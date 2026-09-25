# Contributing to Chalak Intelligence Platform

## Development Setup

```bash
npm install
npm run dev        # Start both frontend and backend
```

## Code Quality Gates

All contributions must pass these checks:

```bash
npm run typecheck  # tsc --build (project references)
npm run lint       # 0 errors, 0 warnings
npm run test       # all unit tests pass
npm run build      # production build succeeds
```

CI runs all four gates on every PR. No bypassing.

## Spec Kit Workflow

Each feature follows the Spec Kit cycle:

1. **Specify** — Document in `speckit/specify.md`
2. **Plan** — Design in `speckit/plan.md`
3. **Tasks** — Break down in `speckit/tasks/`
4. **Implement** — Code with tests
5. **Converge** — Test, review, harden in `speckit/converge/`

## Architecture Principles

See [Constitution](speckit/constitution.md) for the 27 non-negotiable principles.
Key ones:
- Security First
- Type Safety (no `any`, all contracts use Zod)
- RTL First (Persian is primary language)
- No Fake Data — all demo data labeled "داده آزمایشی"
- No Fake Functionality — every UI element must work
- Performance First (benchmark at 1K, 10K, 100K, 500K rows)
- Cloudflare Compatibility (Free Tier where possible)

## Monorepo Conventions

- Shared types: `@chalak/types` (imports from `packages/types/src/`)
- Backend: `@chalak/functions/*` (imports from `packages/functions/src/`)
- Frontend: `@/*` (imports from `packages/web/src/`)
- Use workspace-relative paths in configs (`../../types/src/...`)
- Per-package `tsconfig.json` uses `composite: true` for project references

## Testing

- Unit tests use Vitest
- Run: `npm test` (finds all `*.test.{ts,tsx}` across packages)
- Test files live next to the code they test (e.g., `src/lib/password.test.ts`)
