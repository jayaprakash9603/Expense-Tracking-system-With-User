// Pagination.jsx (JSX file)
import React from "react";

const Pagination = ({
  pageIndex,
  pageOptions,
  gotoPage,
  previousPage,
  nextPage,
  canPreviousPage,
  canNextPage,
  setPageSize,
  pageSize,
}) => {
  return (
    <div className="pagination">
      <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
        {"<<"}
      </button>
      <button onClick={() => previousPage()} disabled={!canPreviousPage}>
        {"<"}
      </button>
      <span className="page-of">
        Page{" "}
        <strong>
          {pageIndex + 1} of {pageOptions.length}
        </strong>{" "}
      </span>
      <button onClick={() => nextPage()} disabled={!canNextPage}>
        {">"}
      </button>
      <button
        onClick={() => gotoPage(pageOptions.length - 1)}
        disabled={!canNextPage}
      >
        {">>"}
      </button>
      <select
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
      >
        {[7, 10, 20, 30, 50, 100].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Pagination;
