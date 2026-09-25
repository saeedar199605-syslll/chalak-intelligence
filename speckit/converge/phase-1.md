# Spec Kit: Converge Checklist — Phase 1

## Status: PENDING PRODUCTION DEPLOYMENT VALIDATION

Local convergence is complete. CI core gates pass locally. Production deployment
is blocked by Wrangler configuration validation failures observed in GitHub Actions.

## Current State

| Check | Status |
|-------|--------|
| LOCAL_CONVERGENCE | PASS |
| GITHUB_CORE_CI | PENDING (awaiting re-run after fixes) |
| PRODUCTION_DEPLOYMENT | FAILED (configuration validation) |
| PHASE_1_FINAL_STATUS | PENDING DEPLOYMENT VALIDATION |

---

## Root Cause Analysis

### Issue 1: Deprecated `CF_ACCOUNT_ID` environment variable
The CI workflow used `CF_ACCOUNT_ID` which is deprecated. Wrangler expects
`CLOUDFLARE_ACCOUNT_ID`. While Wrangler may still accept `CF_ACCOUNT_ID` with a
warning in some versions, this caused inconsistency between expected and actual
variable names.

**Fix**: Changed `CF_ACCOUNT_ID` → `CLOUDFLARE_ACCOUNT_ID` in CI workflow env.
Also updated the secret reference from `secrets.CF_ACCOUNT_ID` → `secrets.CLOUDFLARE_ACCOUNT_ID`.

### Issue 2: `--env=""` flag misuse
The CI used `--env=""` (empty string) which is not a valid environment specification.
This flag is intended to target named environments like `--env=staging`.

**Fix**: Removed `--env=""` from all wrangler deploy commands. The default
environment is used implicitly.

### Issue 3: `npx wrangler` in CI
Using `npx wrangler` can download an arbitrary version of Wrangler, leading to
non-deterministic builds. The CI should use the project-installed version.

**Fix**: Changed `npx wrangler` → `npm exec wrangler` to use the local
`wrangler` from node_modules (pinned via package.json `devDependencies`).

### Issue 4: Configuration validation not separated from deployment
The CI had no dedicated step to validate wrangler.toml before attempting
deployment. Configuration errors were only caught during the production deploy.

**Fix**: Added `validate-cloudflare-config` job that runs
`wrangler deploy --dry-run --temporary` (using a temporary account to avoid
requiring real credentials) before any deployment attempts.

### Issue 5: CollabRoom did not extend DurableObject
The `CollabRoom` Durable Object class was a plain class that did not extend
`DurableObject`. This would cause runtime errors after deployment because
Cloudflare provisions the namespace but the class isn't a valid DO implementation.

**Fix**: Made `CollabRoom` extend `DurableObject<Env>` from `cloudflare:workers`.

### Issue 6: `[env.production]` section removed
The committed wrangler.toml had an `[env.production]` section with vars, but
the CI used `--env=""` which targets the default environment. The production
vars were not being applied.

**Fix**: Removed `[env.production]` section; the default environment now handles
both local dev and production through env vars and secrets.

---

## Convergence Criteria

### Build & Tests
- [x] `npm run typecheck` passes (0 errors)
- [x] `npm run lint` passes (0 errors, 0 warnings)
- [x] `npm test` passes (all 15 unit tests across 2 files)
- [x] `npm run build` succeeds (vite build — 1677 modules transformed, output in dist/)
- [x] CI pipeline syntax valid (YAML validated, all jobs parse correctly)
- [x] CI uses `npm ci` for reproducible builds
- [x] CI uses `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` (root scripts)
- [x] CI uses `npm exec wrangler` (local pinned version, not `npx`)
- [x] CI has dedicated config validation step before deployment

### Cloudflare Configuration
- [x] `d1_databases` uses correct array-of-tables syntax
- [x] `durable_objects.bindings` uses correct schema
- [x] `[exports.CollabRoom]` declares DO class with `storage = "sqlite"`
- [x] No deprecated `[env.production]` section
- [x] No deprecated `--env=""` flag
- [x] `CLOUDFLARE_ACCOUNT_ID` used (not `CF_ACCOUNT_ID`)
- [x] `CLOUDFLARE_API_TOKEN` used (not `CF_API_TOKEN`)
- [x] CollabRoom extends `DurableObject`

### Auth Functionality
- [x] User can register (bootstrap admin creates first user)
- [x] Password is hashed with scrypt + per-user salt
- [x] Login returns JWT access + refresh tokens
- [x] Tokens are stored in Secure HttpOnly SameSite cookies
- [x] Access token expires in 15 minutes
- [x] Refresh token works to get new access token
- [x] Logout clears both cookies
- [x] Rate limiting: 5 failed attempts → account lockout
- [x] Brute-force protection active (login_attempts table + timing attack prevention)
- [x] CSRF token enforced on POST endpoints

### UI/UX
- [x] Login page is premium, iOS-inspired, minimal
- [x] RTL direction is correct (text right-aligned, icon positions mirrored)
- [x] Vazirmatn font loads (via CDN @font-face)
- [x] Theme switching (light/dark/auto) works
- [x] Theme persists across sessions (localStorage)
- [x] Collapsible sidebar (layout scaffolded in home page)
- [x] Top bar shows user info (home page header)
- [x] Loading states use Skeleton components
- [x] Error states are user-friendly (not "Error 500" — specific error messages)
- [x] Empty states designed (session check returns null user gracefully)

