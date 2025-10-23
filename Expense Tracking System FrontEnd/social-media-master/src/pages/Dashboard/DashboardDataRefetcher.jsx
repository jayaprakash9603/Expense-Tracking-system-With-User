import { useEffect } from "react";
import fetchDailySpending, {
  fetchExpenseSummary,
  fetchMonthlyExpenses,
  fetchPaymentMethods,
  fetchCategoriesSummary,
} from "../../utils/Api";

// DashboardDataRefetcher
// Two modes:
// 1. Periodic mode (provide refetchFns[]) -> runs each immediately then at interval.
// 2. Orchestrated trigger mode (provide 'trigger' plus individual state setters & timeframe props).
// If both are provided, both behaviors run.
const DashboardDataRefetcher = ({
  // periodic mode props
  refetchFns = [],
  intervalMs = 60000,
  active = true,
  // orchestrated trigger mode props
  trigger,
  timeframe,
  categoryTimeframe,
  categoryFlowType,
  trendYear,
  paymentMethodsTimeframe,
  paymentMethodsFlowType,
  setDailyLoading,
  setCategoryLoading,
  setMetricsLoading,
  setMonthlyTrendLoading,
  setPaymentMethodsLoading,
  setDailySpendingData,
  setCategoryDistribution,
  setAnalyticsSummary,
  setMonthlyTrendData,
  setPaymentMethodsData,
}) => {
  // Periodic simple mode
  useEffect(() => {
    if (!active || !Array.isArray(refetchFns) || refetchFns.length === 0)
      return;
    refetchFns.forEach((fn) => {
      try {
        fn && fn();
      } catch (e) {
        console.warn("DashboardDataRefetcher immediate refetch failed", e);
      }
    });
    const id = setInterval(() => {
      refetchFns.forEach((fn) => {
        try {
          fn && fn();
        } catch (e) {
          console.warn("DashboardDataRefetcher scheduled refetch failed", e);
        }
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [refetchFns, intervalMs, active]);

  // Orchestrated trigger mode (replicates previous inline logic)
  useEffect(() => {
    if (trigger == null) return; // allow zero trigger

    const fmtDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    // Daily Spending (no type here; dailyType handled separately in dashboard effects)
    if (setDailyLoading && setDailySpendingData) {
      (async () => {
        setDailyLoading(true);
        try {
          const now = new Date();
          const params = {};
          if (timeframe === "this_month" || timeframe === "month") {
            params.month = now.getMonth() + 1;
            params.year = now.getFullYear();
          } else if (timeframe === "last_month") {
            const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            params.month = d.getMonth() + 1;
            params.year = d.getFullYear();
          } else if (timeframe === "last_3_months" || timeframe === "last_3") {
            const end = now;
            const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            params.fromDate = start.toISOString().split("T")[0];
            params.toDate = end.toISOString().split("T")[0];
          }
          const res = await fetchDailySpending(params);
          setDailySpendingData(Array.isArray(res) ? res : []);
        } catch (e) {
          console.error("Refresh: daily spending failed", e);
          setDailySpendingData([]);
        } finally {
          setDailyLoading(false);
        }
      })();
    }

    // Categories
    if (setCategoryLoading && setCategoryDistribution) {
      (async () => {
        setCategoryLoading(true);
        try {
          const now = new Date();
          const params = {};
          if (
            categoryTimeframe === "this_month" ||
            categoryTimeframe === "month"
          ) {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = now;
            params.fromDate = fmtDate(start);
            params.toDate = fmtDate(end);
          } else if (categoryTimeframe === "last_month") {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            params.fromDate = fmtDate(start);
            params.toDate = fmtDate(end);
          } else if (
            categoryTimeframe === "last_3_months" ||
            categoryTimeframe === "last_3"
          ) {
            const end = now;
            const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            params.fromDate = fmtDate(start);
            params.toDate = fmtDate(end);
          }
          if (categoryFlowType === "gain") {
            params.flowType = "inflow";
            params.type = "gain";
          } else {
            params.flowType = "outflow";
            params.type = "loss";
          }
          let res = await fetchCategoriesSummary(params);
          if (!res || !res.summary || !res.summary.categoryTotals) {
            res = await fetchExpenseSummary(params);
          }
          if (res && res.summary && res.summary.categoryTotals) {
            setCategoryDistribution(res);
          } else if (Array.isArray(res)) {
            setCategoryDistribution(res);
          } else {
            setCategoryDistribution([]);
          }
        } catch (e) {
          console.error("Refresh: categories failed", e);
          setCategoryDistribution([]);
        } finally {
          setCategoryLoading(false);
        }
      })();
    }

    // Analytics Summary
    if (setMetricsLoading && setAnalyticsSummary) {
      (async () => {
        setMetricsLoading(true);
        try {
          const now = new Date();
          const params = {};
          if (timeframe === "this_month" || timeframe === "month") {
            params.month = now.getMonth() + 1;
            params.year = now.getFullYear();
          } else if (timeframe === "last_month") {
            const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            params.month = d.getMonth() + 1;
            params.year = d.getFullYear();
          } else if (timeframe === "last_3_months" || timeframe === "last_3") {
            const end = now;
            const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            params.fromDate = start.toISOString().split("T")[0];
            params.toDate = end.toISOString().split("T")[0];
          }
          const res = await fetchExpenseSummary(params);
          setAnalyticsSummary(res && typeof res === "object" ? res : null);
        } catch (e) {
          console.error("Refresh: summary failed", e);
        } finally {
          setMetricsLoading(false);
        }
      })();
    }

    // Monthly Trend
    if (setMonthlyTrendLoading && setMonthlyTrendData && trendYear != null) {
      (async () => {
        setMonthlyTrendLoading(true);
        try {
          const params = { year: trendYear };
          const res = await fetchMonthlyExpenses(params);
          const MONTHS = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          let normalized = null;
          if (
            res &&
            typeof res === "object" &&
            Array.isArray(res.labels) &&
            res.datasets &&
            res.datasets[0] &&
            Array.isArray(res.datasets[0].data)
          ) {
            normalized = {
              labels: res.labels,
              datasets: [{ data: res.datasets[0].data }],
            };
          } else if (Array.isArray(res)) {
            const values = new Array(12).fill(0);
            res.forEach((item) => {
              const label = (item.label ?? item.name ?? "").toString();
              let idx = -1;
              const mNum = Number(
                item.month ?? item.monthNumber ?? item.m ?? item.index
              );
              if (!Number.isNaN(mNum)) {
                idx = Math.min(11, Math.max(0, mNum - 1));
              } else if (label) {
                const short = label.slice(0, 3).toLowerCase();
                idx = MONTHS.findIndex((m) => m.toLowerCase() === short);
                if (idx === -1)
                  idx = MONTHS.findIndex((m) =>
                    m.toLowerCase().startsWith(short)
                  );
              }
              if (idx >= 0 && idx < 12) {
                const v = Number(
                  item.amount ??
                    item.total ??
                    item.value ??
                    item.expenses ??
                    item.sum ??
                    0
                );
                values[idx] = Number.isFinite(v) ? v : 0;
              }
            });
            normalized = { labels: MONTHS, datasets: [{ data: values }] };
          }
          setMonthlyTrendData(normalized || null);
        } catch (e) {
          console.error("Refresh: monthly trend failed", e);
          setMonthlyTrendData(null);
        } finally {
          setMonthlyTrendLoading(false);
        }
      })();
    }

    // Payment Methods
    if (setPaymentMethodsLoading && setPaymentMethodsData) {
      (async () => {
        setPaymentMethodsLoading(true);
        try {
          const now = new Date();
          const fmt = fmtDate;
          const params = {};
          if (
            paymentMethodsTimeframe === "this_month" ||
            paymentMethodsTimeframe === "month"
          ) {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = now;
            params.fromDate = fmt(start);
            params.toDate = fmt(end);
          } else if (paymentMethodsTimeframe === "last_month") {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            params.fromDate = fmt(start);
            params.toDate = fmt(end);
          } else if (
            paymentMethodsTimeframe === "last_3_months" ||
            paymentMethodsTimeframe === "last_3"
          ) {
            const end = now;
            const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            params.fromDate = fmt(start);
            params.toDate = fmt(end);
          }
          if (paymentMethodsFlowType === "gain") {
            params.flowType = "inflow";
            params.type = "gain";
          } else {
            params.flowType = "outflow";
            params.type = "loss";
          }
          const res = await fetchPaymentMethods(params);
          let normalized = null;
          if (
            res &&
            typeof res === "object" &&
            Array.isArray(res.labels) &&
            res.datasets &&
            res.datasets[0] &&
            Array.isArray(res.datasets[0].data)
          ) {
            normalized = {
              labels: res.labels,
              datasets: [{ data: res.datasets[0].data }],
            };
          } else if (Array.isArray(res)) {
            const labels = [];
            const values = [];
            res.forEach((item) => {
              const label = (
                item.label ??
                item.name ??
                item.method ??
                ""
              ).toString();
              const value = Number(
                item.amount ?? item.total ?? item.value ?? item.count ?? 0
              );
              if (label) {
                labels.push(label);
                values.push(Number.isFinite(value) ? value : 0);
              }
            });
            if (labels.length)
              normalized = { labels, datasets: [{ data: values }] };
          } else if (res && typeof res === "object") {
            const labels = Object.keys(res);
            const values = labels.map((k) => Number(res[k] ?? 0));
            if (labels.length)
              normalized = { labels, datasets: [{ data: values }] };
          }
          setPaymentMethodsData(normalized || null);
        } catch (e) {
          console.error("Refresh: payment methods failed", e);
          setPaymentMethodsData(null);
        } finally {
          setPaymentMethodsLoading(false);
        }
      })();
    }
  }, [trigger]);

  return null;
};

export default DashboardDataRefetcher;
