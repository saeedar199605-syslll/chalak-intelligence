# Spec Kit: Plan Phase
# Project: Chalak Intelligence Platform
# Status: Phase 0 — Foundation

---

## Architecture Overview

```
packages/
├── types/          # Shared TypeScript types + Zod schemas
├── functions/      # Cloudflare Workers (Hono API)
├── web/            # React frontend (Vite + Tailwind + ECharts)

migrations/          # SQL migration files (up.sql + down.sql)
speckit/             # Spec Kit documents
  ├── constitution.md
  ├── specify.md
  ├── clarify.md
  ├── adr.md
  ├── threat-model.md
  ├── data-model.md
  ├── plan.md (this file)
  ├── tasks/
  └── converge/

wrangler.toml          # Worker configuration
vite.config.ts          # Frontend config
tsconfig.json           # Root TypeScript config
package.json            # Root with workspaces
```

---

## Vertical Slice Phasing

### Phase 1: Foundation + Authentication + Design System
**Goal:** A working auth flow with a premium login page, shared types, design system, and CI pipeline.

Deliverables:
- Git repo with workspace scaffold
- Shared types package (`packages/types`) with Zod schemas for User, Auth, Session
- Hono Worker backend with auth endpoints (login, refresh, logout)
- scrypt-based password hashing
- JWT access + refresh token flow in Secure HttpOnly cookies
- React frontend with:
  - RTL layout with Vazirmatn font
  - Light/Dark/Auto theme
  - Design system: Button, Input, Card, Dialog, Skeleton, etc.
  - Login page (iOS-inspired, premium)
  - Layout: collapsible sidebar, top bar
- CI pipeline: typecheck, lint, test, build
- First user creation via CLI or admin bootstrap
- `npm run dev`, `npm run typecheck`, `npm run test`, `npm run build`

Acceptance:
- User can register (bootstrap), login, logout
- Login page is visually premium and RTL
- JWT tokens work correctly
- Theme switching works
- CI passes

### Phase 2: Data Import + Dataset Engine
**Goal:** Users can import data (CSV, paste, manual) and manage datasets.

Deliverables:
- Upload API endpoint with file validation
- CSV/XLSX parsing (PapaParse + SheetJS)
- Import wizard wizard steps: Upload → Preview → Column Mapping → Type Detection → Validation → Cleaning → Duplicate Detection → Error Review → Import
- Web Worker for large file processing
- Datasets table in D1
- Data cleaning transformations (rename, type change, trim, replace, split, merge, fill, dedupe, filter, sort, date conversion, Jalali support, mapping dictionary, group, normalize, outlier flag)
- Data quality profile (missing %, duplicate %, invalid %, outlier %, freshness, row count, unique count, min/max/avg, distribution)

Acceptance:
- CSV with 500K rows imports in < 90s
- Column mapping preview works
- Data quality profile generates correctly
- Demo data clearly labeled

### Phase 3: Semantic Model + KPI Engine
**Goal:** Users can define KPIs with full metadata, version them, and trace values to source data.

Deliverables:
- KPI definition form with all metadata fields
- Version history for KPI definitions
- KPI value computation engine
- KPI lineage: KPI → Measure → Fields → Dataset → Import
- Targets with versioning
- KPI Library, KPI Explorer, KPI Momentum views

Acceptance:
- KPI formula uses secure parser (not eval)
- KPI values are traceable to raw data
- Formula changes create new versions
- KPI health status (Healthy/Watch/Critical/No Data) works

### Phase 4: Visualization + Dashboard Builder
**Goal:** Users can build dashboards with drag-and-drop widgets using 40+ chart types.

Deliverables:
- Dashboard Builder with drag-and-drop
- Widget palette: KPI Card, Chart, Table, Matrix, Text, AI Analysis, Image, Filter, Slicer, Goal, Gauge, Annotation, Divider, Section, Tabs
- Responsive grid layout
- Widget settings panel
- ECharts integration with 40+ chart types
- Dashboard version history
- Full-screen presentation mode

Acceptance:
- Drag-drop widgets onto canvas
- Resize, move, duplicate, hide, lock, delete
- Charts render correctly in RTL
- Dashboards save and load
- Version history works

### Phase 5: Momentum Engine
**Goal:** For any KPI, compute explainable momentum with three methods.

Deliverables:
- Simple Momentum (period-over-period % change)
- Trend Momentum (linear regression slope)
- Composite Momentum (weighted combination of 6 components)
- Momentum visualization page with trend, target, rolling average, oscillator, acceleration, variance, confidence, events, AI interpretation
- Annotations on momentum timeline

Acceptance:
- All three methods produce correct results on test data
- Composite momentum output is explainable (hover shows all components)
- Direction auto-reverses for lower-is-better KPIs
- Target-range KPI momentum uses approaching-target = improvement

