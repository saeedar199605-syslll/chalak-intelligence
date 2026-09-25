/**
 * Authentication routes for Chalak Intelligence Platform.
 * Endpoints:
 *   POST /api/v1/auth/register   — Register new user (bootstrap admin or invite code)
 *   POST /api/v1/auth/login      — Login with email/username + password
 *   GET  /api/v1/auth/csrf-token — Get CSRF token for browser clients
 *   POST /api/v1/auth/refresh    — Refresh access token using refresh token
 *   POST /api/v1/auth/logout     — Logout (clears cookies)
 *   GET  /api/v1/auth/session    — Get current user session
 */

import { Hono } from 'hono';
import { verifyPassword, hashPassword } from '../lib/password.js';
import { generateTokens, verifyJWT, signJWT } from '../lib/jwt.js';
import { z } from 'zod';
import type { Env } from '../types.js';

// Inline schemas for now (shared types package will be linked later)
const LoginSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
  rememberMe: z.boolean().default(false),
  csrfToken: z.string(),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(100).optional(),
  inviteCode: z.string().optional(),
});

interface CookieSetter {
  set: (name: string, value: string, opts: Record<string, unknown>) => void;
}

interface CookieReader {
  req: { header: (name: string) => string | undefined };
}

const authRoutes = new Hono<{ Bindings: Env; Variables: { user?: unknown } }>();

/**
 * POST /register
 * Register a new user. First user becomes super admin.
 */
authRoutes.post('/register', async (c) => {
  const body = await c.req.json();

  const parseResult = RegisterSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json(
      { success: false, error: 'Invalid input', details: parseResult.error.issues },
      400
    );
  }

  const { email, username, password, fullName } = parseResult.data;

  try {
    // Check if user already exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    )
      .bind(email, username)
      .first();

    if (existing) {
      return c.json(
        { success: false, error: 'User with this email or username already exists' },
        409
      );
    }

    // Count existing users — first user becomes super admin
    const countResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
    const userCount = countResult?.count ?? 0;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const now = Math.floor(Date.now() / 1000);
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, username, password_hash, full_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
      .bind(email, username, passwordHash, fullName ?? null, now, now)
      .run();

    const userId = result.meta?.last_row_id?.toString() ?? '';

    // Assign role
    const roleName = userCount === 0 ? 'super_admin' : 'viewer';
    const roleResult = await c.env.DB.prepare(
      'SELECT id FROM roles WHERE name = ?'
    )
      .bind(roleName)
      .first<{ id: string }>();

    if (roleResult) {
      await c.env.DB.prepare(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)'
      )
        .bind(userId, roleResult.id)
        .run();
    }

    // Generate tokens
    const tokens = await generateTokens(userId, email, c.env.JWT_SECRET);

    // Set cookies
    setAuthCookies(c, tokens.accessToken, tokens.refreshToken, false);

    // Return sanitized user
    const user = {
      id: userId,
      email,
      username,
      fullName: fullName ?? null,
      locale: 'fa',
      digitMode: 'persian',
      timezone: 'Asia/Tehran',
      isActive: true,
      createdAt: now * 1000,
      updatedAt: now * 1000,
      lastLogin: now * 1000,
    };

    return c.json({
      success: true,
      data: { user, accessToken: tokens.accessToken, expiresAt: tokens.expiresAt },
    });
  } catch (err) {
    console.error('Registration error:', err); // eslint-disable-line no-console
    return c.json(
      { success: false, error: 'Failed to create user' },
      500
    );
  }
});

/**
 * POST /login
 * Authenticate user and return tokens.
 * Rate-limited: 5 attempts per 15 minutes per email.
 */
