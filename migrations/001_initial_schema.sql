-- ========================================
-- Migration: 001_initial_schema
-- Description: Initial database schema for Chalak Intelligence Platform
-- ========================================

CREATE TABLE users (
    id           TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
    email        TEXT UNIQUE NOT NULL,
    username     TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name    TEXT,
    locale       TEXT DEFAULT 'fa',
    digit_mode   TEXT DEFAULT 'persian',
    timezone     TEXT DEFAULT 'Asia/Tehran',
    is_active    INTEGER DEFAULT 1,
    created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at   INTEGER NOT NULL DEFAULT (unixepoch()),
    last_login   INTEGER
);

CREATE TABLE roles (
    id           TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
    name         TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    is_system    INTEGER DEFAULT 0,
    created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE user_roles (
    user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id  TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope    TEXT,
    scope_id TEXT,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE permissions (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    scope      TEXT NOT NULL
);

CREATE TABLE role_permissions (
    role_id       TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE org_units (
    id         TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
    name       TEXT NOT NULL,
    code       TEXT UNIQUE,
    parent_id  TEXT REFERENCES org_units(id),
    path       TEXT NOT NULL,
    level      INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE users_org_units (
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_unit_id  TEXT NOT NULL REFERENCES org_units(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, org_unit_id)
);

-- ========================================
-- Seed: System roles
-- ========================================

INSERT INTO roles (name, display_name, is_system) VALUES
    ('super_admin', 'Super Admin', 1),
    ('admin', 'Admin', 1),
    ('executive', 'Executive', 1),
    ('hr_manager', 'HR Manager', 1),
    ('department_manager', 'Department Manager', 1),
    ('analyst', 'Analyst', 1),
    ('data_steward', 'Data Steward', 1),
    ('editor', 'Editor', 1),
    ('viewer', 'Viewer', 1);

-- ========================================
-- Seed: Core permissions
-- ========================================

INSERT INTO permissions (id, name, scope) VALUES
    ('auth.login', 'Login', 'global'),
    ('auth.logout', 'Logout', 'global'),
    ('users.manage', 'Manage Users', 'org'),
    ('users.view', 'View Users', 'org'),
    ('roles.manage', 'Manage Roles', 'org'),
    ('roles.assign', 'Assign Roles', 'org'),
    ('org.manage', 'Manage Org', 'org'),
    ('datasets.create', 'Create Dataset', 'org'),
    ('datasets.edit', 'Edit Dataset', 'dataset'),
    ('datasets.delete', 'Delete Dataset', 'dataset'),
    ('datasets.import', 'Import Data', 'dataset'),
    ('datasets.export', 'Export Data', 'dataset'),
    ('kpis.create', 'Create KPI', 'org'),
    ('kpis.edit', 'Edit KPI', 'kpi'),
    ('kpis.delete', 'Delete KPI', 'kpi'),
    ('kpis.view', 'View KPI', 'kpi'),
    ('kpis.target', 'Set Target', 'kpi'),
    ('dashboards.create', 'Create Dashboard', 'org'),
    ('dashboards.edit', 'Edit Dashboard', 'dashboard'),
    ('dashboards.delete', 'Delete Dashboard', 'dashboard'),
    ('dashboards.view', 'View Dashboard', 'dashboard'),
    ('dashboards.share', 'Share Dashboard', 'dashboard'),
    ('dashboards.present', 'Present Fullscreen', 'dashboard'),
    ('analyses.create', 'Create Analysis', 'kpi'),
    ('analyses.edit', 'Edit Analysis', 'analysis'),
    ('analyses.approve', 'Approve Analysis', 'analysis'),
    ('analyses.view', 'View Analysis', 'analysis'),
    ('ai.configure', 'Configure AI', 'org'),
    ('ai.use', 'Use AI', 'org'),
    ('settings.view', 'View Settings', 'org'),
    ('settings.edit', 'Edit Settings', 'org'),
    ('themes.manage', 'Manage Themes', 'org'),
    ('audit.view', 'View Audit Log', 'org'),
    ('audit.export', 'Export Audit Log', 'org'),
    ('backup.create', 'Create Backup', 'org'),
    ('backup.restore', 'Restore Backup', 'org'),
    ('alerts.view', 'View Alerts', 'org'),
    ('alerts.manage', 'Manage Alerts', 'org'),
    ('exports.generate', 'Generate Export', 'org');

-- ========================================
-- Seed: Super Admin permissions (all)
-- ========================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin';

-- ========================================
-- Tables: Login attempts, audit log, schema migrations
-- ========================================

CREATE TABLE login_attempts (
    key        TEXT PRIMARY KEY,
    count      INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);

CREATE TABLE audit_log (
    id           TEXT PRIMARY KEY DEFAULT (lower(hex(random(16)))),
    actor_id     TEXT REFERENCES users(id),
    action       TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id  TEXT,
    details      TEXT,
    ip_address   TEXT,
    user_agent   TEXT,
    created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE schema_migrations (
    version      TEXT PRIMARY KEY,
    applied_at   INTEGER NOT NULL DEFAULT (unixepoch()),
    applied_by   TEXT,
    checksum     TEXT
);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ========================================
-- Seed: Indexes
-- ========================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_org_units_parent ON org_units(parent_id);
CREATE INDEX idx_org_units_path ON org_units(path);
