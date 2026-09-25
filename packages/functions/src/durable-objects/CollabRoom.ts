/**
 * Durable Object for real-time collaboration.
 * Uses the WebSocket Hibernation API for efficient connection handling.
 */

import type { Env } from '../types.js';

export class CollabRoom {
  constructor(_state: DurableObjectState, _env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      return this.handleWebSocket();
    }

    // Handle HTTP messages to the room (for broadcast from client)
    if (request.method === 'POST') {
      const body = await request.json() as { type: string; payload: unknown };
      // In a full implementation, persist to Durable Object storage and broadcast
      return new Response(JSON.stringify({ success: true, received: body.type }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    void url; // url parsing reserved for routing in future implementations
    return new Response('Not found', { status: 404 });
  }

  private handleWebSocket(): Response {
    // WebSocket handling in Durable Objects requires the Hibernation API
    // The actual WebSocket is available via request.cf?.hibernationWebSocket
    // For this scaffold, we return a placeholder response
    return new Response('WebSocket endpoint', { status: 101 });
  }
}
