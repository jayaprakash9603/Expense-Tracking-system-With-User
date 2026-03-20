import React, { useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { useUserSettings } from "@/shared/hooks/settings/useUserSettings";
import { EnhancedDataTable } from "@/shared/components/data/EnhancedDataTable";

export function ExpenseSelectionTable({
  expenses = [],
  selectedExpenseIds = [],
  onSelectionChange,
  emptyText = "No expenses available for selected dates",
  defaultPageSize = 5,
  loading = false,
}) {
  const { t } = useLanguage();
  const { settings } = useUserSettings();
  const { format } = useMoneyFormatter();
  const selectedSet = useMemo(() => new Set(selectedExpenseIds), [selectedExpenseIds]);
  const dateFormatPattern = settings.dateFormat;

  const formatExpenseDate = useCallback(
    (value) => {
      if (!value) return "-";
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed.format(dateFormatPattern) : String(value);
    },
    [dateFormatPattern],
  );

  const expenseNameLabel = t("budget.linkExpensesTable.expenseName");
  const dateLabel = t("budget.linkExpensesTable.date");
  const amountLabel = t("budget.linkExpensesTable.amount");
  const categoryLabel = t("budget.linkExpensesTable.category");

  const columns = useMemo(
    () => [
      {
        id: "expenseName",
        accessorFn: (row) => row.expenseName || row.name || "",
        header: expenseNameLabel,
        enableSorting: true,
        size: 240,
        meta: { filterType: "text", filterLabel: expenseNameLabel },
        cell: ({ row }) => (
          <span className="block max-w-[240px] truncate font-medium">
            {row.original.expenseName || row.original.name || "-"}
          </span>
        ),
      },
      {
        accessorKey: "date",
        header: dateLabel,
        enableSorting: true,
        size: 132,
        meta: { filterType: "date", filterLabel: dateLabel },
        cell: ({ getValue }) => (
          <span className="block min-w-[7.5rem] whitespace-nowrap tabular-nums">
            {formatExpenseDate(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: amountLabel,
        enableSorting: true,
        size: 120,
        meta: { filterType: "number", filterLabel: amountLabel },
        sortingFn: "basic",
        cell: ({ row }) => (
          <span className="block whitespace-nowrap tabular-nums">
            {format(row.original.amount)}
          </span>
        ),
      },
      {
        id: "categoryName",
        accessorFn: (row) => row.categoryName || row.category || "",
        header: categoryLabel,
        enableSorting: true,
        size: 130,
        meta: { filterType: "text", filterLabel: categoryLabel },
        cell: ({ row }) => (
          <span className="block max-w-[160px] truncate">
            {row.original.categoryName || row.original.category || "-"}
          </span>
        ),
      },
    ],
    [amountLabel, categoryLabel, dateLabel, expenseNameLabel, format, formatExpenseDate],
  );

  const rowSelectionState = useMemo(
    () =>
      expenses.reduce((acc, row) => {
        if (selectedSet.has(row.id)) acc[String(row.id)] = true;
        return acc;
      }, {}),
    [expenses, selectedSet],
  );

  const typedExpenseIdByKey = useMemo(
    () =>
      expenses.reduce((acc, row) => {
        acc[String(row.id)] = row.id;
        return acc;
      }, {}),
    [expenses],
  );

  const handleRowSelectionStateChange = useCallback(
    (nextSelection) => {
      if (!onSelectionChange) return;
      const nextIds = Object.entries(nextSelection || {})
        .filter(([, selected]) => selected === true)
        .map(([id]) => typedExpenseIdByKey[id] ?? id);
      onSelectionChange(nextIds);
    },
    [onSelectionChange, typedExpenseIdByKey],
  );

  if (!loading && !expenses.length) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <EnhancedDataTable
      columns={columns}
      data={expenses}
      loading={loading}
      selectable
      enableColumnFilters
      showPagination
      rowSelectionState={rowSelectionState}
      onRowSelectionStateChange={handleRowSelectionStateChange}
      getRowId={(row, index) => String(row?.id ?? index)}
      selectionCheckboxClassName="h-4 w-4 rounded-[6px] border-border bg-background data-[state=checked]:border-primary data-[state=checked]:bg-background data-[state=checked]:text-primary"
      defaultPageSize={defaultPageSize}
      pageSizeOptions={[5, 10, 20, 50]}
      emptyMessage={emptyText}
      tableClassName="min-w-[560px] w-full"
      className="w-full"
    />
  );
}

export default ExpenseSelectionTable;
