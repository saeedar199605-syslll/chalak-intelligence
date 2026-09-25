# Data Model Specification
# Project: Chalak Intelligence Platform

## Overview

The data model is designed to store:
1. **Application configuration** — users, roles, permissions, settings, themes
2. **Data definitions** — datasets, tables, fields, relationships, transformations
3. **Semantic model** — dimensions, measures, KPIs, hierarchies, targets
4. **Dashboards** — layouts, widgets, version history
5. **Analytics artifacts** — manual analyses, AI analyses, approvals
6. **Operational data** — audit log, alerts, imports, exports

Raw data files (CSV, XLSX, JSON) are stored in **R2** with metadata in **D1**. Large datasets use external table pattern: D1 stores schema + references, R2 stores the data.

---

## Entity-Relationship Diagram (Logical)

```
┌──────────┐      ┌─────────┐      ┌───────┐
│  users   │      │  roles  │      │  org  │
└────┬─────┘      └────┬────┘      └────┬────┘
     │ role_id        │               │
     ▼                ▼               ▼
  user_roles ──── role_permissions    org_units
                                        │
                                        ▼
                                 org_unit_assignments

┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐
│datasets  │  │dataset_cols│  │transform_pipelines│  │data_imports│
└────┬─────┘  └────┬─────┘  └──────┬───────┘  └────┬─────┘
     │            │               │                │
     ▼            ▼               ▼                ▼
   dataset_field_mappings │  raw_data_files (R2) │  import_jobs

┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐
│measures  │  │ dimensions│  │relationships│  │hierarchies│
└────┬─────┘  └────┬─────┘  └──────┬───────┘  └────┬─────┘
     │            │               │                │
     ▼            ▼               ▼                ▼
  kpis ────────── semantic_model

┌──────────┐  ┌──────────┐  ┌─────────────┐
│dashboards│  │dashboard_widgets│ │dashboard_versions│
└────┬─────┘  └────┬─────┘  └──────┬───────┘
     │            │               │
     ▼            ▼               ▼
  dashboard_shares │  widget_configs
```

---

## Table Definitions

### auth.users
```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  locale        TEXT DEFAULT 'fa',
  digit_mode    TEXT DEFAULT 'persian',
  timezone      TEXT DEFAULT 'Asia/Tehran',
  is_active     INTEGER DEFAULT 1,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login    INTEGER
)
```

### auth.roles
```sql
CREATE TABLE roles (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  name          TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  is_system     INTEGER DEFAULT 0,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  scope   TEXT,
  scope_id TEXT,
  PRIMARY KEY (user_id, role_id)
)
```

### auth.permissions
```sql
CREATE TABLE permissions (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  scope   TEXT NOT NULL
)

CREATE TABLE role_permissions (
  role_id       TEXT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
)
```

### organization
```sql
CREATE TABLE org_units (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  name        TEXT NOT NULL,
  code        TEXT UNIQUE,
  parent_id   TEXT REFERENCES org_units(id),
  path        TEXT NOT NULL,
  level       INTEGER,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE users_org_units (
  user_id  TEXT REFERENCES users(id) ON DELETE CASCADE,
  org_unit_id TEXT REFERENCES org_units(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, org_unit_id)
)
```

