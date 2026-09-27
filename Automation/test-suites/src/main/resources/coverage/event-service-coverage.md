# event-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `events.donations.create` | `donations/donations_positive.feature` | Y | - | Y | Y | Y |
| `events.donations.list` | `donations/donations_positive.feature` | Y | - | Y | Y | Y |
| `events.budgets.create` | `donations/donations_positive.feature` | Y | - | Y | Y | Y |
| `events.budgets.list` | `donations/donations_positive.feature` | Y | - | Y | Y | Y |
| `events.create` | `events/events_positive.feature` | Y | - | Y | Y | Y |
| `events.list-user` | `events/events_positive.feature` | Y | - | Y | Y | Y |
| `events.by-id` | `events/events_positive.feature` | Y | - | Y | Y | Y |
| `events.update` | `events/events_positive.feature` | Y | - | Y | Y | Y |
| `events.delete` | `events/events_positive.feature` | Y | - | Y | Y | Y |
| `events.summary` | `events/events_positive.feature` | Y | - | Y | Y | Y |
| `events.analytics` | `events/events_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 11**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 2/2 PASS | Known defect: POST /api/events returns 500; smokes use list/read |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
