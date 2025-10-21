// Centralized dashboard action creators.
// Each action receives necessary dependencies (e.g. navigate, optional api client) injected.
// This makes the UI component lean and testable.

import { api } from "../../config/api";

/**
 * Build dashboard actions with injected dependencies.
 * @param {Object} deps
 * @param {Function} deps.navigate - navigation function from useNavigate.
 * @returns {{exportReports: Function, viewAllTransactions: Function, openFilter: Function}}
 */
export function createDashboardActions({ navigate } = {}) {
  const exportReports = async () => {
    try {
      await api.get("/api/expenses/generate-excel-report");
      await api.get("/api/bills/export/excel");

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
