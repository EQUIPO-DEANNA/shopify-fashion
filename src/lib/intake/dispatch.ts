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

/**
 * How long a build may run before the waiting page calls it failed.
 *
 * A real build takes eight to twelve minutes. This is inferred rather than
 * read, because the run's own verdict lives behind a permission this token does
 * not have, so it is set generously: telling a brand it failed while the build
 * is still going is worse than a clock that runs a few minutes long.
 */
const STALE_AFTER_MINUTES = 30;

export type Handoff = {
  /** Did the factory take it and start building? */
  started: boolean;
  /** What happens next, in words the brand can act on. */
  message: string;
  /** Where the experience will live, once it is built. */
  url?: string;
  /** The reason we did not start, for our logs rather than for the brand. */
  reason?: "NOT_CONFIGURED" | "ALREADY_EXISTS" | "AT_CAPACITY" | "CANNOT_COUNT" | "DISPATCH_FAILED";
};

function token(): string | null {
  return process.env["GITHUB_FACTORY_TOKEN"]?.trim() || null;
}

/**
 * Where to watch a build happen.
 *
 * Deliberately NOT the finished site's address. There was a version of this
 * that returned `https://<slug>.vercel.app`, on the reasoning that the deploy
 * names the project after the slug — but those names are global across all of
 * Vercel, so a plain word is usually already somebody else's. The first brand
 * built this way was announced at northbound.vercel.app, which is a stranger's
 * newsletter product. Sending a brand to that is worse than sending them
 * nowhere, so the real address is read from the deploy and reported when it
 * exists, and nothing is promised before then.
 */
