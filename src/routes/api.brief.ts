import { createFileRoute } from "@tanstack/react-router";
import { normaliseBrief } from "@/lib/intake/brief";
import { dispatchBuild, type Handoff } from "@/lib/intake/dispatch";
import { callerKey, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/brief   { name, storeUrl, world, ... }  ->  { brand, handoff }
 *
 * Turns a submission into the brief the factory builds from, and starts the
 * build. From here a brand's experience is assembled and published without
 * anyone touching it.
 *
 * What it does NOT do is pretend. When a build cannot be started — nothing
 * configured, the day's budget spent, the brand already has an experience — the
 * response says so and says a person will pick it up. A brand told "your
 * experience is being built" who then hears nothing for a week is worse off
 * than one told the truth.
 *
 * Nothing is written here. The brief goes back to the browser, which can
 * download it, and onward to the factory. GitHub holds the running job, Vercel
 * holds the finished site, and this service keeps no copy of either: brands
 * hand us addresses, not files.
 */

const LIMIT = 6;
const WINDOW_MS = 30 * 60 * 1000;

/**
 * Tell the team a brand came in, with the brief itself rather than a summary.
 *
 * The brief is a few hundred bytes of text and it is the only artefact of a
 * submission that exists anywhere, so a one-line "a brand submitted" would
 * leave the actual thing nowhere but the brand's own browser. Best effort by
 * design: a brief that reached us is not lost because a chat webhook was down.
 */
async function notify(payload: Record<string, unknown>): Promise<void> {
  const url = process.env["INTAKE_WEBHOOK_URL"]?.trim();
  if (!url) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
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
        const handoff: Handoff = await dispatchBuild(brand);

        // The whole brief, so whoever reads the notification can act on it
        // without going back to the brand for anything.
        await notify({
          text:
            `${handoff.started ? "Building" : "New brief, waiting for a human"}: ` +
            `${brand.name} (${brand.store.domain})` +
            `${brand.intake.contactEmail ? ` — ${brand.intake.contactEmail}` : ""}` +
            `${handoff.url ? ` — ${handoff.url}` : ""}`,
          started: handoff.started,
          ...(handoff.reason ? { reason: handoff.reason } : {}),
          brief: brand,
        });

        return Response.json({ ok: true, brand, filename, handoff });
      },
    },
  },
});
