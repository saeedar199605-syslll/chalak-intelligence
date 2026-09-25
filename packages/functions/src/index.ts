/**
 * CloudFlare Worker entry point.
 * This file is the top-level entry for the Worker runtime.
 */

import app from './app.js';
import { CollabRoom } from './durable-objects/CollabRoom.js';
import type { Env } from './types.js';

export { CollabRoom };
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};
