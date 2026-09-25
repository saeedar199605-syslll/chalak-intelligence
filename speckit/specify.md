# Spec Kit: Specify Phase
# Project: Chalak Intelligence Platform
# Status: Phase 0 — Foundation

## Purpose

This document captures the functional and non-functional requirements as derived from the MASTER BUILD PROMPT. Each requirement must have acceptance criteria that are testable.

---

## Functional Requirements

### FR-01: Authentication
Users must authenticate via username/email + password. Login page must be premium iOS-inspired (minimal, elegant, responsive). Must support: show password, remember session, forgot password flow (architecture only — no email service required initially), session management, logout other sessions, rate limiting, brute-force protection, secure cookies, CSRF defense.

**Acceptance Criteria:**
- [ ] Login page loads in < 2s on 3G
- [ ] Password field has show/hide toggle
- [ ] Remember session creates persistent cookie with rotation
- [ ] Brute-force protection locks account after 5 failed attempts
- [ ] Cookies are Secure, HttpOnly, SameSite=Strict
- [ ] CSRF token enforced on all state-changing mutations

### FR-02: Data Import Center
Users can import data via: manual entry, paste from Excel, CSV, XLSX, JSON, REST API, webhook, URL source (when secure), scheduled API refresh.

**Acceptance Criteria:**
- [ ] CSV upload handles 500K rows in < 60s
- [ ] Column mapping preview shows before-and-after
- [ ] Type detection auto-detects date, number, string
- [ ] Validation catches mismatched types and missing required fields
- [ ] Data cleaning step shows preview before apply
- [ ] Duplicate detection flags potential duplicates
- [ ] Error review shows row-level errors with fixes
- [ ] No import enters production dataset without user confirmation

### FR-03: Semantic Data Model
A semantic layer between raw data and dashboards. Concepts: Dataset, Table, Field, Dimension, Measure, KPI, Relationship, Hierarchy, Time Dimension, Target, Business Glossary.

**Acceptance Criteria:**
- [ ] KPI definition is the single source of truth for both AI and Dashboard
- [ ] Relationships between tables are explicitly defined
- [ ] Hierarchies (e.g., Year → Quarter → Month → Day) are navigable
- [ ] Time dimensions support both Gregorian and Jalali calendars

### FR-04: KPI Engine
Each KPI has: Persian name, English name, unique code, description, business definition, formula, data source, owner, department, unit, frequency, aggregation method, dimensions, target, baseline, warning threshold, critical threshold, preferred direction (higher/lower/target-range), display unit, decimal precision, comparison period, effective date, tags, notes, interpretation guide, AI prompt context, active/inactive.

**Acceptance Criteria:**
- [ ] KPI definition is versioned with changelog
- [ ] Formula changes don't destroy historical data
- [ ] KPI values are traceable to raw data via lineage
- [ ] Thresholds auto-color KPI health status
- [ ] Each KPI renders an "Explain This Number" page

### FR-05: Formula Engine
Secure formula engine. No eval(). Simple syntax. Functions: SUM, AVG, COUNT, COUNT_DISTINCT, MIN, MAX, MEDIAN, PERCENTILE, STDDEV, VARIANCE, IF, CASE, DIVIDE, COALESCE, DATE_DIFF, PERIOD_CHANGE, YOY, MOM, QOQ, ROLLING_AVG, ROLLING_SUM, TARGET_GAP, TARGET_ACHIEVEMENT, WEIGHTED_AVG.

**Acceptance Criteria:**
- [ ] Formula Editor has autocomplete, syntax highlight, validation
- [ ] Formula Preview shows computed result on sample data
- [ ] Error Explanation is human-readable (not "error at position 5")
- [ ] Test against sample data returns expected value
- [ ] No eval() or Function constructor used anywhere

### FR-06: Momentum Engine
For any KPI at any time range (7D, 30D, 3M, 6M, 12M, 24M, Custom), compute momentum with explainable components. Three methods: Simple Momentum, Trend Momentum, Composite Momentum.

**Acceptance Criteria:**
- [ ] Simple momentum = period-over-period percentage change
- [ ] Trend momentum = linear regression slope
- [ ] Composite momentum = normalized combination of directional change, trend slope, acceleration, target-gap improvement, consistency, volatility penalty
- [ ] Output normalized to -100…0…+100
- [ ] Hover shows all components, weights, sample size, volatility, confidence
- [ ] For "lower-is-better" KPIs, direction auto-reverses
- [ ] For target-range KPIs, approaching target = improvement
- [ ] Status labels: Strongly Improving, Improving, Stable, Weakening, Deteriorating, Insufficient Data

### FR-07: Visualization Engine
Supports: KPI Card, Number Card, Line, Area, Bar, Stacked Bar, Column, Stacked Column, Combo Chart, Pie, Donut, Scatter, Bubble, Histogram, Box Plot, Heatmap, Calendar Heatmap, Treemap, Waterfall, Funnel, Radar, Gauge, Bullet Chart, KPI Target Chart, Control Chart, Pareto, Sankey, Cohort Heatmap, Distribution Plot, Timeline, Gantt, Matrix, Pivot Table, Sparkline, Trend Indicator, Momentum Chart.

**Acceptance Criteria:**
- [ ] All charts are theme-aware (light/dark/auto)
- [ ] All charts are RTL-aware
- [ ] ECharts used for advanced charts, theme variables for colors
- [ ] Charts support cross-filtering and drill-down
- [ ] Charts support tooltips, data labels, reference lines, goal lines, threshold zones

