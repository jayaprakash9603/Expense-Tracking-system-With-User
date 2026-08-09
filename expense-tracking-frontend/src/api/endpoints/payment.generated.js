/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "payment".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const PAYMENT_ENDPOINTS = {
  "payments.by-id": { key: "payments.by-id", service: "payment", method: "GET", path: "/api/payment-methods/{id}", auth: true },
  "payments.by-name": { key: "payments.by-name", service: "payment", method: "GET", path: "/api/payment-methods/name", auth: true },
  "payments.by-name-and-type": { key: "payments.by-name-and-type", service: "payment", method: "GET", path: "/api/payment-methods/name-and-type", auth: true },
  "payments.create": { key: "payments.create", service: "payment", method: "POST", path: "/api/payment-methods", auth: true },
  "payments.delete": { key: "payments.delete", service: "payment", method: "DELETE", path: "/api/payment-methods/{id}", auth: true },
  "payments.delete-all": { key: "payments.delete-all", service: "payment", method: "DELETE", path: "/api/payment-methods/all", auth: true },
  "payments.list": { key: "payments.list", service: "payment", method: "GET", path: "/api/payment-methods", auth: true },
  "payments.names": { key: "payments.names", service: "payment", method: "GET", path: "/api/payment-methods/names", auth: true },
  "payments.search": { key: "payments.search", service: "payment", method: "GET", path: "/api/payment-methods/search", auth: true },
  "payments.unused": { key: "payments.unused", service: "payment", method: "GET", path: "/api/payment-methods/unused", auth: true },
  "payments.update": { key: "payments.update", service: "payment", method: "PUT", path: "/api/payment-methods/{id}", auth: true },
};

export default PAYMENT_ENDPOINTS;
