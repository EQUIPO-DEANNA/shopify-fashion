/**
 * Turn what a brand types into the brief the factory builds from.
 *
 * This file is the only authority on what a valid brief is. The form mirrors
 * some of it for instant feedback, but the form's checks can be skipped and
 * these cannot — every field that reaches the factory has come through here.
 *
 * Nothing is written anywhere. The brief is computed, returned to the browser,
 * and forwarded to the factory if one is configured. We keep no images, no
 * catalogue copy, and no submission: the addresses in the brief are read live,
 * every time, by whatever builds the experience.
 */

export interface BriefInput {
  name?: string;
  storeUrl?: string;
  slug?: string;
  monogram?: string;
  hostName?: string;
  hostBrief?: string;
  hostPhotoUrl?: string;
  world?: string;
  scenes?: string | unknown[];
  language?: string;
  contactEmail?: string;
}

export interface Scene {
  id: string;
  label: string;
  prompt: string;
}

export interface Brand {
  slug: string;
  name: string;
  monogram: string;
  language: string;
  host: { name: string; brief: string; referenceImageUrl?: string };
  store: { domain: string; url: string };
  world: { look: string; hostSetting: string; heroSetting: string };
  scenes: Scene[];
  intake: {
    submittedAt: string;
    source: string;
    storeUrlAsGiven: string;
    contactEmail: string;
    defaults: string[];
    storage: string;
  };
}

export interface FieldError {
  field: string;
  message: string;
}

export type BriefResult =
  | { ok: true; brand: Brand; errors: []; defaults: string[] }
  | { ok: false; brand: null; errors: FieldError[]; defaults: string[] };

/* ------------------------------------------------------------ text helpers */

/** Strip accents so "MOLÍ & Co." slugs to "moli-co" rather than "mol-co". */
export function fold(input: string): string {
  return String(input).normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function slugify(
  input: string,
  { maxWords = Infinity }: { maxWords?: number } = {},
): string {
  const words = fold(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords);
  return words.join("-").slice(0, 40).replace(/-+$/, "");
}

function clean(value: unknown): string {
  // Normalise the whitespace people paste out of Word and Notion, including
  // non-breaking spaces, which otherwise survive into generation prompts.
  return typeof value === "string" ? value.replace(/\u00a0/g, " ").trim() : "";
}

/** Small stable hash, used only to pick a default host name deterministically. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* ----------------------------------------------------------- the stand-in */

// The host is a generated person, never a real one, so we need a name when the
// brand does not care to choose. Picking by hash of the slug rather than at
// random keeps a re-submission of the same brief producing the same host — a
// brand that resubmits with a typo fixed should not get a different ambassador.
//
// Which list we draw from is read out of the brand's own words. A womenswear
// label that wrote "a woman in her thirties" and got "Mateo" would rightly
// conclude we had not read a line of it.
const HOST_NAMES: Record<"f" | "m" | "x", string[]> = {
  f: ["Lucía", "Marta", "Elena", "Carmen", "Alba", "Irene", "Nuria", "Paula"],
  m: ["Mateo", "Javier", "Álvaro", "Hugo", "Pablo", "Diego", "Marcos", "Adrián"],
  x: ["Alex", "Cruz", "Noa", "Yael", "Sasha", "Reyes"],
};

function pickHostName(brief: string, seed: string): string {
  // Accents are already folded away, so the patterns are written unaccented.
  // Deliberately narrow: "el" or "ella" as bare words appear in almost any
  // Spanish sentence and would sex the host by grammar rather than by intent.
  const text = fold(brief).toLowerCase();
  const female = /\b(mujer|chica|femenin\w*|senora|woman|women|female|she|her)\b/.test(text);
  const male = /\b(hombre|chico|masculin\w*|senor|man|men|male|he|his)\b/.test(text);
  const list = female && !male ? HOST_NAMES.f : male && !female ? HOST_NAMES.m : HOST_NAMES.x;
  return list[hash(seed) % list.length] ?? "Alex";
}

/* ------------------------------------------------------------- the address */

/**
 * Accepts "acme.com", "www.acme.com", "https://www.acme.com/collections/all"
 * and returns the storefront root, because that is where `/products.json`
 * lives. Returns null when it is not an address we can read a catalogue from.
 */
export function parseStoreUrl(raw: unknown): { domain: string; url: string } | null {
  const text = clean(raw).replace(/^\/+|\/+$/g, "");
  if (!text) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  // A hostname with no dot is a LAN name or a typo; either way we cannot read a
  // public catalogue from it, and we would rather say so now than at build time.
  if (!host.includes(".") || host.endsWith(".")) return null;
  return { domain: host, url: `https://${host}` };
}

/* ---------------------------------------------------------------- scenes */

const RESERVED_SCENE_IDS = new Set(["anfitrion"]); // the host scene the factory adds itself
const MAX_LABEL = 28; // a tab label longer than this wraps in the picker
export const MAX_SCENES = 6;

/** Clip on a word boundary — "IN THE MARKET AT DAWN AN" is worse than short. */
function clipLabel(text: string): string {
  const label = clean(text).toUpperCase();
  if (label.length <= MAX_LABEL) return label;
  const cut = label.slice(0, MAX_LABEL);
  const space = cut.lastIndexOf(" ");
  return (space > 8 ? cut.slice(0, space) : cut).replace(/[\s,;:.-]+$/, "");
}

/**
 * The form sends one idea per line of a textarea. A caller may instead post an
 * array — of lines, or of already-shaped scenes — so both are accepted and
 * reduced to the same list of lines.
 */
function sceneLines(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((value) => {
        if (typeof value === "string") return clean(value);
        if (!value || typeof value !== "object") return "";
        const entry = value as { label?: unknown; prompt?: unknown };
        const label = clean(entry.label);
        const prompt = clean(entry.prompt);
        return label && prompt ? `${label} | ${prompt}` : prompt || label;
      })
      .filter(Boolean);
  }
  return String(raw ?? "")
    .split(/\r?\n/)
    .map(clean)
    .filter(Boolean);
}

