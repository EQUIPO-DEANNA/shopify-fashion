import { Eyebrow, Reveal, Section } from "./primitives";
import { useT } from "@/lib/i18n";
import elcapoteShot from "@/assets/example-elcapote.jpg";
import bvmprsShot from "@/assets/example-bvmprs.jpg";

/**
 * Two experiences that exist, with their real addresses.
 *
 * Deliberately live links and real screenshots rather than mockups. Everything
 * above this section is a claim; this is the part a brand can click. A rendered
 * placeholder here would be the one dishonest thing on the page, and the first
 * thing a sceptical visitor would test.
 */
const examples = [
  {
    name: "El Capote",
    shot: elcapoteShot,
    url: "https://elcapote.vercel.app",
    store: "elcapote.com",
    // Spanish source; the English is in the dictionary.
    kind: "Moda masculina española",
    blurb:
      "Polos, camisas y punto. El visitante se prueba la ropa, se hace una foto con Bertín, " +
      "y compra en la tienda de siempre.",
    stats: [
      ["Prendas en el probador", "515"],
      ["Pestañas de categoría", "6"],
    ],
  },
  {
    name: "BVMPRS",
    shot: bvmprsShot,
    url: "https://bvmpers.vercel.app",
    store: "bumpersbrand.com",
    kind: "Lino y algodón para el verano",
    blurb:
      "La segunda marca. Mismo motor, otra marca, otro anfitrión, otro mundo. " +
      "Nada se escribió a mano dos veces.",
    stats: [
      ["Prendas en el probador", "63"],
      ["Pestañas de categoría", "7"],
    ],
  },
];

export function Examples() {
  const t = useT();

  return (
    <Section id="examples" tone="background">
      <Reveal>
        <Eyebrow>{t("Hecho, en marcha, se puede abrir")}</Eyebrow>
        <h2 className="display-lg mt-6">{t("Dos marcas ya la tienen.")}</h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {t(
            "No son maquetas. Son dos experiencias en producción, con el catálogo real de cada marca. Ábrelas y pruébatelas tú.",
          )}
        </p>
      </Reveal>

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        {examples.map((example, index) => (
          <Reveal key={example.name} delay={index * 110} className="group">
            <a
              href={example.url}
              target="_blank"
              rel="noreferrer"
              className="block border border-border bg-card transition-colors hover:border-foreground"
            >
              <div className="relative overflow-hidden border-b border-border">
                <img
                  src={example.shot}
                  alt={t("La experiencia de") + " " + example.name}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <span className="absolute left-5 top-5 bg-electric px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-electric-foreground">
                  {t("En directo")}
                </span>
              </div>

              <div className="p-8 md:p-10">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="display-md">{example.name}</h3>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {example.store}
                  </span>
                </div>
                <p className="eyebrow mt-4">{t(example.kind)}</p>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {t(example.blurb)}
                </p>

                <dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border">
                  {example.stats.map(([label, value]) => (
                    <div key={label} className="bg-card px-4 py-4">
                      <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {t(label as string)}
                      </dt>
                      <dd className="mt-2 font-display text-2xl font-extrabold">
                        {t(value as string)}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-electric">
                  {t("Abrir la experiencia")} →
                </p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <p className="mt-14 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t(
            "La tuya se construye sola en unos diez minutos: lee tu catálogo, coge tus colores y tu tipografía, y se publica.",
          )}
        </p>
      </Reveal>
    </Section>
  );
}
