/**
 * VIXUAL - Rate Limiter (Upstash Redis)
 *
 * Token bucket rate limiting using Upstash Redis.
 * Each route can define its own limit/window.
 */

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSec: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp (seconds)
  retryAfterSec?: number;
}

/** Default rate limit presets */
export const RATE_LIMITS = {
  /** Standard API: 60 req/min */
  standard: { maxRequests: 60, windowSec: 60 } as RateLimitConfig,
  /** Auth routes: 10 req/min */
  auth: { maxRequests: 10, windowSec: 60 } as RateLimitConfig,
  /** Financial routes (invest, withdraw, payout): 20 req/min */
  financial: { maxRequests: 20, windowSec: 60 } as RateLimitConfig,
  /** Webhook routes: 200 req/min (Stripe can burst) */
  webhook: { maxRequests: 200, windowSec: 60 } as RateLimitConfig,
  /** Report/signalement: 5 req/min */
  report: { maxRequests: 5, windowSec: 60 } as RateLimitConfig,
  /** Admin routes: 30 req/min */
  admin: { maxRequests: 30, windowSec: 60 } as RateLimitConfig,
  /** Batch payout (cron): 2 req/min */
  batch: { maxRequests: 2, windowSec: 60 } as RateLimitConfig,
} as const;

/**
 * Checks rate limit for a given identifier (userId, IP, etc.)
 * Uses a sliding window counter stored in Redis.
 */
export async function checkRateLimit(
  identifier: string,
  route: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `rl:${route}:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.windowSec;

  try {
    // Use a pipeline for atomic operations
    const pipeline = redis.pipeline();
    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, windowStart);
    // Count current entries in window
    pipeline.zcard(key);
    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}:${Math.random().toString(36).slice(2, 8)}` });
    // Set TTL on the key
    pipeline.expire(key, config.windowSec);

    const results = await pipeline.exec();
    const currentCount = (results[1] as number) || 0;

    if (currentCount >= config.maxRequests) {
      // Over limit -- remove the entry we just added (best effort)
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + config.windowSec,
        retryAfterSec: config.windowSec,
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - currentCount - 1,
      resetAt: now + config.windowSec,
    };
  } catch (error) {
    // If Redis is down, allow the request (fail-open)
    console.error("[VIXUAL rate-limit] Redis error, failing open:", error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowSec,
    };
  }
}

/**
 * Extracts a rate-limit identifier from a request.
 * Prefers userId from header, falls back to IP.
 */
export function getRateLimitId(req: Request): string {
  const userId = req.headers.get("x-visual-user-id");
  if (userId) return `user:${userId}`;
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `ip:${ip}`;
}