/**
 * One scene idea per line. `LABEL | description` is the documented form; a line
 * without the pipe still works, we just take the opening clause as the label.
 * The form previews the result as it is typed, so nobody discovers our reading
 * of their line only after the experience is built.
 */
export function parseScenes(raw: unknown): Scene[] {
  const lines = sceneLines(raw);
  const scenes: Scene[] = [];
  const seen = new Set(RESERVED_SCENE_IDS);
  for (const line of lines) {
    const pipe = line.indexOf("|");
    const labelSource = pipe >= 0 ? line.slice(0, pipe) : (line.split(/[,.;:]/)[0] ?? line);
    const prompt = clean(pipe >= 0 ? line.slice(pipe + 1) : line);
    const label = clipLabel(labelSource);
    if (!label || !prompt) continue;

    let id = slugify(labelSource, { maxWords: 3 }) || `escena-${scenes.length + 1}`;
    if (seen.has(id)) {
      let n = 2;
      while (seen.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    seen.add(id);
    scenes.push({ id, label, prompt });
  }
  return scenes;
}

/* ------------------------------------------------------------- validation */

const LANGUAGES = new Set(["es", "en"]);

/**
 * Validate a submission and shape it into the brief the factory consumes.
 *
 * `errors` carry the form's own field names, so the page can put each message
 * under the input that caused it rather than in one heap at the top.
 */
export function normaliseBrief(raw: unknown, now: string = new Date().toISOString()): BriefResult {
  const input: BriefInput =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as BriefInput) : {};
  const errors: FieldError[] = [];
  const defaults: string[] = [];
  const err = (field: string, message: string) => errors.push({ field, message });

  const name = clean(input.name);
  if (!name) err("name", "Tell us what the brand is called.");
  else if (name.length > 80) err("name", "Keep the name under 80 characters.");

  const store = parseStoreUrl(input.storeUrl);
  if (!clean(input.storeUrl)) err("storeUrl", "We need your shop's address.");
  else if (!store)
    err("storeUrl", "We don't recognise that address. Write it as www.yourbrand.com.");

  // The slug names the file, the folder and eventually the deploy, so it is
  // derived rather than asked for. If the brand name is all symbols we fall
  // back to the domain, and only then give up.
  const requested = clean(input.slug);
  if (requested && !/^[a-z0-9][a-z0-9-]{0,39}$/.test(requested)) {
    err("name", "An identifier can only hold lowercase letters, numbers and hyphens.");
  }
  const slug =
    (requested && /^[a-z0-9][a-z0-9-]{0,39}$/.test(requested) ? requested : "") ||
    slugify(name) ||
    (store ? slugify(store.domain.replace(/^www\./, "").split(".")[0] ?? "") : "");
  if (!slug && name) err("name", "That name gives us no identifier. Add a letter or two.");

  let monogram = clean(input.monogram).toUpperCase().slice(0, 2);
  if (!monogram) {
    monogram = fold(name)
      .replace(/[^A-Za-z0-9]/g, "")
      .charAt(0)
      .toUpperCase();
    if (monogram) defaults.push("monogram");
  }

  const hostBrief = clean(input.hostBrief);
  let hostName = clean(input.hostName).slice(0, 40);
  if (!hostName) {
    hostName = pickHostName(hostBrief, slug || name || "brand");
    defaults.push("host.name");
  }

  const world = clean(input.world);
  if (!world) err("world", "One line: what you make, and where it gets worn.");
  else if (world.length < 20)
    err("world", "A little more, please — garment, fabric, and the place.");

  // We keep the LINK, never a copy of the image. Anything that is not an http
  // address is refused here rather than passed on to fail at build time.
  let referenceImageUrl = "";
  const rawRef = clean(input.hostPhotoUrl);
  if (rawRef) {
    try {
      const parsed = new URL(rawRef);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("scheme");
      referenceImageUrl = parsed.toString();
    } catch {
      err("hostPhotoUrl", "Paste a full link, starting with https://");
    }
  }

  const lines = sceneLines(input.scenes);
  if (lines.length > MAX_SCENES) {
    err("scenes", `Six scenes at most — you have written ${lines.length}.`);
  }
  const scenes = parseScenes(input.scenes);
  if (lines.length && !scenes.length) {
    err("scenes", "We couldn't read a scene out of that. One idea per line.");
  }

  const requestedLanguage = clean(input.language).toLowerCase();
  const language = LANGUAGES.has(requestedLanguage) ? requestedLanguage : "es";
  if (!requestedLanguage) defaults.push("language");

  const contactEmail = clean(input.contactEmail);
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    err("contactEmail", "That doesn't look like an email address.");
  }

  if (errors.length || !store) return { ok: false, errors, brand: null, defaults };

  const brand: Brand = {
    slug,
    name,
    monogram,
    language,
    host: {
      name: hostName,
      // The brief describes a person we generate. If the brand left it blank we
      // say exactly that, rather than inventing an age, a build and a face.
      brief: hostBrief || "no direction given — the studio proposes a host and the brand approves",
      ...(referenceImageUrl ? { referenceImageUrl } : {}),
    },
    store,
    world: {
      look: world,
      // Written by the factory's world step from `look`; left empty on purpose
      // so a missing setting is obvious rather than quietly inherited from a
      // neighbouring brand.
      hostSetting: "",
      heroSetting: "",
    },
    scenes,
    intake: {
      submittedAt: now,
      source: "deannafashion/intake",
      storeUrlAsGiven: clean(input.storeUrl),
      contactEmail,
      // Which fields the brand did NOT give us and we filled in. Anyone
      // reviewing the brief needs to know what is theirs and what is ours.
      defaults,
      // Restated in the artefact itself so it survives being passed around: we
      // hold no image of theirs, only the addresses we read at build time.
      storage: "no images uploaded or retained; catalogue and any reference link are read live",
    },
  };

  return { ok: true, errors: [], brand, defaults };
}
