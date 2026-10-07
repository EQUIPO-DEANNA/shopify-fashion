import { CTA, Eyebrow, Reveal, Section } from "./primitives";
import heroModel from "@/assets/hero-model.jpg";
import sceneCity from "@/assets/scene-city.jpg";
import influencer from "@/assets/influencer.jpg";
import productPolo from "@/assets/product-polo.jpg";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function CoreIdea() {
  const t = useT();

  return (
    <Section tone="background">
      <div className="text-center">
        <Reveal>
          <h2 className="display-lg">{t("Tu tienda de Shopify vende ropa.")}</h2>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="display-lg mt-4 text-muted-foreground">
            {t("Nosotros la convertimos en")}{" "}
            <span className="text-electric">{t("experiencias")}</span>.
          </h2>
        </Reveal>
      </div>

      <div className="mt-20 grid items-stretch gap-8 md:grid-cols-[1fr_auto_1fr]">
        <Reveal className="border border-border bg-card p-8">
          <Eyebrow>{t("Antes")}</Eyebrow>
          <img
            src={productPolo}
            alt={t("Foto de catálogo")}
            loading="lazy"
            width={912}
            height={1104}
            className="mt-6 h-56 w-full object-cover"
          />
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {["Foto del producto", "Precio", "Talla", "Añadir al carrito"].map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
          </ul>
        </Reveal>

        <div className="flex items-center justify-center">
          <span className="font-display text-4xl text-electric">→</span>
        </div>

        <Reveal
          delay={120}
          className="border border-foreground/20 bg-foreground p-8 text-primary-foreground"
        >
          <p className="eyebrow text-primary-foreground/60">{t("Después")}</p>
          <img
            src={sceneCity}
            alt={t("Cliente dentro de una escena generada con IA")}
            loading="lazy"
            width={1024}
            height={1280}
            className="mt-6 h-56 w-full object-cover"
          />
          <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
            {["Verla", "Ponértela", "Combinarla", "Crear con ella", "Compartirla", "Comprarla"].map(
              (item) => (
                <li key={item}>{t(item)}</li>
              ),
            )}
          </ul>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <p className="mx-auto mt-16 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground">
          {t("El ecommerce de siempre le pide al cliente que se imagine con tu ropa.")}
          <br />
          <span className="text-foreground">{t("La IA deja que se vea de verdad.")}</span>
        </p>
      </Reveal>
    </Section>
  );
}

const scenes = [
  "Ibiza",
  "Madrid",
  "Club de playa",
  "Campo de golf",
  "Ciudad",
  "Hotel de lujo",
  "Estación de esquí",
];

const influencerScenes = [
  "En la playa con nuestro embajador",
  "En una fiesta",
  "Jugando al golf",
  "Paseando por Madrid",
  "En primera fila en la Fashion Week",
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
  const t = useT();

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
        {t("EXPERIENCIA")} {index}
      </p>
      <h3 className="display-md mt-4">{t(title)}</h3>
      <div
        className={cn(
          "mt-4 space-y-1 text-sm leading-relaxed",
          tone === "ink" ? "text-ink-foreground/70" : "text-muted-foreground",
        )}
      >
        {lines.map((line) => (
          <p key={line}>{t(line)}</p>
        ))}
      </div>
      <div className="mt-8 flex-1">{children}</div>
      {cta && (
        <div className="mt-8">
          <CTA variant={tone === "ink" ? "ghost-light" : "outline"} href="#setup">
            {t(cta)}
          </CTA>
        </div>
      )}
    </Reveal>
  );
}

function TryOnVisual() {
  const [on, setOn] = useState(false);
  const t = useT();

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <img
          src={heroModel}
          alt={t("Foto del cliente antes del probador")}
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
            alt={t("El cliente con la prenda puesta")}
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
        onClick={() => setOn((value) => !value)}
        className="mt-4 w-full border border-electric/40 bg-electric/10 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-electric transition-colors hover:bg-electric/20"
      >
        {on ? t("Reiniciar") : t("Probar con IA")}
      </button>
    </div>
  );
}

