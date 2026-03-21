import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";

export const shortcutApi = {
  getAll: () => safeApiCall(() => api.get("/api/shortcuts")),
  update: (data) => safeApiCall(() => api.post("/api/shortcuts/update", data)),
  reset: () => safeApiCall(() => api.post("/api/shortcuts/reset")),
  getRecommendations: () => safeApiCall(() => api.get("/api/shortcuts/recommendations")),
  trackUsage: (data) => safeApiCall(() => api.post("/api/shortcuts/track", data)),
  acceptRecommendation: (actionId) => safeApiCall(() => api.post(`/api/shortcuts/recommendations/${actionId}/accept`)),
  rejectRecommendation: (actionId) => safeApiCall(() => api.post(`/api/shortcuts/recommendations/${actionId}/reject`)),
};
