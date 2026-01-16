import { api } from "../../config/api";

// fetchSuggestions.js
export const getSuggestions = async ( setSuggestions) => {
  try {
    const response = await api.get(`/api/expenses/top-expense-names?topN=500`);
    setSuggestions(response.data);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
};
