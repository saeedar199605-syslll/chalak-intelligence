/**
 * Environment types for the Cloudflare Workers backend.
 */

import type { D1Database, R2Bucket, DurableObjectNamespace } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  COLLAB: DurableObjectNamespace;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  ENVIRONMENT: string;
  AI_ENCRYPTION_KEY?: string;
}

export interface ContextWithUser {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}
