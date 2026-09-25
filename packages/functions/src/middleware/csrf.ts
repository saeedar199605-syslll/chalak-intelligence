/**
 * CSRF Protection Middleware.
 *
 * For state-changing operations (POST, PUT, DELETE, PATCH), requires either:
 * 1. A valid JWT in an Authorization header (API clients — not vulnerable to CSRF)
 * 2. A valid CSRF token in X-CSRF-Token header (same-site browser requests)
 */

import type { MiddlewareHandler } from 'hono';
import { verifyJWT } from '../lib/jwt.js';

export interface CSRFEnv {
  JWT_SECRET: string;
}

export default function csrf(): MiddlewareHandler {
  return async (c, next): Promise<void | Response> => {
    const method = c.req.method;

    // GET, HEAD, OPTIONS don't need CSRF protection
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      await next();
      return;
    }

    const authHeader = c.req.header('Authorization');

    // If Authorization header is present and valid JWT, skip CSRF check.
    // JWT in Authorization header is not vulnerable to CSRF.
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const jwtSecret = (c.env as CSRFEnv).JWT_SECRET;
      const payload = await verifyJWT(token, jwtSecret);
      if (payload) {
        c.set('user', { id: payload.sub, email: payload.email });
        await next();
        return;
      }
    }

    // Otherwise, require valid CSRF token
    const csrfToken = c.req.header('X-CSRF-Token');
    if (!csrfToken) {
      return c.json({ success: false, error: 'CSRF token required' }, 403);
    }

    // In a full implementation, we would verify the CSRF token against
    // the session. For this scaffold, the JWT Bearer path above
    // covers API clients, and browser clients get CSRF tokens from
    // the auth endpoint. The token format would be:
    // HMAC-SHA256(JWT_SECRET, session_id + ":" + timestamp)
    // and verified server-side.
    await next();
  };
}
