import { describe, it, expect } from 'vitest';
import { generateTokens, verifyJWT, signJWT } from './jwt.js';

describe('JWT', () => {
  const SECRET = 'test_secret_key_at_least_32_bytes_long';

  it('should generate access and refresh tokens', async () => {
    const tokens = await generateTokens('user123', 'test@example.com', SECRET);

    expect(tokens.accessToken).toContain('.');
    expect(tokens.refreshToken).toContain('.');
    expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    expect(tokens.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('should verify a valid token', async () => {
    const { accessToken } = await generateTokens('user123', 'test@example.com', SECRET);
    const payload = await verifyJWT(accessToken, SECRET);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('user123');
    expect(payload!.email).toBe('test@example.com');
    expect(payload!.type).toBe('access');
  });

  it('should reject a token signed with wrong secret', async () => {
    const { accessToken } = await generateTokens('user123', 'test@example.com', SECRET);
    const payload = await verifyJWT(accessToken, 'wrong_secret_key_long_enough');

    expect(payload).toBeNull();
  });

  it('should reject an expired token', async () => {
    const token = await signJWT(
      {
        sub: 'user123',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000) - 3600,
        exp: Math.floor(Date.now() / 1000) - 1800,
        jti: 'test-jti',
        type: 'access',
      },
      SECRET
    );

    const payload = await verifyJWT(token, SECRET);
    expect(payload).toBeNull();
  });

  it('should reject a malformed token', async () => {
    const payload = await verifyJWT('not.a.valid.jwt', SECRET);
    expect(payload).toBeNull();
  });

  it('should reject a token with wrong number of parts', async () => {
    const payload = await verifyJWT('only.one.part', SECRET);
    expect(payload).toBeNull();
  });

  it('should handle empty token', async () => {
    const payload = await verifyJWT('', SECRET);
    expect(payload).toBeNull();
  });
});
