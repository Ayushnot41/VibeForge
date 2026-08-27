/**
 * Enterprise Sliding Window Rate Limiter & Token Bucket
 * Tracks request volume per IP / User identifier with atomic window roll-over.
 */

interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
  requestTimestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed in window
  windowSeconds: number; // Window duration in seconds
}

export const DEFAULT_CONFIGS = {
  simulationApi: { maxRequests: 20, windowSeconds: 3600 }, // 20 simulations per hour
  publicApi: { maxRequests: 60, windowSeconds: 60 }, // 60 requests per minute
  authApi: { maxRequests: 10, windowSeconds: 300 }, // 10 attempts per 5 minutes
};

/**
 * Checks and updates rate limit state for a given client identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIGS.publicApi
): { allowed: boolean; remaining: number; resetSeconds: number; limit: number } {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  
  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = {
      tokens: config.maxRequests - 1,
      lastRefill: now,
      requestTimestamps: [now],
    };
    rateLimitStore.set(identifier, record);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetSeconds: config.windowSeconds,
      limit: config.maxRequests,
    };
  }

  // Filter out timestamps older than the sliding window
  record.requestTimestamps = record.requestTimestamps.filter((ts) => now - ts < windowMs);

  if (record.requestTimestamps.length >= config.maxRequests) {
    const oldestTimestamp = record.requestTimestamps[0] || now;
    const resetMs = windowMs - (now - oldestTimestamp);
    const resetSeconds = Math.ceil(Math.max(1, resetMs / 1000));

    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
      limit: config.maxRequests,
    };
  }

  // Record this request
  record.requestTimestamps.push(now);
  const remaining = Math.max(0, config.maxRequests - record.requestTimestamps.length);
  const oldestTimestamp = record.requestTimestamps[0] || now;
  const resetSeconds = Math.ceil(Math.max(1, (windowMs - (now - oldestTimestamp)) / 1000));

  return {
    allowed: true,
    remaining,
    resetSeconds,
    limit: config.maxRequests,
  };
}

/**
 * Clean up stale rate limit entries periodically (Garbage Collection)
 */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.requestTimestamps.length === 0 || now - record.lastRefill > 24 * 60 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000); // Every 10 minutes
}
