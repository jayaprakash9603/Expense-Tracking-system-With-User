import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  fetchExpenses,
  getExpensesByBudget,
} from "../../../Redux/Expenses/expense.action";
import {
  getBudgetById,
  editBudgetAction,
} from "../../../Redux/Budget/budget.action";
import { useDispatch, useSelector } from "react-redux";
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

const EditBudget = () => {
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

  const { id } = params;

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
      const all = Object.values(rawExpenses).filter(Array.isArray).flat();
      return all;
    }
    return [];
  }, [rawExpenses]);

  useEffect(() => {
    if (id) {
      dispatch(getBudgetById(id));
    }
  }, [id, dispatch]);

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

  const linkExpensesLabel = t("editBudget.actions.linkExpenses");
  const submitLabel = t("editBudget.actions.submit");
  const submittingLabel = t("editBudget.actions.submitting");
  const closeLabel = t("common.close");
  const pageTitle = t("editBudget.title");
  const successMessage = t("editBudget.messages.updateSuccess");
  const genericErrorMessage = t("editBudget.messages.updateError");
  const expenseErrorFallback = t("editBudget.messages.expenseLoadError");
  const budgetErrorFallback = t("editBudget.messages.budgetLoadError");

  useEffect(() => {
    if (budget && budget.id === parseInt(id)) {
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
          id,
          budget.startDate,
          budget.endDate,
          friendId || "",
        ),
      );
    }
  }, [budget, id, dispatch, friendId, today, setFormData, setErrors]);

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

  const handleDateChange = useCallback(
    (fieldId, formatted) => {
      setFormData((prev) => {
        const updatedFormData = { ...prev, [fieldId]: formatted };
        if ((fieldId === "startDate" || fieldId === "endDate") && showTable) {
          dispatch(
            getExpensesByBudget(
              id,
              fieldId === "startDate" ? formatted : updatedFormData.startDate,
              fieldId === "endDate" ? formatted : updatedFormData.endDate,
              friendId || "",
            ),
          );
        }
        return updatedFormData;
      });
      clearFieldError(fieldId);
    },
    [showTable, dispatch, id, friendId, setFormData, clearFieldError],
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

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const expenseIds = Object.keys(selectedExpenseIds)
        .filter((expId) => selectedExpenseIds[expId])
        .map((expId) => Number(expId));

      const budgetData = {
        id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        amount: parseFloat(formData.amount) || 0,
        expenseIds,
      };

      await dispatch(
        editBudgetAction(budgetData.id, budgetData, friendId || ""),
      );

      navigate(-1, successMessage, "success");
    } catch (error) {
      navigate(-1, error?.message || genericErrorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkExpenses = () => {
    setShowTable(true);
    dispatch(
      getExpensesByBudget(id, formData.startDate, formData.endDate, friendId || ""),
    );
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  const handleCloseBudget = () => {
    navigate(-1);
  };

  const handleRowSelect = (row, isSelected) => {
    setSelectedExpenseIds((prev) => ({
      ...prev,
      [row.id]: isSelected,
    }));
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

  const renderInput = (id, type = "text") => {
    const labelText = getFieldLabel(id);
    const placeholderText = getPlaceholderForField(id, labelText);
    const isRequired = requiredFields.includes(id);

    return (
      <FormField
        label={labelText}
        htmlFor={id}
        required={isRequired}
        error={errors[id]}
        colors={colors}
      >
        <ThemedTextField
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleInputChange}
          placeholder={placeholderText}
          colors={colors}
          error={!!errors[id]}
          type={type === "date" ? "text" : type}
        />
      </FormField>
    );
  };

  const renderDateInput = (id) => (
    <FormField
      label={getFieldLabel(id)}
      htmlFor={id}
      required
      error={errors[id]}
      colors={colors}
    >
      <ThemedDatePicker
        value={formData[id]}
        onChange={(formatted) => handleDateChange(id, formatted)}
        colors={colors}
        dateFormat={dateFormat}
        error={!!errors[id]}
        disableFuture={false}
        placeholder={getPlaceholderForField(id, getFieldLabel(id))}
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
};

export default EditBudget;
