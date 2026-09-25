# اصفهان چالاک — Chalak Intelligence Platform

**Organizational Intelligence Platform** — a production-grade Business Intelligence platform built entirely on the Cloudflare Free Tier.

## Quick Start

```bash
# Install dependencies
npm install

# Run development servers (frontend + backend)
npm run dev

# Or separately:
npm run dev:web        # Frontend on http://localhost:5173
npm run dev:functions  # Backend on http://localhost:8788

# Check code quality
npm run typecheck      # TypeScript type checking
npm run lint           # ESLint (0 errors, 0 warnings)
npm run test           # Vitest unit tests
npm run build          # Production build

# Database migration
npm run migrate
```

## Project Structure

```
packages/
├── types/        # Shared TypeScript types + Zod schemas
├── functions/    # Cloudflare Workers backend (Hono API)
├── web/          # React frontend (Vite + Tailwind CSS + ECharts)
migrations/         # SQL migration files
speckit/            # Spec Kit documents (constitution, specify, plan, tasks, converge)
```

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + ECharts
- **Backend:** Cloudflare Workers + Hono + Zod
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2
- **Real-time:** Durable Objects + WebSocket Hibernation API
- **Auth:** JWT (access + refresh tokens) in Secure HttpOnly SameSite cookies
- **Password Hashing:** scrypt via Web Crypto API

## Phase 1: Foundation

Phase 1 delivers a working auth flow with:
- scrypt-based password hashing
- JWT access + refresh token flow in Secure HttpOnly cookies
- Premium iOS-inspired RTL login page
- Light/Dark/Auto theme switching
- Design system components (Button, Input, Card, Skeleton, etc.)
- CI pipeline: typecheck, lint, test, build

## License

See the [Spec Kit Constitution](speckit/constitution.md) for project principles.
