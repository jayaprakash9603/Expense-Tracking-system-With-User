# payment-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `payments.create` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.list` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.by-id` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.by-name` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.by-name-and-type` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.update` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.delete` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.delete-all` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.unused` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.search` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |
| `payments.names` | `payment-methods/payment-methods_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 11**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 3/3 PASS | List/create/update smokes green |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
