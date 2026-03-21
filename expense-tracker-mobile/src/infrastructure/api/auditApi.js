import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";

export const auditApi = {
  getLogs: (params) => safeApiCall(() => api.get("/api/audit-logs", { params })),
  getByEntity: (entityType, entityId) => safeApiCall(() => api.get(`/api/audit-logs/${entityType}/${entityId}`)),
  search: (params) => safeApiCall(() => api.get("/api/audit-logs/search", { params })),
  getAll: (params) => safeApiCall(() => api.get("/api/audit-logs/all", { params })),
  getByFilter: (filter) => safeApiCall(() => api.get(`/api/audit-logs/${filter}`)),
  sendByEmail: (filter, email) => safeApiCall(() => api.get(`/api/audit-logs/${filter}/email?email=${email}`)),
};
