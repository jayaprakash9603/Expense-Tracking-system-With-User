import { useState, useMemo, useCallback } from "react";

export function useDataTable({
  data = [],
  columns = [],
  defaultPageSize = 10,
  defaultSortKey = null,
  defaultSortDir = "asc",
  searchKeys = [],
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = typeof key === "function" ? key(row) : row[key];
        return String(val || "").toLowerCase().includes(lower);
      })
    );
  }, [data, searchTerm, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    const accessor = col?.sortAccessor || ((row) => row[sortKey]);

    return [...filteredData].sort((a, b) => {
      const aVal = accessor(a);
      const bVal = accessor(b);
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(
    () => sortedData.slice(page * pageSize, (page + 1) * pageSize),
    [sortedData, page, pageSize]
  );

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
      setPage(0);
    },
    [sortKey]
  );

  const toggleRow = useCallback((id) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedRows((prev) => {
      if (prev.size === paginatedData.length) return new Set();
      return new Set(paginatedData.map((row) => row.id));
    });
  }, [paginatedData]);

  const clearSelection = useCallback(() => setSelectedRows(new Set()), []);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    sortKey,
    sortDir,
    handleSort,
    searchTerm,
    setSearchTerm,
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    totalItems: filteredData.length,
    selectedRows,
    toggleRow,
    toggleAll,
    clearSelection,
    isAllSelected: selectedRows.size > 0 && selectedRows.size === paginatedData.length,
    hasSelection: selectedRows.size > 0,
  };
}

export default useDataTable;
