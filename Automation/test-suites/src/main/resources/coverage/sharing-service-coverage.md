# sharing-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `shares.create` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |
| `shares.access` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |
| `shares.access-paginated` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |
| `shares.validate` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |
| `shares.revoke` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |
| `shares.my` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |
| `shares.shared-with-me` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |
| `shares.public` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |
| `shares.toggle-save` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |
| `shares.make-public` | `sharing/sharing_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 10**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 2/2 PASS | Feature gated: endpoints return 404 (shares unavailable) |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
