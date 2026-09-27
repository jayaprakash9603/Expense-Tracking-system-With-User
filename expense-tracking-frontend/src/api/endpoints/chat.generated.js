/**
 * AUTO-GENERATED from Automation endpoint YAMLs for service "chat".
 * Do not edit by hand — run: node scripts/generate-endpoint-catalog.mjs
 */

export const CHAT_ENDPOINTS = {
  "chats.between": { key: "chats.between", service: "chat", method: "GET", path: "/api/chats/between", auth: true },
  "chats.conversations": { key: "chats.conversations", service: "chat", method: "GET", path: "/api/chats/conversations", auth: true },
  "chats.list": { key: "chats.list", service: "chat", method: "GET", path: "/api/chats", auth: true },
  "chats.mark-read": { key: "chats.mark-read", service: "chat", method: "POST", path: "/api/chats/mark-read", auth: true },
  "chats.send-direct": { key: "chats.send-direct", service: "chat", method: "POST", path: "/api/chats/one-to-one", auth: true },
  "chats.send-group": { key: "chats.send-group", service: "chat", method: "POST", path: "/api/chats/group", auth: true },
  "chats.unread-count": { key: "chats.unread-count", service: "chat", method: "GET", path: "/api/chats/unread/count", auth: true },
  "presence.batch": { key: "presence.batch", service: "chat", method: "GET", path: "/api/chats/presence/batch", auth: true },
  "presence.friends": { key: "presence.friends", service: "chat", method: "GET", path: "/api/chats/presence/friends", auth: true },
  "presence.heartbeat": { key: "presence.heartbeat", service: "chat", method: "POST", path: "/api/chats/presence/heartbeat", auth: true },
  "presence.online": { key: "presence.online", service: "chat", method: "GET", path: "/api/chats/presence/online", auth: true },
  "presence.user": { key: "presence.user", service: "chat", method: "GET", path: "/api/chats/presence/{userId}", auth: true },
};

export default CHAT_ENDPOINTS;
