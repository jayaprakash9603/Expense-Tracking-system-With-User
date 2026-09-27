import React, { useState, useEffect } from "react";
import DetailedExpensesTable from "../pages/DetailedExpensesTable/DetailsExpensesTable";
// import DailySummary from "./DailySummary";
import ExpensesAudits from "./ExpensesAudits";
import { api } from "../config/api";

const ExpenseTableParent = ({ Url, setUrl, selectedReport }) => {
  const [expensesData, setExpensesData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [auditsData, setAuditsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedReport) {
      fetchData(selectedReport);
    }
  }, [selectedReport, Url]);

  const fetchData = async (reportType) => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Authorization token is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;

      switch (reportType) {
        case "searchExpenses":
          response = await api.get(
            Url || "/api/expenses/fetch-expenses"
          );
          if (response.status === 204 || response.data.length === 0) {
            alert("No expenses found.");
            response = await api.get("/api/expenses/user");
          }
          setExpensesData(response.data);
          break;
        case "searchAudits":
          response = await api.get(
            Url || "/api/audit-logs/all"
          );
          if (response.status === 204 || response.data.length === 0) {
            alert("No logs found.");
            response = await api.get("/audit-logs/all");
          }
          setAuditsData(response.data);
          break;

        default:
          setError("Invalid report type selected.");
          return;
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {selectedReport === "searchExpenses" && (
        <DetailedExpensesTable
          data={expensesData}
          loading={loading}
          error={error}
        />
      )}

      {selectedReport === "searchAudits" && (
        <ExpensesAudits data={auditsData} loading={loading} error={error} />
      )}
    </div>
  );
};

export default ExpenseTableParent;
