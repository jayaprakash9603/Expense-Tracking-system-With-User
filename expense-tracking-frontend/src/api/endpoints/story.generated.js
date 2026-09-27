/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "story".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const STORY_ENDPOINTS = {
  "stories.admin-create": { key: "stories.admin-create", service: "story", method: "POST", path: "/api/admin/stories", auth: true },
  "stories.admin-delete": { key: "stories.admin-delete", service: "story", method: "DELETE", path: "/api/admin/stories/{id}", auth: true },
  "stories.admin-list": { key: "stories.admin-list", service: "story", method: "GET", path: "/api/admin/stories", auth: true },
  "stories.admin-update": { key: "stories.admin-update", service: "story", method: "PUT", path: "/api/admin/stories/{id}", auth: true },
  "stories.by-id": { key: "stories.by-id", service: "story", method: "GET", path: "/api/stories/{id}", auth: true },
  "stories.create": { key: "stories.create", service: "story", method: "POST", path: "/api/stories", auth: true },
  "stories.delete": { key: "stories.delete", service: "story", method: "DELETE", path: "/api/stories/{id}", auth: true },
  "stories.list": { key: "stories.list", service: "story", method: "GET", path: "/api/stories", auth: true },
  "stories.update": { key: "stories.update", service: "story", method: "PUT", path: "/api/stories/{id}", auth: true },
};

export default STORY_ENDPOINTS;
