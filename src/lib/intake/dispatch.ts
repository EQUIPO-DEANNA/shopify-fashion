/**
 * Hand a brief to the factory, which builds and publishes the experience.
 *
 * The factory is a GitHub Actions workflow rather than a server, because
 * generation takes minutes and makes dozens of paid image calls — too long for
 * an HTTP request, and not worth a machine kept alive for something that runs a
 * few times a week. So "send it to the factory" means firing a
 * `repository_dispatch` at the brand-factory repo.
 *
 * The guards below exist because this endpoint spends money. Anyone who can
 * reach the form can start a build, and a build costs real cash at Google. None
 * of them needs a human: the daily cap is counted by asking GitHub how many
 * builds ran today, so it holds across every serverless instance at once and
 * survives a cold start, which an in-memory counter would not.
 *
 * Nothing is stored here. GitHub holds the job, Vercel holds the site, and this
 * function holds the brief exactly as long as the request it arrived in.
 */
import type { Brand } from "./brief";

/** The repo whose workflow does the building. */
const FACTORY_REPO = "EQUIPO-DEANNA/brand-factory";
const WORKFLOW = "build-brand.yml";

/**
 * Builds we are willing to start in a day without anyone looking.
 *
 * Deliberately a number someone will one day hit. The alternative to a cap is
 * an open form that can run the bill to whatever a bored person can type, and
 * the failure mode of the cap — a brand waits for a human — is survivable in a
 * way that an unbounded bill is not.
 *
 * Read per call rather than at module load, so changing it takes a redeploy of
 * configuration rather than a cold start to notice.
 */
function maxBuildsPerDay(): number {
  const configured = Number(process.env["MAX_BUILDS_PER_DAY"]);
  return Number.isFinite(configured) && configured > 0 ? configured : 12;
}

const GITHUB_API = "https://api.github.com";

export type Handoff = {
  /** Did the factory take it and start building? */
  started: boolean;
  /** What happens next, in words the brand can act on. */
  message: string;
  /** Where the experience will live, once it is built. */
  url?: string;
  /** The reason we did not start, for our logs rather than for the brand. */
  reason?: "NOT_CONFIGURED" | "ALREADY_EXISTS" | "AT_CAPACITY" | "DISPATCH_FAILED";
};

function token(): string | null {
  return process.env["GITHUB_FACTORY_TOKEN"]?.trim() || null;
}

/** The address a finished experience gets. Vercel names the project after the slug. */
export function experienceUrl(slug: string): string {
  return `https://${slug}.vercel.app`;
}

async function gh(path: string, init: RequestInit = {}, timeoutMs = 10_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${GITHUB_API}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        authorization: `Bearer ${token()}`,
        ...init.headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Has this brand already been built?
 *
 * Resubmitting the same shop is the cheapest way to spend our money twice, and
 * it is also what an impatient person does when nothing has appeared yet. Both
 * are answered by refusing to build over an experience that already exists and
 * handing it to a human instead, who can decide whether a rebuild is wanted.
 */
async function alreadyBuilt(slug: string): Promise<boolean> {
  try {
    const res = await gh(`/repos/EQUIPO-DEANNA/${slug}`);
    return res.status === 200;
  } catch {
    // Unreachable GitHub is handled by the dispatch itself; do not block here.
    return false;
  }
}

/**
 * How many builds have started today, counted by GitHub rather than by us.
 *
 * An in-memory counter would reset on every cold start and be kept separately
 * by every concurrent instance, which is to say it would not be a cap at all.
 * Returns null when the count cannot be read, and the caller treats that as
 * "do not start one", because an uncountable budget is not a budget.
 */
async function buildsToday(): Promise<number | null> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await gh(
      `/repos/${FACTORY_REPO}/actions/workflows/${WORKFLOW}/runs?created=%3E%3D${today}&per_page=1`,
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { total_count?: unknown };
    return typeof body.total_count === "number" ? body.total_count : null;
  } catch {
    return null;
  }
}

/**
 * Start the build.
 *
 * Never throws. Every path returns something the brand can read, because a
 * brief that reached us is not lost just because the factory was busy, and
 * saying so is better than a stack trace or a lie about work in progress.
 */
export async function dispatchBuild(brand: Brand): Promise<Handoff> {
  const waiting =
    "Your brief is ready. Our team reviews it and builds the experience, " +
    "usually within a working day. Keep the file: it is everything we hold about you.";

  if (!token()) {
    return { started: false, reason: "NOT_CONFIGURED", message: waiting };
  }

  if (await alreadyBuilt(brand.slug)) {
    return {
      started: false,
      reason: "ALREADY_EXISTS",
      url: experienceUrl(brand.slug),
      message:
        `There is already an experience for ${brand.name}. We have not built over it. ` +
        "Someone will check whether you wanted it rebuilt.",
    };
  }

  const today = await buildsToday();
  if (today === null || today >= maxBuildsPerDay()) {
    console.error(
      `[dispatch] not starting a build (${today === null ? "could not count today's builds" : `${today} already today`})`,
    );
    return {
      started: false,
      reason: "AT_CAPACITY",
      message:
        "Your brief is ready. We build a limited number of experiences a day and today's are " +
        "spoken for, so yours goes to a person rather than into a queue. Nothing is lost.",
    };
  }

  try {
    const res = await gh(
      `/repos/${FACTORY_REPO}/dispatches`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event_type: "build-brand", client_payload: { brief: brand } }),
      },
      20_000,
    );

    // GitHub answers 204 with no body when it accepts a dispatch.
    if (res.status === 204) {
      return {
        started: true,
        url: experienceUrl(brand.slug),
        message:
          "Your experience is being built now. It takes a few minutes, and it will appear at " +
          `${experienceUrl(brand.slug)}.`,
      };
    }

    console.error(`[dispatch] GitHub returned ${res.status}`);
    return {
      started: false,
      reason: "DISPATCH_FAILED",
      message:
        "Your brief is ready, but the studio did not pick it up automatically. We have been " +
        "told, and someone will take it from here.",
    };
  } catch (error) {
    console.error(`[dispatch] unreachable: ${(error as Error).message}`);
    return {
      started: false,
      reason: "DISPATCH_FAILED",
      message:
        "Your brief is ready. We could not reach the studio just now, so a person will pick " +
        "it up. Nothing is lost.",
    };
  }
}
