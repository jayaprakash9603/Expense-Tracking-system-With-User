# friendship-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `friendships.request` | `friendships/friendships_positive.feature` | Y | - | Y | Y | Y |
| `friendships.respond` | `friendships/friendships_positive.feature` | Y | - | Y | Y | Y |
| `friendships.by-id` | `friendships/friendships_positive.feature` | Y | - | Y | Y | Y |
| `friendships.friends` | `friendships/friendships_positive.feature` | Y | - | Y | Y | Y |
| `friendships.pending` | `friendships/friendships_positive.feature` | Y | - | Y | Y | Y |
| `friendships.stats` | `friendships/friendships_positive.feature` | Y | - | Y | Y | Y |
| `friendships.search` | `friendships/friendships_positive.feature` | Y | - | Y | Y | Y |
| `friendships.remove` | `friendships/friendships_positive.feature` | Y | - | Y | Y | Y |
| `friendships.block` | `friendships/friendships_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 9**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 2/2 PASS | Feature gated: endpoints return 404 (friends.list unavailable) |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
