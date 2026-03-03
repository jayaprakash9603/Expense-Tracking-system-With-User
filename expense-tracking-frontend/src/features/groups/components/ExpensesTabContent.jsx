import React from "react";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalculateIcon from "@mui/icons-material/Calculate";
import ListAltIcon from "@mui/icons-material/ListAlt";

const ExpensesTabContent = ({
  groupData,
  setShowAddExpense,
  setShowExpenseTemplates,
  setShowSplitCalculator,
  expenses,
  formatDate,
}) => (
  <div style={{ position: "relative", minHeight: "80vh" }}>
    {/* Expenses List */}
    <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Expenses</h3>
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            style={{ background: "#2a2a2a" }}
            className="flex items-center justify-between p-4 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="text-white font-semibold">{expense.title}</h4>
              <p className="text-gray-400 text-sm">{expense.description}</p>
              <p className="text-gray-500 text-xs">
                Paid by {expense.paidBy} on {formatDate(expense.date)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">${expense.amount}</p>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  expense.status === "settled"
                    ? "bg-green-500 text-white"
                    : "bg-yellow-500 text-black"
                }`}
              >
                {expense.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* SpeedDial for actions */}
    {groupData.currentUserPermissions.canAddExpenses && (
      <SpeedDial
        ariaLabel="Expense Actions"
        sx={{ position: "fixed", bottom: 80, right: 40, zIndex: 10 }}
        icon={<AddIcon />}
        direction="up"
      >
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Add Expense"
          onClick={() => setShowAddExpense(true)}
        />
        <SpeedDialAction
          icon={<ListAltIcon />}
          tooltipTitle="Use Template"
          onClick={() => setShowExpenseTemplates(true)}
        />
        <SpeedDialAction
          icon={<CalculateIcon />}
          tooltipTitle="Split Calculator"
          onClick={() => setShowSplitCalculator(true)}
        />
      </SpeedDial>
    )}
  </div>
);

export default ExpensesTabContent;
