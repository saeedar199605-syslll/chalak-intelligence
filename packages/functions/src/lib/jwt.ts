/**
 * JWT utilities for authentication.
 * Uses HS256 (HMAC-SHA256) — symmetric signing suitable for Cloudflare Workers
 * where the signing secret is available as a Cloudflare Secret.
 */

interface JWTPayload {
  sub: string;           // user ID
  email: string;         // user email
  iat: number;           // issued at (seconds)
  exp: number;           // expiration (seconds)
  jti: string;          // JWT ID for revocation
  type: 'access' | 'refresh';
}

const ACCESS_TOKEN_TTL = 15 * 60;         // 15 minutes in seconds
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Sign a JWT payload.
 */
export async function signJWT(payload: JWTPayload, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoder = new TextEncoder();

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput));
  const sigB64 = base64UrlEncodeBytes(new Uint8Array(signature));

  return `${signingInput}.${sigB64}`;
}

/**
 * Verify a JWT signature and expiration.
 */
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    if (!headerB64 || !payloadB64 || !sigB64) return null;

    const signingInput = `${headerB64}.${payloadB64}`;

    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['verify']
    );

    const sigBytes = base64UrlDecode(sigB64);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(signingInput));

    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecodeText(payloadB64)) as JWTPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Generate access + refresh token pair for a user.
 */
export async function generateTokens(
  userId: string,
  email: string,
  jwtSecret: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }> {
  const now = Math.floor(Date.now() / 1000);

  const accessToken = await signJWT(
    {
      sub: userId,
      email,
      iat: now,
      exp: now + ACCESS_TOKEN_TTL,
      jti: crypto.randomUUID(),
      type: 'access',
    },
    jwtSecret
  );

  const refreshToken = await signJWT(
    {
      sub: userId,
      email,
      iat: now,
      exp: now + REFRESH_TOKEN_TTL,
      jti: crypto.randomUUID(),
      type: 'refresh',
    },
    jwtSecret
  );

  return {
    accessToken,
    refreshToken,
    expiresAt: now + ACCESS_TOKEN_TTL,
  };
}

export { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL };

// === Base64 URL helpers ===

function base64UrlEncode(text: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(text));
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(text: string): Uint8Array {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecodeText(text: string): string {
  return new TextDecoder().decode(base64UrlDecode(text));
}
