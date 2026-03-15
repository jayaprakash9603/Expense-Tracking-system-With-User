import { api } from "../../config/api";

// fetchSuggestions.js
export const getSuggestions = async (setSuggestions, targetId = "") => {
  try {
    const payload = { topN: 500, targetId: targetId || "" };
    let response;
    try {
      response = await api.post(`/api/expenses/top-expense-names`, payload, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (postError) {
      const statusCode = postError?.response?.status;
      if (statusCode && ![404, 405, 415].includes(statusCode)) {
        throw postError;
      }
      response = await api.get(`/api/expenses/top-expense-names`, {
        params: payload,
      });
    }
    const data = extractSuggestions(response?.data);
    setSuggestions(data);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    setSuggestions([]);
  }
};

const extractSuggestions = (data) => {
  const suggestions = extractSuggestionArray(data);
  return suggestions
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item && typeof item === "object") {
        return item.name || item.value || item.expenseName || item.billName || "";
      }
      return "";
    })
    .filter((name) => name && name.trim() !== "");
};

const extractSuggestionArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.topExpenses)) {
    return data.topExpenses;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  if (Array.isArray(data?.items)) {
    return data.items;
  }
  return [];
};
