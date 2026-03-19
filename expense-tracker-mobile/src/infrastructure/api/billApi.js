import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const billApi = {
  getAll: (params) => safeApiCall(() => api.get("/api/bills", { params })),
  getById: (id) => safeApiCall(() => api.get(`/api/bills/${id}`)),
  create: (data) => safeApiCall(() => api.post("/api/bills", data)),
  update: (id, data) => safeApiCall(() => api.put(`/api/bills/${id}`, data)),
  delete: (id) => safeApiCall(() => api.delete(`/api/bills/${id}`)),
  markPaid: (id) => safeApiCall(() => api.patch(`/api/bills/${id}/pay`)),
  getUpcoming: (params) => safeApiCall(() => api.get("/api/bills/upcoming", { params })),
};
