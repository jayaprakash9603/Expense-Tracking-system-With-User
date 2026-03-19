import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const friendApi = {
  getAll: () => safeApiCall(() => api.get("/api/friends")),
  sendRequest: (data) => safeApiCall(() => api.post("/api/friends/request", data)),
  acceptRequest: (id) => safeApiCall(() => api.patch(`/api/friends/accept/${id}`)),
  rejectRequest: (id) => safeApiCall(() => api.patch(`/api/friends/reject/${id}`)),
  remove: (id) => safeApiCall(() => api.delete(`/api/friends/${id}`)),
  block: (id) => safeApiCall(() => api.patch(`/api/friends/block/${id}`)),
  unblock: (id) => safeApiCall(() => api.patch(`/api/friends/unblock/${id}`)),
  getRequests: () => safeApiCall(() => api.get("/api/friends/requests")),
  getBlocked: () => safeApiCall(() => api.get("/api/friends/blocked")),
  search: (query) => safeApiCall(() => api.get("/api/friends/search", { params: { query } })),
};
