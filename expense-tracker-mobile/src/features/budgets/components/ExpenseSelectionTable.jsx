import React, { useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { useUserSettings } from "@/shared/hooks/settings/useUserSettings";
import { SelectableDataTable } from "@/shared/components/data/SelectableDataTable";

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

  const renderEmpty = useCallback(
    () => (
      <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    ),
    [emptyText],
  );

  return (
    <SelectableDataTable
      columns={columns}
      data={expenses}
      selectedIds={selectedExpenseIds}
      onSelectionChange={onSelectionChange}
      loading={loading}
      defaultPageSize={defaultPageSize}
      pageSizeOptions={[5, 10, 20, 50]}
      emptyMessage={emptyText}
      tableClassName="min-w-[560px] w-full"
      renderEmpty={renderEmpty}
    />
  );
}

export default ExpenseSelectionTable;
