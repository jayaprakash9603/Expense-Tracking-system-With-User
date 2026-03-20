import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";
import { optionalTargetParams } from "@/infrastructure/api/apiUtils";

export const budgetApi = {
  getAll: (params) => safeApiCall(() => api.get("/api/budgets", { params })),
  getById: (id, targetId = "") =>
    safeApiCall(() =>
      api.get(`/api/budgets/${id}`, {
        params: optionalTargetParams(targetId),
      }),
    ),
  create: (data, targetId = "") =>
    safeApiCall(() =>
      api.post("/api/budgets", data, {
        params: optionalTargetParams(targetId),
      }),
    ),
  update: (id, data, targetId = "") =>
    safeApiCall(() =>
      api.put(`/api/budgets/${id}`, data, {
        params: optionalTargetParams(targetId),
      }),
    ),
  delete: (id, targetId = "") =>
    safeApiCall(() =>
      api.delete(`/api/budgets/${id}`, {
        params: optionalTargetParams(targetId),
      }),
    ),
  getOverview: () => safeApiCall(() => api.get("/api/budgets/overview")),
  getExpenses: (id, params) =>
    safeApiCall(() => api.get(`/api/budgets/${id}/expenses`, { params })),
  filterByDate: (params) => safeApiCall(() => api.get("/api/budgets/filter-by-date", { params })),
  getByExpenseId: (params) => safeApiCall(() => api.get("/api/budgets/expenses", { params })),
  getReport: (id) => safeApiCall(() => api.get(`/api/budgets/report/${id}`)),
  getDetailedReport: (id) => safeApiCall(() => api.get(`/api/budgets/detailed-report/${id}`)),
  getFilteredReport: (params) =>
    safeApiCall(() => api.get("/api/budgets/all-with-expenses/detailed/filtered", { params })),
};
