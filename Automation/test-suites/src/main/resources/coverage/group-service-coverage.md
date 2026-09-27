# group-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `groups.create` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |
| `groups.list` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |
| `groups.by-id` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |
| `groups.update` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |
| `groups.delete` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |
| `groups.members` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |
| `groups.invite` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |
| `groups.search` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |
| `groups.settings.get` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |
| `groups.settings.update` | `groups/groups_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 10**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 2/2 PASS | Feature gated: endpoints return 404 (groups.list unavailable) |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
