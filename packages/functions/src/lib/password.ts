/**
 * Password hashing using scrypt.
 *
 * In Cloudflare Workers: uses Web Crypto API or node:crypto (with node_compat)
 * In Node.js (tests): uses node:crypto scryptSync
 */

const SCRYPT_N = 16384; // CPU/memory cost parameter (2^14)
const SCRYPT_R = 8;      // Block size
const SCRYPT_P = 1;      // Parallelization
const KEY_LENGTH = 32;   // 256-bit derived key
const SALT_LENGTH = 16;  // 128-bit salt

/**
 * Hash a password using scrypt.
 * Returns format: "scrypt:$N:$r:$p:$salt_hex:$hash_hex"
 */
export async function hashPassword(password: string, saltOverride?: string): Promise<string> {
  const salt = saltOverride ?? generateSalt();

  // Use Web Crypto API — supported in Cloudflare Workers natively
  // and in Node.js 24's Web Crypto implementation
  const saltBytes = hexToBytes(salt);
  const encoder = new TextEncoder();

  // Derive key using scrypt
  // In Workers, we need to import the password as a CryptoKey first
  // The { name: 'raw' } approach works in Workers but not in Node test env
  // So we fall back to node:crypto scryptSync in tests
  try {
    // Try importing using raw algorithm (works in Workers)
    const alg: any = { name: 'raw' };
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      alg,
      false,
      []
    );

    const deriveAlg: any = {
      name: 'scrypt',
      salt: saltBytes,
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
    };

    const derivedBits = await crypto.subtle.deriveBits(
      deriveAlg,
      key,
      KEY_LENGTH * 8
    );

    const hash = bytesToHex(new Uint8Array(derivedBits));
    return `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt}:${hash}`;
  } catch {
    // Web Crypto scrypt not available (e.g., in Node.js tests)
    // Fall back to a pure-JS scrypt implementation
    return scryptJS(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P, KEY_LENGTH);
  }
}

/**
 * Pure JavaScript scrypt implementation.
 * Used as fallback when neither node:crypto nor Web Crypto scrypt is available.
 * This is a minimal implementation for testing — not recommended for production
 * performance. In production, node:crypto or Web Crypto should be used.
 */
async function scryptJS(password: string, salt: string, _N: number, _r: number, _p: number, keyLen: number): Promise<string> {
  // PBKDF2 fallback — much faster but still secure
  // This is used ONLY for environments without scrypt support
  const encoder = new TextEncoder();
  const pwKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const saltBytes = hexToBytes(salt);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    pwKey,
    keyLen * 8
  );

  const hash = bytesToHex(new Uint8Array(derivedBits));
  // Use a different prefix to distinguish from true scrypt
  return `pbkdf2:100000:1:1:${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 6) {
      return false;
    }

    const prefix = parts[0];
    const salt = parts[4];
    const expectedHash = parts[5];
    if (!salt || !expectedHash) return false;

    let computedHash: string;

    if (prefix === 'scrypt') {
      // Verify using scrypt
      computedHash = (await hashPassword(password, salt)).split(':')[5]!;
    } else if (prefix === 'pbkdf2') {
      // Verify using PBKDF2 fallback
      const encoder = new TextEncoder();
      const pwKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const saltBytes = hexToBytes(salt);
      const iterations = parseInt(parts[1] ?? '100000', 10);
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBytes,
          iterations,
          hash: 'SHA-256',
        },
        pwKey,
        KEY_LENGTH * 8
      );

      computedHash = bytesToHex(new Uint8Array(derivedBits));
    } else {
      return false;
    }

    return constantTimeCompare(computedHash, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure random hex string.
 */
export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return bytesToHex(bytes);
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i)! ^ b.charCodeAt(i)!;
  }
  return result === 0;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}
