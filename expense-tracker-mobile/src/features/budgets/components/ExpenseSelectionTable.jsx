import React, { useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { useUserSettings } from "@/shared/hooks/settings/useUserSettings";
import { SelectableDataTable } from "@/shared/components/data/SelectableDataTable";
import { cn } from "@/lib/utils";
import { formatPaymentMethodName } from "@/features/expenses/utils/expensePaymentMethodUtils";

export function ExpenseSelectionTable({
  expenses = [],
  selectedExpenseIds = [],
  onSelectionChange,
  emptyText,
  defaultPageSize = 5,
  loading = false,
}) {
  const { t } = useLanguage();
  const resolvedEmptyText = emptyText ?? t("budget.noExpensesForDate");
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
  const paymentMethodLabel = t("budget.linkExpensesTable.paymentMethod");
  const commentsLabel = t("budget.linkExpensesTable.comments");

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
          <span className="block max-w-[15rem] truncate font-medium">
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
          <span className="block max-w-[10rem] truncate">
            {row.original.categoryName || row.original.category || "-"}
          </span>
        ),
      },
      {
        id: "paymentMethod",
        accessorFn: (row) => row.paymentMethod || "",
        header: paymentMethodLabel,
        enableSorting: true,
        size: 140,
        meta: { filterType: "text", filterLabel: paymentMethodLabel },
        cell: ({ row }) => (
          <span className="block max-w-[8.75rem] truncate">
            {formatPaymentMethodName(row.original.paymentMethod || "") || "-"}
          </span>
        ),
      },
      {
        id: "comments",
        accessorFn: (row) => row.comments || "",
        header: commentsLabel,
        enableSorting: true,
        size: 200,
        meta: { filterType: "text", filterLabel: commentsLabel },
        cell: ({ row }) => (
          <span className="block max-w-[13.75rem] truncate" title={row.original.comments || ""}>
            {row.original.comments?.trim() ? row.original.comments : "-"}
          </span>
        ),
      },
    ],
    [
      amountLabel,
      categoryLabel,
      commentsLabel,
      dateLabel,
      expenseNameLabel,
      format,
      formatExpenseDate,
      paymentMethodLabel,
    ],
  );

  return (
    <div className="w-full min-w-0 max-w-full">
      <SelectableDataTable
        columns={columns}
        data={expenses}
        selectedIds={selectedExpenseIds}
        onSelectionChange={onSelectionChange}
        loading={loading}
        defaultPageSize={defaultPageSize}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyMessage={resolvedEmptyText}
        flexColumnSizing
        tableClassName={cn("w-full min-w-0")}
        tableContainerClassName="theme-scrollbar overflow-x-hidden overflow-y-auto overscroll-contain"
        tableSectionClassName="max-w-full"
      />
    </div>
  );
}

export default ExpenseSelectionTable;