### FR-08: Dashboard Builder
Visual drag-and-drop dashboard builder. Widgets: KPI Card, Chart, Table, Matrix, Text, AI Analysis, Image, Filter, Slicer, Goal, Gauge, Annotation, Divider, Section, Tabs.

**Acceptance Criteria:**
- [ ] Drag from palette to canvas
- [ ] Move, resize, duplicate, hide, lock, delete widgets
- [ ] Copy/paste widget settings
- [ ] Responsive grid layout
- [ ] Widget settings: data source, metric, color, tooltip, custom filters
- [ ] Dashboard version history
- [ ] Full-screen presentation mode

### FR-09: AI Analytics Layer
For each KPI: "تحلیل شاخص" (Analyze), "چرا تغییر کرده؟" (Why Changed?), "تحلیل روند" (Trend Analysis), "تحلیل Momentum", "شناسیدن ناهنجاری" (Anomaly Detection), "مقایسه دوره‌ها" (Period Comparison), "پیشنهاد اقدام" (Action Suggestion), "تحلیل مدیرانه" (Executive Summary), "خلاصه برای مدیرعامل" (CEO Summary).

**Acceptance Criteria:**
- [ ] AI receives structured context (KPI definition, formula, values, targets, thresholds, momentum, variance, dimensions, filters, data quality, notes, annotations, related KPIs)
- [ ] AI responses use Iranian legal-style disclaimers: Observed Fact, Statistical Relationship, Hypothesis, Recommendation
- [ ] AI never attributes causation without evidence
- [ ] AI analysis is editable and approvable by user

### FR-10: HR Intelligence
Full HR analytics: Workforce, Turnover, Attendance, Recruitment, Performance, Learning, Talent, Engagement, Compensation.

**Acceptance Criteria:**
- [ ] All HR KPI formulas are documented and testable
- [ ] Turnover Rate formula is consistent across all filters
- [ ] Sensitive HR data uses strict permission controls
- [ ] HR data fields have classification (Public, Internal, Confidential, HR Restricted, Highly Restricted)

### FR-11: AI Analyst (Natural Language)
Users can ask in Persian: "چرا نرخ خروج نیروی انسانی در سه ماه اخیر زیاد شده؟"

**Acceptance Criteria:**
- [ ] AI generates a query plan
- [ ] AI extracts data from semantic layer (not arbitrary SQL)
- [ ] Results include data, period, filters, KPI, chart, explanation, caveats
- [ ] AI-generated SQL/formulas are validated before execution

### FR-12: Smart Alerts
Alert triggers: Target missed, Critical threshold, Sudden change, Momentum reversal, Anomaly, Missing data, Refresh failed, Data quality degradation.

**Acceptance Criteria:**
- [ ] Alerts appear in Notification Center
- [ ] Webhook architecture for external notifications
- [ ] Alerts are rule-based + statistical, not AI-guessed

### FR-13: Export
Outputs: CSV, XLSX, PNG Chart, Dashboard Image, Printable Report, PDF. (PowerPoint in roadmap.)

**Acceptance Criteria:**
- [ ] Export is permission-aware
- [ ] PDF export preserves layout
- [ ] PNG export renders charts at 2x resolution

### FR-14: Real-time Collaboration
Dashboard changes sync across users via Durable Objects + WebSocket Hibernation API.

**Acceptance Criteria:**
- [ ] Edit appears on collaborator's screen within 500ms
- [ ] Offline state is clearly indicated
- [ ] Sync resumes automatically after reconnection

### FR-15: Command Palette & Global Search
Cmd/Ctrl+K command palette. Global search across dashboards, KPIs, datasets, reports.

**Acceptance Criteria:**
- [ ] Search results are permission-aware
- [ ] Command palette supports fuzzy search
- [ ] Search returns results in < 200ms for 100K items

### FR-16: Personal Workspace
Each user has: Favorites, Saved Views, Personal Dashboards, Recent Items, Watchlist.

**Acceptance Criteria:**
- [ ] Watchlist shows current value, target, momentum, alert, last update
- [ ] Favorites persist across sessions
- [ ] Saved Views include filter state

---

## Non-Functional Requirements

### NFR-01: Cloudflare Compatibility
- Must run on Workers, Static Assets, D1, Durable Objects, R2, WebSockets
- No VPS, no Docker server, no external PostgreSQL
- Graceful degradation for paid-tier services

### NFR-02: Performance
- Initial load: < 1.5s on broadband, < 3s on 3G
- Dashboard load: < 2s for 10K row charts
- Filter response: < 300ms
- 500K row import: < 90s

### NFR-03: Security
- No secrets in Git
- API keys encrypted server-side via Cloudflare Secrets
- CSP, security headers
- Input validation, output encoding, parameterized DB queries
- XSS/CSRF protection
- Session rotation

### NFR-04: Type Safety
- End-to-end TypeScript
- Zod schemas for all API contracts
- Runtime validation at boundaries

### NFR-05: Accessibility
- WCAG 2.2 AA
- Keyboard navigation, visible focus, ARIA, reduced motion, screen reader labels, touch-friendly targets

### NFR-06: i18n/RTL
- Persian first, English secondary
- Vazirmatn font (SIL OFL 2.1)
- Gregorian/Jalali calendar
- Persian/English digit toggle
- Locale-aware formatting
