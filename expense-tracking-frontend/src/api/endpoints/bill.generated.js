/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "bill".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const BILL_ENDPOINTS = {
  "bills.bulk-add": { key: "bills.bulk-add", service: "bill", method: "POST", path: "/api/bills/add-multiple", auth: true },
  "bills.bulk-add-tracked": { key: "bills.bulk-add-tracked", service: "bill", method: "POST", path: "/api/bills/add-multiple/tracked", auth: true },
  "bills.bulk-progress": { key: "bills.bulk-progress", service: "bill", method: "GET", path: "/api/bills/add-multiple/progress/{jobId}", auth: true },
  "bills.by-expense": { key: "bills.by-expense", service: "bill", method: "GET", path: "/api/bills/expenses/{expenseId}", auth: true },
  "bills.by-id": { key: "bills.by-id", service: "bill", method: "GET", path: "/api/bills/{id}", auth: true },
  "bills.create": { key: "bills.create", service: "bill", method: "POST", path: "/api/bills", auth: true },
  "bills.delete": { key: "bills.delete", service: "bill", method: "DELETE", path: "/api/bills/{id}", auth: true },
  "bills.delete-all": { key: "bills.delete-all", service: "bill", method: "DELETE", path: "/api/bills", auth: true },
  "bills.export-excel": { key: "bills.export-excel", service: "bill", method: "GET", path: "/api/bills/export/excel", auth: true },
  "bills.import-excel": { key: "bills.import-excel", service: "bill", method: "POST", path: "/api/bills/import/excel", auth: true },
  "bills.import-excel-save": { key: "bills.import-excel-save", service: "bill", method: "POST", path: "/api/bills/import/excel/save", auth: true },
  "bills.items": { key: "bills.items", service: "bill", method: "GET", path: "/api/bills/items", auth: true },
  "bills.list": { key: "bills.list", service: "bill", method: "GET", path: "/api/bills", auth: true },
  "bills.ocr-status": { key: "bills.ocr-status", service: "bill", method: "GET", path: "/api/bills/ocr/status", auth: true },
  "bills.scan-receipt": { key: "bills.scan-receipt", service: "bill", method: "POST", path: "/api/bills/scan-receipt", auth: true },
  "bills.search": { key: "bills.search", service: "bill", method: "GET", path: "/api/bills/search", auth: true },
  "bills.update": { key: "bills.update", service: "bill", method: "PUT", path: "/api/bills/{id}", auth: true },
};

export default BILL_ENDPOINTS;
