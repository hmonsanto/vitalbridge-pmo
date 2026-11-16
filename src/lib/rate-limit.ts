type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

/** In-memory sliding-window limiter. Per server instance; adequate for a 2-user internal tool. */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
  now: number = Date.now(),
): { allowed: boolean; retryAfterMs: number } {
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= max) {
    buckets.set(key, bucket);
    return { allowed: false, retryAfterMs: windowMs - (now - bucket.hits[0]) };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimits(): void {
  buckets.clear();
}
