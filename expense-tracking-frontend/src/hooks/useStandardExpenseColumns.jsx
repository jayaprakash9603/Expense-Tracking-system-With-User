import { useMemo } from "react";
import dayjs from "dayjs";
import { useTheme } from "./useTheme";

/**
 * Shared hook to generate standard expense table columns.
 * Used by GroupedExpensesAccordion, NewBudget, etc.
 *
 * @param {Function} t - Translation function
 * @param {Function} navigate - Navigation function (for view link)
 * @param {Object} options - { includeCredit, includeNet, includeActions, ... }
 */
export const useStandardExpenseColumns = (t, navigate, options = {}) => {
  const { colors } = useTheme();

  // Helper to safely access data whether it's flat or nested (row.details/row.expense)
  const getValue = (row, field) => {
    const d = row?.details || row?.expense || row || {};
    return d[field];
  };

  const getAmount = (row) => {
    const d = row?.details || row?.expense || row || {};
    return Number(d.amount ?? d.netAmount ?? 0);
  };

  const getNetAmount = (row) => {
    const d = row?.details || row?.expense || row || {};
    return Number(d.netAmount ?? d.amount ?? 0);
  };

  const getExpenseId = (row) => {
    const d = row?.details || row?.expense || row || {};
    return d.id;
  };

  // Generate view URL for tooltips
  const getViewExpenseUrl = (expenseId) => {
    return `${window.location.origin}/expenses/view/${expenseId}`;
  };

  // Click handler for expense name
  const handleNameClick = (e, expenseId) => {
    e.preventDefault();
    e.stopPropagation();
    if (expenseId && navigate) {
      navigate(`/expenses/view/${expenseId}`);
    }
  };

  return useMemo(() => {
    const cols = [
      {
        key: "date",
        label: t ? t("date") || "Date" : "Date",
        filterable: true,
        filterType: "date",
        sortable: true,
        width: "100px",
        value: (row) => row.date, // Date is usually on the root row object in grouped data
        render: (val) => (val ? dayjs(val).format("DD MMM YYYY") : "-"),
        sortValue: (row) => (row.date ? new Date(row.date).getTime() : 0),
      },
      {
        key: "categoryName",
        label: t ? t("category") || "Category" : "Category",
        filterable: true,
        filterType: "text",
        sortable: true,
        width: "15%",
        value: (row) => row.categoryName || getValue(row, "categoryName"),
        render: (value) => value || "-",
      },
      {
        key: "expenseName",
        label: t ? t("expenseName") || "Expense" : "Expense Name",
        filterable: true,
        filterType: "text",
        sortable: true,
        width: "230px", // Matched GroupedExpensesAccordion
        value: (row) => getValue(row, "expenseName"),
        sortValue: (row) => (getValue(row, "expenseName") || "").toLowerCase(),
        render: (val, row) => {
          const id = getExpenseId(row);
          if (!id || !navigate) return val || "-";
          return (
            <span
              title={getViewExpenseUrl(id)}
              onClick={(e) => handleNameClick(e, id)}
              style={{
                color: colors?.primary_text || "inherit",
                cursor: "pointer",
                transition: "text-decoration 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              {val || "-"}
            </span>
          );
        },
      },
      {
        key: "amount",
        label: t ? t("amount") || "Amount" : "Amount",
        filterable: true,
        filterType: "number",
        sortable: true,
        width: "100px",
        value: (row) => getAmount(row),
        sortValue: (row) => getAmount(row),
        className: (row) => {
          const d = row?.details || row?.expense || row || {};
          const rawType = (d.type || "").toLowerCase();
          if (rawType === "loss") return "pm-negative";
          if (rawType === "gain" || rawType === "profit") return "pm-positive";
          const amt = getAmount(row);
          return amt < 0 ? "pm-negative" : "pm-positive";
        },
      },
    ];

    if (options.includeNet) {
      cols.push({
        key: "netAmount",
        label: t ? t("netAmount") || "Net" : "Net",
        width: "90px",
        value: (row) => getNetAmount(row),
        sortValue: (row) => getNetAmount(row),
        className: (row) => {
          const net = getNetAmount(row);
          return net < 0 ? "pm-negative" : "pm-positive";
        },
      });
    }

    if (options.includeCredit) {
      cols.push({
        key: "creditDue",
        label: t ? t("creditDue") || "Credit Due" : "Credit Due",
        width: "110px",
        value: (row) => {
          const val = getValue(row, "creditDue");
          return val != null ? val : "-";
        },
        sortValue: (row) => Number(getValue(row, "creditDue") || 0),
      });
    }

    cols.push({
      key: "comments",
      label: t ? t("comments") || "Comments" : "Comments",
      filterable: true,
      filterType: "text",
      sortable: true,
      width: "240px",
      value: (row) => getValue(row, "comments"),
    });

    return cols;
  }, [t, colors, navigate, options.includeCredit, options.includeNet]);
};
