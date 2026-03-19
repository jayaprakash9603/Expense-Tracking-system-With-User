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

function resolveText(t, key, fallback) {
  const translated = t?.(key);
  if (!translated || translated === key) return fallback;
  return translated;
}

export function useBudgetTableConfig(data = [], t) {
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const nameLabel = resolveText(t, "common.name", "Name");
  const descriptionLabel = resolveText(
    t,
    "expenses.description",
    "Description",
  );
  const startDateLabel = resolveText(t, "tableFilters.startDate", "Start Date");
  const endDateLabel = resolveText(t, "tableFilters.endDate", "End Date");
  const remainingLabel = resolveText(t, "budget.remaining", "Remaining");
  const totalLabel = resolveText(t, "tableFilters.total", "Total");

  const columns = useMemo(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: nameLabel,
        enableSorting: true,
        size: 220,
        meta: { filterType: "text", filterLabel: nameLabel },
      },
      {
        id: "description",
        accessorKey: "description",
        header: descriptionLabel,
        enableSorting: true,
        size: 260,
        meta: { filterType: "text", filterLabel: descriptionLabel },
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        id: "startDate",
        accessorKey: "startDate",
        header: startDateLabel,
        enableSorting: true,
        size: 170,
        meta: { filterType: "date", filterLabel: startDateLabel },
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        id: "endDate",
        accessorKey: "endDate",
        header: endDateLabel,
        enableSorting: true,
        size: 170,
        meta: { filterType: "date", filterLabel: endDateLabel },
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        id: "remainingAmount",
        accessorFn: (row) =>
          (Number(row.amount) || 0) - (Number(row.spentAmount) || 0),
        header: remainingLabel,
        enableSorting: true,
        size: 170,
        meta: { filterType: "number", filterLabel: remainingLabel },
        sortingFn: "basic",
        cell: ({ getValue }) => formatNumber(getValue()),
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: totalLabel,
        enableSorting: true,
        size: 150,
        meta: { filterType: "number", filterLabel: totalLabel },
        sortingFn: "basic",
        cell: ({ getValue }) => formatNumber(getValue()),
      },
    ],
    [
      descriptionLabel,
      endDateLabel,
      nameLabel,
      remainingLabel,
      startDateLabel,
      totalLabel,
    ],
  );

  return {
    columns,
    rows,
  };
}

export default useBudgetTableConfig;
