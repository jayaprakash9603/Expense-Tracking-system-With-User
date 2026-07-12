import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";

export const groupApi = {
  create: (data) => safeApiCall(() => api.post("/api/groups", data)),
  getAll: () => safeApiCall(() => api.get("/api/groups")),
  getById: (id) => safeApiCall(() => api.get(`/api/groups/${id}`)),
  getPendingInvitations: () => safeApiCall(() => api.get("/api/groups/invitations/pending")),
  getRecommendations: () => safeApiCall(() => api.get("/api/groups/recommendations")),
  getCreated: () => safeApiCall(() => api.get("/api/groups/created")),
  respondToInvitation: (invId, accept) => safeApiCall(() => api.put(`/api/groups/invitations/${invId}/respond?accept=${accept}`)),
  leave: (groupId) => safeApiCall(() => api.post(`/api/groups/${groupId}/leave`)),
  getFriendsNotInGroup: (groupId) => safeApiCall(() => api.get(`/api/groups/${groupId}/friends-not-in-group`)),
  inviteFriend: (groupId, data) => safeApiCall(() => api.post(`/api/groups/${groupId}/invite`, data)),
  getSentInvitations: (groupId) => safeApiCall(() => api.get(`/api/groups/${groupId}/invitations/sent`)),
  cancelInvitation: (invId) => safeApiCall(() => api.put(`/api/groups/invitations/${invId}/cancel`)),
};
