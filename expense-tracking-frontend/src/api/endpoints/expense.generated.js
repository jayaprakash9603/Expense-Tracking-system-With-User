/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "expense".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const EXPENSE_ENDPOINTS = {
  "bulk.expenses-budgets.create": { key: "bulk.expenses-budgets.create", service: "expense", method: "POST", path: "/api/bulk/expenses-budgets", auth: true },
  "bulk.expenses-budgets.progress": { key: "bulk.expenses-budgets.progress", service: "expense", method: "GET", path: "/api/bulk/expenses-budgets/progress/{jobId}", auth: true },
  "bulk.expenses-budgets.tracked": { key: "bulk.expenses-budgets.tracked", service: "expense", method: "POST", path: "/api/bulk/expenses-budgets/tracked", auth: true },
  "expenses.between-dates": { key: "expenses.between-dates", service: "expense", method: "GET", path: "/api/expenses/between-dates", auth: true },
  "expenses.bulk-add": { key: "expenses.bulk-add", service: "expense", method: "POST", path: "/api/expenses/add-multiple", auth: true },
  "expenses.bulk-add-tracked": { key: "expenses.bulk-add-tracked", service: "expense", method: "POST", path: "/api/expenses/add-multiple/tracked", auth: true },
  "expenses.bulk-progress": { key: "expenses.bulk-progress", service: "expense", method: "GET", path: "/api/expenses/add-multiple/progress/{jobId}", auth: true },
  "expenses.by-id": { key: "expenses.by-id", service: "expense", method: "GET", path: "/api/expenses/expense/{id}", auth: true },
  "expenses.cashflow": { key: "expenses.cashflow", service: "expense", method: "GET", path: "/api/expenses/cashflow", auth: true },
  "expenses.copy": { key: "expenses.copy", service: "expense", method: "POST", path: "/api/expenses/{expenseId}/copy", auth: true },
  "expenses.create": { key: "expenses.create", service: "expense", method: "POST", path: "/api/expenses/add-expense", auth: true },
  "expenses.current-month": { key: "expenses.current-month", service: "expense", method: "GET", path: "/api/expenses/current-month", auth: true },
  "expenses.delete": { key: "expenses.delete", service: "expense", method: "DELETE", path: "/api/expenses/delete/{id}", auth: true },
  "expenses.delete-all": { key: "expenses.delete-all", service: "expense", method: "DELETE", path: "/api/expenses/delete-all", auth: true },
  "expenses.delete-multiple": { key: "expenses.delete-multiple", service: "expense", method: "DELETE", path: "/api/expenses/delete-multiple", auth: true },
  "expenses.detailed": { key: "expenses.detailed", service: "expense", method: "GET", path: "/api/expenses/expense/{id}/detailed", auth: true },
  "expenses.edit-multiple": { key: "expenses.edit-multiple", service: "expense", method: "PUT", path: "/api/expenses/edit-multiple", auth: true },
  "expenses.excel-report": { key: "expenses.excel-report", service: "expense", method: "GET", path: "/api/expenses/generate-excel-report", auth: true },
  "expenses.filter": { key: "expenses.filter", service: "expense", method: "GET", path: "/api/expenses/filter", auth: true },
  "expenses.fuzzy-search": { key: "expenses.fuzzy-search", service: "expense", method: "GET", path: "/api/expenses/search/fuzzy", auth: true },
  "expenses.gain": { key: "expenses.gain", service: "expense", method: "GET", path: "/api/expenses/gain", auth: true },
  "expenses.generate-report": { key: "expenses.generate-report", service: "expense", method: "POST", path: "/api/expenses/{id}/generate-report", auth: true },
  "expenses.internal.by-id": { key: "expenses.internal.by-id", service: "expense", method: "GET", path: "/api/expenses/internal/get-by-id", auth: true },
  "expenses.internal.save": { key: "expenses.internal.save", service: "expense", method: "POST", path: "/api/expenses/internal/save-single", auth: true },
  "expenses.internal.search-fuzzy": { key: "expenses.internal.search-fuzzy", service: "expense", method: "GET", path: "/api/expenses/internal/search/fuzzy", auth: true },
  "expenses.last-month": { key: "expenses.last-month", service: "expense", method: "GET", path: "/api/expenses/last-month", auth: true },
  "expenses.list": { key: "expenses.list", service: "expense", method: "GET", path: "/api/expenses/fetch-expenses", auth: true },
  "expenses.loss": { key: "expenses.loss", service: "expense", method: "GET", path: "/api/expenses/loss", auth: true },
  "expenses.monthly-summary": { key: "expenses.monthly-summary", service: "expense", method: "GET", path: "/api/expenses/monthly-summary/{year}/{month}", auth: true },
  "expenses.paginated": { key: "expenses.paginated", service: "expense", method: "GET", path: "/api/expenses/fetch-expenses-paginated", auth: true },
  "expenses.payment-summary": { key: "expenses.payment-summary", service: "expense", method: "GET", path: "/api/expenses/payment-method-summary", auth: true },
  "expenses.reports-history": { key: "expenses.reports-history", service: "expense", method: "GET", path: "/api/expenses/reports/history", auth: true },
  "expenses.search": { key: "expenses.search", service: "expense", method: "GET", path: "/api/expenses/search", auth: true },
  "expenses.summary": { key: "expenses.summary", service: "expense", method: "GET", path: "/api/expenses/summary-expenses", auth: true },
  "expenses.today": { key: "expenses.today", service: "expense", method: "GET", path: "/api/expenses/today", auth: true },
  "expenses.top-n": { key: "expenses.top-n", service: "expense", method: "GET", path: "/api/expenses/top-n", auth: true },
  "expenses.update": { key: "expenses.update", service: "expense", method: "PUT", path: "/api/expenses/edit-expense/{id}", auth: true },
  "expenses.yearly-summary": { key: "expenses.yearly-summary", service: "expense", method: "GET", path: "/api/expenses/yearly-summary/{year}", auth: true },
  "settings.get": { key: "settings.get", service: "expense", method: "GET", path: "/api/settings", auth: true },
  "settings.update": { key: "settings.update", service: "expense", method: "PUT", path: "/api/settings", auth: true },
};

export default EXPENSE_ENDPOINTS;
