import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  editMultipleExpenseAction,
  fetchExpenses,
  getExpensesByBudget,
} from "../../Redux/Expenses/expense.action";
import {
  getBudgetById,
  editBudgetAction,
} from "../../Redux/Budget/budget.action";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const EditBudget = () => {
  const navigate = useNavigate();
  const { id, friendId } = useParams(); // Get budget ID from URL
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
  const { budget, error: budgetError } = useSelector((state) => state.budgets);
  const [checkboxStates, setCheckboxStates] = useState([]);

  const dispatch = useDispatch();

  const fieldStyles =
    "px-3 py-2 rounded bg-[#29282b] text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-full text-base sm:max-w-[350px] max-w-[250px]";
  const labelStyle =
    "text-white text-base sm:text-base text-sm font-semibold mr-3";
  const formRow = "mt-6 flex flex-col sm:flex-row sm:items-center gap-4 w-full";

  // Pre-populate form with budget data
  useEffect(() => {
    if (budget && budget.id === parseInt(id)) {
      setFormData({
        name: budget.name || "",
        description: budget.description || "",
        startDate: budget.startDate || today,
        endDate: budget.endDate || today,
        amount: budget.amount ? budget.amount.toString() : "",
      });
      setShowTable(!budget.budgetHasExpenses); // Show table if no expenses are linked

      console.log(
        "start date: ",
        budget.startDate,
        "end date: ",
        budget.endDate
      );
      dispatch(
        getExpensesByBudget(
          id,
          budget.startDate,
          budget.endDate,
          friendId || ""
        )
      );
    }
  }, [budget, id, dispatch, today]);

  // Checkbox state for 'In Budget' column
  useEffect(() => {
    setCheckboxStates(
      expenses.map((expense) => expense.includeInBudget || false)
    );
  }, [expenses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
      if ((name === "startDate" || name === "endDate") && showTable) {
        dispatch(
          getExpensesByBudget(
            id,
            updatedFormData.startDate,
            updatedFormData.endDate,
            friendId || ""
          )
        );
      }
      return updatedFormData;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.amount || isNaN(parseFloat(formData.amount)))
      newErrors.amount = "Valid amount is required.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Collect expense IDs where includeInBudget is checked
        const expenseIds = expenses
          .filter((expense, index) => checkboxStates[index])
          .map((expense) => expense.id);

        const budgetData = {
          id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          startDate: formData.startDate,
          endDate: formData.endDate,
          amount: parseFloat(formData.amount) || 0,
          expenseIds: expenseIds,
        };

        const updatedExpenses = expenses.map((expense, index) => ({
          ...expense,
          includeInBudget: checkboxStates[index],
        }));

        console.log("Submitting budget data:", budgetData);
        await dispatch(
          editBudgetAction(budgetData.id, budgetData, friendId || "")
        );
        // if (updatedExpenses.length > 0) {
        //   await dispatch(editMultipleExpenseAction(updatedExpenses));
        // }

        navigate(-1, "budget updated successfully.", "success");
      } catch (error) {
        console.error("Submission error:", error);
        navigate(-1, "Budget updated successfully.", "success");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      navigate(-1, "Please fill out all required fields correctly.", "error");
    }
  };

  const handleLinkExpenses = () => {
    setShowTable(true);
    dispatch(
      getExpensesByBudget(
        id,
        formData.startDate,
        formData.endDate,
        friendId || ""
      )
    );
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  const handleCloseBudget = () => {
    navigate(-1);
  };

  const handleCheckboxChange = (index) => {
    setCheckboxStates((prev) =>
      prev.map((state, i) => (i === index ? !state : state))
    );
  };

  // DataGrid columns for desktop
  const dataGridColumns = [
    {
      field: "includeInBudget",
      headerName: (
        <input
          type="checkbox"
          checked={checkboxStates.length > 0 && checkboxStates.every(Boolean)}
          ref={(el) => {
            if (el) {
              el.indeterminate =
                checkboxStates.some(Boolean) && !checkboxStates.every(Boolean);
            }
          }}
          onChange={(e) => {
            const checked = e.target.checked;
            setCheckboxStates(Array(expenses.length).fill(checked));
          }}
          className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
          style={{ accentColor: "#00b8a0", marginLeft: 2, marginRight: 2 }}
        />
      ),
      flex: 0.25,
      minWidth: 40,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={checkboxStates[params.row.index]}
          onChange={() => handleCheckboxChange(params.row.index)}
          className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
          style={{ accentColor: "#00b8a0" }}
        />
      ),
    },
    { field: "date", headerName: "Date", flex: 0.5, minWidth: 60 },
    {
      field: "expenseName",
      headerName: "Expense Name",
      flex: 1,
      minWidth: 120,
    },
    { field: "amount", headerName: "Amount", flex: 0.4, minWidth: 50 },
    {
      field: "paymentMethod",
      headerName: "Payment Method",
      flex: 0.7,
      minWidth: 80,
    },
    { field: "type", headerName: "Type", flex: 0.4, minWidth: 50 },
    { field: "comments", headerName: "Comments", flex: 2, minWidth: 200 },
  ];

  // DataGrid rows
  const dataGridRows = Array.isArray(expenses)
    ? expenses.map((item, index) => ({
        ...item,
        index,
        id: item.id ?? `temp-${index}-${Date.now()}`,
        expenseName: item.expense?.expenseName || "",
        amount: item.expense?.amount || "",
        paymentMethod: item.expense?.paymentMethod || "",
        type: item.expense?.type || "",
        comments: item.expense?.comments || "",
        includeInBudget: checkboxStates[index],
      }))
    : [];

  // Table columns for mobile view
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

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPageIndex(0);
  };

  // Add renderInput function
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
          className={fieldStyles}
        />
      </div>
      {errors[id] && (
        <span className="text-red-500 text-sm ml-[100px] sm:ml-[120px]">
          {errors[id]}
        </span>
      )}
    </div>
  );

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
              Edit Budget
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
              Error: {budgetError.message || "Failed to load or update budget."}
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
                            style={{
                              accentColor: "#00b8a0",
                            }}
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
                    disableRowSelectionOnClick
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
            </div>
          )}
        </div>
        <div className="w-full flex justify-end mt-4 sm:mt-8">
          <button
            onClick={handleSubmit}
            className={`py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] transition-all duration-200 w-full sm:w-[120px] ${
              isSubmitting ? "sm:w-[180px]" : ""
            }`}
            disabled={isSubmitting}
            style={{
              position: "relative",
              opacity: isSubmitting ? 0.7 : 1,
              minWidth: isSubmitting ? 180 : 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              gap: isSubmitting ? 10 : 0,
            }}
          >
            {isSubmitting ? (
              <>
                <span
                  className="loader"
                  style={{
                    width: 20,
                    height: 20,
                    border: "3px solid #fff",
                    borderTop: "3px solid #00DAC6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    display: "inline-block",
                    marginRight: 10,
                  }}
                ></span>
                <span>Submitting...</span>
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
      {/* <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
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

export default EditBudget;