### data.datasets
```sql
CREATE TABLE datasets (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  name            TEXT NOT NULL,
  description     TEXT,
  owner_id        TEXT NOT NULL REFERENCES users(id),
  org_unit_id     TEXT REFERENCES org_units(id),
  storage_type    TEXT NOT NULL, -- 'd1_inline', 'r2_csv', 'r2_parquet', 'api'
  r2_bucket       TEXT,
  r2_key          TEXT,
  d1_table_name   TEXT,
  row_count       INTEGER DEFAULT 0,
  is_demo         INTEGER DEFAULT 0,
  is_active       INTEGER DEFAULT 1,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE dataset_columns (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  dataset_id      TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  display_name    TEXT,
  data_type       TEXT NOT NULL, -- 'string', 'number', 'date', 'boolean', 'currency'
  is_dimension    INTEGER DEFAULT 0,
  is_measure      INTEGER DEFAULT 0,
  is_key          INTEGER DEFAULT 0,
  is_nullable     INTEGER DEFAULT 1,
  format_pattern  TEXT,
  ordinal         INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### data.transforms
```sql
CREATE TABLE transform_pipelines (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  dataset_id      TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  steps           TEXT NOT NULL, -- JSON array of transformation steps
  is_active       INTEGER DEFAULT 1,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### data.imports
```sql
CREATE TABLE import_jobs (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  dataset_id      TEXT NOT NULL REFERENCES datasets(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  source_type     TEXT NOT NULL, -- 'csv', 'xlsx', 'json', 'api', 'manual', 'paste'
  source_uri      TEXT,
  status          TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  row_count       INTEGER DEFAULT 0,
  error_count     INTEGER DEFAULT 0,
  error_details   TEXT,
  r2_key          TEXT,
  started_at      INTEGER,
  completed_at    INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### semantic.kpis
```sql
CREATE TABLE kpi_definitions (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  code                TEXT UNIQUE NOT NULL,
  name_fa             TEXT NOT NULL,
  name_en             TEXT,
  description         TEXT,
  business_definition TEXT,
  formula             TEXT NOT NULL,
  data_source_id      TEXT REFERENCES datasets(id),
  owner_id            TEXT REFERENCES users(id),
  department          TEXT,
  unit                TEXT,
  frequency           TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  aggregation_method  TEXT NOT NULL, -- 'sum', 'avg', 'count', 'custom'
  dimensions          TEXT, -- JSON array of dimension field IDs
  target_type         TEXT NOT NULL, -- 'single', 'threshold', 'range'
  target_value        REAL,
  target_min          REAL,
  target_max          REAL,
  baseline_value      REAL,
  warning_threshold   REAL,
  critical_threshold  REAL,
  preferred_direction TEXT NOT NULL, -- 'higher', 'lower', 'target_range'
  display_unit        TEXT,
  decimal_precision   INTEGER DEFAULT 2,
  comparison_period   TEXT NOT NULL, -- 'previous_period', 'same_period_last_year'
  effective_date      TEXT,
  tags                TEXT, -- JSON array
  notes               TEXT,
  interpretation_guide TEXT,
  ai_prompt_context   TEXT,
  version             INTEGER NOT NULL DEFAULT 1,
  is_active           INTEGER DEFAULT 1,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE kpi_versions (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  kpi_id              TEXT NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
  version             INTEGER NOT NULL,
  definition_snapshot TEXT NOT NULL, -- JSON snapshot of entire definition
  changed_by          TEXT NOT NULL REFERENCES users(id),
  change_reason       TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE kpi_targets (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  kpi_id          TEXT NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
  period          TEXT NOT NULL, -- '2024-01', '2024-W01', '2024-Q1'
  target_value    REAL,
  target_min      REAL,
  target_max      REAL,
  actual_value    REAL,
  confidence      REAL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### dashboards
```sql
CREATE TABLE dashboards (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
  name            TEXT NOT NULL,
  description     TEXT,
  slug            TEXT UNIQUE NOT NULL,
  owner_id        TEXT NOT NULL REFERENCES users(id),
  org_unit_id     TEXT REFERENCES org_units(id),
  layout_config   TEXT NOT NULL, -- JSON: grid columns, breakpoints
  theme_id        TEXT,
  is_template     INTEGER DEFAULT 0,
  is_shared       INTEGER DEFAULT 0,
  version         INTEGER NOT NULL DEFAULT 1,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE dashboard_versions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16))),
  dashboard_id    TEXT NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL,
  layout_json     TEXT NOT NULL,
  widgets_json    TEXT NOT NULL,
  created_by      TEXT NOT NULL REFERENCES users(id),
  change_reason   TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE dashboard_shares (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16))),
  dashboard_id    TEXT NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  shared_with     TEXT NOT NULL, -- user_id, role_id, or 'public'
  permission      TEXT NOT NULL, -- 'view', 'edit'
  expires_at      INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### analytics
```sql
CREATE TABLE analyses (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16))),
  kpi_id          TEXT NOT NULL REFERENCES kpi_definitions(id),
  author_id       TEXT NOT NULL REFERENCES users(id),
  period          TEXT NOT NULL,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL, -- JSON: structured analysis sections
  data_snapshot   TEXT, -- JSON: data snapshot at time of analysis
  status          TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'approved'
  ai_provider     TEXT,
  ai_model        TEXT,
  version         INTEGER NOT NULL DEFAULT 1,
  approved_by     TEXT REFERENCES users(id),
  approved_at     INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE analysis_versions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16))),
  analysis_id     TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL,
  content         TEXT NOT NULL,
  changed_by      TEXT NOT NULL REFERENCES users(id),
  change_reason   TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### alerts
