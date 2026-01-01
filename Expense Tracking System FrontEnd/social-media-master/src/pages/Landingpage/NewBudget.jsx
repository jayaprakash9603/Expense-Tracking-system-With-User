import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { DataGrid } from "@mui/x-data-grid";
import { Box, TextField } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import PageHeader from "../../components/PageHeader";
import { useTranslation } from "../../hooks/useTranslation";

const NewBudget = () => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
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

  const inputWrapper = {
    width: "150px",
    minWidth: "150px",
    display: "flex",
    alignItems: "center",
  };
  const fieldStyles = `px-3 py-2 rounded w-full text-base sm:max-w-[300px] max-w-[200px] border-0 focus:outline-none focus:ring-2 focus:ring-[#00dac6]`;
  const labelStyle = "text-base sm:text-base text-sm font-semibold mr-3";
  const formRow = "mt-6 flex flex-col sm:flex-row sm:items-center gap-4 w-full";

  const fieldLabels = useMemo(
    () => ({
      name: t("newBudget.fields.name"),
      description: t("newBudget.fields.description"),
      startDate: t("newBudget.fields.startDate"),
      endDate: t("newBudget.fields.endDate"),
      amount: t("newBudget.fields.amount"),
    }),
    [t]
  );

  const fieldPlaceholders = useMemo(
    () => ({
      name: t("newBudget.placeholders.name"),
      description: t("newBudget.placeholders.description"),
      startDate: t("newBudget.placeholders.startDate"),
      endDate: t("newBudget.placeholders.endDate"),
      amount: t("newBudget.placeholders.amount"),
    }),
    [t]
  );

  const validationMessages = useMemo(
    () => ({
      name: t("newBudget.validation.name"),
      description: t("newBudget.validation.description"),
      startDate: t("newBudget.validation.startDate"),
      endDate: t("newBudget.validation.endDate"),
      amount: t("newBudget.validation.amount"),
    }),
    [t]
  );

  const tableHeaders = useMemo(
    () => ({
      date: t("newBudget.table.headers.date"),
      expenseName: t("newBudget.table.headers.expenseName"),
      amount: t("newBudget.table.headers.amount"),
      paymentMethod: t("newBudget.table.headers.paymentMethod"),
      type: t("newBudget.table.headers.type"),
      comments: t("newBudget.table.headers.comments"),
      inBudget: t("newBudget.table.headers.inBudget"),
    }),
    [t]
  );

  const requiredFields = [
    "name",
    "description",
    "startDate",
    "endDate",
    "amount",
  ];

  const formatLabelFromId = useCallback((value = "") => {
    return value
      ? value
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
      : "";
  }, []);

  const getFieldLabel = useCallback(
    (fieldId) => fieldLabels[fieldId] || formatLabelFromId(fieldId),
    [fieldLabels, formatLabelFromId]
  );

  const getPlaceholderForField = useCallback(
    (fieldId, fallbackLabel) =>
      fieldPlaceholders[fieldId] ||
      t("newBudget.placeholders.generic", {
        field: fallbackLabel || formatLabelFromId(fieldId),
      }),
    [fieldPlaceholders, formatLabelFromId, t]
  );

  const tableNoRowsLabel = t("newBudget.table.noRows");
  const linkExpensesLabel = t("newBudget.actions.linkExpenses");
  const submitLabel = t("newBudget.actions.submit");
  const submittingLabel = t("newBudget.actions.submitting");
  const closeLabel = t("common.close");
  const pageTitle = t("newBudget.title");
  const successMessage = t("newBudget.messages.createSuccess");
  const genericErrorMessage = t("newBudget.messages.createError");
  const expenseErrorFallback = t("newBudget.messages.expenseLoadError");
  const budgetErrorFallback = t("newBudget.messages.createError");
  const minActionButtonWidth = 132;

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

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
    clearFieldError(name);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasWriteAccess) return; // safety guard
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = validationMessages.name;
    if (!formData.description.trim())
      newErrors.description = validationMessages.description;
    if (!formData.startDate) newErrors.startDate = validationMessages.startDate;
    if (!formData.endDate) newErrors.endDate = validationMessages.endDate;
    if (!formData.amount || isNaN(parseFloat(formData.amount)))
      newErrors.amount = validationMessages.amount;
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
        amount: parseFloat(formData.amount) || 0,
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
            `/budget?message=${encodeURIComponent(successMessage)}&type=success`
          );
    } catch (error) {
      console.error("Submission error:", error);
      navigate(
        `/budget?message=${encodeURIComponent(
          error?.message || genericErrorMessage
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

  const renderInput = (id, type = "text") => {
    const labelText = getFieldLabel(id);
    const placeholderText = getPlaceholderForField(id, labelText);
    const isRequired = requiredFields.includes(id);

    return (
      <div className="flex flex-col flex-1">
        <div className="flex items-center">
          <label
            htmlFor={id}
            style={{
              ...inputWrapper,
              color: colors.primary_text,
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            {labelText}
            {isRequired && <span className="text-red-500"> *</span>}
          </label>
          <TextField
            id={id}
            name={id}
            type={type === "date" ? "text" : type}
            value={formData[id]}
            onChange={handleInputChange}
            placeholder={placeholderText}
            error={!!errors[id]}
            variant="outlined"
            size="small"
            InputProps={{
              className: fieldStyles,
              style: {
                height: "52px",
                backgroundColor: colors.primary_bg,
                color: colors.primary_text,
              },
            }}
            sx={{
              width: "100%",
              maxWidth: { xs: "250px", sm: "300px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: colors.primary_bg,
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
  };

  const renderDateInput = (id) => {
    const labelText = getFieldLabel(id);

    return (
      <div className="flex flex-col flex-1">
        <div className="flex items-center">
          <label
            htmlFor={id}
            style={{
              ...inputWrapper,
              color: colors.primary_text,
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            {labelText}
            <span className="text-red-500"> *</span>
          </label>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={formData[id] ? dayjs(formData[id]) : null}
              onChange={(newValue) => {
                if (newValue) {
                  const formatted = dayjs(newValue).format("YYYY-MM-DD");
                  setFormData((prev) => {
                    const updatedFormData = { ...prev, [id]: formatted };
                    if ((id === "startDate" || id === "endDate") && showTable) {
                      dispatch(
                        fetchExpenses(
                          id === "startDate"
                            ? formatted
                            : updatedFormData.startDate,
                          id === "endDate"
                            ? formatted
                            : updatedFormData.endDate,
                          "desc",
                          friendId || ""
                        )
                      );
                    }
                    return updatedFormData;
                  });
                }
                clearFieldError(id);
              }}
              sx={{
                background: colors.primary_bg,
                borderRadius: 2,
                color: colors.primary_text,
                ".MuiInputBase-input": {
                  color: colors.primary_text,
                  height: 32,
                  fontSize: 18,
                },
                ".MuiSvgIcon-root": { color: "#00dac6" },
                width: 300,
                height: 56,
                minHeight: 56,
                maxHeight: 56,
              }}
              slotProps={{
                textField: {
                  size: "medium",
                  variant: "outlined",
                  sx: {
                    color: colors.primary_text,
                    height: 56,
                    minHeight: 56,
                    maxHeight: 56,
                    width: 300,
                    fontSize: 18,
                    "& .MuiInputBase-root": {
                      height: 56,
                      minHeight: 56,
                      maxHeight: 56,
                    },
                    "& input": {
                      height: 32,
                      fontSize: 18,
                      color: colors.primary_text,
                    },
                  },
                },
              }}
              format={dateFormat}
            />
          </LocalizationProvider>
        </div>
        {errors[id] && (
          <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
            {errors[id]}
          </span>
        )}
      </div>
    );
  };

  const renderAmountInput = () => {
    const labelText = getFieldLabel("amount");
    const placeholderText = getPlaceholderForField("amount", labelText);

    return (
      <div className="flex flex-col flex-1">
        <div className="flex items-center">
          <label
            htmlFor="amount"
            style={{
              ...inputWrapper,
              color: colors.primary_text,
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            {labelText}
            <span className="text-red-500"> *</span>
          </label>
          <TextField
            id="amount"
            name="amount"
            type="number"
            value={formData.amount || ""}
            onChange={(e) => {
              handleInputChange(e);
              clearFieldError("amount");
            }}
            placeholder={placeholderText}
            variant="outlined"
            error={!!errors.amount}
            InputProps={{
              className: fieldStyles,
              style: {
                height: "52px",
                backgroundColor: colors.primary_bg,
                color: colors.primary_text,
                borderColor: errors.amount ? "#ef4444" : colors.border_color,
                borderWidth: errors.amount ? "2px" : "1px",
              },
            }}
            sx={{
              width: "100%",
              maxWidth: "300px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: errors.amount ? "#ef4444" : colors.border_color,
                  borderWidth: errors.amount ? "2px" : "1px",
                  borderStyle: "solid",
                },
                "&:hover fieldset": {
                  borderColor: errors.amount ? "#ef4444" : colors.border_color,
                  borderWidth: errors.amount ? "2px" : "1px",
                  borderStyle: "solid",
                },
                "&.Mui-focused fieldset": {
                  borderColor: errors.amount ? "#ef4444" : "#00dac6",
                  borderWidth: errors.amount ? "2px" : "2px",
                  borderStyle: "solid",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: errors.amount ? "#ef4444" : colors.border_color,
                  borderWidth: errors.amount ? "2px" : "1px",
                  borderStyle: "solid",
                },
              },
              "& .MuiInputBase-input": {
                color: colors.primary_text,
              },
            }}
          />
        </div>
      </div>
    );
  };

  // DataGrid columns for desktop
  const dataGridColumns = [
    { field: "date", headerName: tableHeaders.date, flex: 1, minWidth: 80 },
    {
      field: "expenseName",
      headerName: tableHeaders.expenseName,
      flex: 1,
      minWidth: 120,
    },
    { field: "amount", headerName: tableHeaders.amount, flex: 1, minWidth: 80 },
    {
      field: "paymentMethod",
      headerName: tableHeaders.paymentMethod,
      flex: 1,
      minWidth: 120,
    },
    { field: "type", headerName: tableHeaders.type, flex: 1, minWidth: 80 },
    {
      field: "comments",
      headerName: tableHeaders.comments,
      flex: 1,
      minWidth: 120,
    },
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
        header: tableHeaders.date,
        accessorKey: "date",
        size: 120,
      },
      {
        header: tableHeaders.inBudget,
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
        header: tableHeaders.expenseName,
        accessorKey: "expense.expenseName",
        size: 150,
      },
      {
        header: tableHeaders.amount,
        accessorKey: "expense.amount",
        size: 80,
      },
      {
        header: tableHeaders.paymentMethod,
        accessorKey: "expense.paymentMethod",
        size: 120,
      },
      {
        header: tableHeaders.type,
        accessorKey: "expense.type",
        size: 80,
      },
      {
        header: tableHeaders.comments,
        accessorKey: "expense.comments",
        size: 200,
      },
    ],
    [checkboxStates, tableHeaders]
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
          <PageHeader
            title={pageTitle}
            onClose={handleCloseBudget}
            // titleClassName="font-extrabold text-2xl sm:text-3xl"
            // containerClassName="w-full flex justify-between items-center mb-4"
          />
          <div className={formRow}>
            {renderInput("name")}
            {renderInput("description")}
          </div>
          <div className={formRow}>
            {renderDateInput("startDate")}
            {renderDateInput("endDate")}
          </div>
          <div className={`${formRow} mb-4`}>
            {renderAmountInput()}
            <div className="flex-1 hidden sm:block"></div>
          </div>
          {budgetError && (
            <div className="text-red-500 text-sm mb-4">
              {budgetError.message || budgetErrorFallback}
            </div>
          )}
          {expenseError && (
            <div className="text-red-500 text-sm mb-4">
              {expenseError.message || expenseErrorFallback}
            </div>
          )}
          <div className="mt-4 sm:mt-[50px] w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              onClick={handleLinkExpenses}
              className="px-6 py-2 font-semibold rounded w-full sm:w-auto"
              style={{
                backgroundColor: colors.button_bg,
                color: colors.button_text,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = colors.button_hover)
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = colors.button_bg)
              }
            >
              {linkExpensesLabel}
            </button>
            {showTable && (
              <button
                onClick={handleCloseTable}
                className="px-2 py-1 border rounded mt-2 sm:mt-0 hidden sm:block"
                style={{
                  backgroundColor: colors.active_bg,
                  color: colors.primary_text,
                  borderColor: colors.border_color,
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = colors.hover_bg)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = colors.active_bg)
                }
              >
                {closeLabel}
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
                      backgroundColor: colors.active_bg,
                      color: colors.primary_text,
                      borderColor: colors.border_color,
                      whiteSpace: "nowrap",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = colors.hover_bg)
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = colors.active_bg)
                    }
                  >
                    {closeLabel}
                  </button>
                </div>
                {!Array.isArray(expenses) || expenses.length === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: colors.icon_muted }}
                  >
                    {tableNoRowsLabel}
                  </div>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <div
                      key={row.id}
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: colors.active_bg,
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
                            {tableHeaders.inBudget}
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
                          <span className="font-medium">
                            {tableHeaders.date}:
                          </span>{" "}
                          {row.original.date}
                        </p>
                        <p>
                          <span className="font-medium">
                            {tableHeaders.amount}:
                          </span>{" "}
                          {row.original.expense.amount}
                        </p>
                        <p>
                          <span className="font-medium">
                            {tableHeaders.paymentMethod}:
                          </span>{" "}
                          {row.original.expense.paymentMethod}
                        </p>
                        <p>
                          <span className="font-medium">
                            {tableHeaders.type}:
                          </span>{" "}
                          {row.original.expense.type}
                        </p>
                        <p>
                          <span className="font-medium">
                            {tableHeaders.comments}:
                          </span>{" "}
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
                    background: colors.active_bg,
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
                    localeText={{
                      noRowsLabel: tableNoRowsLabel,
                    }}
                    sx={{
                      color: colors.primary_text,
                      border: 0,
                      "& .MuiDataGrid-columnHeaders": {
                        background: colors.hover_bg,
                        color: colors.primary_text,
                      },
                      "& .MuiDataGrid-row": {
                        background: colors.active_bg,
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
              className="py-2 font-semibold rounded transition-all duration-200 w-full sm:w-auto"
              disabled={isSubmitting || !hasWriteAccess}
              style={{
                position: "relative",
                opacity: isSubmitting ? 0.7 : 1,
                minWidth: isSubmitting ? 180 : minActionButtonWidth,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                gap: isSubmitting ? 10 : 0,
                backgroundColor: colors.button_bg,
                color: colors.button_text,
                whiteSpace: "nowrap",
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
                  <span>{submittingLabel}</span>
                </>
              ) : (
                submitLabel
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
