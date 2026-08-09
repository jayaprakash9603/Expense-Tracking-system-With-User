/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "group".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const GROUP_ENDPOINTS = {
  "groups.by-id": { key: "groups.by-id", service: "group", method: "GET", path: "/api/groups/{id}", auth: true },
  "groups.create": { key: "groups.create", service: "group", method: "POST", path: "/api/groups", auth: true },
  "groups.delete": { key: "groups.delete", service: "group", method: "DELETE", path: "/api/groups/{id}", auth: true },
  "groups.invite": { key: "groups.invite", service: "group", method: "POST", path: "/api/groups/{groupId}/invite", auth: true },
  "groups.list": { key: "groups.list", service: "group", method: "GET", path: "/api/groups", auth: true },
  "groups.members": { key: "groups.members", service: "group", method: "GET", path: "/api/groups/{groupId}/members", auth: true },
  "groups.search": { key: "groups.search", service: "group", method: "GET", path: "/api/groups/search", auth: true },
  "groups.settings.get": { key: "groups.settings.get", service: "group", method: "GET", path: "/api/groups/{groupId}/settings", auth: true },
  "groups.settings.update": { key: "groups.settings.update", service: "group", method: "PUT", path: "/api/groups/{groupId}/settings", auth: true },
  "groups.update": { key: "groups.update", service: "group", method: "PUT", path: "/api/groups/{id}", auth: true },
};

export default GROUP_ENDPOINTS;
