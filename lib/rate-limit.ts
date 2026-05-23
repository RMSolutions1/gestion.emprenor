const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export function getClientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
