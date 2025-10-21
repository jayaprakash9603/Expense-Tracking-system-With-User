import React, { useMemo } from "react";
import GenericAccordionGroup from "./GenericAccordionGroup";

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
            block?.expenseCount || (block?.expenses ? block.expenses.length : 0)
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
          const aAmt = Number(a?.details?.amount ?? a?.details?.netAmount ?? 0);
          const bAmt = Number(b?.details?.amount ?? b?.details?.netAmount ?? 0);
          return bAmt - aAmt; // descending
        });
        const count = Number(m.transactions || items.length);
        const percentage =
          grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(2) : "0.00";
        const avgPerTransaction =
          count > 0 ? (total / count).toFixed(2) : "0.00";
        const creditDueTotal = items.reduce(
          (sum, row) => sum + Number(row?.details?.creditDue || 0),
          0
        );
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
    { key: "date", label: "Date", width: "110px", value: (row) => row.date },
    {
      key: "name",
      label: "Expense Name",
      width: "240px",
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
      key: "netAmount",
      label: "Net",
      width: "100px",
      value: (row) => row.details?.netAmount ?? row.details?.amount ?? 0,
      sortValue: (row) =>
        Number(row.details?.netAmount ?? row.details?.amount ?? 0),
      className: (row) => {
        const net = Number(
          row?.details?.netAmount ?? row?.details?.amount ?? 0
        );
        return net < 0 ? "pm-negative" : "pm-positive";
      },
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
      width: "260px",
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
        <h3>🧾 Expenses Breakdown</h3>
        <div className="chart-subtitle">
          Expand a group to inspect its individual expense entries
        </div>
      </div>
      <GenericAccordionGroup
        groups={groups}
        currencySymbol={currencySymbol}
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
          >
            <div className="pm-header-left boxed-metrics inline-metrics">
              <span className="metric-box name" title={group.label}>
                {group.label}
              </span>
              <span className="metric-box tx" title="Transactions">
                Tx {group.count}
              </span>
              {group.creditDueTotal > 0 && (
                <span className="metric-box credit" title="Total Credit Due">
                  Due {currencySymbol}
                  {group.creditDueTotal.toLocaleString()}
                </span>
              )}
            </div>
            <div className="pm-header-right">
              <span className="metric-box avg" title="Average per Transaction">
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
  );
};

export default GroupedExpensesAccordion;
