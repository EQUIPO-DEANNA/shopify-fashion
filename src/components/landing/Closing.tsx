import { CTA, Eyebrow, Reveal, Section } from "./primitives";
import heroModel from "@/assets/hero-model.jpg";
import scene from "@/assets/scene-city.jpg";
import influencer from "@/assets/influencer.jpg";
import polo from "@/assets/product-polo.jpg";
import { useT } from "@/lib/i18n";

const plans = [
  {
    name: "Inicio",
    price: "200 €",
    credits: "2.000",
    items: [
      "Hasta 100 productos",
      "Probador y Completa tu look",
      "Checkout en tu Shopify",
      "Analítica básica",
    ],
  },
  {
    name: "Crecimiento",
    price: "600 €",
    credits: "8.000",
    featured: true,
    items: [
      "Hasta 1.000 productos",
      "Escenas con IA y looks animados",
      "2 embajadores",
      "Analítica completa y test A/B",
    ],
  },
  {
    name: "Escala",
    price: "A medida",
    credits: "Sin límite",
    items: [
      "Catálogo sin límite",
      "Embajadores a medida",
      "Apoyo creativo dedicado",
      "SLA y renderizado prioritario",
    ],
  },
];

export function Pricing() {
  const t = useT();

  return (
    <Section id="pricing" tone="background">
      <Reveal>
        <Eyebrow>{t("Precios")}</Eyebrow>
        <h2 className="display-lg mt-6">{t("Planes mensuales, sin vueltas.")}</h2>
      </Reveal>
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <Reveal
            key={plan.name}
            delay={i * 80}
            className={
              plan.featured
                ? "border border-foreground bg-ink p-10 text-ink-foreground"
                : "border border-border bg-card p-10"
            }
          >
            <p className="eyebrow">{t(plan.name)}</p>
            <p className="mt-6 font-display text-6xl font-extrabold">{t(plan.price)}</p>
            <p className="mt-1 text-sm opacity-60">
              {plan.price === "A medida" ? t("Hablamos") : t("al mes")}
            </p>
            <p className="mt-6 text-sm font-semibold">
              <span className="text-electric">✦</span> {plan.credits} {t("créditos al mes")}
            </p>
            <ul className="mt-6 space-y-3 text-sm opacity-80">
              {plan.items.map((item) => (
                <li key={item}>— {t(item)}</li>
              ))}
            </ul>
            <div className="mt-10">
              <CTA href="#setup" variant={plan.featured ? "electric" : "solid"}>
                {t("Elegir")} {t(plan.name)}
              </CTA>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Credits() {
  const t = useT();
  const rows: [string, string][] = [
    ["Probador virtual", "1 crédito"],
    ["Completa tu look", "2 créditos"],
    ["Foto de escena con IA", "3 créditos"],
    ["Foto con el embajador", "4 créditos"],
    ["Look animado (vídeo)", "10 créditos"],
  ];

  return (
    <Section tone="paper">
      <div className="grid gap-16 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>{t("Créditos de cliente")}</Eyebrow>
          <h2 className="display-lg mt-6">{t("Ellos juegan. Tú mandas.")}</h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            {t(
              "Cada acción de un cliente gasta créditos de tu plan. Pon límites por persona, premia a quien compra con créditos extra, y no te llevas sustos en la factura.",
            )}
          </p>
        </Reveal>
        <Reveal delay={120} className="border border-border bg-card">
          {rows.map(([action, cost]) => (
            <div
              key={action}
              className="flex items-center justify-between border-b border-border px-8 py-5 last:border-b-0"
            >
              <span className="font-display font-bold uppercase">{t(action)}</span>
              <span className="text-sm text-muted-foreground">{t(cost)}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}

export function Analytics() {
  const t = useT();
  const kpis: [string, string][] = [
    ["Pruebas", "12.480"],
    ["Looks creados", "3.912"],
    ["Veces compartido", "1.204"],
    ["Añadido al carrito", "2.318"],
  ];
  const bars = [38, 52, 44, 61, 70, 58, 82, 76, 90, 84, 95, 88];

  return (
    <Section tone="background">
      <Reveal>
        <Eyebrow>{t("Analítica")}</Eyebrow>
        <h2 className="display-lg mt-6">{t("Mira qué se prueba la gente de verdad.")}</h2>
      </Reveal>
      <Reveal delay={120} className="mt-14 border border-border bg-card p-8 shadow-card">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {kpis.map(([label, value]) => (
            <div key={label}>
              <p className="eyebrow">{t(label)}</p>
              <p className="mt-2 font-display text-4xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex h-48 items-end gap-2">
          {bars.map((height, i) => (
            <div
              key={i}
              className={i === bars.length - 2 ? "flex-1 bg-electric" : "flex-1 bg-foreground/80"}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {t("Panel de ejemplo — datos ilustrativos.")}
        </p>
      </Reveal>
    </Section>
  );
}

export function SplitTest() {
  const t = useT();

  return (
    <Section tone="paper">
      <Reveal>
        <Eyebrow>{t("Test A/B")}</Eyebrow>
        <h2 className="display-lg mt-6">{t("Tienda normal frente a tienda con experiencia.")}</h2>
      </Reveal>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <Reveal className="border border-border bg-card p-8">
          <p className="eyebrow">{t("Tienda normal")}</p>
          <img
            src={polo}
            alt={t("Foto de producto estática")}
            loading="lazy"
            className="mt-6 aspect-[4/5] w-full object-cover grayscale"
          />
          <p className="mt-6 text-sm text-muted-foreground">
            {t("Una foto quieta. Baja, duda, se va.")}
          </p>
        </Reveal>
        <Reveal delay={120} className="border border-foreground bg-ink p-8 text-ink-foreground">
          <p className="eyebrow text-ink-foreground/60">
            {t("Tienda con experiencia")} <span className="text-electric">✦</span>
          </p>
          <img
            src={heroModel}
            alt={t("Cliente con la prenda puesta mediante el probador con IA")}
            loading="lazy"
            className="mt-6 aspect-[4/5] w-full object-cover"
          />
          <p className="mt-6 text-sm opacity-70">
            {t("Se la prueba, monta un look, lo comparte — y compra.")}
          </p>
        </Reveal>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        {t("Pon las dos en paralelo y mide la diferencia en tu propia analítica.")}
      </p>
    </Section>
  );
}

export function MobileTrio() {
  const t = useT();
  const phones = [
    { img: heroModel, label: "Pruébatelo" },
    { img: scene, label: "Ponlo en una escena" },
    { img: influencer, label: "Llévalo con un creador" },
  ];

  return (
    <Section tone="background">
      <Reveal className="text-center">
        <Eyebrow>{t("Primero el móvil")}</Eyebrow>
        <h2 className="display-lg mt-6">{t("Hecho para el pulgar.")}</h2>
      </Reveal>
      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {phones.map((phone, i) => (
          <Reveal key={phone.label} delay={i * 100} className={i === 1 ? "sm:-translate-y-8" : ""}>
            <div className="mx-auto max-w-[260px] rounded-[2.2rem] border-[10px] border-foreground bg-foreground shadow-float">
              <img
                src={phone.img}
                alt={t(phone.label)}
                loading="lazy"
                className="aspect-[9/19] w-full rounded-[1.6rem] object-cover"
              />
            </div>
            <p className="mt-6 text-center font-display font-bold uppercase">{t(phone.label)}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function FinalCTA() {
  const t = useT();

  return (
    <section id="start" className="bg-ink px-5 py-32 text-ink-foreground sm:px-8">
      <div className="mx-auto max-w-[1280px] text-center">
        <Reveal>
          <h2 className="display-xl">
            {t("Deja que se pongan")}
            <br />
            {t("tu marca.")}
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-ink-foreground/70">
            {t(
              "Lanza una experiencia de moda con IA sobre tu tienda de Shopify en días, no en meses.",
            )}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <CTA href="#setup" variant="electric">
              {t("Crea tu experiencia")} →
            </CTA>
            <CTA href="#examples" variant="ghost-light">
              {t("Ver un ejemplo real")}
            </CTA>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const t = useT();

  return (
    <footer className="border-t border-border bg-background px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6">
        <p className="font-display text-sm font-extrabold uppercase tracking-[0.3em]">
          Deanna<span className="text-electric">Fashion</span>
        </p>
        <p className="text-xs text-muted-foreground">
          © 2026 Deanna Fashion. {t("Funciona sobre la tienda de Shopify que ya tienes.")}
        </p>
      </div>
    </footer>
  );
}
