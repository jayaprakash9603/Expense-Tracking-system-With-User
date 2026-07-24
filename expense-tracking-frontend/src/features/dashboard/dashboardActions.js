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
export function createDashboardActions({ navigate, settings } = {}) {
  const exportReports = async () => {
    try {
      const exportPath = settings?.exportDirectoryPath || "";
      const encodedPath = encodeURIComponent(exportPath);

      if (exportPath) {
        const expensesRes = await api.get(`/api/expenses/generate-excel-report?exportPath=${encodedPath}`);
        const billsRes = await api.get(`/api/bills/export/excel?exportPath=${encodedPath}`);

        window.alert(`Excel reports saved successfully!\n\nExpenses: ${expensesRes.data}\nBills: ${billsRes.data}`);
      } else {
        const expensesRes = await api.get("/api/expenses/generate-excel-report", { responseType: "blob" });
        const expensesBlob = new Blob([expensesRes.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const expensesUrl = window.URL.createObjectURL(expensesBlob);
        const expensesLink = document.createElement("a");
        expensesLink.href = expensesUrl;
        expensesLink.download = `expenses_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(expensesLink);
        expensesLink.click();
        expensesLink.remove();
        window.URL.revokeObjectURL(expensesUrl);

        const billsRes = await api.get("/api/bills/export/excel", { responseType: "blob" });
        const billsBlob = new Blob([billsRes.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const billsUrl = window.URL.createObjectURL(billsBlob);
        const billsLink = document.createElement("a");
        billsLink.href = billsUrl;
        billsLink.download = `bills_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(billsLink);
        billsLink.click();
        billsLink.remove();
        window.URL.revokeObjectURL(billsUrl);

        window.alert("Excel reports downloaded successfully!");
      }
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
