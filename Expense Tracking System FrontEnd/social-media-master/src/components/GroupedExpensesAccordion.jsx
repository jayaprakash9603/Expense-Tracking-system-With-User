import React, { useMemo } from "react";
import { Box } from "@mui/material";
import GenericAccordionGroup from "./GenericAccordionGroup";
import { useTheme } from "../hooks/useTheme";
import { getPaymentMethodIcon } from "../utils/iconMapping";

/**
 * GroupedExpensesAccordion
 * Displays expenses grouped by payment method using grouped /cashflow API response.
 * Accepts either:
 *    - methods array already normalized: [{ method, totalAmount, transactions, expenses }]
 *    - rawData: original grouped API object with keys for payment methods and a summary key
 * Computes: percentage of total, average per transaction, total credit due per group.
 */
const GroupedExpensesAccordion = ({
  methods = [],
  rawData,
  summary,
  currencySymbol = "₹",
}) => {
  const { colors, mode } = useTheme();
  // Normalize source: prefer explicit methods array, else derive from rawData
  const sourceMethods = useMemo(() => {
    if (Array.isArray(methods) && methods.length) return methods;
    if (rawData && typeof rawData === "object") {
      return Object.entries(rawData)
        .filter(([k]) => k !== "summary")
        .map(([methodName, block]) => ({
          method: methodName,
          totalAmount: Number(block?.totalAmount || 0),
          transactions: Number(
            block?.expenseCount ||
              (block?.expenses ? block.expenses.length : 0),
          ),
          expenses: block?.expenses || [],
        }));
    }
    return [];
  }, [methods, rawData]);

  const grandTotal = Number(summary?.totalAmount || 0);

  const groups = useMemo(() => {
    return sourceMethods
      .map((m) => {
        const total = Number(m.totalAmount || 0);
        const rawItems = Array.isArray(m.expenses) ? m.expenses : [];
        // Sort individual expenses descending by their primary amount (amount or netAmount fallback)
        const items = [...rawItems].sort((a, b) => {
          const detA = a?.details || a?.expense || {};
          const detB = b?.details || b?.expense || {};
          const aAmt = Number(detA?.amount ?? detA?.netAmount ?? 0);
          const bAmt = Number(detB?.amount ?? detB?.netAmount ?? 0);
          return bAmt - aAmt; // descending
        });
        const count = Number(m.transactions || items.length);
        const percentage =
          grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(2) : "0.00";
        const avgPerTransaction =
          count > 0 ? (total / count).toFixed(2) : "0.00";
        const creditDueTotal = items.reduce((sum, row) => {
          const details = row?.details || row?.expense || {};
          return sum + Number(details?.creditDue || 0);
        }, 0);
        return {
          label: m.method,
          totalAmount: total,
          count,
          items,
          percentage,
          avgPerTransaction,
          creditDueTotal,
        };
      })
      .sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount)); // groups descending by totalAmount
  }, [sourceMethods, grandTotal]);

  const columns = [
    {
      key: "date",
      label: "Date",
      width: "100px",
      value: (row) => row.date,
      sortValue: (row) => {
        const t = row?.date ? new Date(row.date).getTime() : 0;
        return Number.isFinite(t) ? t : 0;
      },
    },
    {
      key: "name",
      label: "Expense Name",
      width: "230px",
      value: (row) => (row.details || row.expense)?.expenseName || "-",
      sortValue: (row) =>
        String((row.details || row.expense)?.expenseName || "").toLowerCase(),
    },
    {
      key: "amount",
      label: "Amount",
      width: "100px",
      value: (row) => {
        const d = row.details || row.expense || {};
        return d.amount ?? d.netAmount ?? 0;
      },
      sortValue: (row) => {
        const d = row.details || row.expense || {};
        return Number(d.amount ?? d.netAmount ?? 0);
      },
      className: (row) => {
        const d = row.details || row.expense || {};
        const rawType = (d.type || "").toLowerCase();
        if (rawType === "loss") return "pm-negative";
        if (rawType === "gain" || rawType === "profit") return "pm-positive";
        const amt = Number(d.amount ?? d.netAmount ?? 0);
        return amt < 0 ? "pm-negative" : "pm-positive";
      },
    },
    {
      key: "netAmount",
      label: "Net",
      width: "90px",
      value: (row) => {
        const d = row.details || row.expense || {};
        return d.netAmount ?? d.amount ?? 0;
      },
      sortValue: (row) => {
        const d = row.details || row.expense || {};
        return Number(d.netAmount ?? d.amount ?? 0);
      },
      className: (row) => {
        const d = row.details || row.expense || {};
        const net = Number(d.netAmount ?? d.amount ?? 0);
        return net < 0 ? "pm-negative" : "pm-positive";
      },
    },
    {
      key: "creditDue",
      label: "Credit Due",
      width: "110px",
      value: (row) => {
        const d = row.details || row.expense || {};
        return d.creditDue != null ? d.creditDue : "-";
      },
      sortValue: (row) => {
        const d = row.details || row.expense || {};
        return Number(d.creditDue ?? 0);
      },
    },
    {
      key: "comments",
      label: "Comments",
      width: "240px",
      value: (row) => (row.details || row.expense)?.comments || "",
      sortValue: (row) =>
        String((row.details || row.expense)?.comments || "").toLowerCase(),
    },
  ];

  const classify = (row) => {
    const d = row.details || row.expense || {};
    const rawType = (d.type || "").toLowerCase();
    if (rawType === "loss") return "loss";
    if (rawType === "gain" || rawType === "profit") return "profit";
    const amt = Number(d.amount ?? d.netAmount ?? 0);
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
          🧾 Expenses Breakdown
        </h3>
        <div
          className="chart-subtitle"
          style={{
            color: mode === "dark" ? "#888" : "#666",
            fontSize: "14px",
            marginBottom: "8px",
          }}
        >
          Expand a group to inspect its individual expense entries
        </div>
      </div>
      <div style={themeVars}>
        <GenericAccordionGroup
          groups={groups}
          currencySymbol={currencySymbol}
          enableGroupSearch
          enableGroupSort
          enableRowSearch
          enableRowSortControls
          enableSelection
          classify={classify}
          columns={columns}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 20, 50]}
          headerRender={(group, isOpen, onToggle) => (
            <button
              type="button"
              className="pm-accordion-header"
              onClick={onToggle}
              aria-expanded={isOpen}
              style={{
                color: colors.primary_text,
              }}
            >
              <div className="pm-header-left boxed-metrics inline-metrics">
                <span className="metric-box name" title={group.label}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    {getPaymentMethodIcon(group.label, {
                      sx: { fontSize: 18, color: colors.primary_accent },
                    })}
                    {group.label}
                  </Box>
                </span>
                <span className="metric-box tx" title="Transactions">
                  Count {group.count}
                </span>
                {group.creditDueTotal > 0 && (
                  <span className="metric-box credit" title="Total Credit Due">
                    Due {currencySymbol}
                    {group.creditDueTotal.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="pm-header-right">
                <span
                  className="metric-box avg"
                  title="Average per Transaction"
                >
                  Avg {currencySymbol}
                  {group.avgPerTransaction}
                </span>
                <span className="metric-box amount" title="Total Amount">
                  {currencySymbol}
                  {Number(group.totalAmount || 0).toLocaleString()} (
                  {group.percentage}%)
                </span>
                <span className="pm-chevron" aria-hidden>
                  {isOpen ? "▾" : "▸"}
                </span>
              </div>
            </button>
          )}
        />
      </div>
    </div>
  );
};

export default GroupedExpensesAccordion;
