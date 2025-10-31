import React from "react";
import GenericAccordionGroup from "./GenericAccordionGroup";
import useUserSettings from "../hooks/useUserSettings";
import { useTheme } from "../hooks/useTheme";

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
      value: (row) => row.details?.expenseName || "-",
    },
    {
      key: "amount",
      label: "Amount",
      width: "100px",
      value: (row) => row.details?.amount ?? row.details?.netAmount ?? 0,
      sortValue: (row) =>
        Number(row.details?.amount ?? row.details?.netAmount ?? 0),
      className: (row) => {
        const rawType = (row?.details?.type || "").toLowerCase();
        if (rawType === "loss") return "pm-negative";
        if (rawType === "gain" || rawType === "profit") return "pm-positive";
        const amt = Number(
          row?.details?.amount ?? row?.details?.netAmount ?? 0
        );
        return amt < 0 ? "pm-negative" : "pm-positive";
      },
    },
    {
      key: "payment",
      label: "Payment",
      width: "200px",
      value: (row) => row.details?.paymentMethod || "-",
    },
    {
      key: "creditDue",
      label: "Credit Due",
      width: "110px",
      value: (row) =>
        row.details?.creditDue != null ? row.details.creditDue : "-",
      sortValue: (row) => Number(row.details?.creditDue ?? 0),
    },
    {
      key: "comments",
      label: "Comments",
      value: (row) => row.details?.comments || "",
    },
  ];

  const classify = (row) => {
    const rawType = (row?.details?.type || "").toLowerCase();
    if (rawType === "loss") return "loss";
    if (rawType === "gain" || rawType === "profit") return "profit";
    const amt = Number(row?.details?.amount ?? row?.details?.netAmount ?? 0);
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
            marginBottom: "16px",
          }}
        >
          Expandable per-category transactions with tabs & sorting
        </div>
      </div>
      <div style={themeVars}>
        <GenericAccordionGroup
          groups={groups}
          currencySymbol={displayCurrency}
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
                    {group.label}
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
