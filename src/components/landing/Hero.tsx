import { CTA, Eyebrow, Reveal } from "./primitives";
import { PhoneDemo } from "./PhoneDemo";
import { useT } from "@/lib/i18n";

export function Hero() {
  const t = useT();

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-background px-5 pb-20 pt-28 sm:px-8 md:pb-28 md:pt-32"
    >
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <Eyebrow>{t("Para marcas de moda en Shopify")}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-xl mt-6">
              {t("No enseñes")}
              <br />
              {t("tu ropa.")}
              <br />
              <span className="text-muted-foreground">{t("Deja que se la prueben.")}</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t(
                "Convierte tu catálogo de Shopify en una experiencia de moda con IA donde cualquiera puede probarse tu ropa, crear looks, hacerse fotos y vídeos, hablar con tu anfitrión, y comprar después en tu tienda de siempre.",
              )}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <CTA href="#setup">{t("Crea tu experiencia")} →</CTA>
              <CTA variant="outline" href="#examples">
                {t("Ver un ejemplo real")}
              </CTA>
            </div>
            <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("Desde 200 € al mes · Sin tocar tu Shopify")}
            </p>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <PhoneDemo />
        </Reveal>
      </div>

      <div className="mx-auto mt-24 w-full max-w-[1280px] overflow-hidden border-y border-border py-4">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10">
              {[
                "Probador virtual",
                "Completa tu look",
                "Escenas con IA",
                "Fotos con tu anfitrión",
                "Looks animados",
                "Contenido para compartir",
                "Checkout en Shopify",
              ].map((item) => (
                <span key={item} className="flex items-center gap-10">
                  {t(item)} <span className="text-electric">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
