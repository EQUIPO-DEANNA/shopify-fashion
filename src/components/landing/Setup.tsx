import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CTA, Eyebrow, Reveal, Section } from "./primitives";
import { parseScenes, MAX_SCENES, type Brand, type FieldError } from "@/lib/intake/brief";
import type { StoreAnalysis } from "@/lib/intake/analyse";
import { useT } from "@/lib/i18n";

export function ThreeThings() {
  const t = useT();

  return (
    <Section tone="background">
      <Reveal>
        <Eyebrow>{t("Lo que necesitamos de la marca")}</Eyebrow>
        <h2 className="display-lg mt-6">{t("Tres cosas.")}</h2>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        <Reveal className="border border-border bg-card p-10">
          <p className="font-display text-5xl font-extrabold text-muted-foreground/40">01</p>
          <h3 className="display-md mt-6">{t("La dirección de tu tienda")}</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t(
              "Y ya está el catálogo. Leemos tu feed público de Shopify en directo cada vez: productos, fotos y precios. Nada que subir, nada que mantener sincronizado.",
            )}
          </p>
          <div className="mt-8 border border-dashed border-border p-5">
            <p className="font-mono text-xs text-muted-foreground">www.tumarca.com</p>
            <p className="mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-electric">
              {t("No guardamos nada")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t("Tus imágenes se quedan en tu CDN. Guardamos direcciones, no ficheros.")}
            </p>
          </div>
        </Reveal>

        <Reveal delay={110} className="border border-border bg-card p-10">
          <p className="font-display text-5xl font-extrabold text-muted-foreground/40">02</p>
          <h3 className="display-md mt-6">{t("Tu marca")}</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t(
              "Un nombre y una letra para el símbolo. Los colores y la tipografía los sacamos de tu propia web, para que la experiencia se parezca a ti y no a nosotros.",
            )}
          </p>
          <div className="mt-8 space-y-3">
            {[
              ["Nombre de la marca", "Obligatorio"],
              ["Monograma", "Lo proponemos"],
              ["Colores", "De tu web"],
              ["Tipografía", "De tu web"],
              ["Idioma", "Español o inglés"],
            ].map(([label, note], i) => (
              <div
                key={label}
                className="flex items-center justify-between border border-border px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em]"
              >
                {t(label as string)}
                <span className={i === 0 ? "text-electric" : "text-muted-foreground"}>
                  {t(note as string)}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={220} className="border border-border bg-card p-10">
          <p className="font-display text-5xl font-extrabold text-muted-foreground/40">03</p>
          <h3 className="display-md mt-6">{t("Tu anfitrión y tu mundo")}</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t(
              "Una línea sobre qué haces y dónde se lleva, y quién lo lleva. El anfitrión es una persona que generamos, nunca una real, salvo que nos mandes a alguien cuyos derechos tengas.",
            )}
          </p>
          <div className="mt-8 space-y-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            {["Una línea sobre tu mundo", "Quién es el anfitrión", "Dónde pasan las escenas"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="w-full border border-border px-4 py-3">{t(item)}</span>
                </div>
              ),
            )}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            {t("Tu tienda de Shopify sigue mandando en productos, precios y checkout.")}
          </p>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="mt-24 text-center">
          <h2 className="display-xl">{t("Ya está.")}</h2>
          <h3 className="display-md mt-4 text-muted-foreground">
            {t("Nosotros construimos la experiencia.")}
          </h3>
        </div>
      </Reveal>
    </Section>
  );
}

/* --------------------------------------------------------------- el formulario */

