# Spec Kit: Permission Matrix
# Project: Chalak Intelligence Platform

## Roles

| Role | Description |
|------|-------------|
| Super Admin | Full system access. Can manage users, roles, all settings, all data. |
| Admin | Company-level admin. Manages users, roles (except Super Admin), org structure, datasets, KPIs, dashboards, AI config, themes, audit, backup. |
| Executive | Read-only access to all dashboards, KPIs, reports, alerts. Executive mode. Cannot edit definitions. |
| HR Manager | Full access to HR KPIs, workforce, attendance, turnover, etc. Can edit HR analyses. Cannot see Finance/production KPIs. |
| Department Manager | Read/write access to department-scoped KPIs and dashboards. Can edit analyses for their scope. |
| Analyst | Can create/edit dashboards, define KPIs (within scope), write/run analyses. Cannot manage users or system config. |
| Data Steward | Manages datasets, imports, transformations, data quality. Cannot edit KPI definitions or dashboards. |
| Editor | Can edit dashboards and analyses within scope. Cannot create KPIs or manage data. |
| Viewer | Read-only access to assigned dashboards and KPIs. |

## Permissions

| Permission ID | Name | Scope | Description |
|---------------|------|-------|-------------|
| auth.login | Login | global | Can authenticate |
| auth.logout | Logout | global | Can terminate session |
| users.manage | Manage Users | org | Create, edit, deactivate users |
| users.view | View Users | org | List and view users |
| roles.manage | Manage Roles | org | Create, edit, delete custom roles |
| roles.assign | Assign Roles | org | Assign roles to users |
| org.manage | Manage Org | org | Manage organization structure |
| datasets.create | Create Dataset | org | Create new datasets |
| datasets.edit | Edit Dataset | dataset | Edit dataset schema and config |
| datasets.delete | Delete Dataset | dataset | Delete datasets |
| datasets.import | Import Data | dataset | Upload and import data |
| datasets.export | Export Data | dataset | Export dataset contents |
| kpis.create | Create KPI | org | Create new KPI definitions |
| kpis.edit | Edit KPI | kpi | Edit KPI definitions |
| kpis.delete | Delete KPI | kpi | Delete KPIs |
| kpis.view | View KPI | kpi | View KPI values and details |
| kpis.target | Set Target | kpi | Set and edit KPI targets |
| dashboards.create | Create Dashboard | org | Create dashboards |
| dashboards.edit | Edit Dashboard | dashboard | Modify dashboard layout/widgets |
| dashboards.delete | Delete Dashboard | dashboard | Delete dashboards |
| dashboards.view | View Dashboard | dashboard | View dashboards |
| dashboards.share | Share Dashboard | dashboard | Share dashboards with others |
| dashboards.present | Present Fullscreen | dashboard | Full-screen presentation mode |
| analyses.create | Create Analysis | kpi | Create new analysis entries |
| analyses.edit | Edit Analysis | analysis | Edit analyses |
| analyses.approve | Approve Analysis | analysis | Approve AI-generated analyses |
| analyses.view | View Analysis | analysis | View analyses |
| ai.configure | Configure AI | org | Manage AI provider settings |
| ai.use | Use AI | org | Request AI analysis |
| settings.view | View Settings | org | View system settings |
| settings.edit | Edit Settings | org | Edit system settings |
| themes.manage | Manage Themes | org | Create and edit themes |
| audit.view | View Audit Log | org | Read audit log |
| audit.export | Export Audit Log | org | Export audit logs |
| backup.create | Create Backup | org | Take system backup |
| backup.restore | Restore Backup | org | Restore from backup |
| alerts.view | View Alerts | org | See alert notifications |
| alerts.manage | Manage Alerts | org | Configure alert rules |
| exports.generate | Generate Export | org | Export reports and data |
| data.import | Import Data | dataset | Import data into datasets |
| data.clean | Clean Data | dataset | Apply data cleaning transformations |
| data_quality.view | View Data Quality | dataset | View quality profiles |
| transformations.manage | Manage Transforms | dataset | Edit transformation pipelines |

## Role → Permission Mapping

| Role | Permissions |
|------|------------|
| Super Admin | ALL |
| Admin | All except `audit.view` is read-only; can manage all org-scope items |
| Executive | `auth.login`, `auth.logout`, `dashboards.view`, `dashboards.present`, `kpis.view`, `analyses.view`, `alerts.view`, `data_quality.view`, `exports.generate` |
| HR Manager | `auth.login`, `auth.logout`, `datasets.import`, `datasets.view`, `kpis.view`, `kpis.create` (HR scope), `kpis.edit` (HR scope), `kpis.target`, `dashboards.create`, `dashboards.edit`, `dashboards.view`, `dashboards.share`, `analyses.create`, `analyses.edit`, `analyses.approve`, `alerts.view`, `exports.generate` |
| Department Manager | Same as HR Manager but scoped to their department's data |
| Analyst | `auth.login`, `auth.logout`, `datasets.import`, `datasets.view`, `data_quality.view`, `kpis.view`, `kpis.create`, `kpis.edit`, `kpis.target`, `dashboards.create`, `dashboards.edit`, `dashboards.view`, `dashboards.share`, `analyses.create`, `analyses.edit`, `analyses.view`, `alerts.view`, `exports.generate` |
| Data Steward | `auth.login`, `auth.logout`, `datasets.create`, `datasets.edit`, `datasets.delete`, `datasets.import`, `datasets.export`, `data.clean`, `data_quality.view`, `transformations.manage`, `imports.manage` |
| Editor | `auth.login`, `auth.logout`, `dashboards.create`, `dashboards.edit`, `dashboards.view`, `analyses.create`, `analyses.edit`, `analyses.view`, `alerts.view` |
| Viewer | `auth.login`, `auth.logout`, `dashboards.view`, `kpis.view`, `analyses.view`, `alerts.view` |

## Scope-Based Access

Permissions can be scoped:
- `org` — entire organization
- `department` — specific department (e.g., HR, Production, Finance)
- `unit` — specific organizational unit
- `dataset` — specific dataset
- `kpi` — specific KPI
- `dashboard` — specific dashboard
- `analysis` — specific analysis entry

Example: An HR Manager has `kpis.view` scoped to department=HR. They can see HR KPIs but not Finance or Production KPIs.

## HR Data Access Control

| Data Classification | Allowed Roles |
|---------------------|---------------|
| Public | All authenticated users |
| Internal | Analyst, Editor, Department Manager, HR Manager, Admin, Super Admin |
| Confidential | Department Manager, HR Manager, Admin, Super Admin |
| HR Restricted | HR Manager, Admin, Super Admin |
| Highly Restricted | HR Manager, Admin, Super Admin (must also be explicitly granted) |

## Enforcement

ALL permissions are enforced server-side in the Worker. Frontend permission checks are for UX only (hiding menus, buttons). Any API call with insufficient permissions returns HTTP 403.
