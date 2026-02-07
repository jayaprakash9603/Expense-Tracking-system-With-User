import { useState, useMemo } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Configuration hook for Expense Table (Columns, Sorting, Filtering)
 * Matches the structure expected by GroupedDataTable.
 *
 * @param {Array} data - The list of expense objects
 * @param {Function} t - Translation function
 * @returns {Object} { columns, filteredRows, sort, setSort, columnFilters, setColumnFilters, search, setSearch }
 */
export const useExpenseTableConfig = (data = [], t) => {
  // State
  const [sort, setSort] = useState({ key: "date", direction: "desc" });
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({});

  // Helper to safely access nested expense fields
  const getExpenseField = (row, field) => row?.expense?.[field] || "";

  // Column Definitions
  const columns = useMemo(
    () => [
      {
        key: "date",
        label: t ? t("date") || "Date" : "Date",
        filterable: true,
        filterType: "date",
        sortable: true,
        width: "15%",
        value: (row) => row.date,
        render: (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-"),
      },
      {
        key: "expenseName",
        label: t ? t("expenseName") || "Expense" : "Expense Name",
        filterable: true,
        filterType: "text",
        sortable: true,
        width: "20%",
        value: (row) => getExpenseField(row, "expenseName"),
      },
      {
        key: "amount",
        label: t ? t("amount") || "Amount" : "Amount",
        filterable: true,
        filterType: "number",
        sortable: true,
        width: "10%",
        value: (row) => getExpenseField(row, "amount"),
        sortValue: (row) => parseFloat(getExpenseField(row, "amount") || 0),
      },
      {
        key: "paymentMethod",
        label: t ? t("paymentMethod") || "Payment" : "Payment Method",
        filterable: true,
        filterType: "text", // Could be select if we had predefined options easily available
        sortable: true,
        width: "15%",
        value: (row) => getExpenseField(row, "paymentMethod"),
        render: (value) =>
          value ? value.replace(/([A-Z])/g, " $1").trim() : "-",
      },
      {
        key: "type",
        label: t ? t("type") || "Type" : "Type",
        filterable: true,
        filterType: "text",
        sortable: true,
        width: "10%",
        value: (row) => getExpenseField(row, "type"),
        render: (value) => (value ? value.toUpperCase() : "-"),
      },
      {
        key: "comments",
        label: t ? t("comments") || "Comments" : "Comments",
        filterable: true,
        filterType: "text",
        sortable: true,
        width: "20%",
        value: (row) => getExpenseField(row, "comments"),
      },
    ],
    [t],
  );

  // Derived Data (Filtering)
  const filteredRows = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    let rows = [...data];

    // 1. Global Search (if implemented externally, usually overrides everything)
    if (search) {
      const lowerSearch = search.toLowerCase();
      rows = rows.filter((row) => {
        const name = getExpenseField(row, "expenseName").toLowerCase();
        const desc = getExpenseField(row, "comments").toLowerCase();
        const amt = String(getExpenseField(row, "amount"));
        return (
          name.includes(lowerSearch) ||
          desc.includes(lowerSearch) ||
          amt.includes(lowerSearch)
        );
      });
    }

    // 2. Column Filters
    Object.keys(columnFilters).forEach((key) => {
      const filter = columnFilters[key];
      if (!filter) return;

      const { operator, value } = filter;
      if (value === "" || value === null || value === undefined) {
        if (operator !== "empty" && operator !== "notEmpty") return;
      }

      rows = rows.filter((row) => {
        // Determine cell value based on key
        let cellValue;
        if (key === "date") cellValue = row.date;
        else cellValue = getExpenseField(row, key);

        // Text Logic
        if (
          key === "expenseName" ||
          key === "paymentMethod" ||
          key === "type" ||
          key === "comments"
        ) {
          const strVal = String(cellValue || "").toLowerCase();
          const filterStr = String(value || "").toLowerCase();

          if (operator === "contains") return strVal.includes(filterStr);
          if (operator === "equals") return strVal === filterStr;
          if (operator === "startsWith") return strVal.startsWith(filterStr);
          if (operator === "endsWith") return strVal.endsWith(filterStr);
          if (operator === "neq") return strVal !== filterStr;
          return true;
        }

        // Number Logic
        if (key === "amount") {
          const numVal = parseFloat(cellValue || 0);
          const filterVal = parseFloat(value || 0);

          if (operator === "equals") return numVal === filterVal;
          if (operator === "gt") return numVal > filterVal;
          if (operator === "lt") return numVal < filterVal;
          if (operator === "gte") return numVal >= filterVal;
          if (operator === "lte") return numVal <= filterVal;
          if (operator === "neq") return numVal !== filterVal;
          return true;
        }

        // Date Logic
        if (key === "date") {
          const dateVal = dayjs(cellValue);
          if (!dateVal.isValid()) return false;

          // Range
          if (operator === "range") {
            const { from, to } = value || {};
            // If partial range is handled:
            if (!from && !to) return true;
            if (from && to) return dateVal.isBetween(from, to, "day", "[]");
            if (from) return dateVal.isSameOrAfter(from, "day");
            if (to) return dateVal.isSameOrBefore(to, "day");
            return true;
          }

          if (operator === "equals") return dateVal.isSame(value, "day");
          if (operator === "before") return dateVal.isBefore(value, "day");
          if (operator === "after") return dateVal.isAfter(value, "day");
          return true;
        }

        return true;
      });
    });

    return rows;
  }, [data, search, columnFilters]);

  return {
    columns,
    filteredRows,
    sort,
    setSort,
    search,
    setSearch,
    columnFilters,
    setColumnFilters,
  };
};
