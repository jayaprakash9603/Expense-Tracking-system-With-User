import { nextDemoId, saveDemoStore } from "@/infrastructure/demo/store/demoStore";

export async function tryDemoFriendsNotificationsMiscRoutes(ctx) {
  const { method, path, body, store, resolveDemoData } = ctx;

  if (method === "GET" && path === "/api/friendships/friends") {
    return resolveDemoData([...store.friends]);
  }

  if (method === "GET" && path === "/api/friendships/suggestions") {
    return resolveDemoData([
      { id: "demo-sug-1", displayName: "River Stone", email: "river@example.com" },
      { id: "demo-sug-2", displayName: "Sky Patel", email: "sky@example.com" },
    ]);
  }

  if (method === "GET" && path === "/api/friendships/pending/incoming") {
    return resolveDemoData([...store.friendRequests]);
  }

  if (method === "GET" && path === "/api/notifications/unread-count") {
    return resolveDemoData({ count: 3 });
  }

  if (
    method === "GET" &&
    path.startsWith("/api/notifications") &&
    path.includes("preferences")
  ) {
    return resolveDemoData({});
  }

  if (method === "GET" && path.startsWith("/api/notifications")) {
    return resolveDemoData([]);
  }

  if (method === "PATCH" && path.startsWith("/api/notifications")) {
    return resolveDemoData({ success: true });
  }

  if (method === "DELETE" && path.startsWith("/api/notifications")) {
    return resolveDemoData({ success: true });
  }

  if (method === "PUT" && path.startsWith("/api/notifications")) {
    return resolveDemoData({ success: true });
  }

  if (method === "POST" && path.startsWith("/api/notifications")) {
    return resolveDemoData({ success: true });
  }

  if (path.startsWith("/api/notification-preferences")) {
    return resolveDemoData({});
  }

  if (path.startsWith("/api/reports")) {
    return resolveDemoData({ labels: [], series: [], rows: [] });
  }

  if (method === "GET" && path === "/api/payment-methods") {
    return resolveDemoData([...(store.paymentMethods || [])]);
  }

  const paymentMethodIdMatch = path.match(/^\/api\/payment-methods\/([^/]+)$/);
  if (method === "GET" && paymentMethodIdMatch) {
    const row = store.paymentMethods?.find((p) => String(p.id) === paymentMethodIdMatch[1]);
    return resolveDemoData(row || {});
  }

  if (path.startsWith("/api/payment-methods")) {
    return resolveDemoData({ success: true });
  }

  if (method === "GET" && path === "/api/groups") {
    return resolveDemoData([...(store.groups || [])]);
  }

  if (method === "GET" && path === "/api/groups/member") {
    return resolveDemoData([...(store.groups || [])]);
  }

  const groupIdMatch = path.match(/^\/api\/groups\/([^/]+)$/);
  if (method === "GET" && groupIdMatch) {
    const row = store.groups?.find((g) => String(g.id) === String(groupIdMatch[1]));
    return resolveDemoData(row || { id: groupIdMatch[1], name: "Group", memberCount: 0 });
  }

  if (method === "GET" && path.startsWith("/api/groups/")) {
    return resolveDemoData({ members: [], activity: [], invitations: [] });
  }

  if (method === "POST" && path === "/api/groups") {
    const id = nextDemoId(store);
    const row = {
      id,
      name: body.name || "Group",
      description: body.description || "",
      memberCount: 1,
    };
    store.groups = [row, ...(store.groups || [])];
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  if (method === "POST" && path.startsWith("/api/groups")) {
    const id = nextDemoId(store);
    saveDemoStore(store);
    return resolveDemoData({ id, name: body.name || "Group" });
  }

  return null;
}
