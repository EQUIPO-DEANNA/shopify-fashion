import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CTA, Eyebrow, Reveal, Section } from "./primitives";
import { parseScenes, MAX_SCENES, type Brand, type FieldError } from "@/lib/intake/brief";
import type { StoreAnalysis } from "@/lib/intake/analyse";

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
          <h3 className="display-md mt-6">Your shop&apos;s address</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            That is the whole catalogue step. We read your public Shopify feed — products, photos,
            prices — live, every time. Nothing to upload, nothing to keep in sync.
          </p>
          <div className="mt-8 border border-dashed border-border p-5">
            <p className="font-mono text-xs text-muted-foreground">www.yourbrand.com</p>
            <p className="mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-electric">
              We store none of it
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Your images stay on your CDN. We hold addresses, not files.
            </p>
          </div>
        </Reveal>

        <Reveal delay={110} className="border border-border bg-card p-10">
          <p className="font-display text-5xl font-extrabold text-muted-foreground/40">02</p>
          <h3 className="display-md mt-6">Your brand</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A name and a letter for the mark. Colours and type we read off your own storefront, so
            the experience looks like you and not like us.
          </p>
          <div className="mt-8 space-y-3">
            {[
              ["Brand name", "Required"],
              ["Monogram", "We propose one"],
              ["Colours", "Read from your site"],
              ["Type", "Read from your site"],
              ["Language", "Spanish or English"],
            ].map(([label, note], i) => (
              <div
                key={label}
                className="flex items-center justify-between border border-border px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em]"
              >
                {label}
                <span className={i === 0 ? "text-electric" : "text-muted-foreground"}>{note}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={220} className="border border-border bg-card p-10">
          <p className="font-display text-5xl font-extrabold text-muted-foreground/40">03</p>
          <h3 className="display-md mt-6">Your host and your world</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            One line on what you make and where it gets worn, and who wears it. The host is a person
            we generate — never a real one, unless you send us someone you have the rights to.
          </p>
          <div className="mt-8 space-y-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            {["A line about your world", "Who the host is", "Where the scenes happen"].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-full border border-border px-4 py-3">{s}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Your Shopify store stays the source of truth for products, pricing and checkout.
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

/* --------------------------------------------------------------- the intake */

const steps = [
  { n: 1, title: "Your brand" },
  { n: 2, title: "Your catalogue" },
  { n: 3, title: "Your host" },
  { n: 4, title: "Your world" },
  { n: 5, title: "Your brief" },
];

type Form = {
  name: string;
  storeUrl: string;
  monogram: string;
  language: string;
  hostName: string;
  hostBrief: string;
  hostPhotoUrl: string;
  world: string;
  scenes: string;
  contactEmail: string;
};

const EMPTY: Form = {
  name: "",
  storeUrl: "",
  monogram: "",
  language: "es",
  hostName: "",
  hostBrief: "",
  hostPhotoUrl: "",
  world: "",
  scenes: "",
  contactEmail: "",
};

/** Which step owns which field, so a server error can send you back to it. */
const FIELD_STEP: Record<string, number> = {
  name: 1,
  storeUrl: 1,
  hostPhotoUrl: 3,
  world: 4,
  scenes: 4,
  contactEmail: 5,
};

type Handoff = { started: boolean; message: string; url?: string; reason?: string };
type Submitted = { brand: Brand; filename: string; handoff: Handoff };

export function Wizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [analysis, setAnalysis] = useState<StoreAnalysis | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key as string];
      return next;
    });
  };

  // The same parser the server uses, so what you see previewed is what gets
  // built — a scene that reads differently on the two sides is a bug nobody
  // finds until the experience is live.
  const scenePreview = useMemo(() => parseScenes(form.scenes), [form.scenes]);

  async function readCatalogue() {
    if (!form.storeUrl.trim()) {
      setErrors((previous) => ({ ...previous, storeUrl: "We need your shop's address." }));
      setStep(1);
      return;
    }
    setAnalysing(true);
    setAnalysisError(null);
    setAnalysis(null);
    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storeUrl: form.storeUrl }),
      });
      const payload = (await response.json()) as StoreAnalysis & { error?: string };
      if (!response.ok) {
        setAnalysisError(payload.error ?? "We could not read that shop.");
        return;
      }
      setAnalysis(payload);
    } catch {
      setAnalysisError("The connection dropped before we finished reading. Try again.");
    } finally {
      setAnalysing(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        brand?: Brand;
        filename?: string;
        handoff?: Handoff;
        errors?: FieldError[];
        error?: string;
      };

      if (response.status === 422 && payload.errors?.length) {
        const mapped: Record<string, string> = {};
        for (const item of payload.errors) mapped[item.field] = item.message;
        setErrors(mapped);
        const first = payload.errors[0];
        setStep(first ? (FIELD_STEP[first.field] ?? 1) : 1);
        return;
      }
      if (!response.ok || !payload.brand || !payload.handoff) {
        setSubmitError(payload.error ?? "Something went wrong on our end. Try again.");
        return;
      }
      setSubmitted({
        brand: payload.brand,
        filename: payload.filename ?? `${payload.brand.slug}.json`,
        handoff: payload.handoff,
      });
    } catch {
      setSubmitError("The connection dropped before we finished. Nothing was lost — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step < 5) {
      // Only the first step has anything we can usefully check here; the rest
      // is the server's job, and the server is the one that decides.
      if (step === 1) {
        const missing: Record<string, string> = {};
        if (!form.name.trim()) missing["name"] = "Tell us what the brand is called.";
        if (!form.storeUrl.trim()) missing["storeUrl"] = "We need your shop's address.";
        if (Object.keys(missing).length) {
          setErrors((previous) => ({ ...previous, ...missing }));
          return;
        }
      }
      setStep((s) => Math.min(5, s + 1));
      return;
    }
    void submit();
  }

  function download() {
    if (!submitted) return;
    const blob = new Blob([`${JSON.stringify(submitted.brand, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = submitted.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (submitted) {
    return (
      <Section id="setup" tone="paper">
        <Reveal>
          <Eyebrow>{submitted.handoff.started ? "Building now" : "Brief received"}</Eyebrow>
          <h2 className="display-lg mt-6">
            {submitted.handoff.started
              ? `${submitted.brand.name} is being built.`
              : `${submitted.brand.name} is on its way.`}
          </h2>
        </Reveal>
        <Reveal delay={120} className="mt-12 border border-border bg-card p-8 md:p-12">
          <p className="text-base leading-relaxed">{submitted.handoff.message}</p>

          {submitted.handoff.started && submitted.handoff.url && (
            <div className="mt-8 border border-electric/40 bg-electric/5 p-6">
              <p className="eyebrow text-electric">Your experience will be here</p>
              <a
                href={submitted.handoff.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block break-all font-display text-xl font-bold underline decoration-electric underline-offset-4"
              >
                {submitted.handoff.url}
              </a>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                It takes a few minutes. The link will not work until it finishes, so give it a
                moment before you try.
              </p>
            </div>
          )}

          <dl className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
            {[
              ["Identifier", submitted.brand.slug],
              ["Shop", submitted.brand.store.domain],
              ["Host", submitted.brand.host.name],
              ["Language", submitted.brand.language === "en" ? "English" : "Spanish"],
              ["Scenes", String(submitted.brand.scenes.length)],
            ].map(([label, value]) => (
              <div key={label} className="bg-card px-6 py-5">
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-2 font-display text-lg font-bold">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            {submitted.brand.intake.defaults.length > 0 ? (
              <>
                We filled in what you left blank:{" "}
                <span className="text-foreground">
                  {submitted.brand.intake.defaults.join(", ")}
                </span>
                . Change any of it by sending the brief back with a note.{" "}
              </>
            ) : null}
            This brief is everything we hold about you. No images were uploaded and none are kept —
            your catalogue and any reference link are read live, each time.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <CTA variant="electric" onClick={download}>
              Download the brief
            </CTA>
            <CTA
              variant="outline"
              onClick={() => {
                setSubmitted(null);
                setForm(EMPTY);
                setAnalysis(null);
                setAnalysisError(null);
                setStep(1);
              }}
            >
              Submit another brand
            </CTA>
          </div>
        </Reveal>
      </Section>
    );
  }

  return (
    <Section id="setup" tone="paper">
      <Reveal>
        <Eyebrow>Setup</Eyebrow>
        <h2 className="display-lg mt-6">Build it in five steps.</h2>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Step two reads your actual shop and tells you what we found. Nothing is uploaded and
          nothing is stored.
        </p>
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

        <form onSubmit={onSubmit} className="p-8 md:p-12">
          {step === 1 && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Field
                  label="Brand name"
                  value={form.name}
                  onChange={(v) => set("name", v)}
                  placeholder="Casa Marés"
                  error={errors["name"]}
                />
                <Field
                  label="Shop address"
                  value={form.storeUrl}
                  onChange={(v) => set("storeUrl", v)}
                  placeholder="www.casamares.com"
                  error={errors["storeUrl"]}
                  hint="Your live storefront, not the Shopify admin."
                />
              </div>
              <div className="space-y-6">
                <Field
                  label="Monogram"
                  value={form.monogram}
                  onChange={(v) => set("monogram", v.toUpperCase().slice(0, 2))}
                  placeholder={form.name.trim().charAt(0).toUpperCase() || "C"}
                  hint="One or two letters for the mark and the browser tab. We propose one if you skip it."
                />
                <label className="block">
                  <span className="eyebrow">Language</span>
                  <div className="mt-3 flex gap-px border border-border bg-border">
                    {[
                      ["es", "Spanish"],
                      ["en", "English"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set("language", value as string)}
                        className={cn(
                          "flex-1 px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                          form.language === value
                            ? "bg-foreground text-primary-foreground"
                            : "bg-card hover:bg-muted",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Read the catalogue</p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    We fetch your public Shopify feed and report what we can put on a person, what
                    completes a look, and what we could not place. It takes a few seconds.
                  </p>
                </div>
                <CTA variant="electric" onClick={() => void readCatalogue()} disabled={analysing}>
                  {analysing ? "Reading…" : analysis ? "Read it again" : "Read my catalogue"}
                </CTA>
              </div>

              {analysing && (
                <p className="mt-8 text-sm text-muted-foreground">
                  Reading {form.storeUrl || "your shop"}…
                </p>
              )}

              {analysisError && (
                <div className="mt-8 border border-destructive/40 bg-destructive/5 p-6">
                  <p className="eyebrow text-destructive">We could not read it</p>
                  <p className="mt-3 text-sm leading-relaxed">{analysisError}</p>
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    You can carry on anyway — a password-protected shop is a normal case, and we
                    will sort the catalogue out with you by hand.
                  </p>
                </div>
              )}

              {analysis && <AnalysisReport analysis={analysis} />}

              {!analysing && !analysis && !analysisError && (
                <p className="mt-8 text-sm text-muted-foreground">
                  Nothing read yet. This is the only step that touches your shop.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Field
                  label="Host name"
                  value={form.hostName}
                  onChange={(v) => set("hostName", v)}
                  placeholder="We propose one"
                  hint="The person who wears your clothes through the experience."
                />
                <Field
                  label="Reference photo link"
                  value={form.hostPhotoUrl}
                  onChange={(v) => set("hostPhotoUrl", v)}
                  placeholder="https://…"
                  error={errors["hostPhotoUrl"]}
                  hint="Optional, and a link only — we never take a copy. Only send someone you have written permission to use."
                />
              </div>
              <Field
                label="Who they are"
                value={form.hostBrief}
                onChange={(v) => set("hostBrief", v)}
                placeholder="A woman in her early thirties, dark hair, warm and unhurried."
                textarea
                rows={7}
                hint="Leave it blank and we will propose someone for you to approve."
              />
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Field
                  label="Your world"
                  value={form.world}
                  onChange={(v) => set("world", v)}
                  placeholder="Linen and cotton shirting for warm evenings on the Mediterranean coast."
                  textarea
                  rows={4}
                  error={errors["world"]}
                  hint="One line: what you make, the fabric, and where it gets worn."
                />
                <Field
                  label="Scenes"
                  value={form.scenes}
                  onChange={(v) => set("scenes", v)}
                  placeholder={
                    "IN THE CITY | a narrow street at dusk, warm shopfront light\nON THE ROOFTOP | a terrace at golden hour"
                  }
                  textarea
                  rows={6}
                  error={errors["scenes"]}
                  hint={`One idea per line, up to ${MAX_SCENES}. LABEL | description, or just a description.`}
                />
              </div>
              <div>
                <p className="eyebrow">How we read them</p>
                {scenePreview.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Nothing yet. Leave it blank and we will propose scenes from your world.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {scenePreview.map((scene) => (
                      <li key={scene.id} className="border border-border p-4">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-electric">
                          {scene.label}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {scene.prompt}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                {scenePreview.length > MAX_SCENES && (
                  <p className="mt-4 text-sm text-destructive">
                    That is more than {MAX_SCENES} scenes.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Field
                  label="Where do we reply"
                  value={form.contactEmail}
                  onChange={(v) => set("contactEmail", v)}
                  placeholder="you@yourbrand.com"
                  error={errors["contactEmail"]}
                  hint="Optional. Without it we have no way to come back to you."
                />
                {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              </div>
              <Summary form={form} analysis={analysis} scenes={scenePreview.length} />
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back
            </button>
            <CTA type="submit" variant={step === 5 ? "electric" : "solid"} disabled={submitting}>
              {step === 5 ? (submitting ? "Sending…" : "Create my experience →") : "Next →"}
            </CTA>
          </div>
        </form>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------- the report */

function AnalysisReport({ analysis }: { analysis: StoreAnalysis }) {
  const [showWarnings, setShowWarnings] = useState(false);

  return (
    <div className="mt-8 space-y-8">
      <dl className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Products read", analysis.counts.total],
          ["Can be worn", analysis.counts.tryable],
          ["Complete a look", analysis.counts.mapped - analysis.counts.tryable],
          ["We could not place", analysis.counts.unclassified],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-card px-6 py-5">
            <dt className="eyebrow">{label}</dt>
            <dd className="mt-2 font-display text-4xl font-extrabold">{value}</dd>
          </div>
        ))}
      </dl>

      {analysis.truncated && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          This was a partial read, kept short so the page stays responsive. The whole catalogue is
          read again, with no time limit, when the experience is built.
        </p>
      )}

      <div>
        <p className="eyebrow">Picker tabs we would build</p>
        {analysis.families.length === 0 ? (
          <p className="mt-4 text-sm text-destructive">
            No family has enough products for a tab. We would need to look at this catalogue with
            you.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.families.map((family) => (
              <span
                key={family.id}
                className="border border-border px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em]"
              >
                {family.label}
                <span className="ml-3 text-muted-foreground">{family.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="eyebrow">Budget bands from your prices</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {analysis.budgets.map((budget) => (
              <li key={budget.label}>{budget.label}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Price range</p>
          <p className="mt-4 font-display text-2xl font-bold">
            €{analysis.priceRange.min} – €{analysis.priceRange.max}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Median €{analysis.priceRange.median}</p>
        </div>
      </div>

      {analysis.warnings.length > 0 && (
        <div className="border border-border p-6">
          <button
            type="button"
            onClick={() => setShowWarnings((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="eyebrow">{analysis.warnings.length} thing(s) worth a look</span>
            <span className="text-muted-foreground">{showWarnings ? "−" : "+"}</span>
          </button>
          {showWarnings && (
            <ul className="mt-5 space-y-4">
              {analysis.warnings.map((warning) => (
                <li key={warning} className="text-sm leading-relaxed text-muted-foreground">
                  {warning}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Summary({
  form,
  analysis,
  scenes,
}: {
  form: Form;
  analysis: StoreAnalysis | null;
  scenes: number;
}) {
  const rows: [string, ReactNode][] = [
    ["Brand", form.name || "—"],
    ["Shop", form.storeUrl || "—"],
    ["Language", form.language === "en" ? "English" : "Spanish"],
    ["Host", form.hostName || "we propose one"],
    ["Scenes", scenes === 0 ? "we propose them" : String(scenes)],
    ["Catalogue", analysis ? `${analysis.counts.tryable} garments you can wear` : "not read yet"],
  ];

  return (
    <div className="border border-border p-6">
      <p className="eyebrow">What we are about to build</p>
      <dl className="mt-5 space-y-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6">
            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {label}
            </dt>
            <dd className="text-right text-sm">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Submitting sends us this brief and nothing else. No images are uploaded and none are kept.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------- the inputs */

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  textarea = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  hint?: string | undefined;
  // Explicitly `| undefined`: with exactOptionalPropertyTypes, a caller reading
  // `errors["name"]` hands over undefined, which an optional-but-not-undefined
  // prop refuses.
  error?: string | undefined;
  textarea?: boolean;
  rows?: number;
}) {
  const classes = cn(
    "mt-2 w-full border-b bg-transparent py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60",
    error ? "border-destructive focus:border-destructive" : "border-border focus:border-electric",
  );

  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(classes, "resize-y leading-relaxed")}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={classes}
        />
      )}
      {error ? (
        <span className="mt-2 block text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}
