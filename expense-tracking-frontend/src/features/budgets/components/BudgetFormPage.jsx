import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  fetchExpenses,
  getExpensesByBudget,
} from "../../../Redux/Expenses/expense.action";
import {
  getBudgetById,
  createBudgetAction,
  editBudgetAction,
} from "../../../Redux/Budget/budget.action";
import { useSelector } from "react-redux";
import useFormPage from "../../../shared/form/hooks/useFormPage";
import useFormState from "../../../shared/form/hooks/useFormState";
import FormPageShell from "../../../shared/form/components/FormPageShell";
import FormField from "../../../shared/form/components/FormField";
import FormRow from "../../../shared/form/components/FormRow";
import SubmitButton from "../../../shared/form/components/SubmitButton";
import ThemedDatePicker from "../../../shared/form/fields/ThemedDatePicker";
import ThemedTextField from "../../../shared/form/fields/ThemedTextField";
import ThemedAmountField from "../../../shared/form/fields/ThemedAmountField";
import GroupedDataTable from "../../../components/common/GroupedDataTable/GroupedDataTable";
import { useExpenseTableConfig } from "../../expenses/hooks/useExpenseTableConfig";
import { FilterPopover } from "../../../components/ui";

const BUDGET_REDIRECT_CONFIG = {
  buildFriendPath: (fid) => `/budget/${fid}`,
  selfPath: "/budget",
  defaultPath: "/budget",
};

const REQUIRED_FIELDS = ["name", "description", "startDate", "endDate", "amount"];

