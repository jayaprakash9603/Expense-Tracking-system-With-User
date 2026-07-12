import React from "react";
import ExpenseFormPage from "./ExpenseFormPage";

export function NewExpense(props) {
  return <ExpenseFormPage mode="create" {...props} />;
}

export default NewExpense;
