import React from "react";
import { useTheme } from "../../../hooks/useTheme";
import { AppSelect } from "../../../components/ui";

const AddExpenseModal = ({ newExpense, setNewExpense, onAdd, onClose }) => {
  const { colors } = useTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        style={{ backgroundColor: colors.secondary_bg }}
        className="p-6 rounded-xl w-full max-w-md"
      >
        <h3
          className="text-xl font-semibold mb-4"
          style={{ color: colors.primary_text }}
        >
          Add New Expense
        </h3>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondary_text }}
            >
              Title
            </label>
            <input
              type="text"
              value={newExpense.title}
              onChange={(e) =>
                setNewExpense({ ...newExpense, title: e.target.value })
              }
              placeholder="Expense title"
              className="w-full px-4 py-2 rounded-lg border-none outline-none"
              style={{
                backgroundColor: colors.tertiary_bg,
                color: colors.primary_text,
              }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondary_text }}
            >
              Amount
            </label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
              placeholder="0.00"
              className="w-full px-4 py-2 rounded-lg border-none outline-none"
              style={{
                backgroundColor: colors.tertiary_bg,
                color: colors.primary_text,
              }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondary_text }}
            >
              Category
            </label>
            <AppSelect
              value={newExpense.category}
              onValueChange={(category) =>
                setNewExpense({ ...newExpense, category })
              }
              options={[
                { value: "Food", label: "Food" },
                { value: "Transportation", label: "Transportation" },
                { value: "Accommodation", label: "Accommodation" },
                { value: "Entertainment", label: "Entertainment" },
                { value: "Other", label: "Other" },
              ]}
              ariaLabel="Category"
              size="small"
              displayEmpty={false}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondary_text }}
            >
              Description
            </label>
            <textarea
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              placeholder="Optional description"
              className="w-full px-4 py-2 rounded-lg border-none outline-none h-20"
              style={{
                backgroundColor: colors.tertiary_bg,
                color: colors.primary_text,
              }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.secondary_text }}
            >
              Date
            </label>
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) =>
                setNewExpense({ ...newExpense, date: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border-none outline-none"
              style={{
                backgroundColor: colors.tertiary_bg,
                color: colors.primary_text,
              }}
            />
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onAdd}
            className="flex-1 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: colors.primary_accent,
              color: colors.primary_text,
            }}
          >
            Add Expense
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: colors.button_inactive,
              color: colors.primary_text,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
