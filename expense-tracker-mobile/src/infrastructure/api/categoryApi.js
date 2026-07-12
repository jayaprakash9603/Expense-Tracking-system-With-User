import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";
import { normalizeApiList } from "@/shared/utils/api/normalizeApiList";

async function fetchCategoriesList(params) {
  const result = await safeApiCall(() => api.get("/api/categories", { params }));
  if (result.error) {
    return result;
  }
  const list = normalizeApiList(result.data, "data", "content");
  return { data: list, error: null };
}

export const categoryApi = {
  getAll: fetchCategoriesList,
  getById: (id) => safeApiCall(() => api.get(`/api/categories/${id}`)),
  create: (data) => safeApiCall(() => api.post("/api/categories", data)),
  update: (id, data) => safeApiCall(() => api.put(`/api/categories/${id}`, data)),
  delete: (id) => safeApiCall(() => api.delete(`/api/categories/${id}`)),
  getAnalytics: (id, params) => safeApiCall(() => api.get(`/api/categories/${id}/analytics`, { params })),
  getFlow: (params) => safeApiCall(() => api.get("/api/categories/flow", { params })),
};
