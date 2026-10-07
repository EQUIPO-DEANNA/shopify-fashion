import { Eyebrow, Reveal, Section } from "./primitives";
import influencer from "@/assets/influencer.jpg";
import { useT } from "@/lib/i18n";

const stats = [
  {
    figure: "+60%",
    body: "Más visitas de calidad según Google para las imágenes de probador virtual, frente al resto de imágenes de compra.",
    source: "Fuente: anuncio del probador virtual de Google Shopping",
    href: "https://blog.google/products/shopping/virtual-try-on-google-generative-ai/",
  },
  {
    figure: "65%",
    body: "Más probabilidad de compra entre los clientes de Rebecca Minkoff que vieron un producto en realidad aumentada, según Shopify.",
    source: "Fuente: caso de estudio de comercio AR de Shopify",
    href: "https://www.shopify.com/blog/ar-shopping",
  },
  {
    figure: "55%",
    body: "de los compradores de moda online encuestados por Google e Ipsos dijeron haber devuelto una prenda porque les quedaba distinta de lo que esperaban.",
    source: "Fuente: encuesta de Google e Ipsos a compradores de moda",
    href: "https://blog.google/products/shopping/virtual-try-on-google-generative-ai/",
  },
];

export function WhyItMatters() {
  const t = useT();

  return (
    <Section id="evidence" tone="ink">
      <Reveal>
        <p className="eyebrow text-ink-foreground/50">{t("Por qué importa")}</p>
        <h2 className="display-lg mt-6">{t("Atención antes que transacción.")}</h2>
      </Reveal>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Reveal key={stat.figure} delay={i * 110} className="border border-ink-foreground/15 p-8">
            <p className="font-display text-6xl font-extrabold tracking-tight text-electric">
              {stat.figure}
            </p>
            <p className="mt-6 text-sm leading-relaxed text-ink-foreground/75">{t(stat.body)}</p>
            <a
              href={stat.href}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-block text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-foreground/45 underline decoration-ink-foreground/25 underline-offset-4 hover:text-ink-foreground"
            >
              {t(stat.source)}
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <p className="mt-14 max-w-3xl text-sm leading-relaxed text-ink-foreground/60">
          {t(
            "El probador virtual y el comercio inmersivo pueden aumentar la interacción y la confianza al comprar. Las cifras de arriba son datos públicos de terceros: no son resultados nuestros ni una promesa de lo que vaya a pasar en tu tienda.",
          )}
        </p>
      </Reveal>
    </Section>
  );
}

const loop = ["Ver", "Probar", "Crear", "Compartir", "Comprar", "Volver"];

export function EngagementLoop() {
  const t = useT();

  return (
    <Section tone="paper">
      <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <Reveal>
            <Eyebrow>{t("El bucle de interacción")}</Eyebrow>
            <h2 className="display-lg mt-6">{t("Convierte comprar en jugar.")}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {t(
                "Cuanto más tiempo pasa un cliente con tus productos, más ocasiones tiene tu marca de crear deseo, leer su intención y acabar en una compra.",
              )}
            </p>
          </Reveal>
        </div>

        <Reveal delay={150} className="relative mx-auto aspect-square w-full max-w-[420px]">
          <div className="spin-slow absolute inset-0 rounded-full border border-dashed border-border" />
          <div className="absolute inset-[18%] rounded-full border border-border" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="eyebrow">{t("Tu marca")}</p>
              <p className="display-md mt-2">Deanna</p>
            </div>
          </div>
          {loop.map((step, i) => {
            const angle = (i / loop.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <span
                key={step}
                className="absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-[0.65rem] font-semibold uppercase tracking-[0.16em] shadow-card"
                style={{
                  left: `${50 + 44 * Math.cos(angle)}%`,
                  top: `${50 + 44 * Math.sin(angle)}%`,
                }}
              >
                {t(step)}
              </span>
            );
          })}
        </Reveal>
      </div>
    </Section>
  );
}

const viral = [
  "El embajador lleva la prenda",
  "El cliente se la prueba",
  "El cliente se hace una foto con el embajador",
  "El cliente comparte la foto",
  "Un amigo abre la experiencia",
  "Cliente nuevo",
];

export function InfluencerCommerce() {
  const t = useT();

  return (
    <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
      <img
        src={influencer}
        alt={t("Fotografía editorial del embajador de la marca")}
        loading="lazy"
        width={1408}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="relative mx-auto w-full max-w-[1280px] px-5 py-32 sm:px-8 md:py-40">
        <Reveal>
          <p className="eyebrow text-ink-foreground/60">{t("Comercio con embajadores")}</p>
          <h2 className="display-lg mt-6 max-w-4xl">{t("¿Ya trabajas con un embajador?")}</h2>
          <h3 className="display-md mt-4 max-w-3xl text-ink-foreground/75">
            {t("Hazle parte de la experiencia de tienda.")}
          </h3>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-foreground/75">
            {t(
              "En vez de que el cliente solo vea al embajador con tus prendas, deja que cree experiencias con él.",
            )}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {viral.map((step, i) => (
            <Reveal
              key={step}
              delay={i * 90}
              className="flex items-start gap-4 border border-ink-foreground/20 bg-ink/40 p-6 backdrop-blur-sm"
            >
              <span className="font-display text-sm text-electric">0{i + 1}</span>
              <span className="text-sm font-semibold uppercase tracking-[0.12em]">{t(step)}</span>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-10 max-w-2xl text-[0.7rem] leading-relaxed text-ink-foreground/50">
            {t(
              "Las experiencias con una persona concreta requieren los derechos de imagen correspondientes. La marca es responsable de conseguir el permiso por escrito antes de enviarnos material de un embajador.",
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