authRoutes.post('/login', async (c) => {
  const body = await c.req.json();

  const parseResult = LoginSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json(
      { success: false, error: 'Invalid credentials' },
      400
    );
  }

  const { emailOrUsername, password, rememberMe } = parseResult.data;
  const ipAddr = c.req.header('cf-connecting-ip') || 'unknown';

  // Check rate limiting for login attempts
  const attemptsKey = `login_attempts:${emailOrUsername}:${ipAddr}`;
  const attempts = await c.env.DB.prepare(
    'SELECT count FROM login_attempts WHERE key = ? AND expires_at > ?'
  )
    .bind(attemptsKey, Math.floor(Date.now() / 1000))
    .first<{ count: number }>();

  if (attempts && attempts.count >= 5) {
    return c.json(
      { success: false, error: 'Too many login attempts. Please try again later.' },
      429
    );
  }

  try {
    // Fetch user by email or username
    const user = await c.env.DB.prepare(
      'SELECT id, email, username, password_hash FROM users WHERE (email = ? OR username = ?) AND is_active = 1'
    )
      .bind(emailOrUsername, emailOrUsername)
      .first<{ id: string; email: string; username: string; password_hash: string }>();

    // Always run password verification even if user not found (timing attack prevention)
    const dummyHash = 'scrypt:16384:8:1:00000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    const hashToVerify = user ? user.password_hash : dummyHash;
    const isValid = await verifyPassword(password, hashToVerify);

    if (!user || !isValid) {
      // Record failed attempt
      const now = Math.floor(Date.now() / 1000);
      await c.env.DB.prepare(
        `INSERT INTO login_attempts (key, count, expires_at) VALUES (?, 1, ?)
         ON CONFLICT(key) DO UPDATE SET count = count + 1, expires_at = ?`
      )
        .bind(attemptsKey, now + 900, now + 900)
        .run();

      return c.json(
        { success: false, error: 'Invalid email/username or password' },
        401
      );
    }

    // Clear failed attempts on successful login
    await c.env.DB.prepare('DELETE FROM login_attempts WHERE key = ?').bind(attemptsKey).run();

    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login = ? WHERE id = ?'
    )
      .bind(Math.floor(Date.now() / 1000), user.id)
      .run();

    // Get user roles
    const roleResults = await c.env.DB.prepare(
      `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = ?`
    )
      .bind(user.id)
      .all<{ name: string }>();

    const roles = roleResults.results?.map(r => r.name) ?? [];

    // Generate tokens
    const tokens = await generateTokens(user.id, user.email, c.env.JWT_SECRET);

    // Set cookies
    setAuthCookies(c, tokens.accessToken, tokens.refreshToken, rememberMe ?? false);

    // Audit log
    await c.env.DB.prepare(
      'INSERT INTO audit_log (actor_id, action, resource_type, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(user.id, 'login', 'auth', ipAddr, c.req.header('user-agent') ?? '', Math.floor(Date.now() / 1000))
      .run();

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          roles,
        },
        accessToken: tokens.accessToken,
        expiresAt: tokens.expiresAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err); // eslint-disable-line no-console
    return c.json(
      { success: false, error: 'Authentication failed' },
      500
    );
  }
});

/**
 * GET /csrf-token
 * Returns a CSRF token for browser-based requests.
 */
