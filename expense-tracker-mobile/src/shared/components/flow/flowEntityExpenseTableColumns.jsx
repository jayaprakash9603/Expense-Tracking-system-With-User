import React from "react";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function isGainType(type) {
  const v = (type || "").toString().toLowerCase();
  return v === "gain" || v === "income" || v === "inflow";
}

export function buildFlowEntityExpenseTableColumns({
  t,
  variant,
  formatMoney,
  dateFormat,
}) {
  const cols = [
    {
      accessorKey: "name",
      header: t("flows.expensesTable.columnName"),
      size: 150,
      cell: ({ row }) => (
        <span className="block truncate font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "date",
      header: t("flows.expensesTable.columnDate"),
      size: 96,
      cell: ({ row }) => {
        const d = row.original.date;
        return d ? dayjs(d).format(dateFormat) : t("flows.expensesTable.noDate");
      },
    },
    {
      accessorKey: "amount",
      header: t("flows.expensesTable.columnAmount"),
      size: 100,
      cell: ({ row }) => (
        <span className="block text-left tabular-nums">
          {formatMoney(Math.abs(Number(row.original.amount) || 0))}
        </span>
      ),
    },
  ];

  if (variant === "category") {
    cols.push({
      accessorKey: "paymentMethod",
      header: t("flows.expensesTable.columnPaymentMethod"),
      size: 128,
      cell: ({ row }) => (
        <span className="block truncate">{row.original.paymentMethod || "—"}</span>
      ),
    });
  }

  if (variant === "paymentMethod") {
    cols.push({
      accessorKey: "categoryName",
      header: t("flows.expensesTable.columnCategory"),
      size: 128,
      cell: ({ row }) => (
        <span className="block truncate">{row.original.categoryName || "—"}</span>
      ),
    });
  }

  cols.push(
    {
      accessorKey: "comments",
      header: t("flows.expensesTable.columnComments"),
      size: 300,
      cell: ({ row }) => {
        const text = row.original.comments || row.original.description || "";
        return (
          <span className="block truncate text-left text-xs text-muted-foreground">{text || "—"}</span>
        );
      },
    },
    {
      accessorKey: "type",
      header: t("flows.expensesTable.columnType"),
      size: 76,
      cell: ({ row }) => {
        const income = isGainType(row.original.type);
        return (
          <Badge
            variant={income ? "outline" : "destructive"}
            className={cn(
              "text-[0.625rem]",
              income && "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
            )}
          >
            {income ? t("flows.expensesTable.typeGain") : t("flows.expensesTable.typeLoss")}
          </Badge>
        );
      },
    },
  );

  return cols;
}
