/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "event".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const EVENT_ENDPOINTS = {
  "events.analytics": { key: "events.analytics", service: "event", method: "GET", path: "/api/events/{eventId}/analytics/user/{userId}", auth: true },
  "events.budgets.create": { key: "events.budgets.create", service: "event", method: "POST", path: "/api/events/budgets", auth: true },
  "events.budgets.list": { key: "events.budgets.list", service: "event", method: "GET", path: "/api/events/{eventId}/budgets/user/{userId}", auth: true },
  "events.by-id": { key: "events.by-id", service: "event", method: "GET", path: "/api/events/{eventId}/user/{userId}", auth: true },
  "events.create": { key: "events.create", service: "event", method: "POST", path: "/api/events", auth: true },
  "events.delete": { key: "events.delete", service: "event", method: "DELETE", path: "/api/events/{eventId}/user/{userId}", auth: true },
  "events.donations.create": { key: "events.donations.create", service: "event", method: "POST", path: "/api/events/donations", auth: true },
  "events.donations.list": { key: "events.donations.list", service: "event", method: "GET", path: "/api/events/{eventId}/donations/user/{userId}", auth: true },
  "events.list-user": { key: "events.list-user", service: "event", method: "GET", path: "/api/events/user/{userId}", auth: true },
  "events.summary": { key: "events.summary", service: "event", method: "GET", path: "/api/events/{eventId}/summary/user/{userId}", auth: true },
  "events.update": { key: "events.update", service: "event", method: "PUT", path: "/api/events/{eventId}/user/{userId}", auth: true },
};

export default EVENT_ENDPOINTS;
