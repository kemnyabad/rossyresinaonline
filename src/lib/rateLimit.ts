import type { NextApiRequest } from "next";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const getClientIp = (req: NextApiRequest) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return String(ip || req.socket.remoteAddress || "unknown").trim();
};

/**
 * Best-effort in-memory rate limit. Resets on cold start and isn't shared
 * across concurrent serverless instances, but it caps abuse from a single
 * warm lambda hammering an expensive (LLM/image) endpoint.
 */
export const checkRateLimit = (
  req: NextApiRequest,
  scope: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } => {
  const key = `${scope}:${getClientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
};