export default function BudgetFormPage({ mode }) {
  const isEditMode = mode === "edit";
  const i18nPrefix = isEditMode ? "editBudget" : "newBudget";
  const today = new Date().toISOString().split("T")[0];

  const {
    colors,
    t,
    dateFormat,
    navigate,
    dispatch,
    params,
    friendId,
    hasWriteAccess,
  } = useFormPage({ redirectConfig: BUDGET_REDIRECT_CONFIG });

  const budgetId = isEditMode ? params?.id : null;

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    handleInputChange,
    clearFieldError,
  } = useFormState({
    name: "",
    description: "",
    startDate: today,
    endDate: today,
    amount: "",
  });

  const [showTable, setShowTable] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);

  const { budget, error: budgetError } = useSelector((state) => state.budgets);
  const { error: expenseError } = useSelector((state) => state.expenses);
  const rawExpenses = useSelector((state) => state.expenses.expenses);

  const expenses = useMemo(() => {
    if (Array.isArray(rawExpenses)) return rawExpenses;
    if (rawExpenses && typeof rawExpenses === "object") {
      return Object.values(rawExpenses).filter(Array.isArray).flat();
    }
    return [];
  }, [rawExpenses]);

  useEffect(() => {
    if (isEditMode && budgetId) {
      dispatch(getBudgetById(budgetId));
    }
  }, [isEditMode, budgetId, dispatch]);

  useEffect(() => {
    if (isEditMode && budget && budget.id === parseInt(budgetId)) {
      setFormData({
        name: budget.name || "",
        description: budget.description || "",
        startDate: budget.startDate || today,
        endDate: budget.endDate || today,
        amount: budget.amount ? budget.amount.toString() : "",
      });
      setErrors({});
      setShowTable(!budget.budgetHasExpenses);
      dispatch(
        getExpensesByBudget(
          budgetId,
          budget.startDate,
          budget.endDate,
          friendId || "",
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, budgetId, dispatch, friendId, today, setFormData, setErrors]);

  useEffect(() => {
    if (isEditMode && expenses && expenses.length > 0) {
      const initialSelection = {};
      expenses.forEach((expense) => {
        if (expense.includeInBudget) {
          initialSelection[expense.id] = true;
        }
      });
      setSelectedExpenseIds(initialSelection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  const {
    columns: expenseColumns,
    filteredRows,
    sort,
    setSort,
    columnFilters,
    setColumnFilters,
  } = useExpenseTableConfig(expenses, t);

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

  const handleFilterClear = () => {
    if (filterColumn) {
      setColumnFilters((prev) => {
        const next = { ...prev };
        delete next[filterColumn.key];
        return next;
      });
    }
  };

  const fieldLabels = useMemo(
    () => ({
      name: t(`${i18nPrefix}.fields.name`),
      description: t(`${i18nPrefix}.fields.description`),
      startDate: t(`${i18nPrefix}.fields.startDate`),
      endDate: t(`${i18nPrefix}.fields.endDate`),
      amount: t(`${i18nPrefix}.fields.amount`),
    }),
    [t, i18nPrefix],
  );

  const fieldPlaceholders = useMemo(
    () => ({
      name: t(`${i18nPrefix}.placeholders.name`),
      description: t(`${i18nPrefix}.placeholders.description`),
      startDate: t(`${i18nPrefix}.placeholders.startDate`),
      endDate: t(`${i18nPrefix}.placeholders.endDate`),
      amount: t(`${i18nPrefix}.placeholders.amount`),
    }),
    [t, i18nPrefix],
  );

  const validationMessages = useMemo(
    () => ({
      name: t(`${i18nPrefix}.validation.name`),
      description: t(`${i18nPrefix}.validation.description`),
      startDate: t(`${i18nPrefix}.validation.startDate`),
      endDate: t(`${i18nPrefix}.validation.endDate`),
      amount: t(`${i18nPrefix}.validation.amount`),
    }),
    [t, i18nPrefix],
  );

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
      t(`${i18nPrefix}.placeholders.generic`, {
        field: fallbackLabel || formatLabelFromId(fieldId),
      }),
    [fieldPlaceholders, formatLabelFromId, t, i18nPrefix],
  );

  const linkExpensesLabel = t(`${i18nPrefix}.actions.linkExpenses`);
  const submitLabel = t(`${i18nPrefix}.actions.submit`);
  const submittingLabel = t(`${i18nPrefix}.actions.submitting`);
  const closeLabel = t("common.close");
  const pageTitle = t(`${i18nPrefix}.title`);
  const successMessage = isEditMode
    ? t("editBudget.messages.updateSuccess")
    : t("newBudget.messages.createSuccess");
  const genericErrorMessage = isEditMode
    ? t("editBudget.messages.updateError")
    : t("newBudget.messages.createError");
  const expenseErrorFallback = t(`${i18nPrefix}.messages.expenseLoadError`);
  const budgetErrorFallback = isEditMode
    ? t("editBudget.messages.budgetLoadError")
    : t("newBudget.messages.createError");

  const dispatchExpenseFetch = useCallback(
    (startDate, endDate) => {
      if (isEditMode) {
        dispatch(getExpensesByBudget(budgetId, startDate, endDate, friendId || ""));
      } else {
        dispatch(fetchExpenses(startDate, endDate, "desc", friendId || ""));
      }
    },
    [isEditMode, budgetId, dispatch, friendId],
  );

  const handleDateChange = useCallback(
    (fieldId, formatted) => {
      setFormData((prev) => {
        const updatedFormData = { ...prev, [fieldId]: formatted };
        if ((fieldId === "startDate" || fieldId === "endDate") && showTable) {
          dispatchExpenseFetch(
            fieldId === "startDate" ? formatted : updatedFormData.startDate,
            fieldId === "endDate" ? formatted : updatedFormData.endDate,
          );
        }
        return updatedFormData;
      });
      clearFieldError(fieldId);
    },
    [showTable, dispatchExpenseFetch, setFormData, clearFieldError],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasWriteAccess) return;

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = validationMessages.name;
    if (!formData.description.trim())
      newErrors.description = validationMessages.description;
    if (!formData.startDate) newErrors.startDate = validationMessages.startDate;
    if (!formData.endDate) newErrors.endDate = validationMessages.endDate;
    if (!formData.amount || isNaN(parseFloat(formData.amount)))
      newErrors.amount = validationMessages.amount;
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const expenseIds = Object.keys(selectedExpenseIds)
        .filter((expId) => selectedExpenseIds[expId])
        .map((expId) => Number(expId));

      const budgetData = {
        ...(isEditMode && { id: budgetId }),
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        amount: parseFloat(formData.amount) || 0,
        expenseIds,
      };

      if (isEditMode) {
        await dispatch(editBudgetAction(budgetId, budgetData, friendId || ""));
        navigate(-1, successMessage, "success");
      } else {
        await dispatch(createBudgetAction(budgetData, friendId || ""));
        friendId
          ? navigate(`/budget/${friendId}`)
          : navigate(
              `/budget?message=${encodeURIComponent(successMessage)}&type=success`,
            );
      }
    } catch (error) {
      if (isEditMode) {
        navigate(-1, error?.message || genericErrorMessage, "error");
      } else {
        navigate(
          `/budget?message=${encodeURIComponent(
            error?.message || genericErrorMessage,
          )}&type=error`,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkExpenses = () => {
    setShowTable(true);
    dispatchExpenseFetch(formData.startDate, formData.endDate);
  };

  const handleCloseTable = () => setShowTable(false);
  const handleCloseBudget = () => navigate(-1);

  const handleRowSelect = (row, isSelected) => {
    setSelectedExpenseIds((prev) => ({ ...prev, [row.id]: isSelected }));
  };

  const handleSelectAll = (rows, checked) => {
    if (checked) {
      const allIds = {};
      rows.forEach((row) => {
        allIds[row.id] = true;
      });
      setSelectedExpenseIds(allIds);
    } else {
      setSelectedExpenseIds({});
    }
  };

  const renderInput = (fieldId, type = "text") => {
    const labelText = getFieldLabel(fieldId);
    const placeholderText = getPlaceholderForField(fieldId, labelText);
    const isRequired = REQUIRED_FIELDS.includes(fieldId);

    return (
      <FormField
        label={labelText}
        htmlFor={fieldId}
        required={isRequired}
        error={errors[fieldId]}
        colors={colors}
      >
        <ThemedTextField
          id={fieldId}
          name={fieldId}
          value={formData[fieldId]}
          onChange={handleInputChange}
          placeholder={placeholderText}
          colors={colors}
          error={!!errors[fieldId]}
          type={type === "date" ? "text" : type}
        />
      </FormField>
    );
  };

  const renderDateInput = (fieldId) => (
    <FormField
      label={getFieldLabel(fieldId)}
      htmlFor={fieldId}
      required
      error={errors[fieldId]}
      colors={colors}
    >
      <ThemedDatePicker
        value={formData[fieldId]}
        onChange={(formatted) => handleDateChange(fieldId, formatted)}
        colors={colors}
        dateFormat={dateFormat}
        error={!!errors[fieldId]}
        disableFuture={false}
        placeholder={getPlaceholderForField(fieldId, getFieldLabel(fieldId))}
      />
    </FormField>
  );

  const renderAmountInput = () => (
    <FormField
      label={getFieldLabel("amount")}
      htmlFor="amount"
      required
      error={errors.amount}
      colors={colors}
    >
      <ThemedAmountField
        id="amount"
        name="amount"
        value={formData.amount || ""}
        onChange={handleInputChange}
        onClearError={() => clearFieldError("amount")}
        placeholder={getPlaceholderForField("amount", getFieldLabel("amount"))}
        colors={colors}
        error={!!errors.amount}
      />
    </FormField>
  );

  return (
    <div style={{ backgroundColor: colors.primary_bg }}>
      <FormPageShell
        title={pageTitle}
        onClose={handleCloseBudget}
        colors={colors}
        containerStyle={{
          minHeight: "calc(100vh - 100px)",
          height: "auto",
        }}
        className="flex flex-col sm:w-full lg:w-[calc(100vw-370px)]"
      >
        <div className="flex-1">
          <FormRow first>
            {renderInput("name")}
            {renderInput("description")}
          </FormRow>
          <FormRow>
            {renderDateInput("startDate")}
            {renderDateInput("endDate")}
          </FormRow>
          <FormRow className="mb-4">
            {renderAmountInput()}
            <div className="flex-1 hidden sm:block" />
          </FormRow>
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
            <div
              className="mt-4 sm:mt-6 w-full relative"
              style={{
                "--pm-text-primary": colors.primary_text,
                "--pm-text-secondary": colors.secondary_text,
                "--pm-text-tertiary": colors.secondary_text,
                "--pm-bg-primary": colors.active_bg,
                "--pm-bg-secondary": colors.secondary_bg,
                "--pm-border-color": colors.border_color,
                "--pm-accent-color": colors.primary_accent,
                "--pm-hover-bg": colors.hover_bg,
                "--pm-scrollbar-thumb": colors.primary_accent,
                "--pm-scrollbar-track": colors.secondary_bg,
              }}
            >
              <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-4 gap-2 sm:hidden">
                <div className="block sm:hidden self-end">
                  <button
                    onClick={handleCloseTable}
                    className="px-2 py-1 border rounded"
                    style={{
                      backgroundColor: colors.active_bg,
                      color: colors.primary_text,
                      borderColor: colors.border_color,
                    }}
                  >
                    {closeLabel}
                  </button>
                </div>
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
                onClear={handleFilterClear}
                column={filterColumn}
                type={filterColumn?.filterType || "text"}
                initialOperator={
                  filterColumn && columnFilters[filterColumn.key]
                    ? columnFilters[filterColumn.key].operator
                    : undefined
                }
                initialValue={
                  filterColumn && columnFilters[filterColumn.key]
                    ? columnFilters[filterColumn.key].value
                    : undefined
                }
              />
            </div>
          )}
        </div>
        {hasWriteAccess && (
          <div className="w-full flex justify-end mt-auto pt-4">
            <SubmitButton
              onClick={handleSubmit}
              label={submitLabel}
              loadingLabel={submittingLabel}
              isSubmitting={isSubmitting}
              disabled={!hasWriteAccess}
              colors={colors}
            />
          </div>
        )}
      </FormPageShell>
    </div>
  );
}
