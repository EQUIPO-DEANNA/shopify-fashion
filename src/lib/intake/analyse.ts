/**
 * Read a brand's Shopify storefront and propose its catalogue.
 *
 * This is the first thing that happens when a brand fills in the form, and the
 * only part of the intake that can tell them something true about their own
 * shop. Everything else on the page is a promise; this is a measurement.
 *
 * It reports what it could NOT place (`unclassified`) and what a human should
 * look at (`warnings`) as prominently as what it could. A catalogue mapping
 * that quietly drops a third of the shop passes every typecheck and every test,
 * and is discovered by a customer.
 *
 * It never downloads an image. Shopify's product JSON carries image URLs, and
 * URLs are all the experience ever needs — it resizes them through Shopify's
 * own CDN at render time. We do not run a photo library and we keep no copy of
 * anyone's photographs.
 */
import {
  CATEGORY_LABELS,
  NOT_A_GARMENT_TYPE,
  NOT_A_PRODUCT,
  classifyText,
  kindOf,
  type Kind,
} from "./taxonomy";

/* ---------------------------------------------------------------- the feed */

export interface ShopifyVariant {
  price?: string | number;
  available?: boolean;
}

export interface ShopifyProduct {
  handle?: string;
  title?: string;
  product_type?: string;
  tags?: string[];
  images?: unknown[];
  variants?: ShopifyVariant[];
}

export interface Family {
  id: string;
  label: string;
  count: number;
}

export interface Budget {
  label: string;
  max: number | null;
}

export interface Unplaced {
  handle: string;
  title: string;
  type: string;
}

export interface StoreAnalysis {
  domain: string;
  counts: {
    total: number;
    mapped: number;
    tryable: number;
    excluded: number;
    unclassified: number;
  };
  catalogue: {
    tryable: string[];
    complements: string[];
    categoryFromProductType: Record<string, string>;
    excludedHandles: string[];
  };
  families: Family[];
  budgets: Budget[];
  priceRange: { min: number; median: number; max: number };
  unclassified: Unplaced[];
  warnings: string[];
  truncated: boolean;
}

export interface AnalyseOptions {
  /** Hard cap on feed pages. The interactive path uses a small one. */
  maxPages?: number;
  /** Wall-clock budget for the whole read, so a slow shop cannot hang a request. */
  budgetMs?: number;
}

const PAGE_SIZE = 250; // Shopify's hard cap for products.json.
const MAX_PAGES = 40; // 10,000 products. Past that, something is wrong.
// A big catalogue is the normal case, not the exception: one real store needed
// twelve pages of 250 full product records and timed out repeatedly at 20s.
const FETCH_TIMEOUT_MS = 30_000;
// Backoff long enough to outlast a shop that is merely slow rather than down.
// Retrying a 20-second timeout 500ms later just times out again.
const RETRY_DELAYS_MS = [2_000, 6_000] as const;
/** A tab with one garment behind it looks broken. Two is the floor. */
export const MIN_FOR_TAB = 2;

/** Thrown when the time budget runs out mid-read. Caught, never surfaced raw. */
class OutOfTime extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Strip protocol, path, port, trailing slash and stray whitespace off a domain. */
export function normaliseDomain(input: string): string {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("Hace falta la dirección de una tienda, por ejemplo www.tumarca.com.");
  }
  const host = input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();

  // A hostname, not a search phrase. Catches "acme" and "www.acme .com" before
  // they turn into a confusing DNS error three calls deeper.
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) {
    throw new Error(
      `"${input}" no parece la dirección de una tienda. Escríbela como www.tumarca.com.`,
    );
  }
  return host;
}

/**
 * One page of products.json, with retries for the failures worth retrying
 * (network blips, rate limits, 5xx) and an immediate, explanatory throw for the
 * ones that are not. A brand reading the message should know what to do next.
 */
