import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CTA } from "./primitives";

const links = [
  { label: "Experiences", href: "#experiences" },
  { label: "Evidence", href: "#evidence" },
  { label: "Setup", href: "#setup" },
  { label: "Pricing", href: "#pricing" },
];

export function SiteNav() {
  const [solid, setSolid] = useState(false);

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
          Atelier<span className="text-electric">AI</span>
        </a>
        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <CTA href="#setup" className="px-5 py-3">
          Create my experience
        </CTA>
      </div>
    </header>
  );
}
