import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const notificationApi = {
  getAll: (params) => safeApiCall(() => api.get("/api/notifications", { params })),
  markRead: (id) => safeApiCall(() => api.patch(`/api/notifications/${id}/read`)),
  markAllRead: () => safeApiCall(() => api.patch("/api/notifications/read-all")),
  delete: (id) => safeApiCall(() => api.delete(`/api/notifications/${id}`)),
  getPreferences: () => safeApiCall(() => api.get("/api/notifications/preferences")),
  updatePreferences: (data) => safeApiCall(() => api.put("/api/notifications/preferences", data)),
  getUnreadCount: () => safeApiCall(() => api.get("/api/notifications/unread-count")),
};
