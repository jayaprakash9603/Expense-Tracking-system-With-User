import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";

export const activityApi = {
  getAll: (params) => safeApiCall(() => api.get("/api/activities", { params })),
  getPaged: (params) => safeApiCall(() => api.get("/api/activities/paged", { params })),
  getUnread: () => safeApiCall(() => api.get("/api/activities/unread")),
  getUnreadCount: () => safeApiCall(() => api.get("/api/activities/unread/count")),
  getByService: (service, params) => safeApiCall(() => api.get(`/api/activities/service/${service}`, { params })),
  getByFriend: (friendId, params) => safeApiCall(() => api.get(`/api/activities/friend/${friendId}`, { params })),
  getRecent: (params) => safeApiCall(() => api.get("/api/activities/recent", { params })),
  markRead: (id) => safeApiCall(() => api.put(`/api/activities/${id}/read`)),
  markAllRead: () => safeApiCall(() => api.put("/api/activities/read-all")),
  getSummary: () => safeApiCall(() => api.get("/api/activities/summary")),
};
