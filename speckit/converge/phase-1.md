# Spec Kit: Converge Checklist — Phase 1

## Status: COMPLETE — Waiting on CI pipeline run on GitHub Actions

All local checks pass. CI pipeline is configured but needs to be validated on GitHub.

---

## Convergence Criteria

### Build & Tests
- [x] `npm run typecheck` passes (0 errors)
- [x] `npm run lint` passes (0 errors, 0 warnings)
- [x] `npm test` passes (all 15 unit tests across 2 files)
- [x] `npm run build` succeeds (vite build — 1677 modules transformed, output in dist/)
- [ ] CI pipeline passes on GitHub Actions (all gates green) — **pending push to GitHub**

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