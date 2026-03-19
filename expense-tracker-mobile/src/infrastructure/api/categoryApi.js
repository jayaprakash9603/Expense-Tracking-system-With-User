import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const categoryApi = {
  getAll: (params) => safeApiCall(() => api.get("/api/categories", { params })),
  getById: (id) => safeApiCall(() => api.get(`/api/categories/${id}`)),
  create: (data) => safeApiCall(() => api.post("/api/categories", data)),
  update: (id, data) => safeApiCall(() => api.put(`/api/categories/${id}`, data)),
  delete: (id) => safeApiCall(() => api.delete(`/api/categories/${id}`)),
  getAnalytics: (id, params) => safeApiCall(() => api.get(`/api/categories/${id}/analytics`, { params })),
  getFlow: (params) => safeApiCall(() => api.get("/api/categories/flow", { params })),
};
