import React from "react";
import GenericAccordionGroup from "./GenericAccordionGroup";

/**
 * CategoryExpensesAccordion
 * Standalone reusable accordion component for category expense breakdown.
 * Mirrors the structure used for PaymentMethodAccordionGroup for consistency.
 *
 * Props:
 * - categories: Array of category spending objects (name, amount, transactions, expenses, percentage, avgPerTransaction)
 * - currencySymbol: String currency symbol displayed with amounts (default '₹').
 */
const CategoryExpensesAccordion = ({
  categories = [],
  currencySymbol = "₹",
}) => {
  const groups = (Array.isArray(categories) ? categories : []).map((c) => ({
    label: c.name,
    totalAmount: c.amount,
    count: c.transactions,
    items: c.expenses || [],
    percentage: c.percentage,
    avgPerTransaction: c.avgPerTransaction,
  }));

  const columns = [
    { key: "date", label: "Date", width: "110px", value: (row) => row.date },
    {
      key: "name",
      label: "Name",
      width: "280px",
      value: (row) => row.details?.expenseName || "-",
    },
    {
      key: "amount",
      label: "Amount",
      width: "110px",
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
      width: "220px",
      value: (row) => row.details?.paymentMethod || "-",
    },
    {
      key: "creditDue",
      label: "Credit Due",
      width: "120px",
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

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>📋 Category Expenses Detail</h3>
        <div className="chart-subtitle">
          Expandable per-category transactions with tabs & sorting
        </div>
      </div>
      <GenericAccordionGroup
        groups={groups}
        currencySymbol={currencySymbol}
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
                  Avg - ₹{group.avgPerTransaction}
                </span>
                <span className="metric-box amount" title="Total Amount">
                  ₹{Number(group.totalAmount || 0).toLocaleString()} (
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
  );
};

export default CategoryExpensesAccordion;
