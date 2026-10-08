/**
 * Tests for the parts of the intake that fail QUIETLY.
 *
 * Not coverage for its own sake. Every case here is a failure that once shipped
 * — or would have — with a green typecheck, a green build and a site that looked
 * fine: a shirt line dropped because its product_type was empty, a gift card in
 * the try-on picker, a tab with nothing behind it. None of those throw. They
 * just make the experience smaller than the shop, and nobody notices until a
 * customer does.
 *
 * So the assertions are about what ends up in the catalogue, not about whether
 * a function returned.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { analyseStore } from "./analyse";
import { normaliseBrief, parseScenes, parseStoreUrl } from "./brief";

/* ------------------------------------------------------------- the fixture */

type FixtureProduct = {
  handle: string;
  title: string;
  product_type?: string;
  tags?: string[];
  price?: string;
  images?: number;
  available?: boolean;
};

function product(input: FixtureProduct) {
  return {
    handle: input.handle,
    title: input.title,
    product_type: input.product_type ?? "",
    tags: input.tags ?? [],
    images: Array.from({ length: input.images ?? 1 }, (_, i) => ({ src: `img-${i}` })),
    variants: [{ price: input.price ?? "79.00", available: input.available ?? true }],
  };
}

/**
 * A feed with every trap a real store has sprung on us, and nothing else.
 * Read the comments before changing a row: each one is a bug that shipped.
 */
const FIXTURE = [
  // Ordinary, typed products. Two per family so they earn a picker tab.
  product({ handle: "polo-navy", title: "Polo Navy", product_type: "POLOS", price: "89" }),
  product({ handle: "polo-white", title: "Polo White", product_type: "POLOS", price: "89" }),

  // The one that started all of this: NO product_type at all. Keying the
  // catalogue on product_type alone drops the whole Oxford line, silently.
  product({ handle: "oxford-blue", title: "Camisa Oxford Azul", price: "99" }),
  product({ handle: "oxford-white", title: "Camisa Oxford Blanca", price: "99" }),

  // A product_type that matches no keyword. Its products vote for `chaqueta`.
  product({
    handle: "sahariana",
    title: "Sahariana de lino",
    product_type: "PRENDA EXTERIOR",
    price: "220",
  }),
  product({
    handle: "cazadora",
    title: "Cazadora vaquera",
    product_type: "PRENDA EXTERIOR",
    price: "195",
  }),
  // The dissenter. Its own title says `chaleco`, but it is filed under the same
  // type as the two jackets, so the majority has to win — and it has to win by
  // count, not by whichever product the loop happened to see last. Filing a
  // whole outerwear line as waistcoats is a bug that shipped once already.
  product({
    handle: "chaleco-acolchado",
    title: "Chaleco acolchado",
    product_type: "PRENDA EXTERIOR",
    price: "150",
  }),

  // Not garments. Both must be excluded BY HANDLE — being a gift card is a
  // permanent property, not a transient one.
  product({ handle: "gift-card", title: "Tarjeta de Regalo Digital", price: "50" }),
  product({
    handle: "iniciales",
    title: "Polo Rugby Verde Hombre Personalizar",
    product_type: "ELEMENTOS PERSONALIZABLES",
    price: "5",
  }),

  // Transient problems: counted and reported, never pinned into the config,
  // because the shop may fix either tomorrow.
  product({ handle: "no-photo", title: "Camisa sin foto", product_type: "CAMISAS", images: 0 }),
  product({ handle: "no-price", title: "Camisa sin precio", product_type: "CAMISAS", price: "0" }),

  // Out of stock stays in. This is a try-on, not a checkout.
  product({
    handle: "sold-out",
    title: "Polo agotado",
    product_type: "POLOS",
    price: "89",
    available: false,
  }),

  // A complement: worn in a look, never put on the model by the try-on.
  product({ handle: "belt", title: "Cinturón de piel", product_type: "CINTURONES", price: "60" }),
  product({
    handle: "belt-2",
    title: "Cinturón trenzado",
    product_type: "CINTURONES",
    price: "65",
  }),

  // Matches nothing. Must be REPORTED, not swallowed.
  product({ handle: "mystery", title: "Objeto sin nombre", product_type: "VARIOS", price: "30" }),
];

