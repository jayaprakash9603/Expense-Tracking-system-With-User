# story-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `stories.create` | `stories/stories_positive.feature` | Y | - | Y | Y | Y |
| `stories.list` | `stories/stories_positive.feature` | Y | - | Y | Y | Y |
| `stories.by-id` | `stories/stories_positive.feature` | Y | - | Y | Y | Y |
| `stories.update` | `stories/stories_positive.feature` | Y | - | Y | Y | Y |
| `stories.delete` | `stories/stories_positive.feature` | Y | - | Y | Y | Y |
| `stories.admin-list` | `stories/stories_positive.feature` | Y | - | Y | Y | Y |
| `stories.admin-create` | `stories/stories_positive.feature` | Y | - | Y | Y | Y |
| `stories.admin-update` | `stories/stories_positive.feature` | Y | - | Y | Y | Y |
| `stories.admin-delete` | `stories/stories_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 9**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 2/2 PASS | Feature gated: stories endpoints return 404 |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
