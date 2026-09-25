# Architecture Decision Records (ADR)
# Project: Chalak Intelligence Platform

---

## ADR-001: Stack Decision

**Status:** Accepted  
**Date:** 2026-09-25  
**Deciders:** Principal Architect

### Context
Need to choose a tech stack for a Production-Grade BI platform that runs on Cloudflare.

### Decision
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Headless UI + TanStack Table + TanStack Query + Apache ECharts + Web Workers
- **Backend:** Cloudflare Workers (TypeScript) + Hono framework + Zod for validation
- **Database:** Cloudflare D1 (SQLite-based)
- **Realtime:** Durable Objects + WebSocket Hibernation API
- **Storage:** Cloudflare R2 (for uploads/exports)
- **AI Gateway:** Cloudflare AI Gateway (adapter-based, pluggable)
- **Authentication:** Custom JWT-based auth with secure cookies + rate limiting
- **Deployment:** Cloudflare Workers + Static Assets (single `npm run deploy`)

### Rationale
- Cloudflare-first per requirement #5
- TypeScript end-to-end for type safety (requirement #17)
- React ecosystem maturity for complex BI UIs
- ECharts for the extensive visualization catalog (requirement #9)
- Hono for Workers (minimal, fast, type-safe)
- D1 provides SQLite compatibility with standard SQL — critical for analytics
- Durable Objects for real-time collaboration
- All Free Tier compatible

### Consequences
- D1 has 10GB storage on Free Tier (may need upgrade for large orgs)
- Workers have 30ms CPU time on Free Tier (may need upgrade for complex AI calls)
- Must design for graceful degradation when paid features are needed

---

## ADR-002: Monorepo Structure

**Status:** Accepted  
**Date:** 2026-09-25

### Context
Need to organize frontend, backend, and shared types in a maintainable way.

### Decision
Three packages in a monorepo:
- `packages/types/` — Shared TypeScript types + Zod schemas
- `packages/web/` — React frontend (Vite, Tailwind, ECharts)
- `packages/functions/` — Cloudflare Workers backend (Hono)

Shared tooling: ESLint, Prettier, Vitest, TypeScript project references.

### Rationale
- Type safety requires shared types between frontend and backend
- Workers Bundles are separate — monorepo allows independent deployment
- Easier to reason about dependencies

---

## ADR-003: Formula Engine

**Status:** Proposed

### Context
Need a secure formula engine for KPI definitions. Cannot use eval().

### Decision
Custom parser using a restricted expression DSL. Tokens parsed into AST. Evaluated with a whitelist of safe operations. No function imports, no property access beyond known contexts.

### Rationale
- eval() is forbidden by Constitution
- Users need to create measures without coding
- Must be safe from formula injection

---

## ADR-004: AI Provider Abstraction

**Status:** Proposed

### Context
Need to support OpenAI, Anthropic, Google, Cloudflare Workers AI, OpenRouter, OpenAI-compatible, and custom endpoints.

### Decision
Adapter pattern. Each provider implements a common interface:
```typescript
interface AIProvider {
  name: string
  testConnection(): Promise<boolean>
  analyze(context: AIAnalysisContext): Promise<string>
  chat(messages: Message[]): AsyncIterable<string>
}
```
Provider configs stored encrypted server-side. API keys never sent to client.

---

## ADR-005: Authentication Strategy

**Status:** Accepted

### Context
Need secure auth compatible with Cloudflare Workers.

### Decision
- JWT access tokens (short-lived, 15min) in Secure HttpOnly cookies
- Refresh tokens (7 days) in separate HttpOnly cookie
- Rate limiting per IP + per username
- Brute-force protection (5 attempts → lockout)
- Password hashing: bcrypt or argon2 via Workers-compatible library
- Session management table in D1

### Consequences
- Stateless auth scales well
- Cookie-based avoids localStorage XSS risks
- Short-lived access tokens limit damage from token theft

---

## ADR-006: Data Model — Datasets

**Status:** Proposed

### Context
Need flexible data model for heterogeneous organizational data.

### Decision
- Datasets have a schema (columns + types) stored in D1
- Raw data stored as parquet or CSV in R2, referenced by D1 metadata
- Data cleaning transformations stored as JSON pipeline config
- Semantic layer maps raw fields to dimensions and measures
- KPI definitions reference measures + formulas

### Rationale
- Separates storage (R2) from metadata (D1) — cost optimization
- Transformation pipeline is declarative and reproducible
- Semantic layer provides single source of truth

---

## ADR-007: Momentum Engine Algorithm

**Status:** Proposed

### Context
Need explainable momentum computation across multiple methods.

### Decision
Composite momentum = weighted sum of normalized components:
1. Directional change (40%): (current - baseline) / baseline * direction_sign * 100
2. Trend slope (25%): linear regression slope * direction_sign, normalized
3. Acceleration (15%): change in trend slope, normalized
4. Target-gap improvement (10%): reduction in distance to target, normalized
5. Consistency (5%): low volatility bonus, normalized
6. Volatility penalty (5%): high volatility penalty, normalized

Weights are configurable per KPI. For "lower-is-better", all components are multiplied by -1. For target-range KPIs, target-gap improvement is inverted (approaching target = positive).

### Rationale
- Fully explainable: each component shown on hover
- Configurable weights for domain tuning
- Handles all KPI direction types

---

## ADR-008: Spec Kit Implementation

**Status:** Accepted

### Context
The prompt references GitHub Spec Kit (github/speckit) but this repository does not exist.

### Decision
Implement Spec Kit as a lightweight, file-based workflow in `/speckit/` directory:
- `constitution.md` — immutable project principles
- `specify.md` — functional + non-functional requirements with acceptance criteria
- `clarify.md` — open questions and decisions
- `plan.md` — phased implementation plan
- `tasks/` — individual task files with status
- `implement/` — design docs per feature
- `converge/` — convergence checklists

### Rationale
- Cannot depend on a non-existent package
- File-based spec is portable and versionable
- Follows the exact cycle required by the prompt (speckit-constitution → specify → clarify → plan → tasks → implement → converge)
