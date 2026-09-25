import { useState } from "react";
import { cn } from "@/lib/utils";
import { CTA, Eyebrow, Reveal, Section } from "./primitives";
import productPolo from "@/assets/product-polo.jpg";
import heroModel from "@/assets/hero-model.jpg";
import influencer from "@/assets/influencer.jpg";

export function ThreeThings() {
  return (
    <Section tone="background">
      <Reveal>
        <Eyebrow>What we need from the brand</Eyebrow>
        <h2 className="display-lg mt-6">Give us three things.</h2>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        <Reveal className="border border-border bg-card p-10">
          <p className="font-display text-5xl font-extrabold text-muted-foreground/40">01</p>
          <h3 className="display-md mt-6">Your products</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Upload your clothing photos. Drag and drop — product cards build themselves.
          </p>
          <div className="mt-8 border border-dashed border-border p-4">
            <div className="grid grid-cols-3 gap-2">
              {[productPolo, heroModel, influencer].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Uploaded product"
                  loading="lazy"
                  className="h-24 w-full object-cover"
                />
              ))}
            </div>
            <p className="mt-4 text-center text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Drop clothing photos here
            </p>
          </div>
        </Reveal>

        <Reveal delay={110} className="border border-border bg-card p-10">
          <p className="font-display text-5xl font-extrabold text-muted-foreground/40">02</p>
          <h3 className="display-md mt-6">Your brand</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Upload your logo. Optionally add colors, fonts, campaign imagery and authorized
            influencer assets.
          </p>
          <div className="mt-8 space-y-3">
            {["Logo", "Colors", "Fonts", "Campaign imagery", "Influencer assets"].map((t, i) => (
              <div
                key={t}
                className="flex items-center justify-between border border-border px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em]"
              >
                {t}
                <span className={i === 0 ? "text-electric" : "text-muted-foreground"}>
                  {i === 0 ? "Required" : "Optional"}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={220} className="border border-border bg-card p-10">
          <p className="font-display text-5xl font-extrabold text-muted-foreground/40">03</p>
          <h3 className="display-md mt-6">Your Shopify links</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Connect each product to its Shopify URL and tracking parameters.
          </p>
          <div className="mt-8 space-y-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            {["AI experience", "Shopify product page", "Sale", "Tracked"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-full border border-border px-4 py-3">{s}</span>
                {i < 3 && <span className="text-electric">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Your Shopify store remains the source of truth for products, pricing and checkout.
          </p>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="mt-24 text-center">
          <h2 className="display-xl">That&apos;s it.</h2>
          <h3 className="display-md mt-4 text-muted-foreground">We build the experience.</h3>
        </div>
      </Reveal>
    </Section>
  );
}

const steps = [
  { n: 1, title: "Your brand" },
  { n: 2, title: "Your products" },
  { n: 3, title: "Your links" },
  { n: 4, title: "Your influencer" },
  { n: 5, title: "Your experience" },
];

export function Wizard() {
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState("");
  const [shop, setShop] = useState("");
  const [creator, setCreator] = useState("");

  return (
    <Section id="setup" tone="paper">
      <Reveal>
        <Eyebrow>Setup wizard</Eyebrow>
        <h2 className="display-lg mt-6">Build it in five steps.</h2>
      </Reveal>

      <Reveal delay={120} className="mt-12 border border-border bg-card">
        <div className="flex flex-wrap gap-px border-b border-border bg-border">
          {steps.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => setStep(s.n)}
              className={cn(
                "flex-1 bg-card px-4 py-5 text-left transition-colors",
                step === s.n ? "bg-foreground text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <span className="text-[0.6rem] font-semibold tracking-[0.24em] opacity-60">
                STEP {s.n}
              </span>
              <span className="mt-2 block text-[0.7rem] font-semibold uppercase tracking-[0.14em]">
                {s.title}
              </span>
            </button>
          ))}
        </div>

        <div className="p-8 md:p-12">
          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex h-40 items-center justify-center border border-dashed border-border text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Upload logo
              </div>
              <div className="space-y-4">
                <Field label="Brand name" value={brand} onChange={setBrand} placeholder="Casa Marés" />
                <Field
                  label="Shopify URL"
                  value={shop}
                  onChange={setShop}
                  placeholder="casamares.myshopify.com"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm text-muted-foreground">Drop clothing photos here.</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[productPolo, heroModel, influencer, productPolo].map((src, i) => (
                  <div key={i} className="border border-border">
                    <img src={src} alt="Uploading product" loading="lazy" className="h-40 w-full object-cover" />
                    <div className="px-3 py-2">
                      <div className="h-1 w-full bg-muted">
                        <div className="h-1 bg-electric" style={{ width: `${40 + i * 20}%` }} />
                      </div>
                      <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Uploading…
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Shopify URL</th>
                    <th className="pb-3">Tracking URL</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {["Navy polo", "White trousers", "Linen jacket"].map((p) => (
                    <tr key={p} className="border-t border-border">
                      <td className="py-4 text-foreground">{p}</td>
                      <td className="py-4">/products/{p.toLowerCase().replace(/ /g, "-")}</td>
                      <td className="py-4">?utm_source=experience</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex h-40 items-center justify-center border border-dashed border-border text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Upload authorized influencer assets
              </div>
              <div className="space-y-4">
                <Field label="Influencer name" value={creator} onChange={setCreator} placeholder="Optional" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Optional. Only upload assets you have written permission to use.
                </p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center">
              <img
                src={heroModel}
                alt="Preview of the generated experience"
                loading="lazy"
                className="mx-auto h-64 w-full max-w-sm object-cover"
              />
              <h3 className="display-md mt-8">Your experience is ready.</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {brand ? brand : "Your brand"} · {shop ? shop : "your-store.myshopify.com"}
              </p>
              <div className="mt-8">
                <CTA variant="electric" href="#pricing">
                  Launch experience →
                </CTA>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <CTA onClick={() => setStep((s) => Math.min(5, s + 1))}>
              {step === 5 ? "Done" : "Next →"}
            </CTA>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border-b border-border bg-transparent py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-electric"
      />
    </label>
  );
}
