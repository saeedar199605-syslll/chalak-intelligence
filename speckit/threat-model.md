# Security Threat Model
# Project: Chalak Intelligence Platform
# Methodology: STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)

---

## Trust Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Frontend)                 │
│  React SPA — untrusted client environment              │
├──────────────────────┬──────────────────────────────────┤
│  Cloudflare Worker   │  Auth boundary — JWT in cookie   │
│  (Hono API)          │  All mutations require auth      │
├──────────────────────┴──────────────────────────────────┤
│  D1 Database        │  SQL injection surface            │
│  R2 Object Storage  │  File upload/download surface    │
│  Durable Objects     │  WebSocket message surface       │
└─────────────────────────────────────────────────────────┘
```

---

## Assets

| Asset | Classification | Protection |
|-------|---------------|------------|
| User credentials (password hash) | Highly Restricted | scrypt + salt, rate-limited login |
| Session tokens | Confidential | HttpOnly, Secure, SameSite cookies |
| AI API keys | Highly Restricted | Encrypted at rest, Cloudflare Secrets master key, never sent to client |
| HR data | HR Restricted | Row-level security, field-level redaction |
| KPI definitions | Internal | Versioned audit trail |
| Dashboards | Internal/Confidential | RBAC per scope |
| Audit logs | Highly Restricted | Immutable, append-only |

---

## Threats (STRIDE)

### T1: Spoofed Identity (S)
| # | Threat | Mitigation |
|---|--------|-----------|
| S1 | Password guessing / brute force | Rate limiting (5 attempts → lockout), account cooldown |
| S2 | Session hijacking | Secure HttpOnly SameSite cookies, short-lived JWT (15min), CSRF tokens |
| S3 | Token replay | JWT has iat + exp, access tokens rotated on refresh |
| S4 | Impersonation via stolen session | Logout other sessions feature, session list in UI |

### T2: Tampering (T)
| # | Threat | Mitigation |
|---|--------|-----------|
| T1 | Tampered formula | Server-side validation of all formula AST, checksum |
| T2 | Malicious data import | File validation (MIME type, size limit), CSV injection protection, sanitization |
| T3 | Dashboard configuration tampering | All dashboard writes go through authenticated API, RBAC enforced server-side |
| T4 | CSRF on state changes | CSRF token + SameSite=Strict cookies |

### T3: Repudiation (R)
| # | Threat | Mitigation |
|---|--------|-----------|
| R1 | User denies deleting data | Immutable audit log of all data mutations |
| R2 | User denies AI config changes | Audit log: before + after values |
| R3 | AI makes unauthorized changes | AI is read-only, no mutation rights |

### T4: Information Disclosure (I)
| # | Threat | Mitigation |
|---|--------|-----------|
| I1 | Frontend permission hiding only | ALL permissions enforced server-side in Worker |
| I2 | HR data exposed to unauthorized | Row-level security in D1, field redaction in API |
| I3 | AI prompt injection from data | Data is sanitized before being included in prompts, structured context injection |
| I4 | AI API key leak | Keys stored encrypted, never in response payloads |
| I5 | Dataset export bypass | Export checks same permissions as view |

### T5: Denial of Service (D)
| # | Threat | Mitigation |
|---|--------|-----------|
| D1 | Large file upload crash | 50MB max upload size, streamed processing |
| D2 | D1 query timeout | Query result limits (10K rows), pagination |
| D3 | AI provider rate limit | Internal rate limiting + fallback provider |
| D4 | WebSocket flood | Rate limiting per connection, message size cap |

### T6: Elevation of Privilege (E)
| # | Threat | Mitigation |
|---|--------|-----------|
| E1 | Viewer accesses editor features | Server-side permission check on every mutation |
| E2 | Analyst edits KPI formula | RBAC: only Editor/Admin can edit KPI definitions |
| E3 | User escalates to Admin | Role changes require Super Admin approval, audit logged |

---

## Attack Surfaces

### Surface 1: Authentication API
- Endpoints: POST `/auth/login`, POST `/auth/refresh`, POST `/auth/logout`
- Controls: Rate limiting, CAPTCHA after 3 failures, account lockout
- Logging: All attempts logged with IP, timestamp, user agent

### Surface 2: Data Import API
- Endpoints: POST `/datasets/{id}/import`, POST `/uploads`
- Controls: File type whitelist, MIME validation, size limit (50MB), content scanning
- Logging: Import job tracked with status, user, row counts

### Surface 3: KPI Definition API
- Endpoints: POST/PUT/DELETE `/kpis`
- Controls: RBAC (Editor+), formula validation, version history
- Logging: Every change creates a new version with who/when/what

### Surface 4: Dashboard Builder API
- Endpoints: POST/PUT/DELETE `/dashboards`
- Controls: RBAC (Editor+), real-time conflict detection
- Logging: All layout changes versioned

### Surface 5: AI Analysis API
- Endpoints: POST `/ai/analyze`
- Controls: Read-only context, no data mutation rights, prompt injection defense
- Logging: Context hash, provider used, response stored with version

### Surface 6: WebSocket Real-time API
- Endpoints: WS `/ws`
- Controls: Auth via query token (validated once), message rate limiting
- Logging: Connection events, message counts

---

## Security Controls Summary

1. **Input validation** — Zod schemas on all API inputs
2. **Output encoding** — React auto-escaping, D1 parameterized queries
3. **Parameterized database access** — all queries use prepared statements
4. **XSS protection** — React's built-in escaping + CSP headers
5. **CSRF protection** — SameSite=Strict cookies + CSRF tokens
6. **Secure cookies** — HttpOnly, Secure, SameSite
7. **Session rotation** — JWT rotated every 15min, refresh every 7 days
8. **Rate limiting** — Per IP + per user, configurable per endpoint
9. **Login lockout/throttling** — 5 failures → 15min lockout
10. **Server-side permission enforcement** — Never rely on frontend hiding
11. **File validation** — MIME type, extension, size, content scanning
12. **MIME validation** — Strict allowlist for uploads
13. **Import size limits** — 50MB hard limit
14. **Audit logging** — Immutable append-only log for critical operations
15. **Secret isolation** — Cloudflare Secrets for master keys, encrypted storage for provider keys
16. **Security headers** — CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
17. **No dangerous eval** — Custom formula parser, no eval()/Function()
18. **Dependency security review** — Weekly `npm audit`, automated in CI

---

## Compliance Mapping

| Requirement # | Standard |
|--------------|----------|
| Privacy by Design (#15) | GDPR Article 25 |
| Auditability (#12) | SOC 2, ISO 27001 |
| No Fake Data (#3) | Data Governance |
| Security First (#1) | OWASP ASVS |
| No eval (#17 Formula Engine) | CWE-95 |
| Secure cookies | OWASP Session Management |
| Input validation | OWASP Input Validation |
| Rate limiting | OWASP Authentication |
