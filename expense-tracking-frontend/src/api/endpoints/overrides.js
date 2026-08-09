/**
 * Hand-written endpoint overlays:
 * - Frontend-only paths not present in Automation YAMLs
 * - Per-transport path rewrites for the snow simulator
 * - Path normalisation aliases for legacy callers
 */

/** Endpoints used by the SPA but missing from Automation YAML catalogs. */
export const FRONTEND_ONLY_ENDPOINTS = Object.freeze({
  "audit.logs.all": {
    key: "audit.logs.all",
    service: "audit",
    method: "GET",
    path: "/audit-logs/all",
    auth: true,
  },
  "audit.logs.types": {
    key: "audit.logs.types",
    service: "audit",
    method: "GET",
    path: "/audit-logs/audit-types",
    auth: true,
  },
  "analytics.report.excel": {
    key: "analytics.report.excel",
    service: "analytics",
    method: "GET",
    path: "/api/analytics/report/excel",
    auth: true,
  },
  "bills.import.excel": {
    key: "bills.import.excel",
    service: "bill",
    method: "POST",
    path: "/api/bills/import/excel",
    auth: true,
  },
  "bills.add-multiple.tracked": {
    key: "bills.add-multiple.tracked",
    service: "bill",
    method: "POST",
    path: "/api/bills/add-multiple/tracked",
    auth: true,
  },
  "bills.add-multiple.progress": {
    key: "bills.add-multiple.progress",
    service: "bill",
    method: "GET",
    path: "/api/bills/add-multiple/progress/{jobId}",
    auth: true,
  },
  "config.features": {
    key: "config.features",
    service: "user",
    method: "GET",
    path: "/api/config/features",
    auth: false,
  },
  "media.cloudinary.upload": {
    key: "media.cloudinary.upload",
    service: "external",
    method: "POST",
    path: "/external/cloudinary",
    auth: false,
  },
});

/**
 * Optional path rewrites when transport === "snow".
 * Keyed by endpoint catalog key.
 */
export const SNOW_PATH_REWRITES = Object.freeze({
  // Example:
  // "expenses.list": { path: "/simulator/expenses" },
});

/**
 * Normalise legacy path conventions to catalog form.
 * - "api/bills" -> "/api/bills"
 * - keeps "/audit-logs/..." as-is
 */
export const normalizePath = (path) => {
  if (!path || typeof path !== "string") return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  if (path.startsWith("api/") || path.startsWith("auth/") || path.startsWith("audit-logs/")) {
    return `/${path}`;
  }
  return path;
};
