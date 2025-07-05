import React, { useState } from "react";
import { IconButton, Button, TextField } from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const ExpenseItemsTable = ({ expenses, setExpenses, onClose }) => {
  const [newExpense, setNewExpense] = useState({
    itemName: "",
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
  });

  const handleAddExpense = () => {
    if (newExpense.itemName.trim()) {
      const calculatedTotal = newExpense.quantity * newExpense.unitPrice;
      const expenseToAdd = {
        ...newExpense,
        totalPrice: calculatedTotal,
        id: Date.now(), // Simple ID generation
      };
      setExpenses([...expenses, expenseToAdd]);
      setNewExpense({
        itemName: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      });
    }
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const handleNewExpenseChange = (field, value) => {
    const updatedExpense = { ...newExpense, [field]: value };

    if (field === "quantity" || field === "unitPrice") {
      updatedExpense.totalPrice =
        updatedExpense.quantity * updatedExpense.unitPrice;
    }

    setNewExpense(updatedExpense);
  };

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + (expense.totalPrice || 0),
    0
  );

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-xl font-semibold">Expense Items</h3>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#ff4444",
            "&:hover": {
              backgroundColor: "#ff444420",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>

      {/* Add New Expense Form */}
      <div className="bg-[#29282b] p-4 rounded border border-gray-600 mb-4">
        <h4 className="text-white text-lg mb-3">Add New Item</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <TextField
            label="Item Name"
            value={newExpense.itemName}
            onChange={(e) => handleNewExpenseChange("itemName", e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "#1a1a1a",
                color: "#fff",
              },
              "& .MuiInputLabel-root": {
                color: "#9ca3af",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgb(75, 85, 99)",
                },
                "&:hover fieldset": {
                  borderColor: "rgb(75, 85, 99)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#00dac6",
                },
              },
            }}
          />
          <TextField
            label="Quantity"
            type="number"
            value={newExpense.quantity}
            onChange={(e) =>
              handleNewExpenseChange(
                "quantity",
                parseFloat(e.target.value) || 0
              )
            }
            variant="outlined"
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "#1a1a1a",
                color: "#fff",
              },
              "& .MuiInputLabel-root": {
                color: "#9ca3af",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgb(75, 85, 99)",
                },
                "&:hover fieldset": {
                  borderColor: "rgb(75, 85, 99)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#00dac6",
                },
              },
            }}
          />
          <TextField
            label="Unit Price"
            type="number"
            value={newExpense.unitPrice}
            onChange={(e) =>
              handleNewExpenseChange(
                "unitPrice",
                parseFloat(e.target.value) || 0
              )
            }
            variant="outlined"
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "#1a1a1a",
                color: "#fff",
              },
              "& .MuiInputLabel-root": {
                color: "#9ca3af",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgb(75, 85, 99)",
                },
                "&:hover fieldset": {
                  borderColor: "rgb(75, 85, 99)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#00dac6",
                },
              },
            }}
          />
          <Button
            onClick={handleAddExpense}
            startIcon={<AddIcon />}
            variant="contained"
            sx={{
              backgroundColor: "#00DAC6",
              color: "black",
              "&:hover": {
                backgroundColor: "#00b8a0",
              },
            }}
          >
            Add Item
          </Button>
        </div>
        <div className="mt-2 text-white">
          Total Price: ${newExpense.totalPrice.toFixed(2)}
        </div>
      </div>

      {/* Expenses List */}
      {expenses.length > 0 ? (
        <div className="bg-[#29282b] rounded border border-gray-600">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-3 text-white">Item Name</th>
                  <th className="text-left p-3 text-white">Quantity</th>
                  <th className="text-left p-3 text-white">Unit Price</th>
                  <th className="text-left p-3 text-white">Total Price</th>
                  <th className="text-left p-3 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-700">
                    <td className="p-3 text-white">{expense.itemName}</td>
                    <td className="p-3 text-white">{expense.quantity}</td>
                    <td className="p-3 text-white">
                      ${expense.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-white">
                      ${expense.totalPrice.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <IconButton
                        onClick={() => handleDeleteExpense(expense.id)}
                        sx={{
                          color: "#ff4444",
                          "&:hover": {
                            backgroundColor: "#ff444420",
                          },
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-gray-600 bg-[#1a1a1a]">
            <div className="text-white font-semibold text-lg">
              Total Amount: ${totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8 bg-[#29282b] rounded border border-gray-600">
          No expense items added yet
        </div>
      )}
    </div>
  );
};

export default ExpenseItemsTable;
