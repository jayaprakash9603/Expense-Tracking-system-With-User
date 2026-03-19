import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const chatApi = {
  sendGroupMessage: (data) => safeApiCall(() => api.post("/api/chats/group", data)),
  getGroupChat: (groupId) => safeApiCall(() => api.get(`/api/chats/group/${groupId}`)),
  getGroupHistory: (groupId, params) => safeApiCall(() => api.get(`/api/chats/history/group/${groupId}`, { params })),
  getUnreadGroup: (groupId) => safeApiCall(() => api.get(`/api/chats/group/${groupId}/unread`)),
  deleteMessage: (chatId) => safeApiCall(() => api.delete(`/api/chats/${chatId}`)),
  editMessage: (chatId, data) => safeApiCall(() => api.put(`/api/chats/${chatId}/edit`, data)),
  replyToMessage: (chatId, data) => safeApiCall(() => api.post(`/api/chats/${chatId}/reply`, data)),
  getConversations: () => safeApiCall(() => api.get("/api/chats/conversations")),
  getOneToOne: (friendId) => safeApiCall(() => api.get(`/api/chats/between?userId2=${friendId}`)),
  sendOneToOne: (data) => safeApiCall(() => api.post("/api/chats/one-to-one", data)),
  addReaction: (messageId, data) => safeApiCall(() => api.post(`/api/chats/${messageId}/reaction`, data)),
  removeReaction: (messageId) => safeApiCall(() => api.delete(`/api/chats/${messageId}/reaction`)),
  markRead: (data) => safeApiCall(() => api.post("/api/chats/mark-read", data)),
  fetchPresence: (data) => safeApiCall(() => api.post("/api/chats/presence/batch", data)),
};
