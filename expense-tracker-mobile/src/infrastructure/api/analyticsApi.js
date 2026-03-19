import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const analyticsApi = {
  getOverview: () => safeApiCall(() => api.get("/api/analytics/overview")),
  getEntityAnalytics: (data) => safeApiCall(() => api.post("/api/analytics/entity", data)),
};
