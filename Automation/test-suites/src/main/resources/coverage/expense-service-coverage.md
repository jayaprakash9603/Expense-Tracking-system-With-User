# expense-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `bulk.expenses-budgets.create` | `bulk/bulk_positive.feature` | Y | - | Y | Y | Y |
| `bulk.expenses-budgets.tracked` | `bulk/bulk_positive.feature` | Y | - | Y | Y | Y |
| `bulk.expenses-budgets.progress` | `bulk/bulk_positive.feature` | Y | - | Y | Y | Y |
| `expenses.create` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.copy` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.list` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.paginated` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.by-id` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.detailed` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.update` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.delete` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.search` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.summary` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.payment-summary` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.monthly-summary` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.yearly-summary` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.bulk-add` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.bulk-add-tracked` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.bulk-progress` | `expenses/expenses_positive.feature` | Y | - | Y | Y | Y |
| `expenses.internal.by-id` | `internal/internal_positive.feature` | Y | - | Y | Y | Y |
| `expenses.internal.save` | `internal/internal_positive.feature` | Y | - | Y | Y | Y |
| `expenses.internal.search-fuzzy` | `internal/internal_positive.feature` | Y | - | Y | Y | Y |
| `settings.get` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `settings.update` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.filter` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.fuzzy-search` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.between-dates` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.top-n` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.today` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.current-month` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.last-month` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.cashflow` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.gain` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.loss` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.delete-all` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.edit-multiple` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.delete-multiple` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.generate-report` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.excel-report` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |
| `expenses.reports-history` | `settings/settings_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 40**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 3/3 PASS | Smoke CRUD/list flows green against monolith :8080 |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
