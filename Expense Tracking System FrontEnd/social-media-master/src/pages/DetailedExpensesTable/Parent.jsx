import React, { useState } from "react";
import DetailedExpensesTable from "./DetailsExpensesTable";
import { useSelector } from "react-redux";

const Parent = () => {
  const { expenses, loading, error } = useSelector((state) => state.expenses);

  return (
    <div>
      <DetailedExpensesTable data={expenses} loading={loading} error={error} />
    </div>
  );
};

export default Parent;
