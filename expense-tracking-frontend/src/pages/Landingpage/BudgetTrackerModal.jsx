import React from "react";

const BudgetTrackerModal = ({ show, onClose, budgetTracker }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        style={{ background: "#1b1b1b" }}
        className="p-6 rounded-xl w-full max-w-lg"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          📊 Budget Tracker
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">Total Budget</span>
              <span className="text-teal-400 font-bold">
                ${budgetTracker.totalBudget}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    (Object.values(budgetTracker.categories).reduce(
                      (sum, cat) => sum + cat.spent,
                      0
                    ) /
                      budgetTracker.totalBudget) *
                      100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Spent: $
              {Object.values(budgetTracker.categories).reduce(
                (sum, cat) => sum + cat.spent,
                0
              )}{" "}
              / ${budgetTracker.totalBudget}
            </p>
          </div>
          {Object.entries(budgetTracker.categories).map(([category, data]) => (
            <div key={category} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">{category}</span>
                <span className="text-gray-300">
                  ${data.spent} / ${data.budget}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    data.spent > data.budget ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (data.spent / data.budget) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {data.spent > data.budget
                  ? `Over budget by $${(data.spent - data.budget).toFixed(2)}`
                  : `Remaining: $${(data.budget - data.spent).toFixed(2)}`}
              </p>
            </div>
          ))}
        </div>
        <div className="flex space-x-3 mt-6">
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
};

export default BudgetTrackerModal;
