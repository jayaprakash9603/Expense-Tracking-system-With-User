import React from "react";
import { AppPagination } from "./AppPagination";

export function DataTablePagination({
  table,
  selectable,
  selectedRowsText,
  pageSummaryText,
  rowsPerPageLabel,
  pageSizeOptions,
}) {
  const pagination = table.getState().pagination;
  const rawCount = table.getPageCount();
  const totalItems = table.getFilteredRowModel().rows.length;

  return (
    <AppPagination
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      totalItems={totalItems}
      pageCount={rawCount}
      pageSizeOptions={pageSizeOptions}
      onPageChange={(index) => table.setPageIndex(index)}
      onPageSizeChange={(size) => table.setPageSize(size)}
      selectable={selectable}
      selectedRowsText={selectedRowsText}
      pageSummaryText={pageSummaryText}
      rowsPerPageLabel={rowsPerPageLabel}
    />
  );
}

export default DataTablePagination;
