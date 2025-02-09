// useTableLogic.js (JS file)
import { useTable, usePagination, useSortBy, useFilters } from "react-table";
import DefaultColumnFilter from "./DefaultColumnFilter";

const useTableLogic = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setAllFilters,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
      defaultColumn: { Filter: DefaultColumnFilter },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const clearAllFilters = () => {
    setAllFilters([]); // Clears all the filters
  };

  return {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setAllFilters,
    clearAllFilters,
    pageIndex,
    pageSize,
  };
};

export default useTableLogic;