function serveFeed(pages: unknown[][]) {
  let call = 0;
  return vi.fn(async () => {
    const page = pages[call++] ?? [];
    return new Response(JSON.stringify({ products: page }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

/* ------------------------------------------------------------- the reading */

describe("analyseStore", () => {
  async function analyseFixture() {
    vi.stubGlobal("fetch", serveFeed([FIXTURE]));
    return analyseStore("www.example-shop.com");
  }

  it("rescues products whose product_type is empty", async () => {
    const result = await analyseFixture();
    // Both Oxford shirts reach the catalogue through their title.
    const camisa = result.families.find((f) => f.id === "camisa");
    expect(camisa?.count).toBe(2);
    expect(result.warnings.some((w) => /product_type VAC/.test(w))).toBe(true);
  });

  it("resolves an unrecognisable product_type by majority vote of its titles", async () => {
    const result = await analyseFixture();
    // "PRENDA EXTERIOR" matches no keyword. Two of its three products read as
    // jackets and one reads as a waistcoat, so the jackets decide it.
    expect(result.catalogue.categoryFromProductType["PRENDA EXTERIOR"]).toBe("chaqueta");
    // And the whole type goes with the decision, dissenter included — which is
    // what the live site does, so it is what the analysis has to report.
    expect(result.families.find((f) => f.id === "chaqueta")?.count).toBe(3);
    expect(result.families.find((f) => f.id === "chaleco")).toBeUndefined();
  });

  it("pins non-garments by handle and leaves transient problems unpinned", async () => {
    const result = await analyseFixture();
    expect(result.catalogue.excludedHandles).toContain("gift-card");
    expect(result.catalogue.excludedHandles).toContain("iniciales");
    // A missing photo or price is the shop's to fix; pinning it would make the
    // product invisible forever, long after the shop had fixed it.
    expect(result.catalogue.excludedHandles).not.toContain("no-photo");
    expect(result.catalogue.excludedHandles).not.toContain("no-price");
  });

  it("keeps sold-out garments, and says so", async () => {
    const result = await analyseFixture();
    expect(result.families.find((f) => f.id === "polo")?.count).toBe(3);
    expect(result.warnings.some((w) => /ninguna talla disponible/.test(w))).toBe(true);
  });

  it("reports what it could not classify rather than dropping it in silence", async () => {
    const result = await analyseFixture();
    expect(result.counts.unclassified).toBe(1);
    expect(result.unclassified[0]?.handle).toBe("mystery");
    expect(result.warnings.some((w) => /no coinciden con nada que reconozcamos/.test(w))).toBe(
      true,
    );
  });

  it("offers only tops as picker tabs, and only where there are enough", async () => {
    const result = await analyseFixture();
    const ids = result.families.map((f) => f.id);
    expect(ids).toContain("polo");
    expect(ids).toContain("camisa");
    // A belt is worn in a look but never put on the model by the try-on.
    expect(ids).not.toContain("cinturon");
    expect(result.catalogue.complements).toContain("cinturon");
  });

  it("gives every tab a real Spanish plural", async () => {
    const result = await analyseFixture();
    const labels = Object.fromEntries(result.families.map((f) => [f.id, f.label]));
    expect(labels["camisa"]).toBe("CAMISAS");
    expect(labels["chaqueta"]).toBe("CHAQUETAS");
    // "JERSEYS" would be the machine-made plural; the tab is the most visible
    // text on the page, so it gets the right one.
    expect(result.warnings.some((w) => /No hay etiqueta en espa/.test(w))).toBe(false);
  });

  it("proposes budget bands a shopper can tell apart", async () => {
    const result = await analyseFixture();
    const caps = result.budgets.map((b) => b.max).filter((m): m is number => m !== null);
    expect(caps).toHaveLength(3);
    for (let i = 1; i < caps.length; i++) {
      expect(caps[i]!).toBeGreaterThan(caps[i - 1]!);
    }
    expect(result.budgets.at(-1)?.max).toBeNull();
  });

  it("stops when a storefront ignores ?page instead of looping to the cap", async () => {
    // 250 identical products on every page: the shop is serving page 1 forever.
    const page = Array.from({ length: 250 }, (_, i) =>
      product({ handle: `p-${i}`, title: `Polo ${i}`, product_type: "POLOS" }),
    );
    const fetchMock = serveFeed([page, page, page, page]);
    vi.stubGlobal("fetch", fetchMock);
    const result = await analyseStore("www.example-shop.com");
    expect(result.counts.total).toBe(250);
    expect(fetchMock).toHaveBeenCalledTimes(2); // page 1, then the repeat that ends it
    expect(result.warnings.some((w) => /ignorando \?page/.test(w))).toBe(true);
  });

  it("explains a storefront that answers with HTML instead of a feed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<!doctype html><html></html>", { status: 200 })),
    );
    await expect(analyseStore("www.example-shop.com")).rejects.toThrow(/contraseña/);
  });

  it("refuses an address that is not one before making any request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(analyseStore("acme")).rejects.toThrow(/no parece la dirección de una tienda/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------- the brief */

describe("normaliseBrief", () => {
  const valid = {
    name: "Casa Marés",
    storeUrl: "https://casamares.com/collections/all",
    world: "Linen shirting for warm evenings on the Mediterranean coast.",
  };

  it("derives a slug, a monogram and a host, and says which it invented", () => {
    const result = normaliseBrief(valid);
    if (!result.ok) throw new Error("expected a valid brief");
    expect(result.brand.slug).toBe("casa-mares");
    expect(result.brand.monogram).toBe("C");
    expect(result.brand.host.name).toBeTruthy();
    // A human reading the brief has to be able to tell their words from ours.
    expect(result.brand.intake.defaults).toContain("monogram");
    expect(result.brand.intake.defaults).toContain("host.name");
  });

  it("folds accents into the slug rather than dropping the letters", () => {
    const result = normaliseBrief({ ...valid, name: "MOLÍ & Co." });
    if (!result.ok) throw new Error("expected a valid brief");
    expect(result.brand.slug).toBe("moli-co");
  });

  it("picks the same host every time for the same brand", () => {
    const first = normaliseBrief(valid);
    const second = normaliseBrief(valid);
    if (!first.ok || !second.ok) throw new Error("expected valid briefs");
    // Fixing a typo and resubmitting should not swap the brand's ambassador.
    expect(first.brand.host.name).toBe(second.brand.host.name);
  });

  it("reads the host's sex out of the brand's own words", () => {
    const woman = normaliseBrief({ ...valid, hostBrief: "a woman in her early thirties" });
    const man = normaliseBrief({ ...valid, hostBrief: "un hombre de unos treinta" });
    if (!woman.ok || !man.ok) throw new Error("expected valid briefs");
    expect(woman.brand.host.name).not.toBe(man.brand.host.name);
  });

  it("keeps a reference photo as a link and never as a file", () => {
    const result = normaliseBrief({ ...valid, hostPhotoUrl: "https://example.com/a.jpg" });
    if (!result.ok) throw new Error("expected a valid brief");
    expect(result.brand.host.referenceImageUrl).toBe("https://example.com/a.jpg");
    expect(result.brand.intake.storage).toMatch(/no images uploaded or retained/);
  });

  it("refuses anything that is not an http link for that photo", () => {
    const result = normaliseBrief({ ...valid, hostPhotoUrl: "file:///C:/secret.jpg" });
    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.field)).toContain("hostPhotoUrl");
  });

  it("names the field behind every complaint", () => {
    const result = normaliseBrief({ name: "", storeUrl: "nope", world: "short" });
    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.field).sort()).toEqual(["name", "storeUrl", "world"]);
  });

  it("points the store at the root, because that is where the feed lives", () => {
    const result = normaliseBrief(valid);
    if (!result.ok) throw new Error("expected a valid brief");
    expect(result.brand.store).toEqual({
      domain: "casamares.com",
      url: "https://casamares.com",
    });
  });

  it("leaves the world's settings empty rather than inheriting a neighbour's", () => {
    const result = normaliseBrief(valid);
    if (!result.ok) throw new Error("expected a valid brief");
    expect(result.brand.world.hostSetting).toBe("");
    expect(result.brand.world.heroSetting).toBe("");
  });
});