async function fetchPage(
  domain: string,
  page: number,
  deadline: number,
): Promise<ShopifyProduct[]> {
  const url = `https://${domain}/products.json?limit=${PAGE_SIZE}&page=${page}`;

  for (let attempt = 0; ; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new OutOfTime();

    let res: Response;
    try {
      // An explicit controller rather than AbortSignal.timeout: that helper
      // leaves its timer armed after the request settles, and on a retry the
      // stale timer rejects with nothing awaiting it, which takes down the
      // whole process instead of failing this one page.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(FETCH_TIMEOUT_MS, remaining));
      try {
        res = await fetch(url, {
          headers: { accept: "application/json" },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
    } catch (err) {
      const wait = RETRY_DELAYS_MS[attempt];
      if (wait !== undefined && Date.now() + wait < deadline) {
        await sleep(wait);
        continue;
      }
      if (Date.now() >= deadline) throw new OutOfTime();
      throw new Error(
        `No hemos podido conectar con https://${domain}/products.json (${(err as Error).message}). ` +
          `Comprueba la dirección y que la tienda sea accesible públicamente.`,
      );
    }

    if (res.ok) {
      const text = await res.text();
      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        // A password-protected or non-Shopify store answers 200 with HTML.
        throw new Error(
          `https://${domain}/products.json ha respondido, pero no con JSON. Lo más probable es ` +
            `que la tienda tenga contraseña, o que no sea una tienda Shopify.`,
        );
      }
      const products = (body as { products?: unknown } | null)?.products;
      if (!Array.isArray(products)) {
        throw new Error(
          `https://${domain}/products.json ha devuelto JSON sin lista de "products". Eso no ` +
            `parece un feed de productos de Shopify.`,
        );
      }
      return products as ShopifyProduct[];
    }

    const wait = RETRY_DELAYS_MS[attempt];
    if ((res.status === 429 || res.status >= 500) && wait !== undefined) {
      if (Date.now() + wait >= deadline) throw new OutOfTime();
      await sleep(wait);
      continue;
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `https://${domain}/products.json ha devuelto ${res.status}. La tienda tiene contraseña ` +
          `o nos está bloqueando, normalmente con un escudo antibots. Quita el bloqueo para ` +
          `nosotros, o dínoslo y leemos el catálogo de otra forma.`,
      );
    }
    if (res.status === 404) {
      throw new Error(
        `https://${domain}/products.json ha devuelto 404, así que no hay feed público de ` +
          `Shopify en esa dirección. Mira si hay una redirección: muchas tiendas viven en ` +
          `shop.${domain}.`,
      );
    }
    throw new Error(
      `https://${domain}/products.json ha devuelto ${res.status} en la página ${page}.`,
    );
  }
}

/**
 * Every page of the feed, within the time we are allowed to spend.
 *
 * Shopify caps a page at 250 and signals the end by returning fewer than that.
 * Some storefronts (and some proxies in front of them) ignore `?page` entirely
 * and serve page 1 forever, so this also stops as soon as a page contributes no
 * handle it has not already seen — otherwise the loop runs to the cap and
 * reports the same 250 products forty times over.
 */
async function fetchAll(
  domain: string,
  warnings: string[],
  { maxPages, deadline }: { maxPages: number; deadline: number },
): Promise<{ products: ShopifyProduct[]; truncated: boolean }> {
  const byHandle = new Map<string, ShopifyProduct>();
  let truncated = false;

  for (let page = 1; page <= maxPages; page++) {
    let batch: ShopifyProduct[];
    try {
      batch = await fetchPage(domain, page, deadline);
    } catch (err) {
      // Running out of time with products already in hand is a partial read,
      // not a failure — say so, and work with what came back. Running out with
      // nothing is a failure, and has to read like one.
      if (err instanceof OutOfTime && byHandle.size) {
        truncated = true;
        warnings.push(
          `Hemos parado en ${byHandle.size} productos para que la página siga respondiendo. El ` +
            `catálogo entero se lee otra vez, sin límite de tiempo, al construir la experiencia.`,
        );
        break;
      }
      if (err instanceof OutOfTime) {
        throw new Error(
          `https://${domain} no ha respondido a tiempo. Puede que la tienda esté lenta ahora ` +
            `mismo; inténtalo dentro de un minuto.`,
        );
      }
      throw err;
    }

    if (!batch.length) break;

    const before = byHandle.size;
    for (const product of batch) if (product?.handle) byHandle.set(product.handle, product);

    if (byHandle.size === before) {
      warnings.push(
        `La página ${page} del feed no añadió ningún producto nuevo, así que paramos en ` +
          `${byHandle.size}. Si la tienda tiene más, su products.json está ignorando ?page.`,
      );
      truncated = true;
      break;
    }
    if (batch.length < PAGE_SIZE) break;
    if (page === maxPages) {
      truncated = true;
      warnings.push(
        `Hemos leído los primeros ${byHandle.size} productos. El resto se leen al construir la ` +
          `experiencia.`,
      );
    }
  }

  return { products: [...byHandle.values()], truncated };
}

/* ---------------------------------------------------------------- classify */

/**
 * Resolve one product the way the LIVE EXPERIENCE will resolve it: product_type
 * first, then the title, then the tags.
 *
 * The order is not a detail. The experience reads `categoryFromProductType`
 * before anything else, so whatever a type maps to governs every product under
 * it. An analysis that classified by title would happily report a "guayabera"
 * family the site can never populate, because those products' type is
 * "CAMISAS".
 *
 * Falling through to title and tags is what rescues the products whose shop
 * left product_type empty — fourteen of eighty-one on the first store we read,
 * the whole Oxford shirt line included.
 */
function classifyProduct(
  product: ShopifyProduct,
  typeToCategory: Map<string, string>,
): { category: string | null; via: "type" | "title" | "tag" | null } {
  const type = product.product_type ?? "";
  if (type) {
    const mapped = typeToCategory.get(type);
    if (mapped) return { category: mapped, via: "type" };
  }
  const byTitle = classifyText(product.title ?? "");
  if (byTitle) return { category: byTitle, via: "title" };
  for (const tag of Array.isArray(product.tags) ? product.tags : []) {
    const byTag = classifyText(tag);
    if (byTag) return { category: byTag, via: "tag" };
  }
  return { category: null, via: null };
}

/**
 * Decide what each product_type maps to, before classifying any product.
 *
 * Preference order:
 *  1. The type's own words ("CAMISAS" to camisa). Deterministic, and it makes
 *     the whole group behave as one, which is what the site does anyway.
 *  2. Failing that, a majority vote of what its products' titles look like.
 *     "PRENDA EXTERIOR" matches no pattern, but forty-odd parkas, saharianas
 *     and cazadoras under it vote convincingly for `chaqueta`.
 *
 * Ties break toward the alphabetically first category, so two reads of an
 * unchanged shop produce byte-identical config.
 */
function resolveTypeMap(products: ShopifyProduct[], warnings: string[]): Map<string, string> {
  const votes = new Map<string, Map<string, number>>();
  const typeToCategory = new Map<string, string>();

  for (const product of products) {
    const type = product.product_type ?? "";
    if (!type) continue;
    let tally = votes.get(type);
    if (!tally) {
      tally = new Map<string, number>();
      votes.set(type, tally);
    }
    const fromTags = Array.isArray(product.tags)
      ? (product.tags.map(classifyText).find(Boolean) ?? null)
      : null;
    const guess = classifyText(product.title ?? "") ?? fromTags;
    if (guess) tally.set(guess, (tally.get(guess) ?? 0) + 1);
  }

  const mixed: string[] = [];
  for (const [type, tally] of votes) {
    const fromType = classifyText(type);
    const ranked = [...tally].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const chosen = fromType ?? ranked[0]?.[0];
    if (!chosen) continue; // neither the type nor any title says anything.
    typeToCategory.set(type, chosen);

    // Products under this type whose own title says something else. They will
    // still show, as `chosen` — but a human may want to split the type.
    const dissent = ranked.filter(([category, n]) => category !== chosen && n >= 2);
    if (dissent.length) {
      const detail = dissent.map(([category, n]) => `${n} look like ${category}`).join(" and ");
      mixed.push(`"${type}" to ${chosen}, but ${detail}`);
    }
  }

  if (mixed.length) {
    const more = mixed.length > 6 ? `; and ${mixed.length - 6} more` : "";
    warnings.push(
      `Tipos de producto mezclados (cada producto hereda la familia de su tipo): ` +
        `${mixed.slice(0, 6).join("; ")}${more}.`,
    );
  }

  return typeToCategory;
}

function labelFor(id: string, warnings: string[]): string {
  const label = CATEGORY_LABELS[id];
  if (label) return label;
  // Falling back beats crashing, but a machine-made Spanish plural will
  // eventually be wrong, so it has to be said out loud.
  warnings.push(
    `No hay etiqueta en español para la familia "${id}"; usamos "${id.toUpperCase()}S" de momento.`,
  );
  return `${id.toUpperCase()}S`;
}

/* ----------------------------------------------------------------- budgets */

/**
 * Round a price up to a human number.
 *
 * Up, not to-nearest, because these are ceilings a shopper reasons with: a band
 * of 100 has to include the 99.90 shirt. The increments widen with the number
 * for the same reason a price list does — steps of 25 read as deliberate at 75,
 * and as noise at 750.
 */
function roundUpToNice(value: number): number {
  const step = value < 25 ? 5 : value < 200 ? 25 : value < 500 ? 50 : value < 2000 ? 100 : 250;
  return Math.max(step, Math.ceil(value / step) * step);
}

/** The next rung up from an already-nice number. */
function nextRung(value: number): number {
  const up = roundUpToNice(value + 0.01);
  return up > value ? up : value + 1;
}

/**
 * Budget bands from the shop's own prices.
 *
 * Taking the 33rd/66th/95th percentiles and rounding to 10 reads well on paper
 * and collapses in practice: on a shop whose prices cluster between 69 and 95
 * it produced 80 / 90 / 100 — three bands a shopper cannot tell apart, on a
 * catalogue running to 180. The bands a human chose for that shop were
 * 100 / 150 / 250.
 *
 * So: anchor the first band at the median (under this buys you half the shop),
 * then require every next band to be at least half as much again, and snap each
 * to a round number. Density still sets the floor — a long tail pulls the bands
 * up — but separation is guaranteed.
 */
function budgetBands(sortedPrices: number[], symbol: string, warnings: string[]): Budget[] {
  const unlimited: Budget = { label: "SIN LÍMITE", max: null };
  if (!sortedPrices.length) {
    warnings.push("Ningún producto tiene precio, así que no hemos podido proponer tramos.");
    return [unlimited];
  }

  const pct = (q: number) => sortedPrices[Math.floor((sortedPrices.length - 1) * q)] ?? 0;
  const SEPARATION = 1.5;

  const cuts = [roundUpToNice(pct(0.5))];
  cuts.push(roundUpToNice(Math.max(pct(0.85), (cuts[0] ?? 0) * SEPARATION)));
  cuts.push(roundUpToNice(Math.max(pct(0.97), (cuts[1] ?? 0) * SEPARATION)));

  // Belt and braces: rounding can in principle land two anchors on one rung.
  for (let i = 1; i < cuts.length; i++) {
    const previous = cuts[i - 1] ?? 0;
    if ((cuts[i] ?? 0) <= previous) cuts[i] = nextRung(previous);
  }

  const first = cuts[0] ?? 0;
  const second = cuts[1] ?? 0;
  const third = cuts[2] ?? 0;

  // A band that selects exactly what the previous one did is a dead control.
  const under = (max: number) => sortedPrices.filter((price) => price <= max).length;
  for (let i = 1; i < cuts.length; i++) {
    const previous = cuts[i - 1] ?? 0;
    const here = cuts[i] ?? 0;
    if (under(here) === under(previous)) {
      warnings.push(
        `El tramo ${symbol}${previous}–${symbol}${here} no contiene ningún producto: los ` +
          `precios están demasiado juntos para cuatro tramos.`,
      );
    }
  }
  if (under(first) === sortedPrices.length) {
    warnings.push(
      `El primer tramo (${symbol}${first}) ya cubre todo el catálogo, así que los demás no ` +
        `seleccionan nada más.`,
    );
  }

  return [
    { label: `MENOS DE ${symbol}${first}`, max: first },
    { label: `${symbol}${first}–${symbol}${second}`, max: second },
    { label: `${symbol}${second}–${symbol}${third}`, max: third },
    unlimited,
  ];
}

/* ----------------------------------------------------------------- analyse */

/**
 * Analyse a Shopify storefront and propose its catalogue configuration.
 *
 * Throws if the feed cannot be read, or holds no usable garment at all. Either
 * is a broken experience, and shipping one is worse than stopping here.
 */
export async function analyseStore(
  domain: string,
  options: AnalyseOptions = {},
): Promise<StoreAnalysis> {
  const host = normaliseDomain(domain);
  const warnings: string[] = [];
  const maxPages = Math.max(1, Math.min(options.maxPages ?? MAX_PAGES, MAX_PAGES));
  const deadline = Date.now() + Math.max(1_000, options.budgetMs ?? 5 * 60_000);

  const { products, truncated } = await fetchAll(host, warnings, { maxPages, deadline });

  if (!products.length) {
    throw new Error(
      `https://${host}/products.json no ha devuelto ningún producto. O la tienda está vacía, ` +
        `o todos los productos están ocultos del feed público.`,
    );
  }

  const excludedHandles: string[] = []; // non-garments, pinned into the config
  const noImage: { handle: string; title: string }[] = [];
  const noPrice: { handle: string; title: string }[] = [];
  const keep: { product: ShopifyProduct; title: string; type: string; price: number }[] = [];

  for (const product of products) {
    const title = (product.title ?? "").replace(/\s+/g, " ").trim();
    const type = product.product_type ?? "";
    const handle = product.handle ?? "";

    // Non-garments are pinned by handle into the config: being a gift card is a
    // permanent property of the product, not a transient state.
    if (NOT_A_PRODUCT.test(title) || NOT_A_PRODUCT.test(type) || NOT_A_GARMENT_TYPE.test(type)) {
      if (handle) excludedHandles.push(handle);
      continue;
    }

    // No image and no price are transient — the shop may fix either tomorrow —
    // so they are counted and reported but NOT pinned. The live site drops them
    // at render time anyway, which is self-correcting.
    if (!product.images?.length) {
      noImage.push({ handle, title });
      continue;
    }
    const price = Number(product.variants?.[0]?.price ?? 0);
    if (!Number.isFinite(price) || price <= 0) {
      noPrice.push({ handle, title });
      continue;
    }

    keep.push({ product, title, type, price });
  }

  // Types are decided over the surviving products only, so a type whose every
  // product is a gift card or an unphotographed add-on never gets a vote.
  const typeToCategory = resolveTypeMap(
    keep.map((entry) => entry.product),
    warnings,
  );

  const byCategory = new Map<string, { kind: Kind; items: ShopifyProduct[] }>();
  const unclassified: Unplaced[] = [];
  const titleRescued: { title: string; category: string }[] = [];
  const fallbackOnly = new Map<string, number>();
  const viaType = new Set<string>();
  const prices: number[] = [];
  let outOfStock = 0;

  for (const { product, title, type, price } of keep) {
    const { category, via } = classifyProduct(product, typeToCategory);
    if (!category) {
      unclassified.push({ handle: product.handle ?? "", title, type: type || "(empty)" });
      continue;
    }
    // Products with an empty product_type only reach the site because the
    // title/tag fallback rescued them. Worth counting: it is the failure this
    // whole module was written to expose.
    if (!type && via) {
      titleRescued.push({ title, category });
      fallbackOnly.set(category, (fallbackOnly.get(category) ?? 0) + 1);
    } else {
      viaType.add(category);
    }

    // Not filtered on stock, on purpose. A sibling project hid 12 of 83
    // garments that way: this is a try-on, not a checkout, and seeing yourself
    // in a piece is useful whether or not your size is in today.
    if (
      Array.isArray(product.variants) &&
      product.variants.length &&
      !product.variants.some((variant) => variant.available)
    ) {
      outOfStock++;
    }

    prices.push(price);
    let bucket = byCategory.get(category);
    if (!bucket) {
      bucket = { kind: kindOf(category), items: [] };
      byCategory.set(category, bucket);
    }
    bucket.items.push(product);
  }

  prices.sort((a, b) => a - b);

  type Entry = [string, { kind: Kind; items: ShopifyProduct[] }];
  const byCount = (a: Entry, b: Entry): number =>
    b[1].items.length - a[1].items.length || a[0].localeCompare(b[0]);
  const tops = [...byCategory].filter(([, value]) => value.kind === "top").sort(byCount);
  const rest = [...byCategory].filter(([, value]) => value.kind !== "top").sort(byCount);

  const families = tops
    .filter(([, value]) => value.items.length >= MIN_FOR_TAB)
    .map(([id, value]) => ({ id, label: labelFor(id, warnings), count: value.items.length }));

  const tooThin = tops.filter(([, value]) => value.items.length < MIN_FOR_TAB).map(([id]) => id);

  const mapped = [...byCategory.values()].reduce((n, value) => n + value.items.length, 0);
  const tryableCount = tops.reduce((n, [, value]) => n + value.items.length, 0);

  /* ---------------------------------------------------------- warnings */

  if (unclassified.length) {
    const sample = unclassified
      .slice(0, 6)
      .map((item) => `[${item.type}] ${item.title}`)
      .join("; ");
    warnings.push(
      `${unclassified.length} producto(s) no coinciden con nada que reconozcamos y no aparecerían ` +
        `en ningún sitio: ${sample}${unclassified.length > 6 ? "; …" : ""}. Dinos qué son y los añadimos.`,
    );
  }
  if (!families.length) {
    warnings.push(
      `Ninguna familia de prendas tiene ${MIN_FOR_TAB} productos o más, así que el probador no ` +
        `tendría ninguna pestaña. Este catálogo no puede sostener una experiencia tal cual está.`,
    );
  }
  if (tooThin.length) {
    warnings.push(
      `Demasiado pocas para tener pestaña propia (menos de ${MIN_FOR_TAB} productos): se pueden ` +
        `probar pero no se llega a ellas desde el probador: ${tooThin.join(", ")}.`,
    );
  }
  if (titleRescued.length) {
    const first = titleRescued[0];
    warnings.push(
      `${titleRescued.length} producto(s) tienen el product_type VACÍO y los hemos rescatado por ` +
        `su título o sus etiquetas (por ejemplo "${first?.title}" como ${first?.category}). ` +
        `Leyendo solo el tipo se perderían.`,
    );
  }

  // A family no product_type maps to only exists because of the title/tag
  // fallback — and that fallback lives in the SITE's own code, whose keyword
  // list is narrower than this taxonomy. On one real shop a single bracelet
  // landed here: analysed as `joyeria`, but the site files it as `accesorio`,
  // leaving `joyeria` in the config with nothing behind it forever.
  const orphans = [...fallbackOnly].filter(([category]) => !viaType.has(category));
  if (orphans.length) {
    warnings.push(
      `Familias a las que solo se llega por título o etiqueta, nunca por un product_type: ` +
        `${orphans.map(([category, n]) => `${category} (${n})`).join(", ")}. Poner un ` +
        `product_type en esos productos las hace fiables.`,
    );
  }
  if (noImage.length) {
    warnings.push(
      `${noImage.length} producto(s) no tienen foto y los hemos saltado (por ejemplo ` +
        `"${noImage[0]?.title}"). Reaparecen solos en cuanto la tienda añada imágenes.`,
    );
  }
  if (noPrice.length) {
    warnings.push(
      `${noPrice.length} producto(s) no tienen precio y los hemos saltado (por ejemplo ` +
        `"${noPrice[0]?.title}").`,
    );
  }
  if (outOfStock) {
    warnings.push(
      `${outOfStock} prenda(s) no tienen ninguna talla disponible. Las mantenemos a propósito: ` +
        `esto es un probador, no un checkout. Eso sí, algún enlace llevará a un agotado.`,
    );
  }
  if (families.length > 9) {
    warnings.push(
      `${families.length} pestañas son muchas; normalmente recortaríamos las más pequeñas a ocho ` +
        `o nueve.`,
    );
  }

  const symbol = "€";

  return {
    domain: host,
    counts: {
      total: products.length,
      mapped,
      tryable: tryableCount,
      excluded: excludedHandles.length + noImage.length + noPrice.length,
      unclassified: unclassified.length,
    },
    catalogue: {
      tryable: tops.map(([id]) => id),
      complements: rest.map(([id]) => id),
      categoryFromProductType: Object.fromEntries(
        [...typeToCategory].sort((a, b) => a[0].localeCompare(b[0])),
      ),
      excludedHandles,
    },
    families,
    budgets: budgetBands(prices, symbol, warnings),
    priceRange: {
      min: prices[0] ?? 0,
      median: prices[Math.floor((prices.length - 1) * 0.5)] ?? 0,
      max: prices[prices.length - 1] ?? 0,
    },
    unclassified,
    warnings,
    truncated,
  };
}
