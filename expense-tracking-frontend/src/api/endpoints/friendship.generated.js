/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "friendship".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const FRIENDSHIP_ENDPOINTS = {
  "friendships.block": { key: "friendships.block", service: "friendship", method: "POST", path: "/api/friendships/block/{userId}", auth: true },
  "friendships.by-id": { key: "friendships.by-id", service: "friendship", method: "GET", path: "/api/friendships/{friendshipId}", auth: true },
  "friendships.friends": { key: "friendships.friends", service: "friendship", method: "GET", path: "/api/friendships/friends", auth: true },
  "friendships.pending": { key: "friendships.pending", service: "friendship", method: "GET", path: "/api/friendships/pending", auth: true },
  "friendships.remove": { key: "friendships.remove", service: "friendship", method: "DELETE", path: "/api/friendships/{friendshipId}", auth: true },
  "friendships.request": { key: "friendships.request", service: "friendship", method: "POST", path: "/api/friendships/request", auth: true },
  "friendships.respond": { key: "friendships.respond", service: "friendship", method: "PUT", path: "/api/friendships/{friendshipId}/respond", auth: true },
  "friendships.search": { key: "friendships.search", service: "friendship", method: "GET", path: "/api/friendships/search", auth: true },
  "friendships.stats": { key: "friendships.stats", service: "friendship", method: "GET", path: "/api/friendships/stats", auth: true },
};

export default FRIENDSHIP_ENDPOINTS;
