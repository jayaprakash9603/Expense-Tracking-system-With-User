import React from "react";
import ExpenseListTable from "../../components/common/ExpenseListTable/ExpenseListTable";
import "../DetailedExpensesTable/DetailedExpensesTable.css";

const DetailedExpensesTable = ({ data, loading, error }) => {
  return (
    <div className="table-container fade-in">
      <div className="top-buttons">
        <h1 className="summary-header-text">Expenses</h1>
      </div>
      <div className="mt-4">
        <ExpenseListTable
          rows={data}
          loading={loading}
          error={error}
          showNet={false}
          showCredit={false}
          defaultPageSize={14}
        />
      </div>
    </div>
  );
};

export default DetailedExpensesTable;
