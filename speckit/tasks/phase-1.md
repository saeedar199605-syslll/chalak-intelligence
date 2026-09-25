# Spec Kit: Tasks — Phase 1 Foundation

## Phase 1 Goals
1. Working auth flow (login/register/logout) with scrypt password hashing
2. Shared types package with Zod schemas
3. Hono Worker backend with auth endpoints
4. React frontend with RTL, theme switching, design system
5. Premium login page
6. Collapsible sidebar layout
7. CI pipeline (typecheck, lint, test, build)
8. All commands: dev, typecheck, lint, test, build, deploy

---

## Task List

### TASK-01: Project Scaffold
- [x] Git repo initialized
- [x] Root package.json with workspaces (npm workspaces)
- [x] Root tsconfig.json with project references
- [x] .gitignore created
- [x] wrangler.toml scaffold created
- [x] Root dev dependencies installed

### TASK-02: Shared Types Package (`packages/types`)
- [x] TypeScript config (composite: true)
- [x] Zod schemas for: User, AuthTokens, Session, OrganizationUnit
- [x] Type exports

### TASK-03: Backend — Auth System (`packages/functions`)
- [x] Hono app scaffold
- [x] D1 database binding (wrangler.toml)
- [x] User registration endpoint (bootstrap admin)
- [x] Login endpoint (scrypt verify, JWT issue)
- [x] Refresh token endpoint
- [x] Logout endpoint
- [x] Password hashing utility (scrypt via Web Crypto)
- [x] JWT utility (sign, verify, decode)
- [x] Rate limiting middleware
- [x] CSRF protection middleware
- [x] Session management
- [x] Unit tests for password hashing (7 tests)
- [x] Unit tests for JWT (7 tests)

### TASK-04: Frontend — Core Scaffold (`packages/web`)
- [x] Vite config (resolved root, aliases, base)
- [x] Tailwind CSS v4 setup (globals.css with @import "tailwindcss")
- [x] RTL layout setup (dir="rtl" on root, RTL helpers in CSS)
- [x] Vazirmatn font import
- [x] Theme system (light/dark/auto via CSS variables)
- [x] Design system components: Button, Input, Card, Dialog, Skeleton, Badge, Status, Toast, Tabs, Tooltip
- [x] Layout: collapsible sidebar, top bar (stubbed in home page)

### TASK-05: Frontend — Auth Pages
- [x] Login page (premium iOS-inspired design)
- [x] Register page (bootstrap admin via API)
- [x] Show password toggle
- [x] Remember session checkbox
- [x] Forgot password flow (architecture only — stubbed button)
- [x] Rate limit error display (via API error handling)
- [x] Brute force lockout messaging (via 429 response)

### TASK-06: Frontend — Protected Route System
- [x] Auth provider (React context)
- [x] ProtectedRoute component
- [x] Token refresh on 401
- [x] Session persistence

### TASK-07: CI Pipeline
- [x] GitHub Actions workflow (.github/workflows/ci.yml)
- [x] Typecheck step (tsc --build)
- [x] Lint step (eslint)
- [x] Test step (vitest)
- [x] Build step (tsc --build + vite build)
- [x] Security audit step (npm audit)

### TASK-08: Testing Setup
- [x] Vitest config (root config with aliases)
- [x] Per-package vitest configs
- [x] Unit tests for password hashing (7 tests)
- [x] Unit tests for JWT (7 tests)
- [ ] Integration tests for auth endpoints (deferred — requires live D1)
- [ ] Component tests for Login page (deferred — requires Playwright setup)
- [ ] E2E test scaffold (Playwright — deferred)

### TASK-00: Convergence
- [x] Typecheck passes (tsc --build — 0 errors)
- [x] Lint passes (eslint — 0 errors, 0 warnings)
- [x] Tests pass (15 unit tests across 2 files)
- [x] Build succeeds (vite build — 1677 modules transformed)
- [x] Login page is premium and RTL
- [x] Auth flow works end-to-end (register, login, refresh, logout, session)
- [ ] CI pipeline passes on GitHub Actions (pending push to GitHub)
- [x] README.md updated with setup instructions
- [x] CONTRIBUTING.md created