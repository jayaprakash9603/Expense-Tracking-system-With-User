import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";

export const shareApi = {
  create: (data) => safeApiCall(() => api.post("/api/shares", data)),
  access: (token) => safeApiCall(() => api.get(`/api/shares/${token}`)),
  accessPaginated: (token, params) => safeApiCall(() => api.get(`/api/shares/${token}/paginated`, { params })),
  validate: (token) => safeApiCall(() => api.get(`/api/shares/${token}/validate`)),
  revoke: (token) => safeApiCall(() => api.delete(`/api/shares/${token}`)),
  getMyShares: () => safeApiCall(() => api.get("/api/shares/my-shares")),
  getStats: () => safeApiCall(() => api.get("/api/shares/stats")),
  regenerateQr: (token) => safeApiCall(() => api.post(`/api/shares/${token}/regenerate-qr`)),
  getQr: (token) => safeApiCall(() => api.get(`/api/shares/${token}/qr`)),
  shareWithFriend: (token, data) => safeApiCall(() => api.post(`/api/shares/${token}/share-with-friend`, data)),
  getAddedItems: (token) => safeApiCall(() => api.get(`/api/shares/${token}/added-items`)),
  trackAddedItem: (token, data) => safeApiCall(() => api.post(`/api/shares/${token}/added-items`, data)),
  trackAddedItemsBulk: (token, data) => safeApiCall(() => api.post(`/api/shares/${token}/added-items/bulk`, data)),
  untrackItem: (token, externalRef) => safeApiCall(() => api.delete(`/api/shares/${token}/added-items/${externalRef}`)),
  getPublic: () => safeApiCall(() => api.get("/api/shares/public")),
  getSharedWithMe: () => safeApiCall(() => api.get("/api/shares/shared-with-me")),
  getFriendSharedWithMe: () => safeApiCall(() => api.get("/api/friends/shared-with-me")),
  toggleSave: (token) => safeApiCall(() => api.post(`/api/shares/${token}/toggle-save`)),
};
