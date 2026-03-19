import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const expenseApi = {
  getAll: (params) => safeApiCall(() => api.get("/api/expenses", { params })),
  getPaginated: (params) => safeApiCall(() => api.get("/api/expenses/paginated", { params })),
  getById: (id) => safeApiCall(() => api.get(`/api/expenses/${id}`)),
  create: (data) => safeApiCall(() => api.post("/api/expenses", data)),
  update: (id, data) => safeApiCall(() => api.put(`/api/expenses/${id}`, data)),
  delete: (id) => safeApiCall(() => api.delete(`/api/expenses/${id}`)),
  getDailySpending: (params) => safeApiCall(() => api.get("/api/expenses/daily-spending", { params })),
  getCashflow: (params) => safeApiCall(() => api.get("/api/expenses/cashflow", { params })),
  search: (query, params) => safeApiCall(() => api.get("/api/expenses/search", { params: { query, ...params } })),
  getByCategory: (categoryId, params) => safeApiCall(() => api.get(`/api/expenses/category/${categoryId}`, { params })),
  exportData: (params) => safeApiCall(() => api.get("/api/expenses/export", { params, responseType: "blob" })),
};
