# Project: اصفهان چالاک — Chalak Intelligence Platform
# Spec Kit: Constitution
# Status: Phase 0 — Research + Spec Foundation

## Project Identity

- **Product Name:** Chalak Intelligence
- **Company Name (UI):** اصفهان چالاک
- **Domain:** Organizational Intelligence Platform (Business Intelligence + Performance Intelligence)
- **Default Language:** Persian (fa-IR), RTL-First
- **Secondary Language:** English (i18n-ready)
- **Architecture:** TypeScript monorepo, Cloudflare-first, modular domain architecture

---

## Core Principles (Non-Negotiable)

### 1. Security First
All auth, all secrets, all data access must be secure by design. No secret enters Git. API keys encrypted server-side. CSRF, XSS, SQL injection, and prompt injection are treated as critical threats.

### 2. Data Integrity First
Data entered by users must not be corrupted, lost, or falsified. All mutations are transactional. All reads are consistent. No silent data loss.

### 3. No Fake Data in Production
Any demo data must be explicitly labeled "Demo Data / داده آزمایشی" and never mixed with production data. No fake KPIs, fake charts, or fake functionality.

### 4. No Fake Functionality
Every UI element must work. Placeholder buttons, fake loading states, or disabled features are forbidden. If a feature is planned but not implemented, it must not appear in the UI.

### 5. Type Safety
End-to-end TypeScript. No `any`. All API contracts are typed with Zod (or equivalent) schemas validated at runtime.

### 6. Accessibility
WCAG 2.2 AA minimum. Keyboard navigation, screen reader support, reduced motion, sufficient contrast, proper ARIA labels.

### 7. RTL First
The UI is built from the ground up as RTL-First (Persian). English and LTR are secondary adaptations.

### 8. Mobile Responsive
All screens must work on Desktop, Laptop, Tablet, and Mobile. Mobile is not a shrunk desktop.

### 9. Performance First
Initial load, dashboard load, chart rendering, and filter response must be fast. Virtualization, Web Workers, pagination, and caching are standard. Benchmark at 1K, 10K, 100K, 500K rows.

### 10. Cloudflare Compatibility
The platform must run entirely on Cloudflare Free Tier where possible: Workers, Static Assets, D1, Durable Objects, R2, WebSockets. No VPS, no dedicated Docker, no external database unless graceful degradation is implemented.

### 11. Test Before Release
Unit, Integration, Component, E2E, Security, Performance, RTL, Responsive, Regression, Authorization, Calculation (KPI Formula, Momentum), Import, Migration, AI Adapter, Backup/Restore — all must pass before release.

### 12. Auditability
All critical operations (login, data import, KPI edit, dashboard edit, AI config, export, restore, permission change) are logged with immutable audit trails.

### 13. Explainable Analytics
Every KPI value, momentum score, anomaly, and forecast must have an explainable breakdown: data lineage, formula, dimensions, data quality, confidence, components.

### 14. Explainable AI
AI outputs must include evidence, data coverage, model info, sample size, and clear distinction between observed fact, statistical relationship, hypothesis, and recommendation. AI must not fabricate causes.

### 15. Privacy by Design
Data classification (Public, Internal, Confidential, HR Restricted, Highly Restricted). Analytics API enforces permission-based data redaction.

### 16. Human-in-the-loop AI
AI never directly mutates data, KPIs, targets, users, or permissions. Every AI suggestion requires explicit human approval. AI is read/analyze only by default.

### 17. No AI Hallucination Presented as Fact
AI responses clearly demarcated as analysis, not fact. Confidence indicators are statistical, not fabricated percentages.

### 18. Modular Architecture
Domain-based modules: auth, users, organization, data, datasets, semantic-model, kpis, dashboards, analytics, momentum, ai, reports, alerts, audit, settings, themes. Dependencies are unidirectional.

### 19. Backward-Compatible Database Migration
All schema changes use migrations. No destructive migration without backup + validation. Seed and migration are separate.

### 20. Documentation as Code
All docs maintained as code alongside the source. Spec Kit artifacts are living documents.

### 21. Reproducible Builds
Build artifacts are deterministic. CI gates enforce typecheck, lint, test, and build.

### 22. No Hardcoded Secrets
All secrets via Cloudflare Secrets or .env (never committed). No API keys, tokens, or credentials in source code.

### 23. Graceful Failure
Cloudflare service outages, AI provider failures, network disconnects must not crash the application. Fallback to last known good state with clear messaging.

### 24. Observability
Structured, privacy-safe error logging. Trace/Correlation IDs per request. Error states must be user-understandable with recovery guidance.

### 25. Maintainability
No God Components. No 2000-line files. No duplicated logic, styles, or KPI calculations. No magic numbers. No hardcoded permissions or business rules. Domain logic separated from UI.

### 26. Evidence Before Release
Release decisions are backed by measurable evidence: test results, performance benchmarks, security scans, user feedback.

### 27. No release while critical tests fail
CI gates must pass. No bypassing.

---

## Acceptance Criteria for Constitution Validation

- [ ] A security reviewer can audit how secrets are stored and rotated
- [ ] A data steward can trace any KPI value to its raw source
- [ ] An accessibility tester can navigate the entire app via keyboard
- [ ] An RTL user sees correct text direction, table alignment, and chart mirroring
- [ ] A mobile user can complete the core workflow (import → KPI → dashboard → analysis)
- [ ] A CI pipeline can run all tests with a single command
- [ ] A new developer can spin up the project with one command
- [ ] Demo data is visually distinct and isolated from production data
- [ ] Every UI button performs a real, tested action
- [ ] Every API contract has a Zod schema enforced on both ends
