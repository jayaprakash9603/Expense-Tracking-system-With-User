import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";

export const searchApi = {
  search: ({ query, limit = 20, mode = "USER", sections } = {}) =>
    safeApiCall(() =>
      api.get("/api/search", {
        params: {
          q: query,
          limit,
          mode,
          sections,
        },
      }),
    ),
};

export default searchApi;
