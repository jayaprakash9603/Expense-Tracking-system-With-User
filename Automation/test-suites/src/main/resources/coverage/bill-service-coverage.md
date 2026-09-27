# bill-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `bills.create` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.list` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.by-id` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.update` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.delete` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.delete-all` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.by-expense` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.items` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.search` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.export-excel` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.import-excel` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.import-excel-save` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.scan-receipt` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.ocr-status` | `bills/bills_positive.feature` | Y | - | Y | Y | Y |
| `bills.bulk-add` | `bulk/bulk_positive.feature` | Y | - | Y | Y | Y |
| `bills.bulk-add-tracked` | `bulk/bulk_positive.feature` | Y | - | Y | Y | Y |
| `bills.bulk-progress` | `bulk/bulk_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 17**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 3/3 PASS | paymentMethod must be lowercase cash |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
