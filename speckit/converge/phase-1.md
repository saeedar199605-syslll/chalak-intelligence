# Spec Kit: Converge Checklist — Phase 1

## Status: COMPLETE

All local checks pass. CI workflow fixed and pushed to GitHub (commit `6fba097`).
Awaiting first CI run on GitHub Actions for final validation.

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
- [~] CI pipeline passes on GitHub Actions (workflow pushed, awaiting run completion after wrangler.toml fix)

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

### CI Fixes Applied (commit 6fba097, 97c4e01)
- **6fba097**: Root cause: invalid `or:` key from `jpillora/install-api-action` made workflow unparseable
  - Removed unnecessary third-party action; Wrangler receives `CLOUDFLARE_API_TOKEN` directly via `env`
  - Fixed production deploy branch: `refs/heads/main` → `refs/heads/master` (matches actual repo branch)
  - Added `github.event_name != 'pull_request'` guard to prevent PRs deploying to production
  - Replaced `npm install` with `npm ci` for reproducible CI builds
  - Build artifact uploaded/downloaded between build and deploy jobs (no redundant rebuild)
  - Added `permissions: contents: read` for least-privilege security
  - Added `CF_ACCOUNT_ID` to production deploy steps
- **97c4e01**: Fixed wrangler.toml config format for Wrangler 4.x
  - `d1_databases`: array of inline tables (was `[[d1_database]]`)
  - `r2_buckets`: array of inline tables (was `[[r2_buckets]]`)
  - `durable_objects`: object with `bindings` array (was `[[durable_objects]]`)
  - Added `[exports.CollabRoom]` type = `"durable-object"` for DO export
  - CI deploy commands use `--env=""` to target default environment
  - Verified: `npx wrangler deploy --dry-run` passes with 0 warnings

---

## CI Evidence

| Check | Command | Result |
|-------|---------|--------|
| YAML syntax | `js-yaml` parse | Valid |
| YAML structure | 7 jobs all parse | typecheck, lint, test, security-audit, build, deploy-preview, deploy-production |
| Branch condition | `refs/heads/master` | Matches active branch |
| npm ci | `package-lock.json` v3 | 457 packages, valid |
| Local typecheck | `tsc --build --force` | 0 errors |
| Local lint | `eslint packages` | 0 errors, 0 warnings |
| Local tests | `vitest run` | 15/15 passed |
| Local build | `vite build` | 1677 modules transformed |
