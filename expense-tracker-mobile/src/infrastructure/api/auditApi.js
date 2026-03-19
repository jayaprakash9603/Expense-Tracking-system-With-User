import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const auditApi = {
  getLogs: (params) => safeApiCall(() => api.get("/api/audit-logs", { params })),
  getByEntity: (entityType, entityId) => safeApiCall(() => api.get(`/api/audit-logs/${entityType}/${entityId}`)),
  search: (params) => safeApiCall(() => api.get("/api/audit-logs/search", { params })),
};
