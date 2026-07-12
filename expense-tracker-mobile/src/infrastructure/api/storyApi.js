import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";

export const storyApi = {
  getAll: () => safeApiCall(() => api.get("/api/stories")),
  markSeen: (storyId) => safeApiCall(() => api.post(`/api/stories/${storyId}/seen`)),
  markCtaClicked: (storyId, ctaId) => safeApiCall(() => api.post(`/api/stories/${storyId}/cta/${ctaId}/clicked`)),
  dismiss: (storyId) => safeApiCall(() => api.post(`/api/stories/${storyId}/dismiss`)),
};
