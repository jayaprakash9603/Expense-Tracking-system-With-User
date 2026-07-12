import { useMemo } from "react";
import dayjs from "dayjs";

function formatDate(value) {
  if (!value) return "-";
  const parsed = dayjs(value);
  if (!parsed.isValid()) return "-";
  return parsed.format("DD MMM YYYY");
}

function formatNumber(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString();
}

export function useBudgetTableConfig(data = [], t) {
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: t("common.name"),
        enableSorting: true,
        size: 220,
        meta: { filterType: "text", filterLabel: t("common.name") },
      },
      {
        id: "description",
        accessorKey: "description",
        header: t("expenses.description"),
        enableSorting: true,
        size: 260,
        meta: { filterType: "text", filterLabel: t("expenses.description") },
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        id: "startDate",
        accessorKey: "startDate",
        header: t("tableFilters.startDate"),
        enableSorting: true,
        size: 170,
        meta: { filterType: "date", filterLabel: t("tableFilters.startDate") },
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        id: "endDate",
        accessorKey: "endDate",
        header: t("tableFilters.endDate"),
        enableSorting: true,
        size: 170,
        meta: { filterType: "date", filterLabel: t("tableFilters.endDate") },
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        id: "remainingAmount",
        accessorFn: (row) =>
          (Number(row.amount) || 0) - (Number(row.spentAmount) || 0),
        header: t("budget.remaining"),
        enableSorting: true,
        size: 170,
        meta: { filterType: "number", filterLabel: t("budget.remaining") },
        sortingFn: "basic",
        cell: ({ getValue }) => formatNumber(getValue()),
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: t("tableFilters.total"),
        enableSorting: true,
        size: 150,
        meta: { filterType: "number", filterLabel: t("tableFilters.total") },
        sortingFn: "basic",
        cell: ({ getValue }) => formatNumber(getValue()),
      },
    ],
    [t],
  );

  return {
    columns,
    rows,
  };
}

export default useBudgetTableConfig;
