import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const paymentMethodApi = {
  getAll: (friendId = "") =>
    safeApiCall(() =>
      api.get("/api/payment-methods", {
        params: friendId ? { targetId: friendId } : undefined,
      }),
    ),
  getById: (id, targetId) => safeApiCall(() => api.get(`/api/payment-methods/${id}`, { params: targetId ? { targetId } : undefined })),
  create: (data, friendId) => safeApiCall(() => api.post(friendId ? `/api/payment-methods/friend/${friendId}` : "/api/payment-methods", data)),
  update: (data, friendId) => safeApiCall(() => api.put(friendId ? `/api/payment-methods/friend/${friendId}` : "/api/payment-methods", data)),
  delete: (id) => safeApiCall(() => api.delete(`/api/payment-methods/${id}`)),
  getWithExpenses: (params) => safeApiCall(() => api.get("/api/expenses/all-by-payment-method/detailed/filtered", { params })),
  getAnalytics: (data) => safeApiCall(() => api.post("/api/analytics/entity", data)),
};
