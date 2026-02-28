import DefaultColumnFilter from "./DefaultColumnFilter";

const columns = [
  {
    Header: "Date",
    accessor: "date",
    Filter: DefaultColumnFilter,
    sortType: "basic",
  },
  {
    Header: "Expense Name",
    accessor: "expense.expenseName",
    Filter: DefaultColumnFilter,
    sortType: "basic",
  },
  {
    Header: "Amount",
    accessor: "expense.amount",
    Cell: ({ value }) => value.toFixed(0),
    Filter: DefaultColumnFilter,
    sortType: "basic",
  },
  {
    Header: "Type",
    accessor: "expense.type",
    Filter: DefaultColumnFilter,
    sortType: "basic",
  },
  {
    Header: "Payment Method",
    accessor: "expense.paymentMethod",
    Filter: DefaultColumnFilter,
    sortType: "basic",
  },
  {
    Header: "Comments",
    accessor: "expense.comments",
    Cell: ({ value }) => value || "No Comments",
    Filter: DefaultColumnFilter,
    sortType: "basic",
  },
];

export default columns;
