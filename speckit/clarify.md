# Spec Kit: Clarify Phase
# Project: Chalak Intelligence Platform

This file documents ambiguities discovered during specification and how they were resolved.

---

## Q1: GitHub Spec Kit package — does it exist?

**Status:** Resolved  
**Decision:** No. The repository `github/speckit` does not exist on GitHub. The package `@github/speckit` is not available on npm. Implementing Spec Kit as a file-based workflow in `/speckit/` directory per ADR-008.

---

## Q2: Should the platform require an external backend (VPS, Docker, etc.)?

**Status:** Resolved  
**Decision:** No. The platform must run entirely on Cloudflare Free Tier. Uses Workers, D1, R2, Durable Objects, Static Assets. If a feature requires paid tier, it must degrade gracefully.

---

## Q3: Should AI be required to run the platform?

**Status:** Resolved  
**Decision:** No. Per requirement #64, the platform must be fully functional without AI. AI is an enhancement layer, not a dependency. KPI computation, Dashboard rendering, Momentum analysis, and manual analysis must all work without any AI provider configured.

---

## Q4: What database should store the semantic model, KPI definitions, and user data?

**Status:** Resolved  
**Decision:** Cloudflare D1. It provides SQLite-compatible queries, Serverless SQL, and scales with the app. For large raw datasets, files are stored in R2 with metadata in D1. This keeps everything within the Cloudflare ecosystem.

---

## Q5: How should passwords be hashed in Cloudflare Workers?

**Status:** Resolved  
**Decision:** Use `scrypt` via the Web Crypto API (`crypto.subtle.deriveKey`), which is natively available in Workers. scrypt is preferred over bcrypt because it's built into the Workers runtime. Salt per-user.

---

## Q6: How should AI API keys be stored?

**Status:** Resolved  
**Decision:** Server-side only. API keys stored encrypted in D1 using AES-256-GCM with a master key from Cloudflare Secrets (`AI_ENCRYPTION_KEY`). Keys are never sent to the client. The AI provider adapter calls the provider directly from the Worker.

---

## Q7: What charting library?

**Status:** Resolved  
**Decision:** Apache ECharts. It has the most comprehensive visualization catalog matching the 40+ chart types required. Theming is via JavaScript config objects. RTL support is via `rtl: true` in the option. All charts theme-aware via CSS variable injection into chart options at render time.

---

## Q8: How to handle large dataset processing in the browser?

**Status:** Resolved  
**Decision:** Use Web Workers for any data processing > 5K rows. Virtualized tables for rendering > 100 rows. Server-side aggregation for > 10K rows. For > 100K rows, require server-side computed aggregations with pagination.

---

## Q9: Persian font choice?

**Status:** Resolved  
**Decision:** Vazirmatn. It is SIL Open Font License, web-compatible, and the gold standard for Persian web typography. Loaded via CDN with fallback to system fonts.

---

## Q10: How should versioning work for KPI definitions?

**Status:** Resolved  
**Decision:** Each KPI definition gets a version number. When formula, target, or thresholds change, a new version is created (not overwritten). Historical KPI values remain tied to the version active at calculation time. Version history is browsable via UI.

---

## Q11: How to handle the Spec Kit requirement without the actual GitHub Spec Kit tool?

**Status:** Resolved  
**Decision:** Implement the Spec Kit cycle as a documentation-driven workflow:
1. `constitution.md` — written (DONE)
2. `specify.md` — written (DONE)
3. `clarify.md` — this file
4. `plan.md` — next step
5. `tasks/` — task breakdown
6. `implement/` — design per feature
7. `converge/` — convergence checklist per feature

Each feature goes through: Specify → Plan → Tasks → Implement → Converge.

---

## Q12: Should the platform support both Gregorian and Jalali calendars simultaneously?

**Status:** Resolved  
**Decision:** Yes. Time dimensions support both. All internal storage is Unix timestamp (UTC). Display layer converts based on user locale. Date dimensions are pre-computed for both calendars.

---

## Q13: What is the scope of Phase 0 deliverable?

**Status:** Resolved  
**Decision:** Phase 0 produces:
- Git repo initialized
- Spec Kit constitution, specify, clarify, ADR, threat model, data model
- Package.json with tooling scaffold
- TypeScript workspace with shared types skeleton
- CI pipeline skeleton
- No feature code until Phase 1

---

## Open Questions (Deferred to Later Phases)

None at this time.
