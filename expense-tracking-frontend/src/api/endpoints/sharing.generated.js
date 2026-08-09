/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "sharing".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const SHARING_ENDPOINTS = {
  "shares.access": { key: "shares.access", service: "sharing", method: "GET", path: "/api/shares/{token}", auth: false },
  "shares.access-paginated": { key: "shares.access-paginated", service: "sharing", method: "GET", path: "/api/shares/{token}/paginated", auth: false },
  "shares.create": { key: "shares.create", service: "sharing", method: "POST", path: "/api/shares", auth: true },
  "shares.make-public": { key: "shares.make-public", service: "sharing", method: "PUT", path: "/api/shares/{token}/public", auth: true },
  "shares.my": { key: "shares.my", service: "sharing", method: "GET", path: "/api/shares/my-shares", auth: true },
  "shares.public": { key: "shares.public", service: "sharing", method: "GET", path: "/api/shares/public", auth: false },
  "shares.revoke": { key: "shares.revoke", service: "sharing", method: "DELETE", path: "/api/shares/{token}", auth: true },
  "shares.shared-with-me": { key: "shares.shared-with-me", service: "sharing", method: "GET", path: "/api/shares/shared-with-me", auth: true },
  "shares.toggle-save": { key: "shares.toggle-save", service: "sharing", method: "POST", path: "/api/shares/{token}/toggle-save", auth: true },
  "shares.validate": { key: "shares.validate", service: "sharing", method: "GET", path: "/api/shares/{token}/validate", auth: false },
};

export default SHARING_ENDPOINTS;
