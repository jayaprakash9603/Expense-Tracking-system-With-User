import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const authApi = {
  checkEmail: (email) =>
    safeApiCall(() => api.post("/auth/check-email", { email }, { skipAuth: true })),
};
