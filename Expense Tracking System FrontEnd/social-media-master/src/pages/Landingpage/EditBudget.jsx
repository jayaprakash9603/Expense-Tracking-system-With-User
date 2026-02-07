import React, { useState, useMemo, useEffect, useCallback } from "react";
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

const EditBudget = () => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
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
  const { budget, error: budgetError } = useSelector((state) => state.budgets);
  const { error: expenseError } = useSelector((state) => state.expenses);
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
  const [selectedExpenseIds, setSelectedExpenseIds] = useState({});

  const dispatch = useDispatch();

  useEffect(() => {
    if (id) {
      dispatch(getBudgetById(id));
    }
  }, [id, dispatch]);

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
      name: t("editBudget.fields.name"),
      description: t("editBudget.fields.description"),
      startDate: t("editBudget.fields.startDate"),
      endDate: t("editBudget.fields.endDate"),
      amount: t("editBudget.fields.amount"),
    }),
    [t],
  );

  const fieldPlaceholders = useMemo(
    () => ({
      name: t("editBudget.placeholders.name"),
      description: t("editBudget.placeholders.description"),
      startDate: t("editBudget.placeholders.startDate"),
      endDate: t("editBudget.placeholders.endDate"),
      amount: t("editBudget.placeholders.amount"),
    }),
    [t],
  );

  const validationMessages = useMemo(
    () => ({
      name: t("editBudget.validation.name"),
      description: t("editBudget.validation.description"),
      startDate: t("editBudget.validation.startDate"),
      endDate: t("editBudget.validation.endDate"),
      amount: t("editBudget.validation.amount"),
    }),
    [t],
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
    [fieldLabels, formatLabelFromId],
  );

  const getPlaceholderForField = useCallback(
    (fieldId, fallbackLabel) =>
      fieldPlaceholders[fieldId] ||
      t("editBudget.placeholders.generic", {
        field: fallbackLabel || formatLabelFromId(fieldId),
      }),
    [fieldPlaceholders, formatLabelFromId, t],
  );

  const tableNoRowsLabel = t("editBudget.table.noRows");
  const linkExpensesLabel = t("editBudget.actions.linkExpenses");
  const submitLabel = t("editBudget.actions.submit");
  const submittingLabel = t("editBudget.actions.submitting");
  const closeLabel = t("common.close");
  const notAvailableLabel = t("common.notAvailable");
  const pageTitle = t("editBudget.title");
  const successMessage = t("editBudget.messages.updateSuccess");
  const genericErrorMessage = t("editBudget.messages.updateError");
  const expenseErrorFallback = t("editBudget.messages.expenseLoadError");
  const budgetErrorFallback = t("editBudget.messages.budgetLoadError");
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
        budget.endDate,
      );
      dispatch(
        getExpensesByBudget(
          id,
          budget.startDate,
          budget.endDate,
          friendId || "",
        ),
      );
    }
  }, [budget, id, dispatch, today]);

  // Checkbox state initialization for 'In Budget' column
  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const initialSelection = {};
      expenses.forEach((expense) => {
        if (expense.includeInBudget) {
          initialSelection[expense.id] = true;
        }
      });
      setSelectedExpenseIds(initialSelection);
    }
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
            friendId || "",
          ),
        );
      }
      return updatedFormData;
    });
    clearFieldError(name);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasWriteAccess) return; // block if read-only
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
        .map((id) => Number(id));

      const budgetData = {
        id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        amount: parseFloat(formData.amount) || 0,
        expenseIds: expenseIds,
      };

      console.log("Submitting budget data:", budgetData);
      await dispatch(
        editBudgetAction(budgetData.id, budgetData, friendId || ""),
      );
      // if (updatedExpenses.length > 0) {
      //   await dispatch(editMultipleExpenseAction(updatedExpenses));
      // }

      navigate(-1, successMessage, "success");
    } catch (error) {
      console.error("Submission error:", error);
      navigate(-1, error?.message || genericErrorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkExpenses = () => {
    setShowTable(true);
    dispatch(
      getExpensesByBudget(
        id,
        formData.startDate,
        formData.endDate,
        friendId || "",
      ),
    );
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  const handleCloseBudget = () => {
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

  // Render input function with MUI TextField
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
                        getExpensesByBudget(
                          budget?.id || budget.id,
                          id === "startDate"
                            ? formatted
                            : updatedFormData.startDate,
                          id === "endDate"
                            ? formatted
                            : updatedFormData.endDate,
                          friendId || "",
                        ),
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
                ".MuiSvgIcon-root": { color: colors.primary_accent },
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
                popper: {
                  sx: {
                    "& .MuiPaper-root": {
                      backgroundColor: colors.card_bg,
                      color: colors.primary_text,
                      border: `1px solid ${colors.border_color}`,
                    },
                    "& .MuiPickersDay-root": {
                      color: colors.primary_text,
                      "&:hover": { backgroundColor: colors.hover_bg },
                      "&.Mui-selected": {
                        backgroundColor: colors.primary_accent,
                        color: colors.button_text,
                      },
                    },
                    "& .MuiPickersCalendarHeader-label": {
                      color: colors.primary_text,
                    },
                    "& .MuiPickersCalendarHeader-switchViewButton": {
                      color: colors.primary_accent,
                    },
                    "& .MuiPickersArrowSwitcher-button": {
                      color: colors.primary_accent,
                    },
                    "& .MuiDayCalendar-weekDayLabel": {
                      color: colors.icon_muted,
                    },
                    "& .MuiPickersYear-yearButton": {
                      color: colors.primary_text,
                      "&:hover": { backgroundColor: colors.hover_bg },
                      "&.Mui-selected": {
                        backgroundColor: colors.primary_accent,
                        color: colors.button_text,
                      },
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

export default EditBudget;
