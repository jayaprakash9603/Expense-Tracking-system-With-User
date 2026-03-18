import React from "react";
import ExpenseFormPage from "../components/ExpenseFormPage";

const NewExpense = ({ onClose, onSuccess }) => (
  <ExpenseFormPage mode="create" onClose={onClose} onSuccess={onSuccess} />
);

export default NewExpense;
