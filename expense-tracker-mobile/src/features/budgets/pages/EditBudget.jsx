import React from "react";
import BudgetFormPage from "./BudgetFormPage";

export function EditBudget(props) {
  return <BudgetFormPage mode="edit" {...props} />;
}

export default EditBudget;
