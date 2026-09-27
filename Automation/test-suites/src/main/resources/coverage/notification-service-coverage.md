# notification-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `notifications.list` | `notifications/notifications_positive.feature` | Y | - | Y | Y | Y |
| `notifications.unread` | `notifications/notifications_positive.feature` | Y | - | Y | Y | Y |
| `notifications.mark-read` | `notifications/notifications_positive.feature` | Y | - | Y | Y | Y |
| `notifications.mark-all-read` | `notifications/notifications_positive.feature` | Y | - | Y | Y | Y |
| `notifications.delete` | `notifications/notifications_positive.feature` | Y | - | Y | Y | Y |
| `notifications.preferences` | `notifications/notifications_positive.feature` | Y | - | Y | Y | Y |
| `notifications.update-preferences` | `notifications/notifications_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 7**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 1/1 PASS | List notifications smoke green |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
