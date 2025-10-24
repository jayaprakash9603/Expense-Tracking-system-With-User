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
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import useFriendAccess from "../../hooks/useFriendAccess";
import { DataGrid } from "@mui/x-data-grid";
import { Box, TextField, useMediaQuery } from "@mui/material";
import ToastNotification from "./ToastNotification";
import { useTheme } from "../../hooks/useTheme";

const NewBudget = () => {
  const { colors } = useTheme();
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

  // Permission & redirect: if read-only, auto-redirect to appropriate list route
  const { hasWriteAccess } = useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) => `/budget/${fid}`,
    selfPath: "/budget",
    defaultPath: "/budget",
  });

  const fieldStyles =
    "px-3 py-2 rounded bg-[#29282b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-full text-base sm:max-w-[350px] max-w-[250px]";
  const labelStyle = "text-base sm:text-base text-sm font-semibold mr-3";
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
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasWriteAccess) return; // safety guard
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.amount || isNaN(parseInt(formData.amount)))
      newErrors.amount = "Valid amount is required.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
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

      await dispatch(createBudgetAction(budgetData, friendId || ""));
      // if (updatedExpenses.length > 0) {
      //   await dispatch(editMultipleExpenseAction(updatedExpenses));
      // }

      friendId
        ? navigate(`/budget/${friendId}`)
        : navigate(
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
    } finally {
      setIsSubmitting(false);
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
    navigate(-1);
  };

  const handleCheckboxChange = (index) => {
    setCheckboxStates((prev) =>
      prev.map((state, i) => (i === index ? !state : state))
    );
  };

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
        <TextField
          id={id}
          name={id}
          type={type}
          value={formData[id]}
          onChange={handleInputChange}
          placeholder={`Enter ${id}`}
          error={!!errors[id]}
          variant="outlined"
          size="small"
          InputLabelProps={type === "date" ? { shrink: true } : {}}
          sx={{
            width: "100%",
            maxWidth: { xs: "250px", sm: "350px" },
            "& .MuiOutlinedInput-root": {
              backgroundColor: colors.tertiary_bg,
              color: colors.primary_text,
              "& fieldset": {
                borderColor: errors[id] ? "#ef4444" : colors.border_color,
              },
              "&:hover fieldset": {
                borderColor: errors[id] ? "#ef4444" : colors.border_color,
              },
              "&.Mui-focused fieldset": {
                borderColor: errors[id] ? "#ef4444" : colors.primary_accent,
              },
            },
            "& .MuiInputBase-input": {
              color: colors.primary_text,
            },
            "& .MuiInputBase-input::placeholder": {
              color: colors.icon_muted,
              opacity: 1,
            },
          }}
        />
      </div>
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
    <div style={{ backgroundColor: colors.primary_bg }}>
      {/* Line 327 omitted */}
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
          padding: "16px",
          marginRight: "20px",
        }}
      >
        <div>
          <div className="w-full flex justify-between items-center mb-4">
            <p
              className="font-extrabold text-2xl sm:text-3xl"
              style={{ color: colors.primary_text }}
            >
              New Budget
            </p>
            <button
              onClick={handleCloseBudget}
              className="flex items-center justify-center w-12 h-12 text-[25px] font-bold rounded mt-[-10px]"
              style={{
                color: colors.primary_accent,
                backgroundColor: colors.tertiary_bg,
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
                            style={{ accentColor: colors.primary_accent }}
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
              {/* ...existing pagination for mobile only... */}
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

export default NewBudget;
