import { api, API_BASE_URL } from "../../config/api";

// fetchSuggestions.js
export const getSuggestions = async (token, setSuggestions) => {
  try {
    const response = await api.get(`/api/expenses/top-expense-names?topN=500`);
    setSuggestions(response.data);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
};
