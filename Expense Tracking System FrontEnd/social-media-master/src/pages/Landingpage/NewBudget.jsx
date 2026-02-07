import React, { useState, useMemo, useEffect, useCallback } from "react";
import { fetchExpenses } from "../../Redux/Expenses/expense.action";
import { createBudgetAction } from "../../Redux/Budget/budget.action";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import { Box, TextField } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import PageHeader from "../../components/PageHeader";
import { useTranslation } from "../../hooks/useTranslation";
import GroupedDataTable from "../../components/common/GroupedDataTable/GroupedDataTable";
import { useExpenseTableConfig } from "../../hooks/useExpenseTableConfig";
import { FilterPopover } from "../../components/ui";

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
  // Replaced checkboxStates array with ID map for GroupedDataTable
  const [selectedExpenseIds, setSelectedExpenseIds] = useState({});

  // GroupedDataTable Configuration
  const {
    columns: expenseColumns,
    filteredRows,
    sort,
    setSort,
    columnFilters,
    setColumnFilters,
  } = useExpenseTableConfig(expenses, t);

  // Filter Popover State
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);

  const handleFilterClick = (e, column) => {
    setFilterAnchorEl(e.currentTarget);
    setFilterColumn(column);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setFilterColumn(null);
  };

  const handleFilterApply = (filterData) => {
    if (filterColumn) {
      setColumnFilters((prev) => ({
        ...prev,
        [filterColumn.key]: filterData,
      }));
    }
  };



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
      const expenseIds = Object.keys(selectedExpenseIds)
        .filter((id) => selectedExpenseIds[id])
        .map((id) => Number(id)); // Ensure IDs are numeric if backend expects numbers

      const budgetData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        amount: parseFloat(formData.amount) || 0,
        expenseIds: expenseIds,
      };

      console.log("Submitting budget:", budgetData);

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

  const handleRowSelect = (id) => {
    setSelectedExpenseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const allIds = {};
      expenses.forEach((expense) => {
        allIds[expense.id] = true;
      });
      setSelectedExpenseIds(allIds);
    } else {
      setSelectedExpenseIds({});
    }
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

  // DataGrid and manual table setup removed in favor of GroupedDataTable

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
              <GroupedDataTable
                rows={filteredRows}
                columns={expenseColumns}
                sort={sort}
                onSortChange={setSort}
                enableSelection={true}
                selectedRows={selectedExpenseIds}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
                columnFilters={columnFilters}
                onFilterClick={handleFilterClick}
                activeTab="all"
              />
              <FilterPopover
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
                onApply={handleFilterApply}
                columnKey={filterColumn?.key}
              />
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