describe("parseStoreUrl", () => {
  it("accepts the ways people actually write an address", () => {
    for (const input of [
      "acme.com",
      "www.acme.com",
      "https://www.acme.com",
      "https://www.acme.com/collections/all",
      "  ACME.com/  ",
    ]) {
      expect(parseStoreUrl(input)).not.toBeNull();
    }
  });

  it("rejects what cannot hold a public catalogue", () => {
    for (const input of ["acme", "localhost", "", "ftp://acme.com"]) {
      expect(parseStoreUrl(input)).toBeNull();
    }
  });
});

describe("parseScenes", () => {
  it("reads LABEL | description, and a bare line too", () => {
    const scenes = parseScenes("EN LA CIUDAD | a street at dusk\nA terrace at golden hour");
    expect(scenes).toHaveLength(2);
    expect(scenes[0]).toEqual({
      id: "en-la-ciudad",
      label: "EN LA CIUDAD",
      prompt: "a street at dusk",
    });
    expect(scenes[1]?.label).toBe("A TERRACE AT GOLDEN HOUR");
  });

  it("never collides with the host scene the factory adds itself", () => {
    const scenes = parseScenes("anfitrion | con el anfitrión");
    expect(scenes[0]?.id).not.toBe("anfitrion");
  });

  it("clips a long label on a word boundary", () => {
    const scenes = parseScenes("EN EL MERCADO AL AMANECER CON NIEBLA | a market at dawn");
    expect(scenes[0]?.label.length).toBeLessThanOrEqual(28);
    expect(scenes[0]?.label.endsWith(" ")).toBe(false);
    // Cutting mid-word gives "EN EL MERCADO AL AMANECE", which reads as a bug.
    expect(scenes[0]?.label).toBe("EN EL MERCADO AL AMANECER");
  });

  it("keeps two scenes apart when their labels slug the same", () => {
    const scenes = parseScenes("EN LA CIUDAD | dusk\nEN LA CIUDAD | dawn");
    expect(scenes[0]?.id).not.toBe(scenes[1]?.id);
  });

  it("drops a line it cannot read rather than inventing a scene", () => {
    expect(parseScenes("   \n|\n  |  ")).toHaveLength(0);
  });
});
