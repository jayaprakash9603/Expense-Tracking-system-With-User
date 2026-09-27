# audit-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `audit.logs` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.types` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.admin-logs` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.admin-stats` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.admin-by-user` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.admin-by-entity` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.admin-reports` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.admin-generate-report` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.admin-report-by-id` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.admin-delete-report` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |
| `audit.admin-download-report` | `audit/audit_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 11**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 2/2 PASS | audit.logs + audit.types green; admin generate returns 404 |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
