# search-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `search.universal` | `search/search_positive.feature` | Y | - | Y | Y | Y |
| `shortcuts.list` | `search/search_positive.feature` | Y | - | Y | Y | Y |
| `shortcuts.create` | `search/search_positive.feature` | Y | - | Y | Y | Y |
| `shortcuts.delete` | `search/search_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 4**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 2/2 PASS | shortcuts.update + shortcuts.list green |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
