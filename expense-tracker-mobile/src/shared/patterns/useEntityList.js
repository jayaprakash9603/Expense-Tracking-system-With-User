import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useEntityList({
  fetchAction,
  selector,
  searchFields = [],
  defaultSort = { field: "createdAt", order: "desc" },
  pageSize = 20,
  autoFetch = true,
  transformItem = null,
}) {
  const dispatch = useDispatch();
  const rawItems = useSelector(selector) || [];
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(
    (params = {}) => {
      return dispatch(
        fetchAction({
          page,
          size: pageSize,
          sort: `${sort.field},${sort.order}`,
          search: search || undefined,
          ...params,
        })
      );
    },
    [dispatch, fetchAction, page, pageSize, sort, search]
  );

  useEffect(() => {
    if (autoFetch) fetchData();
  }, [fetchData, autoFetch, refreshKey]);

  const filteredItems = useMemo(() => {
    let items = [...rawItems];
    if (search && searchFields.length > 0) {
      const query = search.toLowerCase();
      items = items.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }
    return items;
  }, [rawItems, search, searchFields]);

  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    items.sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const comparison = typeof aVal === "string" ? aVal.localeCompare(bVal) : aVal - bVal;
      return sort.order === "desc" ? -comparison : comparison;
    });
    return items;
  }, [filteredItems, sort]);

  const items = useMemo(() => {
    if (transformItem) return sortedItems.map(transformItem);
    return sortedItems;
  }, [sortedItems, transformItem]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const toggleSort = useCallback(
    (field) => {
      setSort((prev) => ({
        field,
        order: prev.field === field && prev.order === "desc" ? "asc" : "desc",
      }));
    },
    []
  );

  return {
    items,
    loading: false,
    search,
    setSearch,
    sort,
    setSort,
    toggleSort,
    page,
    setPage,
    refresh,
    fetchData,
    totalItems: items.length,
    isEmpty: items.length === 0 && !search,
    isSearchEmpty: items.length === 0 && !!search,
  };
}

export default useEntityList;
