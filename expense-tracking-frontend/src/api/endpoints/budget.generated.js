/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "budget".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const BUDGET_ENDPOINTS = {
  "budgets.budgets-for-expense": { key: "budgets.budgets-for-expense", service: "budget", method: "GET", path: "/api/budgets/expenses", auth: true },
  "budgets.by-id": { key: "budgets.by-id", service: "budget", method: "GET", path: "/api/budgets/{budgetId}", auth: true },
  "budgets.create": { key: "budgets.create", service: "budget", method: "POST", path: "/api/budgets", auth: true },
  "budgets.delete": { key: "budgets.delete", service: "budget", method: "DELETE", path: "/api/budgets/{budgetId}", auth: true },
  "budgets.delete-all": { key: "budgets.delete-all", service: "budget", method: "DELETE", path: "/api/budgets", auth: true },
  "budgets.detailed-report": { key: "budgets.detailed-report", service: "budget", method: "GET", path: "/api/budgets/detailed-report/{budgetId}", auth: true },
  "budgets.expenses": { key: "budgets.expenses", service: "budget", method: "GET", path: "/api/budgets/{budgetId}/expenses", auth: true },
  "budgets.filter-by-date": { key: "budgets.filter-by-date", service: "budget", method: "GET", path: "/api/budgets/filter-by-date", auth: true },
  "budgets.filtered-overview": { key: "budgets.filtered-overview", service: "budget", method: "GET", path: "/api/budgets/all-with-expenses/detailed/filtered", auth: true },
  "budgets.internal.get-by-id": { key: "budgets.internal.get-by-id", service: "budget", method: "GET", path: "/api/budgets/get-by-id", auth: true },
  "budgets.internal.save": { key: "budgets.internal.save", service: "budget", method: "POST", path: "/api/budgets/save", auth: true },
  "budgets.internal.user-budgets": { key: "budgets.internal.user-budgets", service: "budget", method: "GET", path: "/api/budgets/user", auth: true },
  "budgets.list": { key: "budgets.list", service: "budget", method: "GET", path: "/api/budgets", auth: true },
  "budgets.report": { key: "budgets.report", service: "budget", method: "GET", path: "/api/budgets/report/{budgetId}", auth: true },
  "budgets.reports": { key: "budgets.reports", service: "budget", method: "GET", path: "/api/budgets/reports", auth: true },
  "budgets.search": { key: "budgets.search", service: "budget", method: "GET", path: "/api/budgets/search", auth: true },
  "budgets.update": { key: "budgets.update", service: "budget", method: "PUT", path: "/api/budgets/{budgetId}", auth: true },
};

export default BUDGET_ENDPOINTS;