const steps = [
  { n: 1, title: "Tu marca" },
  { n: 2, title: "Tu catálogo" },
  { n: 3, title: "Tu anfitrión" },
  { n: 4, title: "Tu mundo" },
  { n: 5, title: "Listo" },
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
type Submitted = { brand: Brand; handoff: Handoff };

export function Wizard() {
  const t = useT();
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
      setErrors((previous) => ({
        ...previous,
        storeUrl: t("Necesitamos la dirección de tu tienda."),
      }));
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
        setAnalysisError(payload.error ?? t("No hemos podido leer esa tienda."));
        return;
      }
      setAnalysis(payload);
    } catch {
      setAnalysisError(t("Se ha cortado la conexión antes de terminar. Inténtalo otra vez."));
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
        setSubmitError(
          payload.error ?? t("Algo ha fallado por nuestra parte. Inténtalo otra vez."),
        );
        return;
      }
      setSubmitted({ brand: payload.brand, handoff: payload.handoff });
    } catch {
      setSubmitError(t("Se ha cortado la conexión. No se ha perdido nada, inténtalo otra vez."));
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
        if (!form.name.trim()) missing["name"] = t("Dinos cómo se llama la marca.");
        if (!form.storeUrl.trim())
          missing["storeUrl"] = t("Necesitamos la dirección de tu tienda.");
        if (Object.keys(missing).length) {
          setErrors((previous) => ({ ...previous, ...missing }));
          return;
        }
      }
      setStep((current) => Math.min(5, current + 1));
      return;
    }
    void submit();
  }

  if (submitted) {
    return (
      <Building
        brand={submitted.brand}
        handoff={submitted.handoff}
        onRestart={() => {
          setSubmitted(null);
          setForm(EMPTY);
          setAnalysis(null);
          setAnalysisError(null);
          setStep(1);
        }}
      />
    );
  }

  return (
    <Section id="setup" tone="paper">
      <Reveal>
        <Eyebrow>{t("Empezar")}</Eyebrow>
        <h2 className="display-lg mt-6">{t("Cinco pasos y listo.")}</h2>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t(
            "El paso dos lee tu tienda de verdad y te dice lo que hemos encontrado. No se sube nada y no se guarda nada.",
          )}
        </p>
      </Reveal>

      <Reveal delay={120} className="mt-12 border border-border bg-card">
        <div className="flex flex-wrap gap-px border-b border-border bg-border">
          {steps.map((item) => (
            <button
              key={item.n}
              type="button"
              onClick={() => setStep(item.n)}
              className={cn(
                "flex-1 bg-card px-4 py-5 text-left transition-colors",
                step === item.n ? "bg-foreground text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <span className="text-[0.6rem] font-semibold tracking-[0.24em] opacity-60">
                {t("PASO")} {item.n}
              </span>
              <span className="mt-2 block text-[0.7rem] font-semibold uppercase tracking-[0.14em]">
                {t(item.title)}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="p-8 md:p-12">
          {step === 1 && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Field
                  label={t("Nombre de la marca")}
                  value={form.name}
                  onChange={(value) => set("name", value)}
                  placeholder="Casa Marés"
                  error={errors["name"]}
                />
                <Field
                  label={t("Dirección de la tienda")}
                  value={form.storeUrl}
                  onChange={(value) => set("storeUrl", value)}
                  placeholder="www.casamares.com"
                  error={errors["storeUrl"]}
                  hint={t("Tu tienda en directo, no el panel de Shopify.")}
                />
              </div>
              <div className="space-y-6">
                <Field
                  label={t("Monograma")}
                  value={form.monogram}
                  onChange={(value) => set("monogram", value.toUpperCase().slice(0, 2))}
                  placeholder={form.name.trim().charAt(0).toUpperCase() || "C"}
                  hint={t(
                    "Una o dos letras para el símbolo y la pestaña del navegador. Si lo dejas, lo proponemos nosotros.",
                  )}
                />
                <label className="block">
                  <span className="eyebrow">{t("Idioma")}</span>
                  <div className="mt-3 flex gap-px border border-border bg-border">
                    {[
                      ["es", "Español"],
                      ["en", "Inglés"],
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
                        {t(label as string)}
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
                  <p className="eyebrow">{t("Leer el catálogo")}</p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {t(
                      "Leemos tu feed público de Shopify y te decimos qué podemos poner sobre una persona, qué completa un look, y qué no hemos sabido colocar. Tarda unos segundos.",
                    )}
                  </p>
                </div>
                <CTA variant="electric" onClick={() => void readCatalogue()} disabled={analysing}>
                  {analysing
                    ? t("Leyendo…")
                    : analysis
                      ? t("Leerlo otra vez")
                      : t("Leer mi catálogo")}
                </CTA>
              </div>

              {analysing && (
                <p className="mt-8 text-sm text-muted-foreground">
                  {t("Leyendo")} {form.storeUrl || t("tu tienda")}…
                </p>
              )}

              {analysisError && (
                <div className="mt-8 border border-destructive/40 bg-destructive/5 p-6">
                  <p className="eyebrow text-destructive">{t("No hemos podido leerla")}</p>
                  <p className="mt-3 text-sm leading-relaxed">{analysisError}</p>
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    {t(
                      "Puedes seguir igualmente: una tienda con contraseña es algo normal y lo resolvemos contigo a mano.",
                    )}
                  </p>
                </div>
              )}

              {analysis && <AnalysisReport analysis={analysis} />}

              {!analysing && !analysis && !analysisError && (
                <p className="mt-8 text-sm text-muted-foreground">
                  {t("Todavía no hemos leído nada. Este es el único paso que toca tu tienda.")}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Field
                  label={t("Nombre del anfitrión")}
                  value={form.hostName}
                  onChange={(value) => set("hostName", value)}
                  placeholder={t("Lo proponemos nosotros")}
                  hint={t("La persona que lleva tu ropa a lo largo de la experiencia.")}
                />
                <Field
                  label={t("Enlace a una foto de referencia")}
                  value={form.hostPhotoUrl}
                  onChange={(value) => set("hostPhotoUrl", value)}
                  placeholder="https://…"
                  error={errors["hostPhotoUrl"]}
                  hint={t(
                    "Opcional, y solo un enlace: nunca nos quedamos una copia. Manda únicamente a alguien de quien tengas permiso por escrito.",
                  )}
                />
              </div>
              <Field
                label={t("Quién es")}
                value={form.hostBrief}
                onChange={(value) => set("hostBrief", value)}
                placeholder={t("Una mujer de treinta y pocos, pelo oscuro, cercana y sin prisa.")}
                textarea
                rows={7}
                hint={t("Déjalo en blanco y te proponemos a alguien para que lo apruebes.")}
              />
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Field
                  label={t("Tu mundo")}
                  value={form.world}
                  onChange={(value) => set("world", value)}
                  placeholder={t(
                    "Camisas de lino y algodón para las noches de verano en el Mediterráneo.",
                  )}
                  textarea
                  rows={4}
                  error={errors["world"]}
                  hint={t("Una línea: qué haces, con qué tejido, y dónde se lleva.")}
                />
                <Field
                  label={t("Escenas")}
                  value={form.scenes}
                  onChange={(value) => set("scenes", value)}
                  placeholder={
                    "EN LA CIUDAD | una calle estrecha al atardecer, luz cálida de escaparate\n" +
                    "EN LA AZOTEA | una terraza a la hora dorada"
                  }
                  textarea
                  rows={6}
                  error={errors["scenes"]}
                  hint={`${t("Una idea por línea, hasta")} ${MAX_SCENES}. ${t("ETIQUETA | descripción, o solo la descripción.")}`}
                />
              </div>
              <div>
                <p className="eyebrow">{t("Cómo las leemos")}</p>
                {scenePreview.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t("Nada todavía. Si lo dejas en blanco, proponemos escenas desde tu mundo.")}
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {scenePreview.map((sceneItem) => (
                      <li key={sceneItem.id} className="border border-border p-4">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-electric">
                          {sceneItem.label}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {sceneItem.prompt}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                {scenePreview.length > MAX_SCENES && (
                  <p className="mt-4 text-sm text-destructive">
                    {t("Eso son más de")} {MAX_SCENES} {t("escenas.")}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Field
                  label={t("Dónde te contestamos")}
                  value={form.contactEmail}
                  onChange={(value) => set("contactEmail", value)}
                  placeholder="tu@tumarca.com"
                  error={errors["contactEmail"]}
                  hint={t("Opcional. Sin esto no tenemos forma de volver a ti.")}
                />
                {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              </div>
              <Summary form={form} analysis={analysis} scenes={scenePreview.length} />
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              ← {t("Atrás")}
            </button>
            <CTA type="submit" variant={step === 5 ? "electric" : "solid"} disabled={submitting}>
              {step === 5
                ? submitting
                  ? t("Enviando…")
                  : `${t("Crear mi experiencia")} →`
                : `${t("Siguiente")} →`}
            </CTA>
          </div>
        </form>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------- mientras se construye */

type BuildState = "building" | "done" | "failed" | "unknown";
type Status = { state: BuildState; url?: string; run?: string; minutes?: number };

/** What the factory is doing, in the order it does it. */
const PHASES = [
  "Leyendo tu catálogo",
  "Cogiendo los colores y la tipografía de tu web",
  "Generando la fotografía",
  "Montando el sitio",
  "Publicándolo",
];

/**
 * The page a brand waits on.
 *
 * It shows elapsed time and the real list of what the factory does, and it does
 * NOT pretend to know which of those it is on. The workflow reports one bit —
 * running, or finished — so a per-step progress bar here would be invented.
 * Sitting with a spinner for eight minutes is tolerable; being lied to about
 * minute six is not.
 */
function Building({
  brand,
  handoff,
  onRestart,
}: {
  brand: Brand;
  handoff: Handoff;
  onRestart: () => void;
}) {
  const t = useT();
  const [status, setStatus] = useState<Status>({
    state: handoff.started ? "building" : "unknown",
  });
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());

  // A clock of our own, so the page is never frozen between polls.
  useEffect(() => {
    if (!handoff.started) return;
    const tick = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    );
    return () => clearInterval(tick);
  }, [handoff.started]);

  useEffect(() => {
    if (!handoff.started) return;
    let alive = true;

    async function poll() {
      try {
        const response = await fetch(`/api/build-status?slug=${encodeURIComponent(brand.slug)}`);
        if (!response.ok) return;
        const next = (await response.json()) as Status;
        if (!alive) return;
        // "unknown" early on means the run has not appeared in the API yet.
        // Treating that as a failure would flash an error at every brand in
        // the first few seconds of a build that is going perfectly well.
        if (next.state === "unknown") return;
        setStatus(next);
      } catch {
        // A dropped poll is not news. The next one is in five seconds.
      }
    }

    void poll();
    const timer = setInterval(() => void poll(), 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [brand.slug, handoff.started]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  // Nothing was started: no build to watch, so say what will happen instead.
  if (!handoff.started) {
    return (
      <Section id="setup" tone="paper">
        <Reveal>
          <Eyebrow>{t("Ficha recibida")}</Eyebrow>
          <h2 className="display-lg mt-6">
            {brand.name} {t("está en camino.")}
          </h2>
        </Reveal>
        <Reveal delay={120} className="mt-12 border border-border bg-card p-8 md:p-12">
          <p className="text-base leading-relaxed">{handoff.message}</p>
          <BrandFacts brand={brand} />
          <StorageNote brand={brand} />
          <div className="mt-10">
            <CTA variant="outline" onClick={onRestart}>
              {t("Enviar otra marca")}
            </CTA>
          </div>
        </Reveal>
      </Section>
    );
  }

  return (
    <Section id="setup" tone="paper">
      <Reveal>
        <Eyebrow>
          {status.state === "done"
            ? t("Lista")
            : status.state === "failed"
              ? t("Se ha parado")
              : t("Construyendo")}
        </Eyebrow>
        <h2 className="display-lg mt-6">
          {status.state === "done"
            ? `${brand.name} ${t("ya está en marcha.")}`
            : status.state === "failed"
              ? `${brand.name} ${t("no ha llegado a publicarse.")}`
              : `${t("Estamos construyendo")} ${brand.name}.`}
        </h2>
      </Reveal>

      <Reveal delay={120} className="mt-12 border border-border bg-card p-8 md:p-12">
        {status.state === "done" && status.url ? (
          <div>
            <p className="text-base leading-relaxed">
              {t("Ya puedes abrirla. Pruébate tu propia ropa.")}
            </p>
            <a
              href={status.url}
              target="_blank"
              rel="noreferrer"
              className="mt-8 block break-all border border-electric bg-electric/5 p-8 font-display text-2xl font-bold underline decoration-electric underline-offset-4 md:text-3xl"
            >
              {status.url}
            </a>
          </div>
        ) : status.state === "failed" ? (
          <div>
            <p className="text-base leading-relaxed">
              {t(
                "Algo se ha torcido durante la construcción. Ya lo sabemos y alguien lo está mirando; no hace falta que vuelvas a enviar nada.",
              )}
            </p>
            {brand.intake.contactEmail ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {t("Te escribimos a")} {brand.intake.contactEmail}.
              </p>
            ) : null}
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <p className="text-base leading-relaxed">
                {t("Tarda unos diez minutos. Puedes dejar esta página abierta.")}
              </p>
              <p className="font-display text-3xl font-extrabold tabular-nums">
                {minutes}:{String(seconds).padStart(2, "0")}
              </p>
            </div>

            <ul className="mt-10 space-y-px border border-border bg-border">
              {PHASES.map((phase) => (
                <li
                  key={phase}
                  className="flex items-center gap-4 bg-card px-6 py-5 text-sm text-muted-foreground"
                >
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-electric" />
                  {t(phase)}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              {t(
                "No te decimos por cuál va porque no lo sabemos: la máquina avisa cuando termina, no paso a paso. Preferimos no inventarnos una barra de progreso.",
              )}
            </p>
          </div>
        )}

        <BrandFacts brand={brand} />
        <StorageNote brand={brand} />

        <div className="mt-10 flex flex-wrap gap-3">
          {status.state === "done" && status.url && (
            <CTA variant="electric" href={status.url}>
              {t("Abrir mi experiencia")} →
            </CTA>
          )}
          <CTA variant="outline" onClick={onRestart}>
            {t("Enviar otra marca")}
          </CTA>
        </div>
      </Reveal>
    </Section>
  );
}

function BrandFacts({ brand }: { brand: Brand }) {
  const t = useT();

  return (
    <dl className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
      {[
        [t("Identificador"), brand.slug],
        [t("Tienda"), brand.store.domain],
        [t("Anfitrión"), brand.host.name],
        [t("Idioma"), brand.language === "en" ? t("Inglés") : t("Español")],
        [t("Escenas"), String(brand.scenes.length)],
      ].map(([label, value]) => (
        <div key={label} className="bg-card px-6 py-5">
          <dt className="eyebrow">{label}</dt>
          <dd className="mt-2 font-display text-lg font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StorageNote({ brand }: { brand: Brand }) {
  const t = useT();

  return (
    <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
      {brand.intake.defaults.length > 0 ? (
        <>
          {t("Hemos rellenado lo que dejaste en blanco:")}{" "}
          <span className="text-foreground">{brand.intake.defaults.join(", ")}</span>.{" "}
        </>
      ) : null}
      {t(
        "No se ha subido ninguna imagen y no guardamos ninguna: tu catálogo y cualquier enlace de referencia se leen en directo, cada vez.",
      )}
    </p>
  );
}

/* ------------------------------------------------------------------ el informe */

function AnalysisReport({ analysis }: { analysis: StoreAnalysis }) {
  const t = useT();
  const [showWarnings, setShowWarnings] = useState(false);

  return (
    <div className="mt-8 space-y-8">
      <dl className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t("Productos leídos"), analysis.counts.total],
          [t("Se pueden llevar"), analysis.counts.tryable],
          [t("Completan un look"), analysis.counts.mapped - analysis.counts.tryable],
          [t("No hemos sabido colocar"), analysis.counts.unclassified],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-card px-6 py-5">
            <dt className="eyebrow">{label}</dt>
            <dd className="mt-2 font-display text-4xl font-extrabold">{value}</dd>
          </div>
        ))}
      </dl>

      {analysis.truncated && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t(
            "Esto ha sido una lectura parcial, corta a propósito para que la página no se quede colgada. El catálogo entero se lee otra vez, sin límite de tiempo, cuando se construye la experiencia.",
          )}
        </p>
      )}

      <div>
        <p className="eyebrow">{t("Pestañas que montaríamos")}</p>
        {analysis.families.length === 0 ? (
          <p className="mt-4 text-sm text-destructive">
            {t(
              "Ninguna familia tiene productos suficientes para una pestaña. Habría que mirar este catálogo contigo.",
            )}
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
          <p className="eyebrow">{t("Tramos de precio, de tus propios precios")}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {analysis.budgets.map((budget) => (
              <li key={budget.label}>{budget.label}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">{t("Rango de precios")}</p>
          <p className="mt-4 font-display text-2xl font-bold">
            {analysis.priceRange.min} € – {analysis.priceRange.max} €
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Mediana")} {analysis.priceRange.median} €
          </p>
        </div>
      </div>

      {analysis.warnings.length > 0 && (
        <div className="border border-border p-6">
          <button
            type="button"
            onClick={() => setShowWarnings((value) => !value)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="eyebrow">
              {analysis.warnings.length} {t("cosas que conviene mirar")}
            </span>
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
  const t = useT();
  const rows: [string, ReactNode][] = [
    [t("Marca"), form.name || "—"],
    [t("Tienda"), form.storeUrl || "—"],
    [t("Idioma"), form.language === "en" ? t("Inglés") : t("Español")],
    [t("Anfitrión"), form.hostName || t("lo proponemos")],
    [t("Escenas"), scenes === 0 ? t("las proponemos") : String(scenes)],
    [
      t("Catálogo"),
      analysis
        ? `${analysis.counts.tryable} ${t("prendas que se pueden llevar")}`
        : t("sin leer todavía"),
    ],
  ];

  return (
    <div className="border border-border p-6">
      <p className="eyebrow">{t("Lo que vamos a construir")}</p>
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
        {t(
          "Al enviar nos llega esta ficha y nada más. No se sube ninguna imagen y no guardamos ninguna.",
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ los campos */

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
