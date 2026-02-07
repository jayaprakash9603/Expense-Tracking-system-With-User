import { useState, useMemo } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

/**
 * Shared hook for Budget Table configuration (Columns, Sorting, Filtering)
 * @param {Array} data - The raw list of budgets
 * @param {Function} t - Translation function
 * @returns {Object} { columns, filteredRows, sort, setSort, columnFilters, setColumnFilters, search, setSearch }
 */
export const useBudgetTableConfig = (data = [], t) => {
  // State
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({});

  // Column Definitions
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: t ? t("name") : "Name",
        filterable: true,
        filterType: "text",
        sortable: true,
        width: "20%",
      },
      {
        key: "description",
        label: t ? t("description") : "Description",
        filterable: true,
        filterType: "text",
        sortable: true,
        width: "25%",
      },
      {
        key: "startDate",
        label: t ? t("start_date") : "Start Date",
        filterable: true,
        filterType: "date",
        sortable: true,
        render: (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-"),
        width: "15%",
      },
      {
        key: "endDate",
        label: t ? t("end_date") : "End Date",
        filterable: true,
        filterType: "date",
        sortable: true,
        render: (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-"),
        width: "15%",
      },
      {
        key: "remainingAmount",
        label: t ? t("remaining") || "Remaining" : "Remaining",
        filterable: true,
        filterType: "number",
        sortable: true,
        render: (value, row) => {
          if (value !== undefined && value !== null) return `${value}`;
          const val = (row.amount || 0) - (row.spentAmount || 0);
          return `${val}`;
        },
        width: "15%",
      },
      {
        key: "amount",
        label: t ? t("total") : "Total",
        filterable: true,
        filterType: "number",
        sortable: true,
        render: (value) => `${value ?? 0}`,
        width: "10%",
      },
    ],
    [t],
  );

  // Derived Data
  const filteredRows = useMemo(() => {
    if (!data) return [];
    let rows = [...data];

    // 1. Global Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      rows = rows.filter(
        (row) =>
          (row.name?.toLowerCase() || "").includes(lowerSearch) ||
          (row.description?.toLowerCase() || "").includes(lowerSearch) ||
          String(row.amount || "").includes(lowerSearch),
      );
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
        const cellValue = row[key];

        // Text Logic
        if (key === "name" || key === "description") {
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
        if (
          key === "amount" ||
          key === "spentAmount" ||
          key === "remainingAmount"
        ) {
          let cellValue = row[key];
          if (key === "remainingAmount") {
            cellValue = (row.amount || 0) - (row.spentAmount || 0);
          }
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
        if (key === "startDate" || key === "endDate") {
          const dateVal = dayjs(cellValue);
          if (!dateVal.isValid()) return false;

          // Range
          if (operator === "range") {
            const { from, to } = value || {};
            if (!from && !to) return true;
            // Inclusive range
            if (from && to) return dateVal.isBetween(from, to, "day", "[]");
            if (from) return dateVal.isSameOrAfter(from, "day");
            if (to) return dateVal.isSameOrBefore(to, "day");
            return true;
          }

          // Single Date Logic
          if (operator === "equals") return dateVal.isSame(value, "day");
          if (operator === "before") return dateVal.isBefore(value, "day");
          if (operator === "after") return dateVal.isAfter(value, "day");
          return true;
        }

        return true;
      });
    });

    // 3. Sorting
    // Note: GroupedDataTable usually handles sorting if we pass 'sort' prop but here we sort data ourselves?
    // Wait, GroupedDataTable in its implementation sorts internally if onSortChange is managed but data is passed.
    // Actually, if we pass 'sort' prop to GroupedDataTable, it might re-sort?
    // Let's rely on GroupedDataTable's internal sorting if we pass the raw 'filteredRows' to it?
    // NO, if we implement server-side or complex sorting, we usually sort before passing.
    // But `GroupedDataTable` has:
    // `const sortedRows = useMemo(() => { ... }, [rows, sort, columns]);`
    // So `GroupedDataTable` DOES sort internally based on the `sort` prop we pass it.
    // SO WE SHOULD NOT SORT HERE to avoid double sorting,
    // UNLESS we want to control it fully.
    // The `GroupedDataTable` sort logic seems fine (uses col.value or row[key]).
    // We will just return filtered rows and let the table sort them.

    return rows;
  }, [data, search, columnFilters]); // Removed 'sort' from dependencies because table handles it

  return {
    columns,
    filteredRows, // These are searching + filtered, but NOT sorted (Table sorts them)
    sort,
    setSort,
    search,
    setSearch,
    columnFilters,
    setColumnFilters,
  };
};
