# Demo fixtures

## `Demo_Data.xlsx`

Authoring workbook for demo seed data. Regenerate [`seed.entities.json`](./seed.entities.json) with `bun run demo:seed:from-xlsx` after editing the workbook. Create or overwrite the workbook from built-in generators with `bun run demo:seed:write-xlsx` (writes both the `.xlsx` and `seed.entities.json`).

| Sheet | Columns | Notes |
| ----- | ------- | ----- |
| Categories | id, name, color, type | type: NEED or WANT |
| PaymentMethods | id, name, type | e.g. CARD, BANK, CASH |
| Budgets | id, name, amount, period, startDateOffsetDays, endDateOffsetDays, description, categoryIds, comments, spent | endDateOffsetDays empty = open-ended; categoryIds comma-separated category id; spent optional (recomputed on export) |
| Bills | id, name, amount, dueInDays, status, category, notes, comments, budgetId | Workbook includes both **notes** and **comments** (same text). budgetId optional FK to Budgets.id; dueInDays relative to export “today” in app hydration. Seed JSON includes `description` for the bill form. |
| Expenses | id, name, amount, dateOffsetDays, categoryId, paymentMethod, type, budgetIds, notes, comments | Both `notes` and `comments` columns appear in the workbook; on import, either populates the app `comments` field. budgetIds comma-separated; type NEED, WANT, or gain; isRecurring optional. After editing, run `npm run demo:seed:from-xlsx` and reload the app. |
| Friends | id, friendUserId, displayName, email, status | |
| Groups | id, name, description, memberCount | memberCount numeric |
| FriendRequests | id, senderId, senderName, senderEmail, status | |

Stable string IDs (e.g. `demo-cat-1`, `demo-bud-1`) are used as foreign keys across sheets.

## `seed.entities.json`

Session-store seed for demo mode (`expenses`, `budgets`, `bills`, `categories`, `friends`, `friendRequests`, `userSettings`, `nextId`). Use offset fields so dates stay relative to **today** (local calendar):

| Field | Result |
|-------|--------|
| `dateOffsetDays` | `date` as `YYYY-MM-DD` |
| `dueInDays` / `dueDateOffsetDays` | `dueDate` |
| `startDateOffsetDays` / `endDateOffsetDays` | `startDate` / `endDate` |
| `createdAtOffsetDays` / `updatedAtOffsetDays` | ISO timestamps |

Hydration runs in [`../seed/hydrateRelativeDates.js`](../seed/hydrateRelativeDates.js) via [`../store/loadDemoSeedFromFixtures.js`](../store/loadDemoSeedFromFixtures.js).

## `overrides/*.json`

Optional per-route JSON merged after the Postman manifest match. Filename = sanitized manifest `id` (e.g. `GET__api_admin_users` for `GET:/api/admin/users`). Regenerate the manifest with `bun run extract:postman` after Postman changes.

## Postman mapping

The route list is generated from the repo [`expense-tracking-backend/postman-collection.json`](../../../../../expense-tracking-backend/postman-collection.json) into [`../generated/postmanRoutes.manifest.json`](../generated/postmanRoutes.manifest.json). Section slugs in the manifest (e.g. `09-expenses`) mirror Postman folder names for optional extra fixture files per area.
