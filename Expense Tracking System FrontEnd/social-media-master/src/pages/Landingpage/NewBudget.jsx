import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { fetchExpenses } from "../../Redux/Expenses/expense.action";
import { createBudgetAction } from "../../Redux/Budget/budget.action";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Box, useMediaQuery } from "@mui/material";

const NewBudget = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: today,
    endDate: today,
    amount: "",
  });
  const [errors, setErrors] = useState({});
  const [showTable, setShowTable] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const { expenses, error: expenseError } = useSelector(
    (state) => state.expenses
  );
  const { error: budgetError } = useSelector((state) => state.budgets);
  const [checkboxStates, setCheckboxStates] = useState([]);

  const dispatch = useDispatch();
  const { friendId } = useParams();

  const fieldStyles =
    "px-3 py-2 rounded bg-[#29282b] text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-full text-base sm:max-w-[350px] max-w-[250px]";
  const labelStyle =
    "text-white text-base sm:text-base text-sm font-semibold mr-3";
  const formRow = "mt-6 flex flex-col sm:flex-row sm:items-center gap-4 w-full";

  useEffect(() => {
    setCheckboxStates(
      expenses.map((expense) => expense.includeInBudget || false)
    );
  }, [expenses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
      console.log("Updated formData:", updatedFormData);
      if ((name === "startDate" || name === "endDate") && showTable) {
        dispatch(
          fetchExpenses(
            updatedFormData.startDate,
            updatedFormData.endDate,
            "desc",
            friendId || ""
          )
        );
      }
      return updatedFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.amount || isNaN(parseInt(formData.amount)))
      newErrors.amount = "Valid amount is required.";
    setErrors(newErrors);

    // If there are errors, do not submit or navigate
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      // Collect expense IDs where includeInBudget is checked
      const expenseIds = expenses
        .filter((expense, index) => checkboxStates[index])
        .map((expense) => expense.id);

      const budgetData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        amount: parseInt(formData.amount) || 0,
        expenseIds: expenseIds,
      };

      const updatedExpenses = expenses.map((expense, index) => ({
        ...expense,
        includeInBudget: checkboxStates[index],
      }));

      console.log("Submitting budget:", budgetData);
      console.log("Saving all expenses:", updatedExpenses);

      dispatch(createBudgetAction(budgetData, friendId || ""));
      // if (updatedExpenses.length > 0) {
      //   await dispatch(editMultipleExpenseAction(updatedExpenses));
      // }

      navigate(
        `/budget?message=${encodeURIComponent(
          "Budget created successfully!"
        )}&type=success`
      );
    } catch (error) {
      console.error("Submission error:", error);
      navigate(
        `/budget?message=${encodeURIComponent(
          error.message || "Failed to create budget."
        )}&type=error`
      );
    }
  };

  const handleLinkExpenses = () => {
    console.log("Link Expenses clicked");
    setShowTable(true);
    dispatch(
      fetchExpenses(
        formData.startDate,
        formData.endDate,
        "desc",
        friendId || ""
      )
    );
  };

  const handleCloseTable = () => {
    console.log("Close Table clicked");
    setShowTable(false);
  };

  const handleCloseBudget = () => {
    console.log("Close Budget clicked");
    navigate("/budget");
  };

  const handleCheckboxChange = (index) => {
    setCheckboxStates((prev) =>
      prev.map((state, i) => (i === index ? !state : state))
    );
  };

  const renderInput = (id, type = "text") => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor={id} className={labelStyle} style={{ width: "100px" }}>
          {id
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
        </label>
        <input
          id={id}
          name={id}
          type={type}
          value={formData[id]}
          onChange={handleInputChange}
          placeholder={`Enter ${id}`}
          className={
            fieldStyles +
            (errors[id] ? " border-red-500 focus:ring-red-500" : "")
          }
          style={
            errors[id]
              ? { borderColor: "#ef4444", boxShadow: "0 0 0 2px #ef4444" }
              : {}
          }
        />
      </div>
      {/* No error message below the field */}
    </div>
  );

  // DataGrid columns for desktop
  const dataGridColumns = [
    { field: "date", headerName: "Date", flex: 1, minWidth: 80 },
    {
      field: "expenseName",
      headerName: "Expense Name",
      flex: 1,
      minWidth: 120,
    },
    { field: "amount", headerName: "Amount", flex: 1, minWidth: 80 },
    {
      field: "paymentMethod",
      headerName: "Payment Method",
      flex: 1,
      minWidth: 120,
    },
    { field: "type", headerName: "Type", flex: 1, minWidth: 80 },
    { field: "comments", headerName: "Comments", flex: 1, minWidth: 120 },
  ];

  // DataGrid selection logic
  const dataGridRows = Array.isArray(expenses)
    ? expenses.map((item, index) => ({
        ...item, // keep all original fields
        id: item.id ?? `temp-${index}-${Date.now()}`,
        expenseName: item.expense?.expenseName || "",
        amount: item.expense?.amount || "",
        paymentMethod: item.expense?.paymentMethod || "",
        type: item.expense?.type || "",
        comments: item.expense?.comments || "",
      }))
    : [];

  // Map checkboxStates to DataGrid selection model
  const selectedIds = dataGridRows
    .filter((_, idx) => checkboxStates[idx])
    .map((row) => row.id);

  const handleDataGridSelection = (newSelection) => {
    // Map DataGrid selection to checkboxStates
    const newCheckboxStates = dataGridRows.map((row, idx) =>
      newSelection.includes(row.id)
    );
    setCheckboxStates(newCheckboxStates);
  };

  const columns = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "date",
        size: 120,
      },
      {
        header: "In Budget",
        accessorKey: "includeInBudget",
        size: 80,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={checkboxStates[row.index]}
            onChange={() => handleCheckboxChange(row.index)}
            className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
          />
        ),
      },
      {
        header: "Expense Name",
        accessorKey: "expense.expenseName",
        size: 150,
      },
      {
        header: "Amount",
        accessorKey: "expense.amount",
        size: 80,
      },
      {
        header: "Payment Method",
        accessorKey: "expense.paymentMethod",
        size: 120,
      },
      {
        header: "Type",
        accessorKey: "expense.type",
        size: 80,
      },
      {
        header: "Comments",
        accessorKey: "expense.comments",
        size: 200,
      },
    ],
    [checkboxStates]
  );

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(expenses.length / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
  });

  return (
    <div className="bg-[#1b1b1b]">
      <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col justify-between sm:w-full"
        style={{
          height: "auto",
          minHeight: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: "1px solid rgb(0, 0, 0)",
          opacity: 1,
          padding: "16px",
        }}
      >
        <div>
          <div className="w-full flex justify-between items-center mb-4">
            <p className="text-white font-extrabold text-2xl sm:text-3xl">
              New Budget
            </p>
            <button
              onClick={handleCloseBudget}
              className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a]"
            >
              X
            </button>
          </div>
          <hr className="border-t border-gray-600 w-full mb-4 sm:mb-6" />
          <div className={formRow}>
            {renderInput("name")}
            {renderInput("description")}
          </div>
          <div className={formRow}>
            {renderInput("startDate", "date")}
            {renderInput("endDate", "date")}
          </div>
          <div className={`${formRow} mb-4`}>
            {renderInput("amount", "number")}
            <div className="flex-1 hidden sm:block"></div>
          </div>
          {budgetError && (
            <div className="text-red-500 text-sm mb-4">
              Error: {budgetError.message || "Failed to create budget."}
            </div>
          )}
          {expenseError && (
            <div className="text-red-500 text-sm mb-4">
              Error: {expenseError.message || "Failed to load expenses."}
            </div>
          )}
          <div className="mt-4 sm:mt-[50px] w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              onClick={handleLinkExpenses}
              className="px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] w-full sm:w-[150px]"
            >
              Link Expenses
            </button>
            {showTable && (
              <button
                onClick={handleCloseTable}
                className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a] mt-2 sm:mt-0 hidden sm:block"
              >
                X
              </button>
            )}
          </div>
          {showTable && (
            <div className="mt-4 sm:mt-6 w-full relative">
              <div className="block sm:hidden space-y-4">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleCloseTable}
                    className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a]"
                  >
                    X
                  </button>
                </div>
                {expenses.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No rows found
                  </div>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <div
                      key={row.id}
                      className="bg-[#29282b] border border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">
                          {row.original.expense.expenseName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300 text-sm">
                            In Budget
                          </span>
                          <input
                            type="checkbox"
                            checked={checkboxStates[row.index]}
                            onChange={() => handleCheckboxChange(row.index)}
                            className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
                          />
                        </div>
                      </div>
                      <div className="text-gray-300 text-sm space-y-1">
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {row.original.date}
                        </p>
                        <p>
                          <span className="font-medium">Amount:</span>{" "}
                          {row.original.expense.amount}
                        </p>
                        <p>
                          <span className="font-medium">Payment Method:</span>{" "}
                          {row.original.expense.paymentMethod}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {row.original.expense.type}
                        </p>
                        <p>
                          <span className="font-medium">Comments:</span>{" "}
                          {row.original.expense.comments || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="hidden sm:block">
                <Box
                  sx={{
                    height: 340,
                    width: "100%",
                    background: "#29282b",
                    borderRadius: 2,
                    border: "1px solid #444",
                  }}
                >
                  <DataGrid
                    rows={dataGridRows}
                    columns={dataGridColumns}
                    getRowId={(row) => row.id}
                    checkboxSelection
                    disableRowSelectionOnClick
                    selectionModel={selectedIds}
                    onRowSelectionModelChange={handleDataGridSelection}
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: pageSize },
                      },
                    }}
                    rowHeight={45}
                    headerHeight={32}
                    sx={{
                      color: "#fff",
                      border: 0,
                      "& .MuiDataGrid-columnHeaders": { background: "#222" },
                      "& .MuiDataGrid-row": { background: "#29282b" },
                      "& .MuiCheckbox-root": { color: "#00dac6 !important" },
                      fontSize: "0.92rem",
                    }}
                  />
                </Box>
              </div>
              {/* ...existing pagination for mobile only... */}
            </div>
          )}
        </div>
        <div className="w-full flex justify-end mt-4 sm:mt-8">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] w-full sm:w-[120px]"
          >
            Submit
          </button>
        </div>
      </div>
      <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: url('https://cdn-icons-png.flaticon.com/128/8350/8350450.png') no-repeat;
            background-size: 18px;
            filter: invert(1) brightness(100) contrast(100);
          }
          input[type="date"], input[type="number"] {
            color: white;
          }
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
            appearance: none;
          }
          .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #1b1b1b;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #00dac6;
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #00b8a0;
          }
          .overflow-x-auto::-webkit-scrollbar {
            height: 8px;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background: #1b1b1b;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #00dac6;
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: #00b8a0;
          }
        `}
      </style>
    </div>
  );
};

export default NewBudget;
