import { createFileRoute } from "@tanstack/react-router";
import { buildStatus } from "@/lib/intake/dispatch";
import { callerKey, rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/build-status?slug=casa-mares  ->  { state, url?, run?, minutes? }
 *
 * What the waiting page asks, every few seconds, while a brand's experience is
 * being built.
 *
 * It holds no state of its own. GitHub knows whether the run is going, and the
 * run writes where the site landed; this reads both and says one of four
 * things. That is the same bargain as the rest of the intake: somebody else
 * stores it, we do not.
 */

// A page polling every five seconds for ten minutes is 120 requests, and two
// people watching their builds at once is 240. The ceiling is well above that
// and still low enough to stop a script.
const LIMIT = 400;
const WINDOW_MS = 30 * 60 * 1000;

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

export const Route = createFileRoute("/api/build-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const gate = rateLimit(`status:${callerKey(request)}`, LIMIT, WINDOW_MS);
        if (!gate.ok) {
          return Response.json(
            { error: "Demasiadas consultas. Espera un momento." },
            { status: 429, headers: { "retry-after": String(gate.retryAfter) } },
          );
        }

        const slug = new URL(request.url).searchParams.get("slug") ?? "";
        if (!SAFE_SLUG.test(slug)) {
          return Response.json({ error: "Identificador no válido." }, { status: 400 });
        }

        const status = await buildStatus(slug);
        return Response.json(status, {
          // The answer changes minute to minute and a cached "still building"
          // would outlive the build it describes.
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
