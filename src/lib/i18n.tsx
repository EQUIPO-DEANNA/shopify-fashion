import { useRouter } from "@tanstack/react-router";
import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EN } from "./i18n-en";

/**
 * Two languages, one source of truth.
 *
 * The site is Spanish. The brands it is shown to are Spanish, and so is the
 * team demoing it. But it is also put in front of investors who do not read
 * Spanish, so rather than keep two copies of the copy, the source carries the
 * SPANISH string and `t()` looks up the English.
 *
 * That direction is the whole point, and it is the opposite of the sibling
 * project's. There, English was the source because the audience being protected
 * was investors. Here the audience being protected is the brand: a string
 * nobody remembered to translate falls back to its own key, which is Spanish,
 * so the failure mode degrades the English view and never the Spanish one.
 *
 * Keys are the Spanish strings themselves. No invented key names to keep in
 * sync, and every call site reads as the sentence it renders.
 */

export type Lang = "es" | "en";

export const LANGS: Lang[] = ["es", "en"];

/**
 * Spanish, always — and deliberately NOT persisted.
 *
 * The choice lives for the session only, which is a feature rather than a
 * shortcut. Every fresh load renders Spanish, so nobody opens the site in front
 * of a brand and finds it in English because of something they clicked last
 * week.
 *
 * It also removes a real bug, found the hard way on the sibling project.
 * Restoring a stored language after hydration flips the store while React is
 * still hydrating lazily-loaded route components: the root's effect runs first,
 * the route component hydrates afterwards against already-changed state, and
 * React reports a text mismatch and re-renders the subtree. Because the
 * language now only ever changes on a click — long after hydration — server and
 * client can never disagree.
 */
export const DEFAULT_LANG: Lang = "es";

/**
 * Module-level rather than React state, because plenty of callers are not
 * components: route `head()` functions building <title>, and the fetch helpers
 * localising an error message before they throw.
 *
 * Safe under SSR: nothing on the server ever calls `setLang`, so this stays
 * DEFAULT_LANG for every request and cannot leak across them.
 */
let current: Lang = DEFAULT_LANG;
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}

export function setLang(next: Lang): void {
  if (next === current) return;
  current = next;
  if (typeof document !== "undefined") document.documentElement.lang = next;
  for (const listener of listeners) listener();
}

/** Translate. Unknown keys return themselves, which is the Spanish copy. */
export function t(es: string): string {
  if (current === "es") return es;
  return EN[es] ?? es;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Re-renders the calling component whenever the language changes. */
export function useLang(): Lang {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => DEFAULT_LANG,
  );
}

/**
 * The hook every component uses: `const t = useT()`.
 *
 * Returns the module-level `t` — the subscription is what triggers the
 * re-render, and `t` reads the current language at call time.
 */
export function useT(): (es: string) => string {
  useLang();
  return t;
}

/** ES | EN, small and out of the way. */
export function LanguageToggle({ className }: { className?: string }) {
  const lang = useLang();
  const router = useRouter();

  function choose(next: Lang) {
    setLang(next);
    // Route `head()` blocks build <title> and the meta description through the
    // module-level `t`, and the router only evaluates them when it matches.
    // Without this the page switches language but the browser tab does not.
    void router.invalidate();
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
        className,
      )}
      role="group"
    >
      {LANGS.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => choose(value)}
          aria-pressed={lang === value}
          aria-label={value === "es" ? "Español" : "English"}
          className={cn(
            "transition-colors",
            lang === value ? "text-foreground" : "text-foreground/35 hover:text-foreground/70",
          )}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Convenience for rendering a translated string in JSX: <T>Guardar</T>. */
export function T({ children }: { children: string }): ReactNode {
  useLang();
  return t(children);
}
