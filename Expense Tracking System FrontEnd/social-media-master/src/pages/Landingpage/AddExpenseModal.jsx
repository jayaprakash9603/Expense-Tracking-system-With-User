import React from "react";

const AddExpenseModal = ({ newExpense, setNewExpense, onAdd, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      style={{ background: "#1b1b1b" }}
      className="p-6 rounded-xl w-full max-w-md"
    >
      <h3 className="text-xl font-semibold text-white mb-4">Add New Expense</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            value={newExpense.title}
            onChange={(e) =>
              setNewExpense({ ...newExpense, title: e.target.value })
            }
            placeholder="Expense title"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Amount
          </label>
          <input
            type="number"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
            placeholder="0.00"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Category
          </label>
          <select
            value={newExpense.category}
            onChange={(e) =>
              setNewExpense({ ...newExpense, category: e.target.value })
            }
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
          >
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={newExpense.description}
            onChange={(e) =>
              setNewExpense({ ...newExpense, description: e.target.value })
            }
            placeholder="Optional description"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none h-20"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Date
          </label>
          <input
            type="date"
            value={newExpense.date}
            onChange={(e) =>
              setNewExpense({ ...newExpense, date: e.target.value })
            }
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
          />
        </div>
      </div>
      <div className="flex space-x-3 mt-6">
        <button
          onClick={onAdd}
          className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Add Expense
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default AddExpenseModal;
