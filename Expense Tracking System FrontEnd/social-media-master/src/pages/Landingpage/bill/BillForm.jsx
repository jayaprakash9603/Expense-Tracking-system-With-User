import React, { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import { Add as AddIcon, Link as LinkIcon } from "@mui/icons-material";

import BillFormFields from "./BillFormFields";

import ExpenseItemsTable from "./ExpenseItemsTable";
import BudgetTable from "./BudgetTable";

const BillForm = ({
  billData,
  setBillData,
  expenses,
  setExpenses,
  selectedBudgets,
  setSelectedBudgets,
  errors,
  setErrors,
  onSubmit,
  isLoading,
  friendId,
  mode = "create",
}) => {
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [showBudgetTable, setShowBudgetTable] = useState(false);

  // Calculate total amount from expenses
  useEffect(() => {
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + (expense.totalPrice || 0),
      0
    );
    setBillData((prev) => ({ ...prev, amount: totalAmount.toString() }));
  }, [expenses, setBillData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(billData);
  };

  const handleToggleBudgetTable = () => {
    setShowBudgetTable(!showBudgetTable);
    if (showExpenseTable) {
      setShowExpenseTable(false);
    }
  };

  const handleOpenExpenseTable = () => {
    setShowExpenseTable(true);
    setShowBudgetTable(false);
  };

  const handleCloseExpenseTable = () => {
    setShowExpenseTable(false);
  };

  const handleCloseBudgetTable = () => {
    setShowBudgetTable(false);
  };

  return (
    <div className="flex flex-col gap-4 mt-4 flex-1">
      <BillFormFields
        billData={billData}
        setBillData={setBillData}
        errors={errors}
        setErrors={setErrors}
        friendId={friendId}
      />

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between items-center">
        <Button
          onClick={handleToggleBudgetTable}
          startIcon={<LinkIcon />}
          sx={{
            backgroundColor: showBudgetTable ? "#00b8a0" : "#00DAC6",
            color: "black",
            "&:hover": {
              backgroundColor: "#00b8a0",
            },
          }}
        >
          {showBudgetTable ? "Hide" : "Link"} Budgets
        </Button>

        <Button
          onClick={handleOpenExpenseTable}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: showExpenseTable ? "#00b8a0" : "#00DAC6",
            color: "black",
            "&:hover": {
              backgroundColor: "#00b8a0",
            },
          }}
        >
          {showExpenseTable ? "Hide" : "Add"} Expense Items
        </Button>
      </div>

      {/* Budget Table */}
      {showBudgetTable && !showExpenseTable && (
        <BudgetTable
          billData={billData}
          selectedBudgets={selectedBudgets}
          setSelectedBudgets={setSelectedBudgets}
          onClose={handleCloseBudgetTable}
          friendId={friendId}
        />
      )}

      {/* Expense Items Table */}
      {showExpenseTable && !showBudgetTable && (
        <ExpenseItemsTable
          expenses={expenses}
          setExpenses={setExpenses}
          onClose={handleCloseExpenseTable}
        />
      )}

      {/* Submit Button */}
      <div className="w-full flex justify-end mt-4 sm:mt-8">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] w-full sm:w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : mode === "edit" ? (
            "Update"
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default BillForm;
