/**
 * Tests for dispatch.ts.
 *
 * This is the function that spends money. Anyone who can load the page can
 * reach it, each call it lets through costs real cash at an image provider, and
 * there is no human between it and the bill. So these tests are mostly about
 * the ways it must REFUSE, and about failing closed when it cannot tell.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildsUrl, dispatchBuild } from "./dispatch";
import type { Brand } from "./brief";

const BRAND: Brand = {
  slug: "casa-mares",
  name: "Casa Marés",
  monogram: "C",
  language: "es",
  host: { name: "Alba", brief: "a woman in her early thirties" },
  store: { domain: "casamares.com", url: "https://casamares.com" },
  world: { look: "Linen shirting.", hostSetting: "", heroSetting: "" },
  scenes: [],
  intake: {
    submittedAt: "2026-10-02T15:04:26.091Z",
    source: "deannafashion/intake",
    storeUrlAsGiven: "casamares.com",
    contactEmail: "",
    defaults: [],
    storage: "no images uploaded or retained; catalogue and any reference link are read live",
  },
};

/**
 * Answer GitHub's three endpoints: does the repo exist, how many builds today,
 * and the dispatch itself. Records every call so a test can assert that one was
 * never made — "did not spend money" is the assertion that matters most here.
 */
function stubGitHub({
  repoExists = false,
  runsToday = 0,
  runsStatus = 200,
  dispatchStatus = 204,
}: {
  repoExists?: boolean;
  runsToday?: number;
  runsStatus?: number;
  dispatchStatus?: number;
} = {}) {
  const calls: { url: string; method: string; body?: unknown }[] = [];
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({
      url,
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });

    if (url.includes("/dispatches")) {
      return new Response(null, { status: dispatchStatus });
    }
    if (url.includes("/actions/workflows/")) {
      return new Response(JSON.stringify({ total_count: runsToday }), { status: runsStatus });
    }
    // The "has this brand already been published" check, which reads the
    // factory's own deployment record rather than looking for another repo.
    return new Response(repoExists ? "{}" : "", { status: repoExists ? 200 : 404 });
  });
  vi.stubGlobal("fetch", mock);
  return { calls, dispatched: () => calls.some((c) => c.url.includes("/dispatches")) };
}

