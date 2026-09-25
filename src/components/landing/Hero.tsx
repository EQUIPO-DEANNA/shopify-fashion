import { CTA, Eyebrow, Reveal } from "./primitives";
import { PhoneDemo } from "./PhoneDemo";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-background px-5 pb-20 pt-28 sm:px-8 md:pb-28 md:pt-32">
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <Eyebrow>For fashion brands on Shopify</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-xl mt-6">
              Don&apos;t just show
              <br />
              your clothes.
              <br />
              <span className="text-muted-foreground">Let people wear them.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Turn your Shopify catalog into an interactive AI fashion experience where shoppers can
              try on your clothes, create looks, make photos and videos, interact with your
              influencers — and then buy directly from your existing Shopify store.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <CTA href="#setup">Create my experience →</CTA>
              <CTA variant="outline" href="#experiences">
                See live experience
              </CTA>
            </div>
            <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              From $200/month · No Shopify rebuild required
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
                "Virtual try-on",
                "Complete my look",
                "AI scenes",
                "Influencer photos",
                "Animated looks",
                "Shareable content",
                "Shopify checkout",
              ].map((t) => (
                <span key={t} className="flex items-center gap-10">
                  {t} <span className="text-electric">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
