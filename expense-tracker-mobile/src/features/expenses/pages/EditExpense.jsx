import React from "react";
import ExpenseFormPage from "./ExpenseFormPage";

export function EditExpense(props) {
  return <ExpenseFormPage mode="edit" {...props} />;
}

export default EditExpense;
