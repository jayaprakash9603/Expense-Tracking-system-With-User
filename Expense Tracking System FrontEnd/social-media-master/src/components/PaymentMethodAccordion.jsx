import React from "react";
import { Box, Grid, Card, Typography } from "@mui/material";
import "./PaymentMethodAccordion.css";
import GenericAccordionGroup, {
  GenericAccordionGroup as Generic,
} from "./GenericAccordionGroup";
import useUserSettings from "../hooks/useUserSettings";

/**
 * Generic accordion group component for displaying grouped expenses by a key (e.g. payment method).
 * Each accordion item header shows summary (paymentMethod, totalAmount, expenseCount).
 * On expand it shows two tabs (Loss / Gain) and filters the expenses accordingly.
 * Reusable: supply any grouping objects matching the shape below.
 *
 * Item shape (method object expected): {
 *   method: string;               // group name (e.g. payment method)
 *   totalAmount: number;          // aggregated amount for the group
 *   transactions|expenseCount: number; // number of expenses
 *   expenses: [
 *     {
 *       id: (string|number),
 *       date: string (YYYY-MM-DD) | Date,
 *       details: {
 *         expenseName: string,
 *         amount?: number,
 *         netAmount?: number,     // may be negative for loss
 *         type?: 'loss'|'profit'|string,
 *         comments?: string,
 *         paymentMethod?: string,
 *         creditDue?: number
 *       }
 *     }
 *   ]
 * }
 *
 * Props:
 *  - methods: array of method objects (see above)
 *  - currencySymbol: optional currency symbol (default '₹')
 *  - defaultOpen: index or method string to open initially
 *  - onToggle?: (method, isOpen) => void
 *  - renderExpenseRow?: custom renderer
 */
// Usage Example:
// <PaymentMethodAccordionGroup methods={methodsData} defaultOpen={0} />
// where methodsData = [{ method:'cash', totalAmount: 1200, transactions: 5, expenses:[...] }, ...]
export default function PaymentMethodAccordionGroup({
  methods = [],
  currencySymbol,
  defaultOpen = null,
  onToggle,
  renderExpenseRow,
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const settings = useUserSettings();
  const displayCurrency = currencySymbol || settings.getCurrency().symbol;

  // Compute grand total for percentage calculation
  const grandTotal = methods.reduce(
    (sum, m) => sum + Number(m.totalAmount || 0),
    0
  );
  const groups = methods.map((m) => {
    const count =
      m.transactions || m.expenseCount || (m.expenses ? m.expenses.length : 0);
    const total = Number(m.totalAmount || 0);
    const avg = count > 0 ? Math.round(total / count) : 0;
    const pct =
      grandTotal > 0 ? Number(((total / grandTotal) * 100).toFixed(1)) : 0;
    return {
      label: m.method,
      totalAmount: total,
      count,
      items: m.expenses || [],
      percentage: pct,
      avgPerTransaction: avg,
    };
  });

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
      value: (row) => {
        const amt = row.details?.amount ?? row.details?.netAmount ?? 0;
        return amt;
      },
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
      value: (row) => row.details?.paymentMethod,
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

  return (
    <Box>
      <GenericAccordionGroup
        groups={groups}
        currencySymbol={displayCurrency}
        defaultOpen={defaultOpen}
        classify={classify}
        onToggle={onToggle}
        rowRender={
          renderExpenseRow
            ? (row, group, tab) => renderExpenseRow(row, group, tab)
            : undefined
        }
        columns={columns}
        defaultPageSize={defaultPageSize}
        pageSizeOptions={pageSizeOptions}
        headerRender={(group, isOpen, toggle) => {
          return (
            <button
              type="button"
              className="pm-accordion-header category-perf-header"
              onClick={toggle}
              aria-expanded={isOpen}
            >
              <div className="pm-header-left boxed-metrics inline-metrics">
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
                  style={{ marginRight: 8 }}
                >
                  Avg - {displayCurrency}
                  {group.avgPerTransaction}
                </span>
                <span
                  className="metric-box amount"
                  title="Total Amount"
                  style={{ marginRight: 8 }}
                >
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
    </Box>
  );
}
