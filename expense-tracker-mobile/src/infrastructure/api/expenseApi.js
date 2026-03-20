import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";
import { optionalTargetParams } from "@/infrastructure/api/apiUtils";

export const expenseApi = {
  getAll: (params) => safeApiCall(() => api.get("/api/expenses/fetch-expenses", { params })),
  getPaginated: (params) => safeApiCall(() => api.get("/api/expenses/fetch-expenses-paginated", { params })),
  getById: (id, targetId = "") =>
    safeApiCall(() =>
      api.get(`/api/expenses/expense/${id}/detailed`, {
        params: targetId ? { targetId } : undefined,
      }),
    ),
  create: (data, targetId = "") =>
    safeApiCall(() =>
      api.post("/api/expenses/add-expense", data, {
        params: targetId ? { targetId } : undefined,
      }),
    ),
  update: (id, data, targetId = "") =>
    safeApiCall(() =>
      api.put(`/api/expenses/edit-expense/${id}`, data, {
        params: targetId ? { targetId } : undefined,
      }),
    ),
  delete: (id) => safeApiCall(() => api.delete(`/api/expenses/delete/${id}`)),
  getDailySpending: (params) => safeApiCall(() => api.get("/api/expenses/cashflow", { params })),
  search: (query, params) => safeApiCall(() => api.get("/api/expenses/fetch-expenses", { params: { query, ...params } })),
  getByCategory: (categoryId, params) => safeApiCall(() => api.get(`/api/expenses/category/${categoryId}`, { params })),
  exportData: (params) => safeApiCall(() => api.get("/api/expenses/export", { params, responseType: "blob" })),
  getSuggestions: (data) => safeApiCall(() => api.post("/api/expenses/top-expense-names", data)),
  getGroupedByDate: (params) => safeApiCall(() => api.get("/api/expenses/groupedByDate", { params })),
  getSummary: (params) => safeApiCall(() => api.get("/api/expenses/summary-expenses", { params })),
  copy: (id) => safeApiCall(() => api.post(`/api/expenses/${id}/copy`)),
  editMultiple: (data) => safeApiCall(() => api.put("/api/expenses/edit-multiple", data)),
  deleteMultiple: (ids) => safeApiCall(() => api.delete("/api/expenses/delete-multiple", { data: ids })),
  getPrevious: (name, date, targetId = "") =>
    safeApiCall(() =>
      api.get(`/api/expenses/before/${name}/${date}`, {
        params: optionalTargetParams(targetId),
      }),
    ),
  upload: (formData) => safeApiCall(() => api.post("/api/expenses/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })),
  uploadCategories: (formData) => safeApiCall(() => api.post("/api/expenses/upload-categories", formData, { headers: { "Content-Type": "multipart/form-data" } })),
  createMultiple: (data) => safeApiCall(() => api.post("/api/expenses/add-multiple", data)),
  createMultipleTracked: (data) => safeApiCall(() => api.post("/api/expenses/add-multiple/tracked", data)),
  pollSaveProgress: (jobId) => safeApiCall(() => api.get(`/api/expenses/add-multiple/progress/${jobId}`)),
  getByDate: (params) => safeApiCall(() => api.get("/api/expenses/fetch-expenses-by-date", { params })),
  getByParticularDate: (params) => safeApiCall(() => api.get("/api/expenses/particular-date", { params })),
  getCategoriesDetailed: (params) => safeApiCall(() => api.get("/api/expenses/all-by-categories/detailed/filtered", { params })),
  getByPaymentMethod: (params) => safeApiCall(() => api.get("/api/expenses/all-by-payment-method/detailed/filtered", { params })),
};
