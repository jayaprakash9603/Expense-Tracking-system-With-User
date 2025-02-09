// fetchSuggestions.js
export const getSuggestions = async (token, setSuggestions) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/expenses/top-expense-names?topN=500", {
          headers: {
            Authorization: `Bearer ${token}`,  // Include the JWT in the Authorization header
          },
        }
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };
  