import { useMemo } from "react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useDateFormat } from "@/shared/hooks/i18n/useDateFormat";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";

export function useStandardExpenseColumns(options = {}) {
  const { t } = useLanguage();
  const { formatDate } = useDateFormat();
  const { format: formatMoney } = useMoneyFormatter();

  return useMemo(() => {
    const cols = [
      {
        key: "date",
        label: t("expenses.columns.date"),
        meta: { filterType: "date" },
        sortable: true,
        width: "100px",
        value: (row) => extractExpenseDetails(row).date || row.date,
        render: (val) => (val ? formatDate(val) : "-"),
        sortValue: (row) => {
          const d = extractExpenseDetails(row).date || row.date;
          return d ? new Date(d).getTime() : 0;
        },
      },
      {
        key: "categoryName",
        label: t("expenses.columns.category"),
        meta: { filterType: "text" },
        sortable: true,
        width: "15%",
        value: (row) => extractExpenseDetails(row).categoryName || row.categoryName,
        render: (value) => value || "-",
      },
      {
        key: "expenseName",
        label: t("expenses.columns.name"),
        meta: { filterType: "text" },
        sortable: true,
        width: "230px",
        value: (row) => extractExpenseDetails(row).expenseName || extractExpenseDetails(row).name || row.expenseName || row.name,
        sortValue: (row) => {
          const name = extractExpenseDetails(row).expenseName || extractExpenseDetails(row).name || row.expenseName || row.name || "";
          return name.toLowerCase();
        },
        render: (val) => val || "-",
      },
      {
        key: "amount",
        label: t("expenses.columns.amount"),
        meta: { filterType: "number" },
        sortable: true,
        width: "100px",
        value: (row) => {
          const d = extractExpenseDetails(row);
          return Number(d.amount ?? d.netAmount ?? row.amount ?? 0);
        },
        render: (val) => formatMoney(val),
        sortValue: (row) => {
          const d = extractExpenseDetails(row);
          return Number(d.amount ?? d.netAmount ?? row.amount ?? 0);
        },
        className: (row) => {
          const d = extractExpenseDetails(row);
          const rawType = (d.type || row.type || "").toLowerCase();
          if (rawType === "loss") return "text-destructive font-medium";
          if (rawType === "gain" || rawType === "profit") return "text-emerald-600 dark:text-emerald-500 font-medium";
          const amt = Number(d.amount ?? d.netAmount ?? row.amount ?? 0);
          return amt < 0 ? "text-destructive font-medium" : "text-emerald-600 dark:text-emerald-500 font-medium";
        },
      },
    ];

    if (options.includeNet) {
      cols.push({
        key: "netAmount",
        label: t("expenses.columns.netAmount"),
        meta: { filterType: "number" },
        width: "100px",
        sortable: true,
        value: (row) => {
          const d = extractExpenseDetails(row);
          return Number(d.netAmount ?? d.amount ?? row.netAmount ?? 0);
        },
        render: (val) => formatMoney(val),
        sortValue: (row) => {
          const d = extractExpenseDetails(row);
          return Number(d.netAmount ?? d.amount ?? row.netAmount ?? 0);
        },
        className: (row) => {
          const d = extractExpenseDetails(row);
          const net = Number(d.netAmount ?? d.amount ?? row.netAmount ?? 0);
          return net < 0 ? "text-destructive font-medium" : "text-emerald-600 dark:text-emerald-500 font-medium";
        },
      });
    }

    if (options.includeCredit) {
      cols.push({
        key: "creditDue",
        label: t("expenses.columns.creditDue"),
        meta: { filterType: "number" },
        width: "110px",
        sortable: true,
        value: (row) => {
          const val = extractExpenseDetails(row).creditDue ?? row.creditDue;
          return Number(val ?? 0);
        },
        render: (val) => formatMoney(val),
        sortValue: (row) => {
          const val = extractExpenseDetails(row).creditDue ?? row.creditDue;
          return Number(val || 0);
        },
      });
    }

    cols.push({
      key: "comments",
      label: t("expenses.columns.comments"),
      meta: { filterType: "text" },
      sortable: true,
      width: "240px",
      value: (row) => extractExpenseDetails(row).comments || row.comments,
      render: (val) => val || "-",
    });

    return cols;
  }, [t, options.includeCredit, options.includeNet]);
}
