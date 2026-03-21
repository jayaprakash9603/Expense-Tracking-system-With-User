import React, { useMemo } from "react";

function normalizeCellContent(value) {
  if (React.isValidElement(value)) return value;
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function useGroupedExpenseTableColumns(columns) {
  return useMemo(
    () =>
      columns.map((col) => ({
        id: col.key,
        accessorFn: col.value || ((row) => row[col.key]),
        header: col.label,
        meta: col.meta,
        cell: ({ row, getValue }) => {
          const val = getValue();
          const raw = col.render ? col.render(val, row.original) : val;
          const content = normalizeCellContent(raw);
          const cls = typeof col.className === "function" ? col.className(row.original) : col.className;
          return <div className={cls}>{content}</div>;
        },
        enableSorting: col.sortable !== false,
      })),
    [columns],
  );
}
