// DetailedExpensesTable.jsx (JSX file)
import React from "react";
import useTableLogic from "./hooks/useTableLogic";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import Pagination from "./Pagination";
import columns from "./Columns";
import "../../../src/Styles/ExpensesTable.css";

const DetailedExpensesTable = ({ data, loading, error }) => {
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
    clearAllFilters,
    pageIndex,
    pageSize,
  } = useTableLogic({ columns, data });

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );

  if (error) return <p>{error}</p>;

  return (
    <div className="table-container">
      <div className="top-buttons">
        <h1 className="summary-header-text">Expenses</h1>
        <span className="clear-all-btn" onClick={clearAllFilters}>
          Clear All Filters
        </span>
      </div>
      <div>
        <table {...getTableProps()} className="budget-table">
          <thead>
            {headerGroups.map((headerGroup) => (
              <TableHeader key={headerGroup.id} headerGroup={headerGroup} />
            ))}
          </thead>
          <TableBody page={page} prepareRow={prepareRow} />
        </table>
      </div>
      <Pagination
        pageIndex={pageIndex}
        pageOptions={pageOptions}
        gotoPage={gotoPage}
        previousPage={previousPage}
        nextPage={nextPage}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        setPageSize={setPageSize}
        pageSize={pageSize}
      />
    </div>
  );
};

export default DetailedExpensesTable;
