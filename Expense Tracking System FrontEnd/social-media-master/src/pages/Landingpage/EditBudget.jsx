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
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import useFriendAccess from "../../hooks/useFriendAccess";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const EditBudget = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id, friendId } = useParams(); // Get budget ID from URL

  // Permission & redirect enforcement
  const { hasWriteAccess } = useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) => `/budget/${fid}`,
    selfPath: "/budget",
    defaultPath: "/budget",
  });
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
  const rawExpenses = useSelector((state) => state.expenses.expenses);
  // Defensive: some responses may return an object keyed by date or null; normalize to flat array
  const expenses = useMemo(() => {
    if (Array.isArray(rawExpenses)) return rawExpenses;
    if (rawExpenses && typeof rawExpenses === "object") {
      // If shape is { '2025-10-02': [ ... ], '2025-10-03': [ ... ] }
      const all = Object.values(rawExpenses).filter(Array.isArray).flat();
      return all;
    }
    return [];
  }, [rawExpenses]);
  const expenseError = useSelector((state) => state.expenses.error);
  const { budget, error: budgetError } = useSelector((state) => state.budgets);
  const [checkboxStates, setCheckboxStates] = useState([]);

  const dispatch = useDispatch();

  const fieldStyles =
    "px-3 py-2 rounded bg-[#29282b] text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-full text-base sm:max-w-[350px] max-w-[250px]";
  const labelStyle = "text-base sm:text-base text-sm font-semibold mr-3";
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
    if (!hasWriteAccess) return; // block if read-only
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
        <label
          htmlFor={id}
          className={labelStyle}
          style={{ width: "100px", color: colors.primary_text }}
        >
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
          className={`px-3 py-2 rounded transition-colors w-full focus:outline-none ${
            errors[id]
              ? "border-red-500 focus:border-red-600"
              : "focus:border-[#00dac6]"
          }`}
          style={{
            maxWidth: "350px",
            backgroundColor: colors.tertiary_bg,
            color: colors.primary_text,
            border: `1px solid ${errors[id] ? "#ef4444" : colors.border_color}`,
          }}
        />
      </div>
      {errors[id] && (
        <span
          className="text-sm ml-[100px] sm:ml-[120px]"
          style={{ color: "#ef4444" }}
        >
          {errors[id]}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ backgroundColor: colors.primary_bg }}>
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col justify-between sm:w-full"
        style={{
          height: "auto",
          minHeight: "calc(100vh - 100px)",
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: `1px solid ${colors.border_color}`,
          opacity: 1,
          marginRight: "20px",
          padding: "16px",
        }}
      >
        <div>
          <div className="w-full flex justify-between items-center mb-4">
            <p
              className="font-extrabold text-2xl sm:text-3xl"
              style={{ color: colors.primary_text }}
            >
              Edit Budget
            </p>
            <button
              onClick={handleCloseBudget}
              className="px-2 py-1 border rounded"
              style={{
                color: colors.primary_accent,
                backgroundColor: colors.tertiary_bg,
                borderColor: colors.border_color,
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = colors.hover_bg)
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = colors.tertiary_bg)
              }
            >
              X
            </button>
          </div>
          <hr
            className="border-t w-full mb-4 sm:mb-6"
            style={{ borderColor: colors.border_color }}
          />
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
              className="px-6 py-2 font-semibold rounded w-full sm:w-[150px]"
              style={{
                backgroundColor: colors.button_bg,
                color: colors.button_text,
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = colors.button_hover)
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = colors.button_bg)
              }
            >
              Link Expenses
            </button>
            {showTable && (
              <button
                onClick={handleCloseTable}
                className="px-2 py-1 border rounded mt-2 sm:mt-0 hidden sm:block"
                style={{
                  backgroundColor: colors.tertiary_bg,
                  color: colors.primary_text,
                  borderColor: colors.border_color,
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = colors.hover_bg)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = colors.tertiary_bg)
                }
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
                    className="px-2 py-1 border rounded"
                    style={{
                      backgroundColor: colors.tertiary_bg,
                      color: colors.primary_text,
                      borderColor: colors.border_color,
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = colors.hover_bg)
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = colors.tertiary_bg)
                    }
                  >
                    X
                  </button>
                </div>
                {expenses.length === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: colors.icon_muted }}
                  >
                    No rows found
                  </div>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <div
                      key={row.id}
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: colors.tertiary_bg,
                        borderColor: colors.border_color,
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className="font-semibold"
                          style={{ color: colors.primary_text }}
                        >
                          {row.original.expense.expenseName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm"
                            style={{ color: colors.secondary_text }}
                          >
                            In Budget
                          </span>
                          <input
                            type="checkbox"
                            checked={checkboxStates[row.index]}
                            onChange={() => handleCheckboxChange(row.index)}
                            className="h-5 w-5 rounded focus:ring-[#00dac6]"
                            style={{
                              accentColor: colors.primary_accent,
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="text-sm space-y-1"
                        style={{ color: colors.secondary_text }}
                      >
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
                    background: colors.tertiary_bg,
                    borderRadius: 2,
                    border: `1px solid ${colors.border_color}`,
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
                      color: colors.primary_text,
                      border: 0,
                      "& .MuiDataGrid-columnHeaders": {
                        background: colors.secondary_bg,
                        color: colors.primary_text,
                      },
                      "& .MuiDataGrid-row": {
                        background: colors.tertiary_bg,
                        "&:hover": {
                          backgroundColor: colors.hover_bg,
                        },
                      },
                      "& .MuiDataGrid-cell": {
                        borderColor: colors.border_color,
                      },
                      "& .MuiCheckbox-root": {
                        color: `${colors.primary_accent} !important`,
                      },
                      "& .MuiDataGrid-footerContainer": {
                        backgroundColor: colors.secondary_bg,
                        borderColor: colors.border_color,
                      },
                      "& .MuiTablePagination-root": {
                        color: colors.primary_text,
                      },
                      fontSize: "0.92rem",
                    }}
                  />
                </Box>
              </div>
            </div>
          )}
        </div>
        {hasWriteAccess && (
          <div className="w-full flex justify-end mt-4 sm:mt-8">
            <button
              onClick={handleSubmit}
              className={`py-2 font-semibold rounded transition-all duration-200 w-full sm:w-[120px] ${
                isSubmitting ? "sm:w-[180px]" : ""
              }`}
              disabled={isSubmitting || !hasWriteAccess}
              style={{
                position: "relative",
                opacity: isSubmitting ? 0.7 : 1,
                minWidth: isSubmitting ? 180 : 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                gap: isSubmitting ? 10 : 0,
                backgroundColor: colors.button_bg,
                color: colors.button_text,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = colors.button_hover;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.button_bg;
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="loader"
                    style={{
                      width: 20,
                      height: 20,
                      border: `3px solid ${colors.button_text}`,
                      borderTop: `3px solid ${colors.primary_accent}`,
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
        )}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: url('https://cdn-icons-png.flaticon.com/128/8350/8350450.png') no-repeat;
            background-size: 18px;
            filter: invert(1) brightness(100) contrast(100);
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
            background: ${colors.secondary_bg};
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: ${colors.primary_accent};
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: ${colors.primary_accent};
            opacity: 0.8;
          }
          .overflow-x-auto::-webkit-scrollbar {
            height: 8px;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background: ${colors.secondary_bg};
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: ${colors.primary_accent};
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: ${colors.primary_accent};
            opacity: 0.8;
          }
        `}
      </style>
    </div>
  );
};

export default EditBudget;
