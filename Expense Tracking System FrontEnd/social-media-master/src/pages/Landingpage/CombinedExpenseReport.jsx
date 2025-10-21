import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ReportHeader from "../../components/ReportHeader";
import GroupedExpensesAccordion from "../../components/GroupedExpensesAccordion";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import { ExpensesLoadingSkeleton } from "../../components/skeletons/CommonSkeletons";
import {
  FETCH_CASHFLOW_EXPENSES_REQUEST,
  FETCH_CASHFLOW_EXPENSES_FAILURE,
} from "../../Redux/Expenses/expense.actionType";
import { api } from "../../config/api";
import { getChartColors } from "../../utils/chartColors";
import "../Landingpage/Payment Report/PaymentReport.css"; // Reuse existing payment report styles

// Combined Expenses Report: Overview, payment method distribution, usage, category distribution, expenses accordion.
const COLORS = getChartColors(12);

export default function CombinedExpenseReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { friendId } = useParams();

  // UI state
  const [timeframe, setTimeframe] = useState("month"); // retained for explicit date calculations (can be simplified later)
  // flow selection: 'all' | 'outflow' | 'inflow'
  const [flowType, setFlowType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data state
  const [rawData, setRawData] = useState(null); // grouped payment methods
  // Removed categoryData state - focusing only on grouped expenses by payment method
  const [startDate] = useState(null); // explicit custom range placeholders
  const [endDate] = useState(null);

  // Build date range based on timeframe (default current month)
  const computedDates = useMemo(() => {
    if (startDate && endDate) return { start: startDate, end: endDate };
    const now = new Date();
    if (timeframe === "week") {
      // get Monday of current week
      const d = new Date(now);
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day; // adjust when Sunday
      const monday = new Date(d.setDate(d.getDate() + diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        start: monday.toISOString().slice(0, 10),
        end: sunday.toISOString().slice(0, 10),
      };
    }
    if (timeframe === "year") {
      const start = `${now.getFullYear()}-01-01`;
      const end = `${now.getFullYear()}-12-31`;
      return { start, end };
    }
    // default month
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
    const endDateObj = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endStr = endDateObj.toISOString().slice(0, 10);
    return { start, end: endStr };
  }, [timeframe, startDate, endDate]);

  // Fetch grouped cashflow data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    dispatch({ type: FETCH_CASHFLOW_EXPENSES_REQUEST });
    try {
      const params = new URLSearchParams();
      // API example provided by user: offset=0&startDate=2025-09-21&endDate=2025-10-21&type=loss&groupBy=true
      params.append("groupBy", "true");
      params.append("startDate", computedDates.start);
      params.append("endDate", computedDates.end);
      // Map flowType to backend 'type' param: outflow => loss, inflow => gain, all => omit
      if (flowType === "outflow") {
        params.append("type", "loss");
      } else if (flowType === "inflow") {
        params.append("type", "gain");
      }
      params.append("offset", "0");
      if (friendId) params.append("targetId", friendId);
      const { data } = await api.get(
        `/api/expenses/cashflow?${params.toString()}`
      );
      setRawData(data);
    } catch (err) {
      console.error("Error fetching grouped cashflow", err);
      setError(err?.response?.data?.message || err.message);
      dispatch({ type: FETCH_CASHFLOW_EXPENSES_FAILURE, payload: err });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, friendId, flowType]);

  const summary = rawData?.summary;

  // Transform payment method groups into methodsData (include percentage for overview usage)
  const methodsData = useMemo(() => {
    if (!rawData) return [];
    const total = Number(rawData?.summary?.totalAmount || 0);
    return Object.entries(rawData)
      .filter(([key]) => key !== "summary")
      .map(([methodName, block]) => {
        const totalAmount = Number(block.totalAmount || 0);
        const transactions = Number(
          block.expenseCount || (block.expenses ? block.expenses.length : 0)
        );
        const percentage =
          total > 0 ? Number(((totalAmount / total) * 100).toFixed(2)) : 0;
        return {
          method: methodName,
          totalAmount,
          transactions,
          expenses: block.expenses || [],
          percentage,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [rawData]);

  // Removed category and fallback category spending logic

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/friends/expenses/${friendId}`);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/expenses");
    }
  };

  const handleFilter = () => {
    console.log("Filter controls placeholder (not implemented)");
  };
  const handleExport = () => {
    console.log("Export placeholder: would export expenses list");
  };

  if (loading) return <ExpensesLoadingSkeleton />;

  return (
    <div className="payment-methods-report">
      <ReportHeader
        className="payment-methods-header"
        title="🧾 Expenses Report"
        subtitle="Expenses grouped togethere"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onFilter={handleFilter}
        onExport={handleExport}
        onBack={handleBack}
        flowType={flowType}
        onFlowTypeChange={setFlowType}
      />

      {error && (
        <div style={{ color: "#ff6b6b", marginBottom: 16 }}>
          <div>Expenses Error: {error}</div>
        </div>
      )}

      {/* Overview cards: expenses mode with grouped payment method data */}
      <SharedOverviewCards data={methodsData} mode="expenses" />

      <div className="charts-grid">
        <div className="chart-row full-width">
          {/* Pass rawData directly; component will normalize payment method blocks internally */}

          <GroupedExpensesAccordion rawData={rawData} summary={summary} />
        </div>
      </div>
    </div>
  );
}