### Phase 6: HR Intelligence
**Goal:** Full HR analytics with all required KPIs.

Deliverables:
- HR KPI Library with documented formulas
- Workforce, Turnover, Attendance, Recruitment, Performance, Learning, Talent, Engagement, Compensation views
- Sensitive HR data with strict permissions
- HR-specific demo dataset

Acceptance:
- All required HR KPIs are implemented and tested
- Turnover Rate formula is consistent across filters
- HR data classification enforced

### Phase 7: AI Analytics Layer
**Goal:** Structure AI analysis with explainability and human-in-the-loop approval.

Deliverables:
- AI provider adapter system (OpenAI, Anthropic, Google, Workers AI, OpenRouter, OpenAI-compatible, custom)
- Per-KPI analysis buttons (تحلیل شاخص, چرا تغییر کرده؟, etc.)
- AI analysis panel with manual edit + approval workflow
- AI Analyst natural language query interface
- AI security: read-only, no mutation, prompt injection defense
- Analysis versioning and approval workflow

Acceptance:
- AI provider switching works (fallback)
- AI receives structured context (not arbitrary SQL)
- AI responses are clearly marked as hypothesis/recommendation
- AI analysis is editable and approvable
- Platform works without AI configured

### Phase 8: Advanced Analytics
**Goal:** Correlation, root-cause, anomaly detection, forecast, scenario analysis.

Deliverables:
- Correlation Explorer (scatter plot, correlation coefficient, lagged comparison)
- Root-Cause Explorer (contribution analysis)
- Anomaly Detection (IQR, Z-score, rolling deviation, seasonal comparison)
- Forecast (modular, with confidence intervals)
- What-if/Scenario Mode
- Smart Insights (rule-based + statistical before AI)

Acceptance:
- Correlations show causation disclaimer
- Anomalies are explainable (which algorithm, why flagged)
- Forecasts show method, horizon, confidence interval, assumptions

### Phase 9: Collaboration + Alerts + Reporting
**Goal:** Real-time collaboration, alerting, and report generation.

Deliverables:
- Real-time dashboard editing (Durable Objects + WebSocket)
- Alert engine with Notification Center + Webhooks
- Data Storytelling (executive summary format)
- Export (CSV, XLSX, PNG, Dashboard Image, PDF)
- Annotation engine with business context timeline

Acceptance:
- Collaborative edits sync in < 500ms
- Alerts trigger on all specified conditions
- Export preserves layout and respects permissions

### Phase 10: Hardening + Performance + Security
**Goal:** Production-grade hardening, performance optimization, security review.

Deliverables:
- Performance benchmarks at 1K, 10K, 100K, 500K rows
- Security review (dependency audit, OWASP ASVS check)
- Error logging with trace IDs
- Offline state handling
- Backup & Restore (with validation, preview, schema check)
- PWA readiness

### Phase 11: Cloudflare Production Release
**Goal:** Production deployment on Cloudflare.

Deliverables:
- `npm run deploy` deploys to Cloudflare
- D1 database, R2 bucket, Durable Object configured via wrangler
- CI/CD pipeline on GitHub Actions
- Secrets documentation
- First admin bootstrap
- Backup strategy documented

---

## Implementation Order

Within each phase, tasks follow this cycle:

1. **Specify** — detailed requirements for the feature
2. **Plan** — design doc with architecture
3. **Tasks** — individual implementation tasks
4. **Implement** — code
5. **Converge** — test, review, harden, document

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cloudflare API unreachable | Low | High | Use wrangler login; local dev with miniflare works offline |
| D1 Free Tier limits exceeded | Medium | Medium | Pagination + aggregation; graceful degradation |
| ECharts RTL quirks | Medium | Low | Test all chart types with RTL config; fallback to LTR for problematic charts |
| Web Worker in Workers environment | Low | Low | Workers have no DOM; processing done in Worker, not browser |

---

## Tooling Stack (locked versions)

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.0.0 | Frontend framework |
| react-dom | 19.0.0 | DOM rendering |
| typescript | 5.9.x | Type checking |
| vite | 6.3.x | Build tool |
| tailwindcss | 4.0.x | Styling |
| hono | 4.13.7 | Worker framework |
| zod | 4.5.4 | Schema validation |
| @cloudflare/workers-types | latest | Worker types |
| @cloudflare/d1 | latest | D1 binding |
| echarts | 5.6.x | Visualization |
| react-echarts | 6.1.x | React ECharts wrapper |
| papa | 5.5.x | CSV parsing |
| xlsx | 0.18.x | XLSX parsing |
| @tanstack/react-table | 8.20.x | Data grid |
| @tanstack/react-query | 5.80.x | Data fetching |
| vitest | 4.0.x | Testing |
| eslint | 9.39.x | Linting |
| prettier | 3.7.x | Formatting |
