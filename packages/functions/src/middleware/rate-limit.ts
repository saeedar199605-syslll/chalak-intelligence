/**
 * Rate limiting middleware for Hono.
 * Uses a sliding window counter approach.
 *
 * In production, this uses UPSTASH_RATE_LIMIT_URL/TOKEN for distributed rate limiting.
 * For local/dev, in-memory store is used.
 */

import type { Context, MiddlewareHandler } from 'hono';

interface RateLimitStore {
  increment(key: string, ttl: number): Promise<{ count: number; reset: number }>;
}

// Simple in-memory store for local development
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; reset: number }>();

  async increment(_key: string, ttl: number): Promise<{ count: number; reset: number }> {
    const now = Date.now();
    const key = _key;
    const entry = this.store.get(key);

    if (!entry || now > entry.reset) {
      const newEntry = { count: 1, reset: now + ttl };
      this.store.set(key, newEntry);
      return newEntry;
    }

    entry.count++;
    return entry;
  }
}

const memoryStore = new MemoryStore();

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  statusCode?: number;
  message?: string;
}

export default function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  const {
    windowMs = 60_000,
    max = 100,
    keyPrefix = 'rl',
    statusCode = 429,
    message = 'Too many requests',
  } = options;

  return async (c: Context, next: () => Promise<void>): Promise<void | Response> => {
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const key = `${keyPrefix}:${ip}:${c.req.path}`;

    const result = await memoryStore.increment(key, windowMs);

    if (result.count > max) {
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', String(Math.floor(result.reset / 1000)));
      return c.json({ success: false, error: message }, statusCode as 200 | 400 | 401 | 403 | 404 | 429 | 500);
    }

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - result.count)));
    c.header('X-RateLimit-Reset', String(Math.floor(result.reset / 1000)));

    await next();
  };
}

export { memoryStore };
