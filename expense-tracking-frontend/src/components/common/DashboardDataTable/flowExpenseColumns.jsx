import dayjs from "dayjs";
import { formatNumberFull } from "../../../utils/formatting/numberFormatters";

export const buildFlowExpenseColumns = ({
  t,
  currencySymbol,
  dateFormat = "DD/MM/YYYY",
}) => [
  {
    id: "name",
    accessorKey: "name",
    header: t("cashflow.tableHeaders.name"),
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="dashboard-data-table__cell-primary" title={String(getValue() ?? "")}>
        {getValue()}
      </span>
    ),
  },
  {
    id: "date",
    accessorKey: "date",
    header: t("cashflow.tableHeaders.date"),
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const d1 = dayjs(rowA.original.date);
      const d2 = dayjs(rowB.original.date);
      const t1 = d1.isValid() ? d1.valueOf() : 0;
      const t2 = d2.isValid() ? d2.valueOf() : 0;
      return t1 - t2;
    },
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className="dashboard-data-table__cell-muted">
          {dayjs(value).isValid()
            ? dayjs(value).format(dateFormat)
            : t("flows.expensesTable.noDate")}
        </span>
      );
    },
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: t("cashflow.tableHeaders.amount"),
    align: "right",
    enableSorting: true,
    sortingFn: "basic",
    cell: ({ row, getValue }) => (
      <span
        className={`dashboard-data-table__cell-amount ${
          row.original.isIncome ? "is-income" : "is-expense"
        }`}
      >
        {currencySymbol}
        {formatNumberFull(getValue())}
      </span>
    ),
  },
  {
    id: "type",
    accessorKey: "type",
    header: t("cashflow.tableHeaders.type"),
    align: "center",
    enableSorting: true,
    cell: ({ row }) => {
      const isIncome = row.original.isIncome;
      return (
        <span
          className={`dashboard-data-table__badge ${
            isIncome ? "is-success" : "is-danger"
          }`}
        >
          {isIncome
            ? t("flows.expensesTable.type.income")
            : t("flows.expensesTable.type.expense")}
        </span>
      );
    },
  },
];