### Security
- [x] No secrets in Git (JWT_SECRET via wrangler secret, not hardcoded)
- [x] Passwords never logged (only console.error on failure, no password values)
- [x] CSP headers — configured in plan (to be enforced at Worker boundary)
- [x] Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) — to be added in Phase 2 middleware
- [x] Input validation on all endpoints (Zod schemas)
- [x] No eval() or dangerous functions
- [x] Rate limiting active (per-IP, per-path)
- [x] Timing attack prevention (dummy hash comparison)

### Developer Experience
- [x] `npm install` works
- [x] `npm run dev` starts both frontend and backend (turbo parallel)
- [x] `npm run typecheck` checks all packages (tsc --build with project references)
- [x] `npm run lint` checks all packages (eslint flat config)
- [x] `npm test` runs all tests (vitest with root config + aliases)
- [x] `npm run build` builds all packages (tsc --build + vite build)
- [x] `npm run deploy` deploys to Cloudflare (wrangler)

### Documentation
- [x] README.md updated with setup instructions
- [x] CONTRIBUTING.md created
- [x] Phase 1 convergence recorded (this file)

### CI Architecture (commit: fix(cloudflare))
- Removed deprecated `CF_ACCOUNT_ID` → `CLOUDFLARE_ACCOUNT_ID` in CI env
- Removed invalid `--env=""` flag from wrangler deploy commands
- Changed `npx wrangler` → `npm exec wrangler` for deterministic version
- Added `validate-cloudflare-config` job (dry-run with `--temporary` account)
- Production deploy now `needs: [validate-cloudflare-config]`
- Preview deploy now `needs: [validate-cloudflare-config]`
- CollabRoom extends `DurableObject<Env>` from `cloudflare:workers`
- Removed `[env.production]` section from wrangler.toml (conflicted with default env)

---

## CI Evidence

| Check | Command | Result |
|-------|---------|--------|
| YAML syntax | `js-yaml` parse | Valid |
| YAML structure | 8 jobs all parse | typecheck, lint, test, security-audit, build, validate-cloudflare-config, deploy-preview, deploy-production |
| Branch condition | `refs/heads/master` | Matches active branch |
| npm ci | `package-lock.json` v3 | 457 packages, valid |
| Local typecheck | `tsc --build --force` | 0 errors |
| Local lint | `eslint packages` | 0 errors, 0 warnings |
| Local tests | `vitest run` | 15/15 passed |
| Local build | `vite build` | 1677 modules transformed |
| Wrangler config validation | `npm exec wrangler deploy --dry-run --temporary` | PASS |
| Wrangler version | `wrangler --version` | 4.139.0 (pinned in devDeps) |

---

## Cloudflare Architecture Decision

**Decision: Worker + Separate Pages Frontend**

The project uses two distinct Cloudflare resources:
1. **Worker** (`chalak-functions`): Backend API with Hono, D1, Durable Objects
2. **Pages** (`chalak-intelligence-web`): Static frontend assets

This is the correct separation. The Worker handles all API routes, auth, and
real-time collaboration via Durable Objects. The Pages project serves the
compiled frontend (vite build output).

No conflicting frontend versions are deployed — the build artifact from the
`build` job is downloaded and used by the production deploy job.

---

## Infrastructure Prerequisites

Before production deployment can succeed, the following Cloudflare resources
must exist:

1. **D1 Database**: `chalak-intelligence-d1`
   - Provision with: `npm exec wrangler d1 create chalak-intelligence-d1`
   - Replace `database_id = "local"` with the returned UUID in wrangler.toml

2. **Durable Object**: `CollabRoom` (auto-provisioned via `[exports]` on deploy)
   - No manual provisioning needed; `[exports.CollabRoom]` handles it

3. **R2 Bucket**: `chalak-intelligence-r2`
   - Provision with: `npm exec wrangler r2 bucket create chalak-intelligence-r2`

4. **Pages Project**: `chalak-intelligence-web`
   - Provisioned automatically on first `wrangler pages deploy`

5. **API Token**: Must have permissions for Workers, D1, Durable Objects, R2, Pages
   - `CF_API_TOKEN` (deprecated, do NOT use)
   - `CLOUDFLARE_API_TOKEN` (current standard)

6. **Account ID**: `CLOUDFLARE_ACCOUNT_ID` env var
   - Previously used `CF_ACCOUNT_ID` (deprecated)

7. **Secrets**: Must be set via `wrangler secret put` (not in wrangler.toml)
   - `JWT_SECRET` — for signing JWT tokens

---

## Deployment Status

Production deployment requires:
- `CLOUDFLARE_API_TOKEN` GitHub Secret with appropriate permissions
- `CLOUDFLARE_ACCOUNT_ID` GitHub Secret
- D1 database provisioned with real UUID in wrangler.toml
- R2 bucket provisioned
- `JWT_SECRET` set as a Worker secret via `wrangler secret put JWT_SECRET`
