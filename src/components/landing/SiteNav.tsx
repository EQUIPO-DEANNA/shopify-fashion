import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CTA } from "./primitives";
import { LanguageToggle, useT } from "@/lib/i18n";

const links = [
  { label: "Experiencias", href: "#experiences" },
  { label: "Por qué funciona", href: "#evidence" },
  { label: "Ejemplos", href: "#examples" },
  { label: "Empezar", href: "#setup" },
  { label: "Precios", href: "#pricing" },
];

export function SiteNav() {
  const [solid, setSolid] = useState(false);
  const t = useT();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-display text-sm font-extrabold uppercase tracking-[0.3em]">
          Deanna<span className="text-electric">Fashion</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.label)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <LanguageToggle />
          <CTA href="#setup" className="px-5 py-3">
            {t("Crea tu experiencia")}
          </CTA>
        </div>
      </div>
    </header>
  );
}
