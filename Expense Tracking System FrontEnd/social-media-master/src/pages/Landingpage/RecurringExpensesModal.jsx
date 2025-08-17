import React from "react";

const RecurringExpensesModal = ({ expenses = [], onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      style={{ background: "#1b1b1b" }}
      className="p-6 rounded-xl w-full max-w-lg"
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        🔄 Recurring Expenses
      </h3>
      <div className="space-y-3 mb-4">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <div key={expense.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-semibold">{expense.title}</h4>
                  <p className="text-gray-400 text-sm">
                    {expense.frequency} • Next due: {expense.nextDue}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {expense.participants.length} participants
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-teal-400 font-bold">${expense.amount}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      expense.isActive
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {expense.isActive ? "Active" : "Paused"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400">No recurring expenses found.</div>
        )}
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default RecurringExpensesModal;
