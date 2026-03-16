# Budget-Service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

## CRUD Endpoints

| Endpoint                           | Feature                                           | H   | V   | A   | N   | S   |
| ---------------------------------- | ------------------------------------------------- | --- | --- | --- | --- | --- |
| POST `/api/budgets`                | `crud/budget_crud_positive.feature`               | Y   | -   | -   | -   | Y   |
| GET `/api/budgets`                 | `crud/budget_crud_positive.feature`                | Y   | -   | -   | -   | Y   |
| GET `/api/budgets/{budgetId}`      | `crud/budget_crud_positive.feature`                | Y   | -   | -   | -   | Y   |
| PUT `/api/budgets/{budgetId}`      | `crud/budget_crud_positive.feature`                | Y   | -   | -   | -   | Y   |
| DELETE `/api/budgets/{budgetId}`   | `crud/budget_crud_positive.feature`                | Y   | -   | -   | -   | -   |
| DELETE `/api/budgets`              | `crud/budget_crud_positive.feature`                | Y   | -   | -   | -   | -   |

## Reporting Endpoints

| Endpoint                                              | Feature                                              | H   | V   | A   | N   | S   |
| ----------------------------------------------------- | ---------------------------------------------------- | --- | --- | --- | --- | --- |
| GET `/api/budgets/report/{budgetId}`                  | `reporting/budget_reporting_positive.feature`         | Y   | -   | -   | -   | Y   |
| GET `/api/budgets/reports`                            | `reporting/budget_reporting_positive.feature`         | Y   | -   | -   | -   | Y   |
| GET `/api/budgets/detailed-report/{budgetId}`         | `reporting/budget_reporting_positive.feature`         | Y   | -   | -   | -   | Y   |
| GET `/api/budgets/all-with-expenses/detailed/filtered`| `reporting/budget_reporting_positive.feature`         | Y   | -   | -   | -   | Y   |

## Query/Lookup Endpoints

| Endpoint                              | Feature                                       | H   | V   | A   | N   | S   |
| ------------------------------------- | --------------------------------------------- | --- | --- | --- | --- | --- |
| GET `/api/budgets/{budgetId}/expenses`| `query/budget_query_positive.feature`         | Y   | -   | -   | -   | Y   |
| GET `/api/budgets/filter-by-date`     | `query/budget_query_positive.feature`         | Y   | -   | -   | -   | Y   |
| GET `/api/budgets/expenses`           | `query/budget_query_positive.feature`         | Y   | -   | -   | -   | Y   |
| GET `/api/budgets/search`             | `query/budget_query_positive.feature`         | Y   | -   | -   | -   | Y   |

## Internal Technical Endpoints

| Endpoint                      | Feature                                          | H   | V   | A   | N   | S   |
| ----------------------------- | ------------------------------------------------ | --- | --- | --- | --- | --- |
| GET `/api/budgets/get-by-id`  | `internal/budget_internal_positive.feature`      | Y   | -   | -   | -   | Y   |
| POST `/api/budgets/save`      | `internal/budget_internal_positive.feature`      | Y   | -   | -   | -   | Y   |
| GET `/api/budgets/user`       | `internal/budget_internal_positive.feature`      | Y   | -   | -   | -   | Y   |

**Total: 17 endpoints | 17 positive scenarios | 0 negative (positive-only scope)**

All feature files use existing `GenericApiSteps` only — no new step definitions required.