authRoutes.get('/csrf-token', async (c) => {
  const refreshToken = getRefreshToken(c);

  if (!refreshToken) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  try {
    const payload = await verifyJWT(refreshToken, c.env.JWT_SECRET);
    if (!payload || payload.type !== 'refresh') {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    // Generate CSRF token as HMAC of session JTI
    const csrfToken = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey('raw', new TextEncoder().encode(c.env.JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
      new TextEncoder().encode(`${payload.sub}:${payload.jti}:${Math.floor(Date.now() / 60000)}`)
    );

    const tokenHex = Array.from(new Uint8Array(csrfToken), b => b.toString(16).padStart(2, '0')).join('');

    return c.json({ success: true, data: { csrfToken: tokenHex } });
  } catch {
    return c.json({ success: false, error: 'Failed to generate CSRF token' }, 500);
  }
});

/**
 * POST /refresh
 * Refresh access token using refresh token from cookie.
 */
authRoutes.post('/refresh', async (c) => {
  const refreshToken = getRefreshToken(c);

  if (!refreshToken) {
    return c.json({ success: false, error: 'No refresh token' }, 401);
  }

  try {
    const payload = await verifyJWT(refreshToken, c.env.JWT_SECRET);
    if (!payload || payload.type !== 'refresh') {
      return c.json({ success: false, error: 'Invalid refresh token' }, 401);
    }

    // Generate new access token
    const now = Math.floor(Date.now() / 1000);
    const newAccessToken = await signJWT(
      {
        sub: payload.sub,
        email: payload.email,
        iat: now,
        exp: now + 15 * 60,
        jti: crypto.randomUUID(),
        type: 'access',
      },
      c.env.JWT_SECRET
    );

    setAccessTokenCookie(c, newAccessToken);

    return c.json({
      success: true,
      data: { accessToken: newAccessToken, expiresAt: now + 15 * 60 },
    });
  } catch {
    return c.json({ success: false, error: 'Token refresh failed' }, 401);
  }
});

/**
 * POST /logout
 * Clear authentication cookies.
 */
authRoutes.post('/logout', async (c) => {
  const refreshToken = getRefreshToken(c);

  if (refreshToken) {
    const payload = await verifyJWT(refreshToken, c.env.JWT_SECRET);
    if (payload) {
      // Audit log
      const ipAddr = c.req.header('cf-connecting-ip') || 'unknown';
      await c.env.DB.prepare(
        'INSERT INTO audit_log (actor_id, action, resource_type, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(payload.sub, 'logout', 'auth', ipAddr, c.req.header('user-agent') ?? '', Math.floor(Date.now() / 1000))
        .run();
    }
  }

  clearAuthCookies(c);

  return c.json({ success: true, data: { message: 'Logged out successfully' } });
});

/**
 * GET /session
 * Get current user session.
 */
authRoutes.get('/session', async (c) => {
  const accessToken = getAccessToken(c);

  if (!accessToken) {
    return c.json({ success: true, data: { user: null } });
  }

  try {
    const payload = await verifyJWT(accessToken, c.env.JWT_SECRET);
    if (!payload) {
      return c.json({ success: true, data: { user: null } });
    }

    // Fetch full user data
    const user = await c.env.DB.prepare(
      'SELECT id, email, username, full_name, locale, digit_mode, timezone, is_active, last_login FROM users WHERE id = ? AND is_active = 1'
    )
      .bind(payload.sub)
      .first();

    if (!user) {
      return c.json({ success: true, data: { user: null } });
    }

    // Get roles
    const roleResults = await c.env.DB.prepare(
      `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = ?`
    )
      .bind(user.id)
      .all<{ name: string }>();

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          roles: roleResults.results?.map(r => r.name) ?? [],
        },
        expiresAt: payload.exp * 1000,
      },
    });
  } catch {
    return c.json({ success: true, data: { user: null } });
  }
});

// === Cookie helpers ===

function getAccessToken(c: CookieReader): string | null {
  return c.req.header('Authorization')?.replace('Bearer ', '') ?? null;
}

function getRefreshToken(c: CookieReader): string | null {
  const cookies = c.req.header('Cookie');
  if (!cookies) return null;
  const match = cookies.match(/refresh_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]!) : null;
}

function setAuthCookies(c: CookieSetter, accessToken: string, refreshToken: string, rememberMe: boolean) {
  const accessTokenOpts: Record<string, unknown> = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60,
  };

  const refreshTokenOpts: Record<string, unknown> = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/v1/auth/refresh',
    maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
  };

  c.set('access_token', accessToken, accessTokenOpts);
  c.set('refresh_token', refreshToken, refreshTokenOpts);
}

function setAccessTokenCookie(c: CookieSetter, accessToken: string) {
  c.set('access_token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60,
  });
}

function clearAuthCookies(c: CookieSetter) {
  const expiredOpts: Record<string, unknown> = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  };

  c.set('access_token', '', expiredOpts);
  c.set('refresh_token', '', { ...expiredOpts, path: '/api/v1/auth/refresh' });
}

export { authRoutes };
