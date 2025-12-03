import React from "react";
import PropTypes from "prop-types";
import { Typography, Box, Chip } from "@mui/material";
import { useTheme } from "../hooks/useTheme";
import useUserSettings from "../hooks/useUserSettings";
import { formatDate } from "../utils/dateFormatter";
import { formatAmount as fmt } from "../utils/formatAmount";
import { GenericAccordionGroup } from "./GenericAccordionGroup";

/**
 * Budget Accordion Group - uses GenericAccordionGroup for consistent UI
 */
const BudgetAccordionGroup = ({ budgets }) => {
  const { colors, mode } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
  const isDarkMode = mode === "dark";

  if (!budgets || budgets.length === 0) {
    return (
      <Box
        style={{
          padding: "32px",
          textAlign: "center",
          color: colors.secondary_text,
        }}
      >
        <Typography variant="h6">No budgets found</Typography>
        <Typography variant="body2" style={{ marginTop: "8px" }}>
          Try adjusting your filters or create a new budget
        </Typography>
      </Box>
    );
  }

  // Transform budgets to GenericAccordionGroup format with defensive deduplication
  const uniqueBudgets = [];
  const seenBudgetKeys = new Set();
  for (const b of budgets) {
    const key = b.budgetId ?? b.budgetName ?? `budget-${uniqueBudgets.length}`;
    if (!seenBudgetKeys.has(key)) {
      seenBudgetKeys.add(key);
      uniqueBudgets.push(b);
    }
  }
  const groups = uniqueBudgets.map((budget) => ({
    label: budget.budgetName,
    count: budget.transactions || budget.expenses?.length || 0,
    totalAmount: budget.totalLoss,
    items: budget.expenses || [],
    // Store budget metadata for custom header
    _metadata: budget,
  }));

  // Define tabs
  const tabs = [
    { key: "all", label: "All" },
    { key: "loss", label: "Loss" },
    { key: "profit", label: "Gain" },
  ];

  // Define columns for expense table
  const columns = [
    {
      key: "name",
      label: "Expense Name",
      width: "30%",
      value: (row) => row.name || "-",
      sortValue: (row) => (row.name || "").toLowerCase(),
    },
    {
      key: "category",
      label: "Category",
      width: "20%",
      value: (row) => row.category || "-",
      sortValue: (row) => (row.category || "").toLowerCase(),
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      width: "20%",
      value: (row) => row.paymentMethod || "-",
      sortValue: (row) => (row.paymentMethod || "").toLowerCase(),
    },
    {
      key: "date",
      label: "Date",
      width: "15%",
      value: (row) => (row.date ? formatDate(row.date, dateFormat) : "-"),
      sortValue: (row) => (row.date ? new Date(row.date).getTime() : 0),
    },
    {
      key: "amount",
      label: "Amount",
      width: "15%",
      value: (row) => fmt(row.amount || 0, { currencySymbol }),
      sortValue: (row) => row.amount || 0,
      className: (row) => {
        const type = row.type?.toLowerCase() || "";
        if (type === "loss") return "pm-amount-loss";
        if (type === "gain") return "pm-amount-gain";
        return "";
      },
    },
  ];

  // Classify function for tab filtering
  const classify = (row) => {
    const type = row.type?.toLowerCase() || "";
    if (type === "loss") return "loss";
    if (type === "gain") return "profit";
    // Fallback to amount-based classification
    const amount = row.amount || 0;
    return amount < 0 ? "loss" : "profit";
  };

  // Custom header renderer for budget-specific display
  const headerRender = (group, isOpen, toggleFn) => {
    const budget = group._metadata;
    let percentageColor = "#51cf66";
    if (budget.percentageUsed >= 100) {
      percentageColor = "#ff6b6b";
    } else if (budget.percentageUsed >= 80) {
      percentageColor = "#ffa94d";
    }

    return (
      <button
        type="button"
        className="pm-accordion-header"
        onClick={toggleFn}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? "Collapse" : "Expand"} budget ${
          budget.budgetName
        }`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "16px",
          minHeight: "72px",
        }}
      >
        {/* Left section */}
        <Box style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Box
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: budget.color || colors.accent_color,
              }}
            />
            <span
              className="pm-method-name"
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              {budget.budgetName}
            </span>
            {!budget.valid && (
              <Chip
                label="Expired"
                size="small"
                style={{
                  background: "rgba(255, 107, 107, 0.2)",
                  color: "#ff6b6b",
                  fontSize: "11px",
                  height: "24px",
                }}
              />
            )}
          </Box>
          <Typography
            variant="body2"
            style={{
              color: colors.secondary_text,
              marginLeft: "24px",
              fontSize: "0.875rem",
            }}
          >
            {formatDate(budget.startDate, dateFormat)} -{" "}
            {formatDate(budget.endDate, dateFormat)}
          </Typography>
        </Box>

        {/* Right section with stats */}
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginRight: "8px",
          }}
        >
          <Box style={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              style={{ color: colors.secondary_text, display: "block" }}
            >
              Spent
            </Typography>
            <Typography
              variant="body1"
              style={{ color: colors.primary_text, fontWeight: 600 }}
            >
              {currencySymbol}
              {budget.totalLoss?.toFixed(2) || "0.00"}
            </Typography>
          </Box>

          <Box style={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              style={{ color: colors.secondary_text, display: "block" }}
            >
              Allocated
            </Typography>
            <Typography
              variant="body1"
              style={{ color: colors.primary_text, fontWeight: 600 }}
            >
              {currencySymbol}
              {budget.allocatedAmount?.toFixed(2) || "0.00"}
            </Typography>
          </Box>

          <Box style={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              style={{ color: colors.secondary_text, display: "block" }}
            >
              Used
            </Typography>
            <Typography
              variant="body1"
              style={{ color: percentageColor, fontWeight: 600 }}
            >
              {budget.percentageUsed?.toFixed(1) || "0.0"}%
            </Typography>
          </Box>

          <Chip
            label={`${budget.transactions || 0} tx`}
            style={{
              background: isDarkMode
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
              color: colors.primary_text,
              fontWeight: 500,
            }}
          />

          <span className="pm-chevron" aria-hidden>
            {isOpen ? "▾" : "▸"}
          </span>
        </Box>
      </button>
    );
  };

  // Custom row renderer to add budget summary above the table
  const rowRender = (row, group, activeTab) => {
    const type = row.type?.toLowerCase() || "";
    let amountClass = "";
    if (type === "loss") {
      amountClass = "pm-amount-loss";
    } else if (type === "gain") {
      amountClass = "pm-amount-gain";
    }

    return (
      <tr
        key={`${group._metadata?.budgetId || "budget"}-${
          row.expenseId || row.id || Math.random()
        }`}
      >
        <td>{row.name || "-"}</td>
        <td>{row.category || "-"}</td>
        <td>{row.paymentMethod || "-"}</td>
        <td>{row.date ? formatDate(row.date, dateFormat) : "-"}</td>
        <td className={amountClass}>
          {fmt(row.amount || 0, { currencySymbol })}
        </td>
      </tr>
    );
  };

  return (
    <Box style={{ padding: "8px 0" }}>
      <GenericAccordionGroup
        groups={groups}
        currencySymbol={currencySymbol}
        tabs={tabs}
        columns={columns}
        classify={classify}
        headerRender={headerRender}
        rowRender={rowRender}
        defaultPageSize={5}
        pageSizeOptions={[5, 10, 20, 50]}
        groupPaginationThreshold={5}
        defaultGroupsPerPage={5}
        groupPageSizeOptions={[5, 10, 20, 50]}
      />
    </Box>
  );
};

BudgetAccordionGroup.propTypes = {
  budgets: PropTypes.arrayOf(
    PropTypes.shape({
      budgetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      budgetName: PropTypes.string,
      transactions: PropTypes.number,
      totalLoss: PropTypes.number,
      allocatedAmount: PropTypes.number,
      percentageUsed: PropTypes.number,
      color: PropTypes.string,
      valid: PropTypes.bool,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      expenses: PropTypes.arrayOf(PropTypes.object),
    })
  ).isRequired,
};

export default BudgetAccordionGroup;
