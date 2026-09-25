import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateSalt } from './password.js';

describe('Password Hashing', () => {
  it('should generate a salt', () => {
    const salt = generateSalt();
    expect(salt).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 32 hex chars
  });

  it('should generate different salts each time', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
  });

  it('should hash a password with a valid format', async () => {
    const hash = await hashPassword('testpassword123');
    // Format: "scrypt:..." or "pbkdf2:..." (fallback)
    expect(hash).toMatch(/^(scrypt|pbkdf2):[0-9]+:[0-9]+:[0-9]+:[0-9a-f]{32}:[0-9a-f]+$/);
  });

  it('should verify a correct password', async () => {
    const hash = await hashPassword('mypassword');
    const isValid = await verifyPassword('mypassword', hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const hash = await hashPassword('mypassword');
    const isValid = await verifyPassword('wrongpassword', hash);
    expect(isValid).toBe(false);
  });

  it('should produce different hashes for same password (different salts)', async () => {
    const hash1 = await hashPassword('samepassword');
    const hash2 = await hashPassword('samepassword');
    expect(hash1).not.toBe(hash2); // different salts → different hashes
    expect(await verifyPassword('samepassword', hash1)).toBe(true);
    expect(await verifyPassword('samepassword', hash2)).toBe(true);
  });

  it('should reject invalid hash format', async () => {
    const isValid = await verifyPassword('anything', 'invalid:hash:format');
    expect(isValid).toBe(false);
  });

  it('should handle edge case passwords', async () => {
    // Empty password should fail validation (not crash)
    const hash = await hashPassword('');
    expect(await verifyPassword('', hash)).toBe(true);
    expect(await verifyPassword('nonempty', hash)).toBe(false);
  });
});
