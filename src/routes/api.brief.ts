import { createFileRoute } from "@tanstack/react-router";
import { normaliseBrief } from "@/lib/intake/brief";
import { callerKey, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/brief   { name, storeUrl, world, ... }  ->  { brand, handoff }
 *
 * Turns a submission into the brief the factory builds from, and hands it on.
 *
 * What it does NOT do is pretend. If no factory is configured, the response
 * says the brief was produced and is waiting for a human — it does not report a
 * build that never started. A brand told "your experience is being built" who
 * then hears nothing for a week is worse off than one told the truth.
 *
 * Nothing is written here. The brief goes back to the browser (which can
 * download it) and onward to the factory if one is reachable. This service
 * keeps no copy, which is the whole point: brands hand us addresses, not files.
 */

const LIMIT = 6;
const WINDOW_MS = 30 * 60 * 1000;

type Handoff = {
  /** Did a factory accept the brief and start work? */
  started: boolean;
  /** What actually happens next, in words a brand can act on. */
  message: string;
  /** Present when a factory took it and gave us something to watch. */
  jobId?: string;
};

function factoryEndpoint(): string | null {
  const base = process.env["FACTORY_URL"]?.trim();
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/api/brief`;
}

/**
 * Tell the team a brand came in. Best effort by design: a brief that reached us
 * is not lost because a chat webhook was down, so a failure here is logged and
 * swallowed rather than turned into an error the brand has to read.
 */
async function notify(summary: string): Promise<void> {
  const url = process.env["INTAKE_WEBHOOK_URL"]?.trim();
  if (!url) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: summary }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    console.error("[api/brief] notification failed:", (error as Error).message);
  }
}

export const Route = createFileRoute("/api/brief")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const gate = rateLimit(`brief:${callerKey(request)}`, LIMIT, WINDOW_MS);
        if (!gate.ok) {
          return Response.json(
            { error: "Too many submissions. Try again shortly." },
            { status: 429, headers: { "retry-after": String(gate.retryAfter) } },
          );
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Send JSON." }, { status: 400 });
        }

        const result = normaliseBrief(body);
        if (!result.ok) {
          // 422, not 400: the request was well-formed, the content was not.
          // The page puts each message under the field that caused it.
          return Response.json({ errors: result.errors }, { status: 422 });
        }

        const { brand } = result;
        const filename = `${brand.slug}.json`;

        let handoff: Handoff = {
          started: false,
          message:
            "Your brief is ready. Our team reviews it and builds the experience — " +
            "usually within a working day. Keep the file: it is everything we hold about you.",
        };

        const endpoint = factoryEndpoint();
        if (endpoint) {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 20_000);
            let response: Response;
            try {
              const token = process.env["FACTORY_TOKEN"]?.trim();
              response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  ...(token ? { authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(brand),
                signal: controller.signal,
              });
            } finally {
              clearTimeout(timer);
            }

            if (response.ok) {
              const accepted = (await response.json().catch(() => ({}))) as { id?: unknown };
              handoff = {
                started: true,
                message: "Your brief is with the studio and the build has been queued.",
                ...(typeof accepted.id === "string" ? { jobId: accepted.id } : {}),
              };
            } else {
              // The brief is still valid and still in the brand's hands. Say
              // what happened without making it their problem to solve.
              console.error("[api/brief] factory returned", response.status);
              handoff = {
                started: false,
                message:
                  "Your brief is ready, but the studio did not pick it up automatically. " +
                  "We have been told, and someone will take it from here.",
              };
            }
          } catch (error) {
            console.error("[api/brief] factory unreachable:", (error as Error).message);
            handoff = {
              started: false,
              message:
                "Your brief is ready. We could not reach the studio just now, so a human " +
                "will pick it up — nothing is lost.",
            };
          }
        }

        await notify(
          `New brand brief: ${brand.name} (${brand.store.domain})` +
            `${brand.intake.contactEmail ? ` — ${brand.intake.contactEmail}` : ""}` +
            ` — ${handoff.started ? "queued" : "waiting for a human"}`,
        );

        return Response.json({ ok: true, brand, filename, handoff });
      },
    },
  },
});
