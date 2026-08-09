import React from "react";
import { AppSelect } from "../../components/ui";

const PAGE_SIZE_OPTIONS = [7, 10, 20, 30, 50, 100];

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
      <AppSelect
        value={pageSize}
        onValueChange={(val) => setPageSize(Number(val))}
        options={PAGE_SIZE_OPTIONS.map((size) => ({
          value: size,
          label: String(size),
        }))}
        ariaLabel="Rows per page"
        size="small"
        density="compact"
        fullWidth={false}
        displayEmpty={false}
        showSelectedCheck={false}
      />
    </div>
  );
};

export default Pagination;
