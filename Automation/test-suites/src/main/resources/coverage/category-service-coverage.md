# category-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `categories.create` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.list` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.by-id` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.by-name` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.update` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.delete` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.delete-all` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.bulk-create` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.bulk-update` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.bulk-delete` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.uncategorized` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.expenses` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.filtered-expenses` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |
| `categories.search` | `categories/categories_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 14**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 4/4 PASS | ApiResponse wrapper; rules use data.id paths |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
