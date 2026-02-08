import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { applyColumnFilter } from "../utils/filterLogic";

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
        key: "categoryName",
        label: t ? t("category") || "Category" : "Category",
        filterable: true,
        filterType: "text",
        sortable: true,
        width: "15%",
        value: (row) => row.categoryName,
        render: (value) => value || "-",
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
        render: (value) => (value ? value.toLowerCase() : "-"),
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
        const category = (row.categoryName || "").toLowerCase();
        const desc = getExpenseField(row, "comments").toLowerCase();
        const amt = String(getExpenseField(row, "amount"));
        return (
          name.includes(lowerSearch) ||
          category.includes(lowerSearch) ||
          desc.includes(lowerSearch) ||
          amt.includes(lowerSearch)
        );
      });
    }

    // 2. Column Filters
    Object.keys(columnFilters).forEach((key) => {
      const filter = columnFilters[key];
      if (!filter) return;

      rows = rows.filter((row) => {
        // Determine cell value based on key
        let cellValue;
        if (key === "date") cellValue = row.date;
        else if (key === "categoryName") cellValue = row.categoryName;
        else cellValue = getExpenseField(row, key);

        // Determine filter type from columns definition
        const column = columns.find((c) => c.key === key);
        const filterType = column?.filterType || "text";

        return applyColumnFilter(cellValue, filter, filterType);
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
