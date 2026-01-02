import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDetailedBudgetReport } from "../Redux/Budget/budget.action";

/**
 * Custom hook to fetch single budget report data using Redux
 * Fetches detailed budget report with grouped expenses
 */
const useSingleBudgetReport = (
  budgetId,
  timeFrame = "All",
  flowType = "all",
  targetId = null,
  customRange = null
) => {
  const dispatch = useDispatch();
  const budgetState = useSelector((store) => store.budget || {});
  const { loading = false, error = null } = budgetState;
  const [budgetData, setBudgetData] = useState(null);

  useEffect(() => {
    const fetchBudgetReport = async () => {
      if (!budgetId) {
        return;
      }

      try {
        const rangeType = timeFrame.toLowerCase();
        const offset = 0;

        // Calculate fromDate and toDate based on timeFrame
        let fromDate = null;
        let toDate = null;
        const now = new Date();

        // Helper to format date in LOCAL time (avoids UTC shift causing previous day like 31st of last month)
        const formatLocalDate = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        };

        if (timeFrame !== "all") {
          toDate = formatLocalDate(now); // Local date (YYYY-MM-DD) to avoid UTC off-by-one

          switch (timeFrame.toLowerCase()) {
            case "day":
            case "today":
              fromDate = toDate;
              break;
            case "week":
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
              fromDate = formatLocalDate(startOfWeek);
              break;
            case "month":
              const startOfMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
              );
              fromDate = formatLocalDate(startOfMonth);
              break;
            case "quarter":
              const currentQuarter = Math.floor(now.getMonth() / 3);
              const startOfQuarter = new Date(
                now.getFullYear(),
                currentQuarter * 3,
                1
              );
              fromDate = formatLocalDate(startOfQuarter);
              break;
            case "year":
              const startOfYear = new Date(now.getFullYear(), 0, 1);
              fromDate = formatLocalDate(startOfYear);
              break;
            case "budget":
              // For budget period, we'll use rangeType as we need budget start/end dates from backend
              fromDate = null;
              toDate = null;
              break;
            default:
              // Unknown timeframe, use rangeType
              fromDate = null;
              toDate = null;
          }
        }

        if (customRange?.fromDate && customRange?.toDate) {
          fromDate = customRange.fromDate.slice(0, 10);
          toDate = customRange.toDate.slice(0, 10);
        }

        // Dispatch Redux action with explicit dates if calculated
        const data = await dispatch(
          getDetailedBudgetReport(
            budgetId,
            targetId,
            rangeType,
            offset,
            flowType,
            fromDate,
            toDate
          )
        );

        // Transform the data for frontend consumption
        const transformedData = {
          summary: data.summary || {},
          categoryBreakdown: [],
          paymentMethodBreakdown: [],
          expenseGroups: [],
          rawData: data, // keep raw response for components that expect the original shape
        };

        // Prefer summary.categoryTotals (new shape) -> map into {name, amount, count, percentage}
        if (
          data.summary?.categoryTotals &&
          Array.isArray(data.summary.categoryTotals)
        ) {
          const categoryTotal = data.summary.categoryTotals.reduce(
            (sum, item) => sum + (item.totalAmount ?? 0),
            0
          );
          transformedData.categoryBreakdown = data.summary.categoryTotals.map(
            (item) => {
              const amount = item.totalAmount ?? item.total ?? item.value ?? 0;
              const percentage =
                categoryTotal > 0
                  ? Math.round((amount / categoryTotal) * 100 * 10) / 10
                  : 0;
              return {
                name:
                  item.category || item.name || item.label || item.expenseName,
                amount,
                count: item.count ?? item.transactions ?? 0,
                percentage,
              };
            }
          );
        } else if (data.summary?.expenseNameTotals) {
          // backward / fallback: use expenseNameTotals
          const expenseTotal = data.summary.expenseNameTotals.reduce(
            (sum, item) => sum + (item.totalAmount ?? 0),
            0
          );
          transformedData.categoryBreakdown =
            data.summary.expenseNameTotals.map((item) => {
              const amount = item.totalAmount ?? 0;
              const percentage =
                expenseTotal > 0
                  ? Math.round((amount / expenseTotal) * 100 * 10) / 10
                  : 0;
              return {
                name: item.expenseName,
                amount,
                count: item.count,
                percentage,
              };
            });
        }

        // Transform payment method totals to payment breakdown with percentage
        if (data.summary?.paymentMethodTotals) {
          const paymentTotal = data.summary.paymentMethodTotals.reduce(
            (sum, item) => sum + (item.totalAmount ?? 0),
            0
          );
          transformedData.paymentMethodBreakdown =
            data.summary.paymentMethodTotals.map((item) => {
              const amount = item.totalAmount ?? 0;
              const percentage =
                paymentTotal > 0
                  ? Math.round((amount / paymentTotal) * 100 * 10) / 10
                  : 0;
              return {
                name: item.paymentMethod,
                method: item.paymentMethod, // for SharedDistributionChart payment mode
                amount,
                totalAmount: amount, // for SharedDistributionChart payment mode
                count: item.count,
                percentage,
              };
            });
        }

        // Transform expense groups for overview cards (needs totalAmount, transactions, expenses)
        // Format compatible with SharedOverviewCards expenses mode
        if (data) {
          const expenseGroups = [];
          Object.keys(data).forEach((key) => {
            if (key !== "summary") {
              const group = data[key];
              expenseGroups.push({
                groupName: key,
                method: key, // for overview card naming
                expenseCount: group.expenseCount,
                totalAmount: group.totalAmount,
                transactions: group.expenseCount, // count for overview cards
                expenses: group.expenses || [],
              });
            }
          });
          transformedData.expenseGroups = expenseGroups;
        }

        setBudgetData(transformedData);
      } catch (err) {
        console.error("Error fetching budget report:", err);
      }
    };

    fetchBudgetReport();
  }, [budgetId, timeFrame, flowType, targetId, customRange, dispatch]);

  return {
    loading,
    error: error?.message || error,
    budgetData,
  };
};

export default useSingleBudgetReport;
