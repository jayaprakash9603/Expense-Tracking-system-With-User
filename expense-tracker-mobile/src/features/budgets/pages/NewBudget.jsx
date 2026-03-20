import React from "react";
import BudgetFormPage from "./BudgetFormPage";

export function NewBudget(props) {
  return <BudgetFormPage mode="create" {...props} />;
}

export default NewBudget;
