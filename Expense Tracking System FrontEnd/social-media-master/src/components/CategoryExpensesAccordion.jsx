import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import GenericAccordionGroup from "./GenericAccordionGroup";
import useUserSettings from "../hooks/useUserSettings";
import { useTheme } from "../hooks/useTheme";
import { getCategoryIcon } from "../utils/iconMapping";

const getExpenseDetails = (row) => row?.expense || row?.details || row || {};
const getNormalizedType = (row) => {
  const details = getExpenseDetails(row);
  return String(details?.type || row?.type || "")
    .trim()
    .toLowerCase();
};
const getNormalizedAmount = (row) => {
  const details = getExpenseDetails(row);
  return details?.amount ?? details?.netAmount ?? row?.amount ?? 0;
};

/**
 * CategoryExpensesAccordion
 * Standalone reusable accordion component for category expense breakdown.
 * Mirrors the structure used for PaymentMethodAccordionGroup for consistency.
 *
 * Props:
 * - categories: Array of category spending objects (name, amount, transactions, expenses, percentage, avgPerTransaction)
 * - currencySymbol: String currency symbol displayed with amounts (optional, uses user settings if not provided).
 */
const CategoryExpensesAccordion = ({ categories = [], currencySymbol }) => {
  const settings = useUserSettings();
  const { colors, mode } = useTheme();
  const navigate = useNavigate();

  // Navigate to view expense page
  const handleNameClick = useCallback(
    (e, expenseId) => {
      e.preventDefault();
      e.stopPropagation();
      if (expenseId) {
        navigate(`/expenses/view/${expenseId}`);
      }
    },
    [navigate],
  );

  // Generate full URL for tooltip
  const getViewExpenseUrl = useCallback((expenseId) => {
    return `${window.location.origin}/expenses/view/${expenseId}`;
  }, []);

  // Use provided currency symbol or get from user settings
  const displayCurrency = currencySymbol || settings.getCurrency().symbol;
  const groups = (Array.isArray(categories) ? categories : []).map((c) => ({
    label: c.name,
    totalAmount: c.amount,
    count: c.transactions,
    items: c.expenses || [],
    percentage: c.percentage,
    avgPerTransaction: c.avgPerTransaction,
  }));

  const columns = [
    { key: "date", label: "Date", width: "100px", value: (row) => row.date },
    {
      key: "name",
      label: "Name",
      width: "270px",
      value: (row) => getExpenseDetails(row)?.expenseName || "-",
      render: (val, row) => {
        const expenseId = row?.id || row?.details?.id || row?.expense?.id;
        if (!expenseId) return val || "-";
        return (
          <span
            title={getViewExpenseUrl(expenseId)}
            onClick={(e) => handleNameClick(e, expenseId)}
            style={{
              color: colors.primary_text,
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
      label: "Amount",
      width: "100px",
      value: (row) => getNormalizedAmount(row),
      sortValue: (row) => Number(getNormalizedAmount(row) ?? 0),
      className: (row) => {
        const rawType = getNormalizedType(row);
        if (rawType === "loss") return "pm-negative";
        if (rawType === "gain" || rawType === "profit" || rawType === "income")
          return "pm-positive";
        const amt = Number(getNormalizedAmount(row) ?? 0);
        return amt < 0 ? "pm-negative" : "pm-positive";
      },
    },
    {
      key: "payment",
      label: "Payment",
      width: "200px",
      value: (row) => getExpenseDetails(row)?.paymentMethod || "-",
    },
    {
      key: "creditDue",
      label: "Credit Due",
      width: "110px",
      value: (row) =>
        getExpenseDetails(row)?.creditDue != null
          ? getExpenseDetails(row).creditDue
          : "-",
      sortValue: (row) => Number(getExpenseDetails(row)?.creditDue ?? 0),
    },
    {
      key: "comments",
      label: "Comments",
      value: (row) => getExpenseDetails(row)?.comments || "",
    },
  ];

  const classify = (row) => {
    const rawType = getNormalizedType(row);
    if (rawType === "loss") return "loss";
    if (rawType === "gain" || rawType === "profit" || rawType === "income")
      return "profit";
    const amt = Number(getNormalizedAmount(row) ?? 0);
    if (amt < 0) return "loss";
    if (amt > 0) return "profit";
    return "all";
  };

  // Theme-aware CSS variables
  const themeVars = {
    "--pm-bg-primary": mode === "dark" ? "#141414" : "#ffffff",
    "--pm-bg-secondary": mode === "dark" ? "#1d1d1f" : "#f5f5f5",
    "--pm-bg-tertiary": mode === "dark" ? "#1b1b1b" : "#fafafa",
    "--pm-border-color": colors.border_color,
    "--pm-text-primary": colors.primary_text,
    "--pm-text-secondary": mode === "dark" ? "#ccc" : "#555",
    "--pm-text-tertiary": mode === "dark" ? "#bbb" : "#666",
    "--pm-accent-color": colors.primary_accent,
    "--pm-scrollbar-thumb": colors.primary_accent,
    "--pm-scrollbar-track": mode === "dark" ? "#1d1d1f" : "#e8e8e8",
  };

  return (
    <div
      className="chart-container"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <div className="chart-header">
        <h3 style={{ color: colors.primary_text, margin: "0 0 8px 0" }}>
          📋 Category Expenses Detail
        </h3>
        <div
          className="chart-subtitle"
          style={{
            color: mode === "dark" ? "#888" : "#666",
            fontSize: "14px",
            marginBottom: "8px",
          }}
        >
          Expandable per-category transactions with tabs & sorting
        </div>
      </div>
      <div style={themeVars}>
        <GenericAccordionGroup
          groups={groups}
          currencySymbol={displayCurrency}
          enableGroupSearch
          enableGroupSort
          enableRowSearch
          enableRowSortControls
          enableSelection
          classify={classify}
          columns={columns}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 20, 50]}
          headerRender={(group, isOpen, onToggle) => {
            return (
              <button
                type="button"
                className="pm-accordion-header category-perf-header"
                onClick={onToggle}
                aria-expanded={isOpen}
                style={{
                  color: colors.primary_text,
                }}
              >
                <div className="pm-header-left category-perf-left boxed-metrics inline-metrics">
                  <span className="metric-box name" title={group.label}>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      {getCategoryIcon(group.label, {
                        sx: { fontSize: 18, color: colors.primary_accent },
                      })}
                      {group.label}
                    </Box>
                  </span>
                  <span className="metric-box tx" title="Count">
                    Count - {group.count}
                  </span>
                </div>
                <div className="pm-header-right">
                  <span
                    className="metric-box avg"
                    title="Average per Transaction"
                  >
                    Avg - {displayCurrency}
                    {group.avgPerTransaction}
                  </span>
                  <span className="metric-box amount" title="Total Amount">
                    {displayCurrency}
                    {Number(group.totalAmount || 0).toLocaleString()} (
                    {group.percentage}%)
                  </span>
                  <span className="pm-chevron" aria-hidden>
                    {isOpen ? "▾" : "▸"}
                  </span>
                </div>
              </button>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CategoryExpensesAccordion;
