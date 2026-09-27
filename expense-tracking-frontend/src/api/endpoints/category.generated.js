/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "category".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const CATEGORY_ENDPOINTS = {
  "categories.bulk-create": { key: "categories.bulk-create", service: "category", method: "POST", path: "/api/categories/bulk", auth: true },
  "categories.bulk-delete": { key: "categories.bulk-delete", service: "category", method: "DELETE", path: "/api/categories/bulk", auth: true },
  "categories.bulk-update": { key: "categories.bulk-update", service: "category", method: "PUT", path: "/api/categories/bulk", auth: true },
  "categories.by-id": { key: "categories.by-id", service: "category", method: "GET", path: "/api/categories/{id}", auth: true },
  "categories.by-name": { key: "categories.by-name", service: "category", method: "GET", path: "/api/categories/name/{name}", auth: true },
  "categories.create": { key: "categories.create", service: "category", method: "POST", path: "/api/categories", auth: true },
  "categories.delete": { key: "categories.delete", service: "category", method: "DELETE", path: "/api/categories/{id}", auth: true },
  "categories.delete-all": { key: "categories.delete-all", service: "category", method: "DELETE", path: "/api/categories", auth: true },
  "categories.expenses": { key: "categories.expenses", service: "category", method: "GET", path: "/api/categories/{categoryId}/expenses", auth: true },
  "categories.filtered-expenses": { key: "categories.filtered-expenses", service: "category", method: "GET", path: "/api/categories/{categoryId}/filtered-expenses", auth: true },
  "categories.list": { key: "categories.list", service: "category", method: "GET", path: "/api/categories", auth: true },
  "categories.search": { key: "categories.search", service: "category", method: "GET", path: "/api/categories/search", auth: true },
  "categories.uncategorized": { key: "categories.uncategorized", service: "category", method: "GET", path: "/api/categories/uncategorized", auth: true },
  "categories.update": { key: "categories.update", service: "category", method: "PUT", path: "/api/categories/{id}", auth: true },
};

export default CATEGORY_ENDPOINTS;
