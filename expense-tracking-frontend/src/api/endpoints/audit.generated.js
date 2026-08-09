/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "audit".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const AUDIT_ENDPOINTS = {
  "audit.admin-by-entity": { key: "audit.admin-by-entity", service: "audit", method: "GET", path: "/api/admin/audit-logs/entity", auth: true },
  "audit.admin-by-user": { key: "audit.admin-by-user", service: "audit", method: "GET", path: "/api/admin/audit-logs/user/{userId}", auth: true },
  "audit.admin-delete-report": { key: "audit.admin-delete-report", service: "audit", method: "DELETE", path: "/api/admin/reports/{reportId}", auth: true },
  "audit.admin-download-report": { key: "audit.admin-download-report", service: "audit", method: "GET", path: "/api/admin/reports/{reportId}/download", auth: true },
  "audit.admin-generate-report": { key: "audit.admin-generate-report", service: "audit", method: "POST", path: "/api/admin/reports/generate", auth: true },
  "audit.admin-logs": { key: "audit.admin-logs", service: "audit", method: "GET", path: "/api/admin/audit-logs", auth: true },
  "audit.admin-report-by-id": { key: "audit.admin-report-by-id", service: "audit", method: "GET", path: "/api/admin/reports/{reportId}", auth: true },
  "audit.admin-reports": { key: "audit.admin-reports", service: "audit", method: "GET", path: "/api/admin/reports", auth: true },
  "audit.admin-stats": { key: "audit.admin-stats", service: "audit", method: "GET", path: "/api/admin/audit-logs/stats", auth: true },
  "audit.logs": { key: "audit.logs", service: "audit", method: "GET", path: "/api/audit-logs/all", auth: true },
  "audit.types": { key: "audit.types", service: "audit", method: "GET", path: "/api/audit-logs/audit-types", auth: true },
};

export default AUDIT_ENDPOINTS;
