import { notificationApi } from "@/infrastructure/api";

/**
 * @typedef {import('@/shared/contracts/api').ApiResult<any>} ApiResult
 */

/**
 * Normalizes notification payloads from API and websocket events.
 * @param {any} notification
 * @returns {any}
 */
export function normalizeNotification(notification) {
  if (!notification) return null;

  return {
    ...notification,
    id: notification.id || notification.notificationId || `n-${Date.now()}`,
    read: Boolean(notification.read),
    createdAt: notification.createdAt || notification.timestamp || new Date().toISOString(),
  };
}

export const notificationService = {
  async list(params) {
    const result = await notificationApi.getAll(params);
    if (!result.success) return result;

    const normalized = Array.isArray(result.data)
      ? result.data.map(normalizeNotification).filter(Boolean)
      : [];

    return { ...result, data: normalized };
  },

  async unreadCount() {
    return notificationApi.getUnreadCount();
  },

  async markRead(id) {
    return notificationApi.markRead(id);
  },

  async markAllRead() {
    return notificationApi.markAllRead();
  },

  async remove(id) {
    return notificationApi.delete(id);
  },
};

export default notificationService;
