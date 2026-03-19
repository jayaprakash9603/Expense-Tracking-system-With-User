export function fromApiResponse(raw) {
  return {
    id: raw.id,
    type: raw.type || "SYSTEM",
    title: raw.title || "",
    message: raw.message || raw.body || "",
    read: Boolean(raw.read || raw.isRead),
    actionUrl: raw.actionUrl || raw.link || null,
    createdAt: raw.createdAt || raw.created_at || "",
    data: raw.data || raw.metadata || {},
  };
}

export function toListItem(notification) {
  return {
    id: notification.id,
    title: notification.title,
    subtitle: notification.message,
    type: notification.type,
    read: notification.read,
    date: notification.createdAt,
    actionUrl: notification.actionUrl,
  };
}
