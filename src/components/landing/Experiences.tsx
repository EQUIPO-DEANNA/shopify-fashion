import { CTA, Eyebrow, Reveal, Section } from "./primitives";
import heroModel from "@/assets/hero-model.jpg";
import sceneCity from "@/assets/scene-city.jpg";
import influencer from "@/assets/influencer.jpg";
import productPolo from "@/assets/product-polo.jpg";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CoreIdea() {
  return (
    <Section tone="background">
      <div className="text-center">
        <Reveal>
          <h2 className="display-lg">Your Shopify store sells clothes.</h2>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="display-lg mt-4 text-muted-foreground">
            We turn them into <span className="text-electric">experiences</span>.
          </h2>
        </Reveal>
      </div>

      <div className="mt-20 grid items-stretch gap-8 md:grid-cols-[1fr_auto_1fr]">
        <Reveal className="border border-border bg-card p-8">
          <Eyebrow>Before</Eyebrow>
          <img
            src={productPolo}
            alt="Catalog product photo"
            loading="lazy"
            width={912}
            height={1104}
            className="mt-6 h-56 w-full object-cover"
          />
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>Product image</li>
            <li>Price</li>
            <li>Size</li>
            <li>Add to cart</li>
          </ul>
        </Reveal>

        <div className="flex items-center justify-center">
          <span className="font-display text-4xl text-electric">→</span>
        </div>

        <Reveal
          delay={120}
          className="border border-foreground/20 bg-foreground p-8 text-primary-foreground"
        >
          <p className="eyebrow text-primary-foreground/60">After</p>
          <img
            src={sceneCity}
            alt="Shopper placed inside an AI-generated fashion scene"
            loading="lazy"
            width={1024}
            height={1280}
            className="mt-6 h-56 w-full object-cover"
          />
          <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
            {["See it", "Wear it", "Style it", "Create with it", "Share it", "Buy it"].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <p className="mx-auto mt-16 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground">
          Traditional ecommerce asks customers to imagine themselves wearing your clothes.
          <br />
          <span className="text-foreground">AI lets them actually see it.</span>
        </p>
      </Reveal>
    </Section>
  );
}

const scenes = [
  "Ibiza",
  "Madrid",
  "Beach Club",
  "Golf Course",
  "City",
  "Luxury Hotel",
  "Ski Resort",
];

const influencerScenes = [
  "At the beach with our ambassador",
  "At a party",
  "Playing golf",
  "Walking through Madrid",
  "Front row at Fashion Week",
];

function CardShell({
  index,
  title,
  lines,
  children,
  cta,
  tone = "card",
}: {
  index: string;
  title: string;
  lines: string[];
  children?: React.ReactNode;
  cta?: string;
  tone?: "card" | "ink";
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col border p-8 md:p-10",
        tone === "ink"
          ? "border-transparent bg-ink text-ink-foreground"
          : "border-border bg-card text-card-foreground",
      )}
    >
      <p
        className={cn(
          "text-[0.65rem] font-semibold tracking-[0.3em]",
          tone === "ink" ? "text-ink-foreground/50" : "text-muted-foreground",
        )}
      >
        CARD {index}
      </p>
      <h3 className="display-md mt-4">{title}</h3>
      <div
        className={cn(
          "mt-4 space-y-1 text-sm leading-relaxed",
          tone === "ink" ? "text-ink-foreground/70" : "text-muted-foreground",
        )}
      >
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      <div className="mt-8 flex-1">{children}</div>
      {cta && (
        <div className="mt-8">
          <CTA variant={tone === "ink" ? "ghost-light" : "outline"} href="#setup">
            {cta}
          </CTA>
        </div>
      )}
    </Reveal>
  );
}

function TryOnVisual() {
  const [on, setOn] = useState(false);
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <img
          src={heroModel}
          alt="Shopper photo before try-on"
          loading="lazy"
          width={1024}
          height={1408}
          className="h-48 w-full object-cover"
        />
        <span
          className={cn("font-display text-2xl", on ? "text-electric" : "text-muted-foreground")}
        >
          →
        </span>
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={sceneCity}
            alt="Shopper wearing the garment"
            loading="lazy"
            width={1024}
            height={1280}
            className={cn(
              "h-full w-full object-cover transition-all duration-1000",
              on ? "scale-100 opacity-100" : "scale-110 opacity-25 blur-sm",
            )}
          />
          {!on && <div className="absolute inset-0 shimmer-sweep" />}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className="mt-4 w-full border border-electric/40 bg-electric/10 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-electric transition-colors hover:bg-electric/20"
      >
        {on ? "Reset" : "Run AI try-on"}
      </button>
    </div>
  );
}

