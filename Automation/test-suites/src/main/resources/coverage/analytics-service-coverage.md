# analytics-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `analytics.overview` | `analytics/analytics_positive.feature` | Y | - | Y | Y | Y |
| `analytics.entity` | `analytics/analytics_positive.feature` | Y | - | Y | Y | Y |
| `analytics.report-excel` | `analytics/analytics_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 3**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 2/2 PASS | overview + entity analytics POST green |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
