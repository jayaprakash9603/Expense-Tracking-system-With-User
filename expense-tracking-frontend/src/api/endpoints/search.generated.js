/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "search".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const SEARCH_ENDPOINTS = {
  "search.universal": { key: "search.universal", service: "search", method: "GET", path: "/api/search", auth: true },
  "shortcuts.create": { key: "shortcuts.create", service: "search", method: "POST", path: "/api/shortcuts/update", auth: true },
  "shortcuts.delete": { key: "shortcuts.delete", service: "search", method: "DELETE", path: "/api/shortcuts/{id}", auth: true },
  "shortcuts.list": { key: "shortcuts.list", service: "search", method: "GET", path: "/api/shortcuts", auth: true },
};

export default SEARCH_ENDPOINTS;