export function SixExperiences() {
  const [scene, setScene] = useState(0);
  const t = useT();

  return (
    <Section id="experiences" tone="paper">
      <Reveal>
        <Eyebrow>{t("La capa de experiencia")}</Eyebrow>
        <h2 className="display-lg mt-6">
          {t("Un producto.")}
          <br />
          {t("Seis experiencias.")}
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <CardShell
          index="01"
          title="Pruébatelo"
          lines={["Sube una foto.", "Elige una prenda.", "Mírate con ella puesta."]}
          cta="Probar esta experiencia →"
        >
          <TryOnVisual />
        </CardShell>

        <CardShell
          index="02"
          title="Completa tu look"
          lines={[
            "No te quedes en una prenda.",
            "Deja que la IA combine prendas de la tienda en looks completos.",
          ]}
          cta="Crear un look →"
        >
          <div className="flex flex-wrap items-center gap-2">
            {["Polo", "Pantalón", "Chaqueta", "Zapatos"].map((piece, i) => (
              <span key={piece} className="flex items-center gap-2">
                <span className="border border-border px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
                  {t(piece)}
                </span>
                {i < 3 && <span className="text-muted-foreground">+</span>}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span className="font-display text-2xl text-electric">↓</span>
            <span className="display-md">{t("Tu look")}</span>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[heroModel, sceneCity, influencer, heroModel].map((src, i) => (
              <img
                key={i}
                src={src}
                alt={t("Prenda del look")}
                loading="lazy"
                className="h-24 w-full object-cover"
              />
            ))}
          </div>
        </CardShell>

        <CardShell
          index="03"
          title="Entra en la marca"
          lines={["No solo lleves la ropa.", "Entra en el mundo de la marca."]}
          cta="Crear mi escena →"
        >
          <div className="flex flex-wrap gap-2">
            {scenes.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => setScene(i)}
                className={cn(
                  "border px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                  i === scene
                    ? "border-electric bg-electric text-electric-foreground"
                    : "border-border hover:border-foreground/40",
                )}
              >
                {t(name)}
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 border border-border bg-background p-4">
            <span className="text-electric">✦</span>
            <p className="text-sm text-muted-foreground">
              &laquo;{t("Ponme en")}{" "}
              <span className="text-foreground">{t(scenes[scene] ?? "")}</span>&raquo; —{" "}
              {t("la IA genera al cliente allí, con la ropa que ha elegido.")}
            </p>
          </div>
          <img
            src={influencer}
            alt={t("Escena generada con IA")}
            loading="lazy"
            width={1408}
            height={1024}
            className="mt-6 h-40 w-full object-cover"
          />
        </CardShell>

        <CardShell
          index="04"
          title="Conoce a tu embajador"
          tone="ink"
          lines={["Tu embajador ya no está solo en la campaña.", "El cliente puede salir con él."]}
          cta="Crear con un embajador →"
        >
          <img
            src={influencer}
            alt={t("Cliente y embajador juntos en una foto con IA")}
            loading="lazy"
            width={1408}
            height={1024}
            className="h-44 w-full object-cover"
          />
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
            <span className="border border-ink-foreground/30 px-3 py-2">{t("Cliente")}</span>
            <span>+</span>
            <span className="border border-ink-foreground/30 px-3 py-2">{t("Embajador")}</span>
            <span>+</span>
            <span className="border border-ink-foreground/30 px-3 py-2">{t("Tu ropa")}</span>
            <span className="text-electric">↓</span>
            <span className="bg-electric px-3 py-2 text-electric-foreground">
              {t("Foto con IA")}
            </span>
          </div>
          <ul className="mt-6 space-y-1 text-sm text-ink-foreground/70">
            {influencerScenes.map((line) => (
              <li key={line}>&laquo;{t(line)}&raquo;</li>
            ))}
          </ul>
          <p className="mt-6 text-[0.65rem] leading-relaxed text-ink-foreground/45">
            {t(
              "Las experiencias con embajadores requieren los derechos de imagen y los permisos correspondientes.",
            )}
          </p>
        </CardShell>

        <CardShell
          index="05"
          title="Dale vida"
          lines={[
            "Convierte la foto generada en vídeo.",
            "La persona camina. La cámara se mueve. La ropa se mueve de verdad.",
          ]}
        >
          <div className="relative h-52 overflow-hidden">
            <img
              src={sceneCity}
              alt={t("Look listo para animar")}
              loading="lazy"
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-2 border border-card/60 bg-foreground/60 px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                ▶ {t("Animar")}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-electric" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em]">
            {["Animar mi look", "Crear vídeo", "Compartir"].map((label) => (
              <span key={label} className="border border-border px-3 py-2">
                {t(label)}
              </span>
            ))}
          </div>
        </CardShell>

        <CardShell
          index="06"
          title="Comparte tu look"
          lines={[
            "Cada cliente puede ser creador.",
            "Cada look que cree puede ser contenido que traiga a otro cliente a tu marca.",
          ]}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {["WhatsApp", "Instagram", "TikTok", "Pinterest", "Facebook", "Copiar enlace"].map(
              (label) => (
                <span
                  key={label}
                  className="border border-border px-3 py-3 text-center text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-electric hover:text-electric"
                >
                  {t(label)}
                </span>
              ),
            )}
          </div>
          <p className="display-md mt-8">{t("Cada cliente puede ser creador.")}</p>
        </CardShell>
      </div>
    </Section>
  );
}

const hotspots = [
  { label: "Polo marino", price: "89 €", top: "26%", left: "48%" },
  { label: "Pantalón blanco", price: "110 €", top: "62%", left: "40%" },
  { label: "Chaqueta", price: "179 €", top: "38%", left: "22%" },
];

export function ShopTheExperience() {
  const [active, setActive] = useState(0);
  const t = useT();

  return (
    <Section tone="background">
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal className="relative">
          <img
            src={sceneCity}
            alt={t("Look generado con prendas comprables")}
            loading="lazy"
            width={1024}
            height={1280}
            className="h-[560px] w-full object-cover"
          />
          {hotspots.map((spot, i) => (
            <button
              key={spot.label}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              style={{ top: spot.top, left: spot.left }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 border px-3 py-2 text-left text-[0.6rem] font-semibold uppercase tracking-[0.14em] backdrop-blur-md transition-all",
                i === active
                  ? "border-electric bg-electric text-electric-foreground"
                  : "border-card/70 bg-card/80 text-foreground",
              )}
            >
              {t(spot.label)}
              <span className="ml-2 opacity-70">{spot.price}</span>
            </button>
          ))}
        </Reveal>

        <div>
          <Reveal>
            <Eyebrow>{t("Compra desde la experiencia")}</Eyebrow>
            <h2 className="display-lg mt-6">{t("No sustituimos tu tienda.")}</h2>
            <h3 className="display-md mt-4 text-muted-foreground">
              {t("Te mandamos clientes que ya quieren la prenda.")}
            </h3>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
              {["Experiencia", "Producto", "Shopify", "Checkout"].map((step, i) => (
                <span key={step} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "border px-4 py-3",
                      i === 3
                        ? "border-electric bg-electric text-electric-foreground"
                        : "border-border",
                    )}
                  >
                    {t(step)}
                  </span>
                  {i < 3 && <span className="text-muted-foreground">→</span>}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10">
              <CTA variant="electric" href="#pricing">
                {t("Comprar este look")} →
              </CTA>
              <p className="mt-4 text-sm text-muted-foreground">
                {t(
                  "Al pulsar un look se abre la prenda en tu tienda de Shopify, con tus parámetros de seguimiento.",
                )}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
