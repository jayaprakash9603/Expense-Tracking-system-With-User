import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";

export const notificationApi = {
  getAll: (params) => safeApiCall(() => api.get("/api/notifications", { params })),
  markRead: (id) => safeApiCall(() => api.patch(`/api/notifications/${id}/read`)),
  markAllRead: () => safeApiCall(() => api.patch("/api/notifications/read-all")),
  delete: (id) => safeApiCall(() => api.delete(`/api/notifications/${id}`)),
  getPreferences: () => safeApiCall(() => api.get("/api/notifications/preferences")),
  updatePreferences: (data) => safeApiCall(() => api.put("/api/notifications/preferences", data)),
  getUnreadCount: () => safeApiCall(() => api.get("/api/notifications/unread-count")),
  sendTest: () => safeApiCall(() => api.post("/api/notifications/test")),
  getFiltered: (params) => safeApiCall(() => api.get("/api/notifications/filter", { params })),
  getNotificationPreferences: () => safeApiCall(() => api.get("/api/notification-preferences")),
  updateNotificationPreferences: (data) => safeApiCall(() => api.put("/api/notification-preferences", data)),
  deleteNotificationPreferences: () => safeApiCall(() => api.delete("/api/notification-preferences")),
  resetNotificationPreferences: () => safeApiCall(() => api.post("/api/notification-preferences/reset")),
  existsNotificationPreferences: () => safeApiCall(() => api.get("/api/notification-preferences/exists")),
  createDefaultNotificationPreferences: () => safeApiCall(() => api.post("/api/notification-preferences/default")),
};
