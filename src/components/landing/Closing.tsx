import { CTA, Eyebrow, Reveal, Section } from "./primitives";
import heroModel from "@/assets/hero-model.jpg";
import scene from "@/assets/scene-city.jpg";
import influencer from "@/assets/influencer.jpg";
import polo from "@/assets/product-polo.jpg";

const plans = [
  { name: "Starter", price: "$200", credits: "2,000", items: ["Up to 100 products", "Try-on + Complete my look", "Shopify checkout handoff", "Basic analytics"] },
  { name: "Growth", price: "$600", credits: "8,000", featured: true, items: ["Up to 1,000 products", "AI scenes + animated looks", "2 influencer models", "Full analytics + A/B testing"] },
  { name: "Scale", price: "Custom", credits: "Unlimited", items: ["Unlimited catalog", "Custom influencer roster", "Dedicated creative support", "SLA + priority rendering"] },
];

export function Pricing() {
  return (
    <Section id="pricing" tone="background">
      <Reveal>
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="display-lg mt-6">Simple monthly plans.</h2>
      </Reveal>
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 80} className={p.featured ? "border border-foreground bg-ink p-10 text-ink-foreground" : "border border-border bg-card p-10"}>
            <p className="eyebrow">{p.name}</p>
            <p className="mt-6 font-display text-6xl font-extrabold">{p.price}</p>
            <p className="mt-1 text-sm opacity-60">{p.price === "Custom" ? "Talk to us" : "per month"}</p>
            <p className="mt-6 text-sm font-semibold"><span className="text-electric">✦</span> {p.credits} shopper credits / month</p>
            <ul className="mt-6 space-y-3 text-sm opacity-80">
              {p.items.map((it) => <li key={it}>— {it}</li>)}
            </ul>
            <div className="mt-10">
              <CTA href="#start" variant={p.featured ? "electric" : "solid"}>Choose {p.name}</CTA>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Credits() {
  const rows = [["Virtual try-on", "1 credit"], ["Complete my look", "2 credits"], ["AI scene photo", "3 credits"], ["Influencer photo", "4 credits"], ["Animated look (video)", "10 credits"]];
  return (
    <Section tone="paper">
      <div className="grid gap-16 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Customer credits</Eyebrow>
          <h2 className="display-lg mt-6">Shoppers play. You stay in control.</h2>
          <p className="mt-6 max-w-md text-muted-foreground">Each shopper action uses credits from your plan. Set per-shopper limits, reward buyers with bonus credits, and never get a surprise bill.</p>
        </Reveal>
        <Reveal delay={120} className="border border-border bg-card">
          {rows.map(([a, c]) => (
            <div key={a} className="flex items-center justify-between border-b border-border px-8 py-5 last:border-b-0">
              <span className="font-display font-bold uppercase">{a}</span>
              <span className="text-sm text-muted-foreground">{c}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}

export function Analytics() {
  const kpis = [["Try-ons", "12,480"], ["Looks created", "3,912"], ["Shares", "1,204"], ["Added to cart", "2,318"]];
  const bars = [38, 52, 44, 61, 70, 58, 82, 76, 90, 84, 95, 88];
  return (
    <Section tone="background">
      <Reveal>
        <Eyebrow>Analytics</Eyebrow>
        <h2 className="display-lg mt-6">See what shoppers actually wear.</h2>
      </Reveal>
      <Reveal delay={120} className="mt-14 border border-border bg-card p-8 shadow-card">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {kpis.map(([k, v]) => (
            <div key={k}>
              <p className="eyebrow">{k}</p>
              <p className="mt-2 font-display text-4xl font-extrabold">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex h-48 items-end gap-2">
          {bars.map((h, i) => (
            <div key={i} className={i === bars.length - 2 ? "flex-1 bg-electric" : "flex-1 bg-foreground/80"} style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Sample dashboard — illustrative data.</p>
      </Reveal>
    </Section>
  );
}

export function SplitTest() {
  return (
    <Section tone="paper">
      <Reveal>
        <Eyebrow>A/B split</Eyebrow>
        <h2 className="display-lg mt-6">Normal store vs. experience store.</h2>
      </Reveal>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <Reveal className="border border-border bg-card p-8">
          <p className="eyebrow">Normal store</p>
          <img src={polo} alt="Static product photo" loading="lazy" className="mt-6 aspect-[4/5] w-full object-cover grayscale" />
          <p className="mt-6 text-sm text-muted-foreground">One static photo. Scroll, hesitate, leave.</p>
        </Reveal>
        <Reveal delay={120} className="border border-foreground bg-ink p-8 text-ink-foreground">
          <p className="eyebrow text-ink-foreground/60">Experience store <span className="text-electric">✦</span></p>
          <img src={heroModel} alt="Shopper wearing the product via AI try-on" loading="lazy" className="mt-6 aspect-[4/5] w-full object-cover" />
          <p className="mt-6 text-sm opacity-70">Try it on, build a look, share it — then buy.</p>
        </Reveal>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Run both side by side and measure the difference in your own analytics.</p>
    </Section>
  );
}

export function MobileTrio() {
  const phones = [
    { img: heroModel, label: "Try it on" },
    { img: scene, label: "Put it in a scene" },
    { img: influencer, label: "Wear it with a creator" },
  ];
  return (
    <Section tone="background">
      <Reveal className="text-center">
        <Eyebrow>Mobile first</Eyebrow>
        <h2 className="display-lg mt-6">Built for the thumb.</h2>
      </Reveal>
      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {phones.map((p, i) => (
          <Reveal key={p.label} delay={i * 100} className={i === 1 ? "sm:-translate-y-8" : ""}>
            <div className="mx-auto max-w-[260px] rounded-[2.2rem] border-[10px] border-foreground bg-foreground shadow-float">
              <img src={p.img} alt={p.label} loading="lazy" className="aspect-[9/19] w-full rounded-[1.6rem] object-cover" />
            </div>
            <p className="mt-6 text-center font-display font-bold uppercase">{p.label}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function FinalCTA() {
  return (
    <section id="start" className="bg-ink px-5 py-32 text-ink-foreground sm:px-8">
      <div className="mx-auto max-w-[1280px] text-center">
        <Reveal>
          <h2 className="display-xl">Let people<br />wear your brand.</h2>
          <p className="mx-auto mt-8 max-w-xl text-ink-foreground/70">Launch an AI fashion experience on top of your Shopify store in days, not months.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <CTA href="#setup" variant="electric">Create my experience →</CTA>
            <CTA href="#experiences" variant="ghost-light">See live experience</CTA>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6">
        <p className="font-display text-sm font-extrabold uppercase tracking-[0.3em]">Atelier<span className="text-electric">AI</span></p>
        <p className="text-xs text-muted-foreground">© 2026 AtelierAI. Works with your existing Shopify store.</p>
      </div>
    </footer>
  );
}
