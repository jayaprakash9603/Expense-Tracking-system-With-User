// Centralized dashboard action creators.
// Each action receives necessary dependencies (e.g. navigate, optional api client) injected.
// This makes the UI component lean and testable.

/**
 * Build dashboard actions with injected dependencies.
 * @param {Object} deps
 * @param {Function} deps.navigate - navigation function from useNavigate.
 * @param {Object} [deps.api] - optional API client (axios-like) supporting get.
 * @returns {{exportReports: Function, viewAllTransactions: Function, openFilter: Function}}
 */
export function createDashboardActions({ navigate, api } = {}) {
  const exportReports = async () => {
    try {
      if (1==1) {
        await api.get("/api/expenses/generate-excel-report");
        await api.get("/api/bills/export/excel");
      } else {
        // Fallback to fetch if no api client injected.
        await fetch("/api/expenses/generate-excel-report", { method: "GET" });
        await fetch("/api/bills/export/excel", { method: "GET" });
      }
      window.alert("Excel reports export triggered.");
    } catch (e) {
      console.error("Export failed", e);
      window.alert("Failed to export reports");
    }
  };

  const viewAllTransactions = () => {
    if (navigate) navigate("/expenses");
  };

  const openFilter = () => {
    console.log("Filter opened");
  };

  return { exportReports, viewAllTransactions, openFilter };
}

export default createDashboardActions;
