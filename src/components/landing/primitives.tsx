import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/use-reveal";
import type { ReactNode } from "react";

export function Reveal({
  children,
  className,
  delay = 0,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <As
      ref={ref as never}
      className={cn("reveal", shown && "reveal-in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </As>
  );
}

export function Section({
  children,
  className,
  id,
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "paper" | "background" | "ink";
}) {
  const tones = {
    paper: "bg-paper text-foreground",
    background: "bg-background text-foreground",
    ink: "bg-ink text-ink-foreground",
  } as const;
  return (
    <section id={id} className={cn("px-5 py-24 sm:px-8 md:py-32", tones[tone], className)}>
      <div className="mx-auto w-full max-w-[1280px]">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function CTA({
  children,
  variant = "solid",
  className,
  onClick,
  href,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  variant?: "solid" | "outline" | "electric" | "ghost-light";
  className?: string;
  onClick?: () => void;
  href?: string;
  /** "submit" so a CTA can be the primary action of a real form. */
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const variants = {
    solid:
      "bg-primary text-primary-foreground hover:bg-foreground/85 hover:tracking-[0.2em] border border-transparent",
    outline:
      "border border-foreground/25 text-foreground hover:border-foreground hover:tracking-[0.2em]",
    electric:
      "bg-electric text-electric-foreground hover:brightness-110 border border-transparent shadow-card",
    "ghost-light":
      "border border-ink-foreground/30 text-ink-foreground hover:border-ink-foreground hover:tracking-[0.2em]",
  } as const;
  const classes = cn(
    "inline-flex items-center justify-center gap-2 px-7 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300",
    variants[variant],
    disabled && "pointer-events-none opacity-50",
    className,
  );
  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export function StepArrow({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("text-muted-foreground", className)}>
      →
    </span>
  );
}