```sql
CREATE TABLE alerts (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16))),
  kpi_id          TEXT REFERENCES kpi_definitions(id),
  org_unit_id     TEXT REFERENCES org_units(id),
  type            TEXT NOT NULL, -- 'target_missed', 'threshold', 'sudden_change', 'momentum_reversal', 'anomaly', 'missing_data', 'refresh_failed', 'data_quality'
  severity        TEXT NOT NULL, -- 'info', 'warning', 'critical'
  message_fa      TEXT NOT NULL,
  message_en      TEXT,
  is_read         INTEGER DEFAULT 0,
  is_acknowledged INTEGER DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE alert_subscriptions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16))),
  user_id         TEXT NOT NULL REFERENCES users(id),
  kpi_id          TEXT REFERENCES kpi_definitions(id),
  type            TEXT NOT NULL,
  channel         TEXT NOT NULL, -- 'in_app', 'email'
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### audit
```sql
CREATE TABLE audit_log (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16))),
  actor_id        TEXT REFERENCES users(id),
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     TEXT,
  details         TEXT, -- JSON
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### settings
```sql
CREATE TABLE settings (
  key             TEXT PRIMARY KEY,
  value           TEXT NOT NULL,
  type            TEXT NOT NULL, -- 'string', 'number', 'boolean', 'json'
  scope           TEXT NOT NULL, -- 'global', 'org', 'user'
  description     TEXT,
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
)

CREATE TABLE ai_providers (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16))),
  name            TEXT NOT NULL,
  provider_type   TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'workers_ai', 'openrouter', 'compatible', 'custom'
  base_url        TEXT,
  encrypted_key   TEXT NOT NULL, -- AES-256-GCM encrypted
  model           TEXT,
  api_format      TEXT, -- JSON template for request/response mapping
  timeout_ms      INTEGER DEFAULT 30000,
  max_tokens      INTEGER DEFAULT 4096,
  temperature     REAL DEFAULT 0.7,
  custom_headers  TEXT, -- JSON
  is_enabled      INTEGER DEFAULT 1,
  is_default      INTEGER DEFAULT 0,
  is_fallback     INTEGER DEFAULT 0,
  cost_per_1k     REAL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### themes
```sql
CREATE TABLE themes (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(random(16))),
  name            TEXT NOT NULL,
  is_system       INTEGER DEFAULT 0,
  is_active       INTEGER DEFAULT 0,
  config          TEXT NOT NULL, -- JSON: design tokens
  created_by      TEXT REFERENCES users(id),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
)
```

### metadata
```sql
CREATE TABLE schema_migrations (
  version         TEXT PRIMARY KEY,
  applied_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  applied_by      TEXT,
  checksum        TEXT
)
```

---

## Sample Dataset (Synthetic)

A synthetic dataset with 24 months of data for HR, Production, Maintenance, Quality, Finance must be created for demo purposes. All demo data is clearly labeled with `is_demo = 1` on the dataset level and "Demo Data / داده آزمایشی" badge in UI.

---

## Indexing Strategy

Critical indexes for query performance:
- `users(email)`
- `kpi_definitions(code)`
- `kpi_targets(kpi_id, period)`
- `dashboards(owner_id)`
- `analyses(kpi_id, created_at)`
- `audit_log(action, created_at)`
- `import_jobs(status, created_at)`
- `alerts(is_read, created_at)`

Full-text search for global search:
- `datasets(name)` — FTS5
- `kpi_definitions(name_fa, name_en, code)` — FTS5
- `dashboards(name)` — FTS5

---

## Migration Strategy

- All schema changes via SQL migration files in `/migrations/`
- Each migration has up.sql and down.sql
- Migration applied via CLI tool (`npm run migrate`)
- Seed data separate from migrations
- Rollback validated against backup
