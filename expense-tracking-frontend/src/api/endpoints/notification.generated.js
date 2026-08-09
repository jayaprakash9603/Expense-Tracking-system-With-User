/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "notification".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const NOTIFICATION_ENDPOINTS = {
  "notifications.delete": { key: "notifications.delete", service: "notification", method: "DELETE", path: "/api/notifications/{id}", auth: true },
  "notifications.list": { key: "notifications.list", service: "notification", method: "GET", path: "/api/notifications", auth: true },
  "notifications.mark-all-read": { key: "notifications.mark-all-read", service: "notification", method: "PUT", path: "/api/notifications/read-all", auth: true },
  "notifications.mark-read": { key: "notifications.mark-read", service: "notification", method: "PUT", path: "/api/notifications/{id}/read", auth: true },
  "notifications.preferences": { key: "notifications.preferences", service: "notification", method: "GET", path: "/api/notification-preferences", auth: true },
  "notifications.unread": { key: "notifications.unread", service: "notification", method: "GET", path: "/api/notifications/unread", auth: true },
  "notifications.update-preferences": { key: "notifications.update-preferences", service: "notification", method: "PUT", path: "/api/notification-preferences", auth: true },
};

export default NOTIFICATION_ENDPOINTS;
