/**
 * Hono application for Chalak Intelligence Platform.
 * Cloudflare Workers backend.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import csrf from './middleware/csrf.js';
import rateLimit from './middleware/rate-limit.js';
import { authRoutes } from './routes/auth.js';
import type { Env } from './types.js';

const app = new Hono<{
  Bindings: Env;
  Variables: { user?: unknown };
}>();

// === Global Middleware ===

// CORS — only allow our frontend origin in production
app.use(
  '*',
  cors({
    origin: (origin, _c) => {
      const env = _c.env as Env;
      if (env?.ENVIRONMENT === 'development') {
        return origin || '';
      }
      return origin === env?.FRONTEND_URL ? origin : '';
    },
    credentials: true,
  })
);

// CSRF protection
app.use('*', csrf());

// Rate limiting (global default)
app.use('*', rateLimit({ windowMs: 60_000, max: 100 }));

// === Routes ===

// Auth routes (login, register, refresh, logout) — special rate limits handled within
app.route('/api/v1/auth', authRoutes);

// Health check
app.get('/api/v1/health', (c) => {
  return c.json({ success: true, data: { status: 'ok', timestamp: Date.now() } });
});

// Catch-all 404
app.notFound((c) => {
  return c.json({ success: false, error: 'Endpoint not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err); // eslint-disable-line no-console
  return c.json(
    { success: false, error: 'Internal server error' },
    500
  );
});

export default app;