export function SixExperiences() {
  const [scene, setScene] = useState(0);

  return (
    <Section id="experiences" tone="paper">
      <Reveal>
        <Eyebrow>The experience layer</Eyebrow>
        <h2 className="display-lg mt-6">
          One product.
          <br />
          Six experiences.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <CardShell
          index="01"
          title="Try it on"
          lines={["Upload a photo.", "Choose a product.", "See yourself wearing it."]}
          cta="Try this experience →"
        >
          <TryOnVisual />
        </CardShell>

        <CardShell
          index="02"
          title="Complete my look"
          lines={[
            "Don't stop at one garment.",
            "Let AI combine products from the store into complete outfits.",
          ]}
          cta="Create a look →"
        >
          <div className="flex flex-wrap items-center gap-2">
            {["Polo", "Trousers", "Jacket", "Shoes"].map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                <span className="border border-border px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
                  {p}
                </span>
                {i < 3 && <span className="text-muted-foreground">+</span>}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span className="font-display text-2xl text-electric">↓</span>
            <span className="display-md">Your look</span>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[heroModel, sceneCity, influencer, heroModel].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Outfit component"
                loading="lazy"
                className="h-24 w-full object-cover"
              />
            ))}
          </div>
        </CardShell>

        <CardShell
          index="03"
          title="Step into the brand"
          lines={["Don't just wear the clothing.", "Enter the world of the brand."]}
          cta="Create my scene →"
        >
          <div className="flex flex-wrap gap-2">
            {scenes.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setScene(i)}
                className={cn(
                  "border px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                  i === scene
                    ? "border-electric bg-electric text-electric-foreground"
                    : "border-border hover:border-foreground/40",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 border border-border bg-background p-4">
            <span className="text-electric">✦</span>
            <p className="text-sm text-muted-foreground">
              &ldquo;Put me in <span className="text-foreground">{scenes[scene]}</span>&rdquo; — AI
              generates the shopper wearing the selected clothing there.
            </p>
          </div>
          <img
            src={influencer}
            alt="Aspirational AI generated scene"
            loading="lazy"
            width={1408}
            height={1024}
            className="mt-6 h-40 w-full object-cover"
          />
        </CardShell>

        <CardShell
          index="04"
          title="Meet your influencer"
          tone="ink"
          lines={[
            "Your influencer isn't just in the campaign anymore.",
            "The customer can join them.",
          ]}
          cta="Create with an influencer →"
        >
          <img
            src={influencer}
            alt="Customer and brand ambassador together in an AI photo"
            loading="lazy"
            width={1408}
            height={1024}
            className="h-44 w-full object-cover"
          />
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
            <span className="border border-ink-foreground/30 px-3 py-2">Customer</span>
            <span>+</span>
            <span className="border border-ink-foreground/30 px-3 py-2">Influencer</span>
            <span>+</span>
            <span className="border border-ink-foreground/30 px-3 py-2">Your clothes</span>
            <span className="text-electric">↓</span>
            <span className="bg-electric px-3 py-2 text-electric-foreground">AI photo</span>
          </div>
          <ul className="mt-6 space-y-1 text-sm text-ink-foreground/70">
            {influencerScenes.map((s) => (
              <li key={s}>&ldquo;{s}&rdquo;</li>
            ))}
          </ul>
          <p className="mt-6 text-[0.65rem] leading-relaxed text-ink-foreground/45">
            Influencer/ambassador experiences require appropriate image rights and permissions.
          </p>
        </CardShell>

        <CardShell
          index="05"
          title="Bring it to life"
          lines={[
            "Turn the generated fashion image into video.",
            "The person walks. The camera moves. Clothes move naturally.",
          ]}
        >
          <div className="relative h-52 overflow-hidden">
            <img
              src={sceneCity}
              alt="Generated look ready to animate"
              loading="lazy"
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-2 border border-card/60 bg-foreground/60 px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                ▶ Animate
              </span>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-electric" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em]">
            {["Animate my look", "Create video", "Share"].map((b) => (
              <span key={b} className="border border-border px-3 py-2">
                {b}
              </span>
            ))}
          </div>
        </CardShell>

        <CardShell
          index="06"
          title="Share your look"
          lines={[
            "Every customer can become a creator.",
            "Every look they create can become content that brings another potential customer back to your brand.",
          ]}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {["WhatsApp", "Instagram", "TikTok", "Pinterest", "Facebook", "Copy link"].map((s) => (
              <span
                key={s}
                className="border border-border px-3 py-3 text-center text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-electric hover:text-electric"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="display-md mt-8">Every customer can become a creator.</p>
        </CardShell>
      </div>
    </Section>
  );
}

const hotspots = [
  { label: "Navy polo", price: "€89", top: "26%", left: "48%" },
  { label: "White trousers", price: "€110", top: "62%", left: "40%" },
  { label: "Jacket", price: "€179", top: "38%", left: "22%" },
];

export function ShopTheExperience() {
  const [active, setActive] = useState(0);
  return (
    <Section tone="background">
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal className="relative">
          <img
            src={sceneCity}
            alt="Generated look with shoppable hotspots"
            loading="lazy"
            width={1024}
            height={1280}
            className="h-[560px] w-full object-cover"
          />
          {hotspots.map((h, i) => (
            <button
              key={h.label}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              style={{ top: h.top, left: h.left }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 border px-3 py-2 text-left text-[0.6rem] font-semibold uppercase tracking-[0.14em] backdrop-blur-md transition-all",
                i === active
                  ? "border-electric bg-electric text-electric-foreground"
                  : "border-card/70 bg-card/80 text-foreground",
              )}
            >
              {h.label}
              <span className="ml-2 opacity-70">{h.price}</span>
            </button>
          ))}
        </Reveal>

        <div>
          <Reveal>
            <Eyebrow>Shop the experience</Eyebrow>
            <h2 className="display-lg mt-6">We don&apos;t replace your store.</h2>
            <h3 className="display-md mt-4 text-muted-foreground">
              We send shoppers to it wanting the product.
            </h3>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
              {["Experience", "Product", "Shopify", "Checkout"].map((s, i) => (
                <span key={s} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "border px-4 py-3",
                      i === 3
                        ? "border-electric bg-electric text-electric-foreground"
                        : "border-border",
                    )}
                  >
                    {s}
                  </span>
                  {i < 3 && <span className="text-muted-foreground">→</span>}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10">
              <CTA variant="electric" href="#pricing">
                Buy this look →
              </CTA>
              <p className="mt-4 text-sm text-muted-foreground">
                Clicking a look opens the matching product on your Shopify store, with your tracking
                parameters attached.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