beforeEach(() => {
  vi.stubEnv("GITHUB_FACTORY_TOKEN", "test-token");
  vi.stubEnv("MAX_BUILDS_PER_DAY", "12");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("dispatchBuild", () => {
  it("starts a build and tells the brand where it will live", async () => {
    const gh = stubGitHub();
    const handoff = await dispatchBuild(BRAND);

    expect(handoff.started).toBe(true);
    expect(gh.dispatched()).toBe(true);
    // Deliberately promises no address. A *.vercel.app name is global across
    // all of Vercel, so the slug's is usually already a stranger's — the first
    // brand built this way was announced at northbound.vercel.app, which is
    // somebody's newsletter product.
    expect(handoff.url).toBeUndefined();
    expect(handoff.message).not.toMatch(/vercel\.app/);
    expect(handoff.message).toMatch(/Estamos construyendo/);
  });

  it("sends the brief itself, under the event the workflow listens for", async () => {
    const gh = stubGitHub();
    await dispatchBuild(BRAND);

    const dispatch = gh.calls.find((c) => c.url.includes("/dispatches"));
    const body = dispatch?.body as { event_type?: string; client_payload?: { brief?: Brand } };
    expect(dispatch?.method).toBe("POST");
    expect(body?.event_type).toBe("build-brand");
    expect(body?.client_payload?.brief?.slug).toBe("casa-mares");
    expect(body?.client_payload?.brief?.store.domain).toBe("casamares.com");
  });

  it("spends nothing when no factory is configured", async () => {
    vi.stubEnv("GITHUB_FACTORY_TOKEN", "");
    const gh = stubGitHub();
    const handoff = await dispatchBuild(BRAND);

    expect(handoff.started).toBe(false);
    expect(handoff.reason).toBe("NOT_CONFIGURED");
    // Not one call. An unconfigured deployment must be inert, not noisy.
    expect(gh.calls).toHaveLength(0);
  });

  it("refuses to build over a brand that already has an experience", async () => {
    // Resubmitting the same shop is the cheapest way to spend our money twice,
    // and it is also just what an impatient person does.
    const gh = stubGitHub({ repoExists: true });
    const handoff = await dispatchBuild(BRAND);

    expect(handoff.started).toBe(false);
    expect(handoff.reason).toBe("ALREADY_EXISTS");
    expect(handoff.url).toBeUndefined();
    expect(gh.dispatched()).toBe(false);
  });

  it("stops once the day's builds are spent", async () => {
    const gh = stubGitHub({ runsToday: 12 });
    const handoff = await dispatchBuild(BRAND);

    expect(handoff.started).toBe(false);
    expect(handoff.reason).toBe("AT_CAPACITY");
    expect(gh.dispatched()).toBe(false);
  });

  it("honours a cap set by configuration", async () => {
    vi.stubEnv("MAX_BUILDS_PER_DAY", "3");
    const gh = stubGitHub({ runsToday: 3 });
    expect((await dispatchBuild(BRAND)).reason).toBe("AT_CAPACITY");
    expect(gh.dispatched()).toBe(false);
  });

  it("still builds while the day has room", async () => {
    const gh = stubGitHub({ runsToday: 11 });
    expect((await dispatchBuild(BRAND)).started).toBe(true);
    expect(gh.dispatched()).toBe(true);
  });

  it("fails closed when it cannot count today's builds", async () => {
    // An uncountable budget is not a budget. If GitHub will not say how many
    // ran today, the safe answer is to hand this one to a person.
    const gh = stubGitHub({ runsStatus: 500 });
    const handoff = await dispatchBuild(BRAND);

    expect(handoff.started).toBe(false);
    expect(gh.dispatched()).toBe(false);
    // Reported apart from a real cap: one is a Tuesday, the other is a broken
    // token, and they look identical to the brand but not to us. A token
    // missing Actions:read told every brand we were busy, every day.
    expect(handoff.reason).toBe("CANNOT_COUNT");
  });

  it("calls a genuine cap a cap", async () => {
    stubGitHub({ runsToday: 99 });
    expect((await dispatchBuild(BRAND)).reason).toBe("AT_CAPACITY");
  });

  it("checks the factory's deployment record, not the brand's own repo", async () => {
    // A token scoped to brand-factory gets 404 for every other repo in the org,
    // so a guard that looked for `EQUIPO-DEANNA/<slug>` answered "new brand"
    // for everyone by lacking permission to say otherwise.
    const gh = stubGitHub({ repoExists: true });
    await dispatchBuild(BRAND);

    const lookup = gh.calls.find((call) => call.url.includes("/contents/"));
    expect(lookup?.url).toContain("brand-factory/contents/deployments/casa-mares.json");
  });

  it("does not claim a build when GitHub rejects the dispatch", async () => {
    const handoff = await dispatchBuild({ ...BRAND });
    void handoff;
    stubGitHub({ dispatchStatus: 422 });
    const second = await dispatchBuild(BRAND);

    expect(second.started).toBe(false);
    expect(second.reason).toBe("DISPATCH_FAILED");
    expect(second.message).not.toMatch(/being built/);
  });

  it("survives GitHub being unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );
    const handoff = await dispatchBuild(BRAND);

    // Never throws: a brief that reached us is not lost because GitHub was down.
    // It lands on the capacity path rather than the dispatch one, because an
    // unreachable GitHub means the day's builds cannot be counted, and an
    // uncountable budget is not a budget.
    expect(handoff.started).toBe(false);
    expect(handoff.message).toMatch(/No se pierde nada/);
  });

  it("never promises a build it did not start", async () => {
    for (const options of [
      { repoExists: true },
      { runsToday: 99 },
      { runsStatus: 500 },
      { dispatchStatus: 500 },
    ]) {
      stubGitHub(options);
      const handoff = await dispatchBuild(BRAND);
      expect(handoff.started).toBe(false);
      expect(handoff.message).not.toMatch(/being built now/);
    }
  });
});

describe("never inventing an address", () => {
  it("promises no URL on any path", async () => {
    // Every one of these once returned https://<slug>.vercel.app. Those names
    // are global, so the slug's is usually somebody else's site, and pointing a
    // brand at a stranger's page is worse than pointing them nowhere.
    for (const options of [{}, { repoExists: true }, { runsToday: 99 }, { dispatchStatus: 500 }]) {
      stubGitHub(options);
      const handoff = await dispatchBuild(BRAND);
      expect(handoff.url).toBeUndefined();
      expect(handoff.message).not.toMatch(/vercel\.app/);
    }
  });

  it("points at the builds, which is an address we do control", () => {
    expect(buildsUrl()).toBe(
      "https://github.com/EQUIPO-DEANNA/brand-factory/actions/workflows/build-brand.yml",
    );
  });
});
