import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const userSettingsApi = {
  get: () => safeApiCall(() => api.get("/api/settings")),
  update: (data) => safeApiCall(() => api.put("/api/settings", data)),
  createDefault: () => safeApiCall(() => api.post("/api/settings/default")),
  reset: () => safeApiCall(() => api.post("/api/settings/reset")),
  exists: () => safeApiCall(() => api.get("/api/settings/exists")),
  getDashboardPreferences: () => safeApiCall(() => api.get("/api/user/dashboard-preferences")),
};
