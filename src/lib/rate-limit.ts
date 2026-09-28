/**
 * A small fixed-window rate limiter, keyed by caller IP.
 *
 * The intake endpoints are deliberately open — asking a brand to sign up before
 * they can see whether we can even read their shop defeats the point — but each
 * call reads a third party's storefront, sometimes thousands of products of it.
 * Leaving that unguarded would make this page a convenient way to hammer
 * somebody else's server.
 *
 * Deliberately in-memory. It holds for a single server instance, which is what
 * this runs on today; it is NOT a defence at scale, where several instances
 * would each keep their own counter. If the traffic ever justifies it, move the
 * counter to shared storage.
 */

type Window = { count: number; resetAt: number };

const globalForLimiter = globalThis as unknown as {
  __intakeRateLimit?: Map<string, Window>;
};

const buckets = (globalForLimiter.__intakeRateLimit ??= new Map<string, Window>());

export type RateLimitResult = {
  ok: boolean;
  /** Calls left in the current window. */
  remaining: number;
  /** Seconds until the window resets — surfaced as Retry-After. */
  retryAfter: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // Opportunistic sweep; without it the map grows once per unique IP forever.
    if (buckets.size > 5_000) {
      for (const [k, window] of buckets) if (now >= window.resetAt) buckets.delete(k);
    }
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count++;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  if (existing.count > limit) return { ok: false, remaining: 0, retryAfter };
  return { ok: true, remaining: limit - existing.count, retryAfter };
}

/**
 * Best-effort caller identity.
 *
 * `x-forwarded-for` can be spoofed by the client, so this is not a security
 * boundary — which is fine, because the limiter is a politeness guard rather
 * than an authentication check.
 */
export function callerKey(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-vercel-forwarded-for") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
