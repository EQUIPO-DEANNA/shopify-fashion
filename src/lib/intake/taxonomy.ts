/**
 * What counts as a garment, and which garment it is.
 *
 * Every pattern here was earned against a real Shopify feed. Fitting a
 * catalogue to a new store is the part that fails SILENTLY: on the first store
 * we read, fifteen of eighty-one products carried an empty `product_type` —
 * the entire Oxford shirt line among them — so keying categories on that field
 * alone dropped them with no error anywhere. Nothing crashed. The site just
 * had fewer clothes in it than the shop did.
 *
 * So: do not delete a pattern without re-reading a real feed through it.
 */

export type Kind = "top" | "bottom" | "accessory";

/** Keyword -> [category, kind], in priority order. Specific rules come first, */
/* so "guayabera de lino" does not fall through to the generic shirt rule. */
export const TAXONOMY: ReadonlyArray<readonly [RegExp, string, Kind]> = [
  [/guayabera/i, "guayabera", "top"],
  [/havanera/i, "havanera", "top"],
  [/polera/i, "polera", "top"],
  [/sudadera|hoodie|sweatshirt/i, "sudadera", "top"],
  [/camiseta|t-?shirt|tee\b/i, "camiseta", "top"],
  // "polos?" so the plural product_type "POLOS" matches on its own; the word
  // boundary stays, or "polo" fires inside unrelated words.
  [/polos?\b/i, "polo", "top"],
  [/camisa|shirt/i, "camisa", "top"],
  [/jersey|punto|knit|sweater/i, "jersey", "top"],
  [/chaleco|vest\b/i, "chaleco", "top"],
  [/americana|blazer/i, "americana", "top"],
  // sahariana / cazadora / gabardina came from a real store whose outerwear
  // sits under a "PRENDA EXTERIOR" type that matches none of the obvious words.
  [
    /chaqueta|abrigo|jacket|coat|parka|sahariana|cazadora|gabardina|trench|anorak/i,
    "chaqueta",
    "top",
  ],
  [/vestido|dress\b/i, "vestido", "top"],
  [/ba[ñn]ador|swim|bikini/i, "bano", "bottom"],
  [/bermuda|short/i, "bermuda", "bottom"],
  [/pantal|trouser|chino|cargo|jean|denim/i, "pantalon", "bottom"],
  [/falda|skirt/i, "falda", "bottom"],
  [/calzado|zapat|mocas|botin|boot|sneaker|shoe/i, "calzado", "accessory"],
  // "gorro" (beanie) added from a real winter pack; "cap\b" alone missed it.
  [/gorra|gorro|cap\b|beanie|sombrero|hat\b/i, "gorra", "accessory"],
  [/cintur|belt\b/i, "cinturon", "accessory"],
  [/corbata|tie\b|pajarita/i, "corbata", "accessory"],
  [/pulsera|brazalete|bracelet|collar|anillo/i, "joyeria", "accessory"],
  [/gafas|sunglasses/i, "gafas", "accessory"],
  [/perfume|colonia|fragrance/i, "perfume", "accessory"],
  // Bags and small leather goods are one family; a store that files them under
  // "portatrajes" or "tarjetero" was losing them to `unclassified`.
  [
    /bolso|bolsa|bag\b|mochila|cartera|wallet|portatraje|tarjetero|card.?holder/i,
    "bolso",
    "accessory",
  ],
  [/calcet|sock/i, "calcetin", "accessory"],
  // Golf gloves live here, under an "ACCESORIOS GOLF" product_type.
  [/guante|glove|manopla/i, "guante", "accessory"],
  [
    /lanyer|lanyard|llavero|keyring|paraguas|umbrella|toalla|towel|accesorio|accessor/i,
    "accesorio",
    "accessory",
  ],
];

/**
 * Not a garment at all. Tested against both the title and the product_type.
 *
 * "tarjetas de regalo" is spelled out rather than left to `tarjeta.?regalo`,
 * which does not match "Tarjeta de Regalo Digital" — a real store's gift card
 * slipped through exactly that gap.
 */
export const NOT_A_PRODUCT =
  /gift.?card|tarjetas?\s*(?:de\s*)?regalo|mensaje personalizado|custom message|donation|donaci/i;

/**
 * Product TYPES that hold customisation add-ons rather than products —
 * embroidery, monograms, a flag sewn on a cuff. One store sells forty-one of
 * them at zero euros.
 *
 * Matched against product_type ONLY. Matching "personalizar" in the title
 * instead excluded five real polos ("Polo Rugby Verde Hombre Personalizar" — a
 * 79-euro garment you can have monogrammed), which is precisely the kind of
 * silent deletion this file exists to prevent.
 */
export const NOT_A_GARMENT_TYPE =
  /elementos? personalizab|personalizacion|personalización|\bupsell\b/i;

/**
 * Spanish plurals for the picker tabs.
 *
 * Upper-casing the category id gives "CAMISA" and "JERSEY", which read as text
 * written by a machine. The tabs are the most visible words on the try-on page,
 * so they get real plurals with real accents.
 */
export const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  camisa: "CAMISAS",
  guayabera: "GUAYABERAS",
  havanera: "HAVANERAS",
  polera: "POLERAS",
  camiseta: "CAMISETAS",
  polo: "POLOS",
  sudadera: "SUDADERAS",
  jersey: "JERSÉIS",
  chaleco: "CHALECOS",
  americana: "AMERICANAS",
  chaqueta: "CHAQUETAS",
  vestido: "VESTIDOS",
  bano: "BAÑADORES",
  bermuda: "BERMUDAS",
  pantalon: "PANTALONES",
  falda: "FALDAS",
  calzado: "CALZADO",
  gorra: "GORRAS",
  cinturon: "CINTURONES",
  corbata: "CORBATAS",
  joyeria: "JOYERÍA",
  gafas: "GAFAS",
  perfume: "PERFUMES",
  bolso: "BOLSOS",
  calcetin: "CALCETINES",
  guante: "GUANTES",
  accesorio: "ACCESORIOS",
};

/**
 * A category's kind, from the first taxonomy rule that produces it.
 *
 * Read from TAXONOMY on every call rather than snapshotted into a Map at load:
 * TAXONOMY is exported so a caller can extend it for a vocabulary we have not
 * met, and a snapshot would silently file those additions as accessories.
 * Twenty-seven entries scanned per product costs nothing.
 */
export function kindOf(category: string): Kind {
  return TAXONOMY.find(([, id]) => id === category)?.[2] ?? "accessory";
}

/** First taxonomy pattern that matches a single piece of text, or null. */
export function classifyText(text: string | undefined): string | null {
  if (!text) return null;
  for (const [re, category] of TAXONOMY) if (re.test(text)) return category;
  return null;
}