export function buildsUrl(): string {
  return `https://github.com/${FACTORY_REPO}/actions/workflows/${WORKFLOW}`;
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
 * Has this brand already been published?
 *
 * Resubmitting the same shop is the cheapest way to spend our money twice, and
 * it is also what an impatient person does when nothing has appeared yet. Both
 * are answered by refusing to build over an experience that already exists and
 * handing it to a human instead, who can decide whether a rebuild is wanted.
 *
 * Asks the factory's deployment record rather than looking for the brand's own
 * repository. The first version did the latter and the guard was silently dead:
 * a token scoped to brand-factory — which is the correct, narrow scope for a
 * token living in a public web app — gets 404 for every other repo in the org,
 * so every brand looked new. It answered "no" by lacking permission to say yes.
 *
 * The record is also the better question. A repo can exist from a build that
 * never published; `deployments/<slug>.json` only exists when a site went live.
 */
async function alreadyBuilt(slug: string): Promise<boolean> {
  try {
    const res = await gh(`/repos/${FACTORY_REPO}/contents/deployments/${slug}.json?ref=main`);
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
    // Counted from the markers each run writes into `builds/<date>/`, not from
    // the Actions API.
    //
    // The Actions API needs an `Actions: read` permission on this token, and
    // that permission could not be granted: the organisation's approval flow
    // errors and drops the request. A cap that cannot be counted fails closed,
    // so the whole form sat there telling every brand we were busy — every day,
    // forever. Counting something `Contents: read` can already see removes the
    // dependency rather than waiting on an approval that does not come.
    const res = await gh(`/repos/${FACTORY_REPO}/contents/builds/${today}?ref=main`);

    // No directory for today means no build has started today. That is a zero,
    // not a failure, and treating it as one would stop the first build of every
    // morning.
    if (res.status === 404) return 0;
    if (!res.ok) {
      console.error(
        `[dispatch] could not count today's builds: GitHub returned ${res.status}. ` +
          "GITHUB_FACTORY_TOKEN needs Contents: read on brand-factory.",
      );
      return null;
    }

    const body = (await res.json()) as unknown;
    if (!Array.isArray(body)) return null;
    return body.filter(
      (entry) =>
        typeof (entry as { name?: unknown }).name === "string" &&
        (entry as { name: string }).name.endsWith(".json"),
    ).length;
  } catch (error) {
    console.error(`[dispatch] could not count today's builds: ${(error as Error).message}`);
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
    "Tenemos tu ficha. La revisamos y construimos la experiencia, normalmente en un día " +
    "laborable. Te escribimos en cuanto esté.";

  if (!token()) {
    return { started: false, reason: "NOT_CONFIGURED", message: waiting };
  }

  if (await alreadyBuilt(brand.slug)) {
    return {
      started: false,
      reason: "ALREADY_EXISTS",
      message:
        `Ya existe una experiencia para ${brand.name}. No la hemos sobrescrito. ` +
        "Alguien comprueba si querías rehacerla y te manda la dirección.",
    };
  }

  const today = await buildsToday();
  if (today === null || today >= maxBuildsPerDay()) {
    // Two different faults wearing one face. A real cap is a Tuesday; an
    // uncountable one is a broken token, and telling them apart in the logs is
    // the difference between waiting a day and fixing a permission.
    return {
      started: false,
      reason: today === null ? "CANNOT_COUNT" : "AT_CAPACITY",
      message:
        "Tenemos tu ficha. Construimos un número limitado de experiencias al día y las de hoy ya " +
        "están cogidas, así que la tuya pasa a una persona en vez de a una cola. No se pierde nada.",
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
        message: "Estamos construyendo tu experiencia. Tarda unos diez minutos.",
      };
    }

    console.error(`[dispatch] GitHub returned ${res.status}`);
    return {
      started: false,
      reason: "DISPATCH_FAILED",
      message:
        "Tenemos tu ficha, pero el estudio no la ha recogido automáticamente. Ya lo sabemos y " +
        "alguien sigue desde aquí.",
    };
  } catch (error) {
    console.error(`[dispatch] unreachable: ${(error as Error).message}`);
    return {
      started: false,
      reason: "DISPATCH_FAILED",
      message:
        "Tenemos tu ficha. Ahora mismo no hemos podido avisar al estudio, así que la recoge una " +
        "persona. No se pierde nada.",
    };
  }
}

/* ------------------------------------------------------------ watching one */

export type BuildState = "building" | "done" | "failed" | "unknown";

export type BuildStatus = {
  state: BuildState;
  /** Present once the site is published. */
  url?: string;
  /** The run, for us rather than for the brand. */
  run?: string;
  /** Minutes since the run started, so the page can say something true. */
  minutes?: number;
};

/**
 * Where a brand's build has got to.
 *
 * Holds nothing. GitHub knows whether the run is going, and the run itself
 * writes `deployments/<slug>.json` when the site is published, so between them
 * they answer the question without this service remembering anything.
 *
 * The deployment record is checked FIRST. A run can report "completed" a few
 * seconds before its last step finishes writing, and a page that says "failed"
 * to a brand whose site is actually live is the worst of the four answers.
 */
export async function buildStatus(slug: string): Promise<BuildStatus> {
  if (!token()) return { state: "unknown" };

  try {
    const record = await gh(`/repos/${FACTORY_REPO}/contents/deployments/${slug}.json?ref=main`);
    if (record.status === 200) {
      const body = (await record.json()) as { content?: string; encoding?: string };
      if (body.content && body.encoding === "base64") {
        const decoded = JSON.parse(Buffer.from(body.content, "base64").toString("utf8")) as {
          url?: unknown;
          run?: unknown;
        };
        if (typeof decoded.url === "string" && decoded.url) {
          return {
            state: "done",
            url: decoded.url,
            ...(typeof decoded.run === "string" ? { run: decoded.run } : {}),
          };
        }
      }
    }
  } catch (error) {
    console.error(`[status] could not read the deployment record: ${(error as Error).message}`);
  }

  try {
    // The start marker the run writes before it does anything. Read rather than
    // the Actions API, which needs a permission this token does not have and
    // could not be granted — see buildsToday above. Everything here works with
    // Contents: read alone.
    const day = new Date().toISOString().slice(0, 10);
    const marker = await gh(`/repos/${FACTORY_REPO}/contents/builds/${day}/${slug}.json?ref=main`);

    if (marker.status !== 200) {
      // Not started yet, or started before midnight. Either way we cannot say,
      // and "unknown" leaves the waiting page showing what it already shows.
      return { state: "unknown" };
    }

    const body = (await marker.json()) as { content?: string; encoding?: string };
    let startedAt = NaN;
    let run: string | undefined;
    if (body.content && body.encoding === "base64") {
      const decoded = JSON.parse(Buffer.from(body.content, "base64").toString("utf8")) as {
        startedAt?: unknown;
        run?: unknown;
      };
      if (typeof decoded.startedAt === "string") startedAt = Date.parse(decoded.startedAt);
      if (typeof decoded.run === "string") run = decoded.run;
    }

    const minutes = Number.isFinite(startedAt)
      ? Math.max(0, Math.round((Date.now() - startedAt) / 60_000))
      : undefined;

    // Started, no deployment record, and long past the time a build takes. We
    // cannot read the run's own verdict without the Actions permission, so this
    // is inferred — generously, because telling a brand it failed while it is
    // still going is worse than letting the clock run a few minutes longer.
    if (minutes !== undefined && minutes > STALE_AFTER_MINUTES) {
      return { state: "failed", ...(run ? { run } : {}) };
    }

    return {
      state: "building",
      ...(run ? { run } : {}),
      ...(minutes === undefined ? {} : { minutes }),
    };
  } catch (error) {
    console.error(`[status] could not read the build marker: ${(error as Error).message}`);
    return { state: "unknown" };
  }
}
