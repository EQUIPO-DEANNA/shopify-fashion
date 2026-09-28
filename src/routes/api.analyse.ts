import { createFileRoute } from "@tanstack/react-router";
import { analyseStore } from "@/lib/intake/analyse";
import { callerKey, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/analyse   { storeUrl }  ->  the catalogue we can read from that shop
 *
 * The only honest thing on this page. Everything above it is a claim about what
 * we could build; this goes and reads the brand's own storefront and reports
 * what is actually in it, including what we could not place.
 *
 * It runs inside this app rather than against a separate service on purpose:
 * one deployment, no CORS, and no second thing to keep alive. It reads the
 * public Shopify feed, which is the same JSON any browser can fetch, and it
 * stores nothing — not the catalogue, not the submission, not an image.
 */

// Ten shops a quarter of an hour is far more than a real visitor needs, and far
// less than it takes to make this a useful way to hammer somebody's storefront.
const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

// A serverless platform kills the function at its own limit — 60s on most
// plans, 10s on some older ones — and a killed function returns a blank 504 the
// brand cannot act on. Staying under it and answering with a partial read is
// strictly better, so the budget is configurable per deployment.
const BUDGET_MS = Number(process.env["ANALYSE_BUDGET_MS"] ?? 45_000) || 45_000;
// Enough for 2,500 products. Larger catalogues get a truthful "we read the
// first N" and the full read happens at build time, off the request path.
const MAX_PAGES = 10;

export const Route = createFileRoute("/api/analyse")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const gate = rateLimit(`analyse:${callerKey(request)}`, LIMIT, WINDOW_MS);
        if (!gate.ok) {
          return Response.json(
            {
              error: `That is a lot of shops at once. Try again in ${Math.ceil(gate.retryAfter / 60)} minute(s).`,
            },
            { status: 429, headers: { "retry-after": String(gate.retryAfter) } },
          );
        }

        let body: { storeUrl?: unknown };
        try {
          body = (await request.json()) as { storeUrl?: unknown };
        } catch {
          return Response.json({ error: "Send JSON." }, { status: 400 });
        }

        const storeUrl = typeof body.storeUrl === "string" ? body.storeUrl : "";
        if (!storeUrl.trim()) {
          return Response.json({ error: "We need your shop's address." }, { status: 400 });
        }

        try {
          const analysis = await analyseStore(storeUrl, {
            maxPages: MAX_PAGES,
            budgetMs: BUDGET_MS,
          });
          return Response.json(analysis);
        } catch (error) {
          // These messages are written for the brand reading them — they say
          // which shop, what happened, and what to do — so they are passed
          // through rather than flattened into "something went wrong".
          const message = error instanceof Error ? error.message : "We could not read that shop.";
          console.error("[api/analyse]", message);
          return Response.json({ error: message }, { status: 422 });
        }
      },
    },
  },
});
