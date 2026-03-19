import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const budgetApi = {
  getAll: (params) => safeApiCall(() => api.get("/api/budgets", { params })),
  getById: (id) => safeApiCall(() => api.get(`/api/budgets/${id}`)),
  create: (data) => safeApiCall(() => api.post("/api/budgets", data)),
  update: (id, data) => safeApiCall(() => api.put(`/api/budgets/${id}`, data)),
  delete: (id) => safeApiCall(() => api.delete(`/api/budgets/${id}`)),
  getOverview: () => safeApiCall(() => api.get("/api/budgets/overview")),
  getExpenses: (id, params) => safeApiCall(() => api.get(`/api/budgets/${id}/expenses`, { params })),
  filterByDate: (params) => safeApiCall(() => api.get("/api/budgets/filter-by-date", { params })),
  getByExpenseId: (params) => safeApiCall(() => api.get("/api/budgets/expenses", { params })),
  getReport: (id) => safeApiCall(() => api.get(`/api/budgets/report/${id}`)),
  getDetailedReport: (id) => safeApiCall(() => api.get(`/api/budgets/detailed-report/${id}`)),
  getFilteredReport: (params) => safeApiCall(() => api.get("/api/budgets/all-with-expenses/detailed/filtered", { params })),
};
