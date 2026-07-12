import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";

export const reportApi = {
  generate: (data) => safeApiCall(() => api.post("/api/reports/generate", data)),
  getHistory: (params) => safeApiCall(() => api.get("/api/reports/history", { params })),
  getById: (id) => safeApiCall(() => api.get(`/api/reports/${id}`)),
  delete: (id) => safeApiCall(() => api.delete(`/api/reports/${id}`)),
  download: (id) => safeApiCall(() => api.get(`/api/reports/${id}/download`, { responseType: "blob" })),
};
