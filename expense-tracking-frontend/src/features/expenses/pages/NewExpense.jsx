import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { createExpenseAction } from "../../../Redux/Expenses/expense.action";
import { Autocomplete } from "@mui/material";
import {
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  ExpenseNameAutocomplete,
} from "../../../components/ui";
import PreviousExpenseIndicator from "../../../components/PreviousExpenseIndicator";
import { normalizePaymentMethod } from "../../../utils/paymentMethodUtils";
import { getListOfBudgetsById } from "../../../Redux/Budget/budget.action";
import { useLocation } from "react-router-dom";
import usePreviousExpense from "../hooks/usePreviousExpense";
import HighlightedText from "../../../components/common/HighlightedText";
import { createFuzzyFilterOptions } from "../../../utils/fuzzyMatchUtils";
import BudgetSelectionTable from "../../../components/common/BudgetSelectionTable/BudgetSelectionTable";
import useFormPage from "../../../shared/form/hooks/useFormPage";
import useFormState from "../../../shared/form/hooks/useFormState";
import FormPageShell from "../../../shared/form/components/FormPageShell";
import FormField from "../../../shared/form/components/FormField";
import FormRow from "../../../shared/form/components/FormRow";
import SubmitButton from "../../../shared/form/components/SubmitButton";
import ThemedDatePicker from "../../../shared/form/fields/ThemedDatePicker";
import ThemedAmountField from "../../../shared/form/fields/ThemedAmountField";
import ThemedCommentField from "../../../shared/form/fields/ThemedCommentField";
import ThemedAutocomplete from "../../../shared/form/fields/ThemedAutocomplete";

const NewExpense = ({ onClose, onSuccess }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dateFromQuery = searchParams.get("date");
  const today = new Date().toISOString().split("T")[0];

  const {
    colors,
    t,
    dateFormat,
    navigate,
    dispatch,
    friendId,
    hasWriteAccess,
  } = useFormPage({
    redirectConfig: {
      buildFriendPath: (fid) => `/friends/expenses/${fid}`,
      selfPath: "/friends/expenses",
      defaultPath: "/friends/expenses",
    },
  });

  const initialExpenseData = useMemo(
    () => ({
      expenseName: "",
      amount: "",
      netAmount: "",
      paymentMethod: "cash",
      transactionType: "loss",
      comments: "",
      date: dateFromQuery || today,
      creditDue: "",
    }),
    [dateFromQuery, today],
  );

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    setFieldValue,
    handleInputChange,
    clearFieldError,
  } = useFormState(initialExpenseData);

  const pageTitle = t("newExpense.title");
  const previouslyAddedLabel = t("newExpense.header.previouslyAdded");
  const autoFilledLabel = t("newExpense.indicators.autoFilled");
  const linkBudgetsLabel = t("newExpense.actions.linkBudgets");
  const submitLabel = t("newExpense.actions.submit");
  const tableNoRowsText = t("newExpense.table.noRows");
  const errorLoadingBudgets = t("newExpense.messages.errorLoadingBudgets");
  const successMessage = t("newExpense.actions.successMessage");
  const noOptionsText = t("newExpense.autocomplete.noOptions");
  const closeLabel = t("common.close");

  const fieldLabels = useMemo(
    () => ({
      expenseName: t("newExpense.fields.expenseName"),
      amount: t("newExpense.fields.amount"),
      date: t("newExpense.fields.date"),
      transactionType: t("newExpense.fields.transactionType"),
      category: t("newExpense.fields.category"),
      paymentMethod: t("newExpense.fields.paymentMethod"),
      comments: t("newExpense.fields.comments"),
    }),
    [t],
  );

  const fieldPlaceholders = useMemo(
    () => ({
      expenseName: t("newExpense.placeholders.expenseName"),
      amount: t("newExpense.placeholders.amount"),
      date: t("newExpense.placeholders.date"),
      transactionType: t("newExpense.placeholders.transactionType"),
      category: t("newExpense.placeholders.category"),
      paymentMethod: t("newExpense.placeholders.paymentMethod"),
      comments: t("newExpense.placeholders.comments"),
    }),
    [t],
  );

  const transactionTypeLabels = useMemo(
    () => ({
      gain: t("newExpense.transactionTypes.gain"),
      loss: t("newExpense.transactionTypes.loss"),
    }),
    [t],
  );

  const typeOptions = ["gain", "loss"];

  const getTransactionTypeLabel = (option) => {
    if (!option) return "";
    const key = option.toLowerCase();
    return (
      transactionTypeLabels[key] ||
      option.charAt(0).toUpperCase() + option.slice(1)
    );
  };

  const transactionTypeFilterOptions = useMemo(() => {
    return createFuzzyFilterOptions({
      getOptionLabel: getTransactionTypeLabel,
    });
  }, [transactionTypeLabels]);

  const { budgets, error: budgetError } = useSelector(
    (state) => state.budgets || {},
  );

  const [autoFilledFields, setAutoFilledFields] = useState({
    category: false,
    paymentMethod: false,
    transactionType: false,
    comments: false,
  });
  const [lastAutoFilledExpenseName, setLastAutoFilledExpenseName] =
    useState("");
  const [userModifiedFields, setUserModifiedFields] = useState({
    category: false,
    paymentMethod: false,
    transactionType: false,
    comments: false,
  });
  const [showTable, setShowTable] = useState(false);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState([]);

  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    formData.expenseName,
    formData.date,
    friendId,
  );

  useEffect(() => {
    if (!formData.expenseName || formData.expenseName.trim().length < 2) {
      if (lastAutoFilledExpenseName) {
        setFormData((prev) => ({
          ...prev,
          category: "",
          paymentMethod: "cash",
          transactionType: "loss",
          comments: "",
        }));
        setLastAutoFilledExpenseName("");
        setAutoFilledFields({
          category: false,
          paymentMethod: false,
          transactionType: false,
          comments: false,
        });
        setUserModifiedFields({
          category: false,
          paymentMethod: false,
          transactionType: false,
          comments: false,
        });
      }
      return;
    }

    if (previousExpense && formData.expenseName?.trim().length >= 2) {
      const isNewExpenseName =
        formData.expenseName.trim() !== lastAutoFilledExpenseName;

      const updates = {};
      const newAutoFilled = { ...autoFilledFields };

      if (
        previousExpense.categoryId &&
        (!formData.category ||
          (isNewExpenseName && !userModifiedFields.category))
      ) {
        updates.category = previousExpense.categoryId;
        newAutoFilled.category = true;
      }

      if (
        previousExpense.expense?.paymentMethod &&
        (formData.paymentMethod === "cash" ||
          (isNewExpenseName && !userModifiedFields.paymentMethod))
      ) {
        updates.paymentMethod = previousExpense.expense.paymentMethod;
        newAutoFilled.paymentMethod = true;
      }

      if (
        previousExpense.expense?.type &&
        (formData.transactionType === "loss" ||
          (isNewExpenseName && !userModifiedFields.transactionType))
      ) {
        updates.transactionType = previousExpense.expense.type;
        newAutoFilled.transactionType = true;
      }

      if (
        previousExpense.expense?.comments &&
        (!formData.comments ||
          (isNewExpenseName && !userModifiedFields.comments))
      ) {
        updates.comments = previousExpense.expense.comments;
        newAutoFilled.comments = true;
      } else if (
        !previousExpense.expense?.comments &&
        isNewExpenseName &&
        !userModifiedFields.comments
      ) {
        updates.comments = "";
        newAutoFilled.comments = false;
      }

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({ ...prev, ...updates }));
        setAutoFilledFields(newAutoFilled);
        setLastAutoFilledExpenseName(formData.expenseName.trim());

        if (isNewExpenseName) {
          setUserModifiedFields({
            category: false,
            paymentMethod: false,
            transactionType: false,
            comments: false,
          });
        }

        setTimeout(() => {
          setAutoFilledFields({
            category: false,
            paymentMethod: false,
            transactionType: false,
            comments: false,
          });
        }, 3000);
      }
    }
  }, [previousExpense, formData.expenseName]);

  useEffect(() => {
    dispatch(getListOfBudgetsById(today, friendId || ""));
  }, [dispatch, today, friendId]);

  useEffect(() => {
    if (budgets && Array.isArray(budgets)) {
      const initialSelection = budgets
        .filter((budget) => budget.includeInBudget)
        .map((budget) => budget.id);
      setSelectedBudgetIds(initialSelection);
    }
  }, [budgets]);

  useEffect(() => {
    if (dateFromQuery) {
      const newDate = new Date(dateFromQuery);
      const lastDayOfMonth = new Date(
        newDate.getFullYear(),
        newDate.getMonth() + 1,
        0,
      );
      let salaryDate = new Date(lastDayOfMonth);
      if (salaryDate.getDay() === 6) {
        salaryDate.setDate(salaryDate.getDate() - 1);
      } else if (salaryDate.getDay() === 0) {
        salaryDate.setDate(salaryDate.getDate() - 2);
      }
      const isSalary = newDate.toDateString() === salaryDate.toDateString();
      if (isSalary) {
        setFormData((prev) => ({ ...prev, transactionType: "gain" }));
      } else {
        setFormData((prev) => ({ ...prev, transactionType: "loss" }));
      }
    }
  }, [dateFromQuery]);

  const handleDateChange = (formatted, dayjsValue) => {
    setFormData((prev) => ({ ...prev, date: formatted }));
    clearFieldError("date");
    dispatch(getListOfBudgetsById(dayjsValue, friendId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasWriteAccess) return;
    const newErrors = {};
    if (!formData.expenseName) newErrors.expenseName = true;
    const parsedAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0)
      newErrors.amount = true;
    if (!formData.date) newErrors.date = true;
    if (!formData.transactionType) newErrors.transactionType = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const normalizedPm = normalizePaymentMethod(formData.paymentMethod);
    const amt = parseFloat(formData.amount) || 0;
    const derivedCreditDue = normalizedPm === "creditNeedToPaid" ? amt : 0;
    const budgetIds = selectedBudgetIds;

    dispatch(
      createExpenseAction(
        {
          date: formData.date,
          budgetIds: budgetIds,
          categoryId: formData.category,
          expense: {
            expenseName: formData.expenseName,
            amount: amt,
            netAmount: amt,
            paymentMethod: normalizedPm,
            type: formData.transactionType.toLowerCase(),
            comments: formData.comments,
            creditDue: derivedCreditDue,
          },
        },
        friendId || "",
      ),
    );

    if (typeof onClose === "function") {
      onClose();
    } else {
      navigate(-1, {
        state: { toastMessage: successMessage },
      });
    }
    if (onSuccess) {
      onSuccess(successMessage);
    }
  };

  const handleLinkBudgets = () => {
    setShowTable(true);
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  const renderExpenseNameWithSuggestions = () => (
    <FormField
      label={fieldLabels.expenseName}
      htmlFor="expenseName"
      required
      colors={colors}
    >
      <ExpenseNameAutocomplete
        value={formData.expenseName}
        onChange={(val) => {
          setFieldValue("expenseName", val);
          if (errors.expenseName && val) clearFieldError("expenseName");
        }}
        friendId={friendId}
        placeholder={fieldPlaceholders.expenseName}
        error={errors.expenseName}
        size="medium"
        maxSuggestions={500}
        noDataText="No expense names found"
      />
    </FormField>
  );

  const renderAmountInput = () => (
    <FormField
      label={fieldLabels.amount}
      htmlFor="amount"
      required
      error={errors.amount}
      colors={colors}
    >
      <ThemedAmountField
        id="amount"
        name="amount"
        value={formData.amount}
        onChange={handleInputChange}
        onClearError={() => clearFieldError("amount")}
        placeholder={fieldPlaceholders.amount}
        colors={colors}
        error={errors.amount}
        height="48px"
      />
    </FormField>
  );

  const renderDateInput = () => (
    <FormField
      label={fieldLabels.date}
      htmlFor="date"
      required
      error={errors.date}
      colors={colors}
    >
      <ThemedDatePicker
        value={formData.date}
        onChange={handleDateChange}
        colors={colors}
        dateFormat={dateFormat}
        error={errors.date}
        disableFuture
        placeholder={fieldPlaceholders.date}
        height={48}
      />
    </FormField>
  );

  const renderCategoryAutocomplete = () => (
    <FormField
      label={fieldLabels.category}
      htmlFor="category"
      colors={colors}
    >
      <div className="relative">
        <CategoryAutocomplete
          value={formData.category}
          onChange={(categoryId) => {
            setFieldValue("category", categoryId);
            setUserModifiedFields((prev) => ({ ...prev, category: true }));
            if (autoFilledFields.category) {
              setAutoFilledFields((prev) => ({ ...prev, category: false }));
            }
          }}
          friendId={friendId}
          placeholder={fieldPlaceholders.category}
          size="medium"
        />
        {autoFilledFields.category && (
          <div
            className="absolute top-0 right-[-8px] transform translate-x-full"
            style={{
              background: `linear-gradient(135deg, ${colors.primary_accent} 0%, ${colors.tertiary_accent} 100%)`,
              color: colors.button_text,
              fontSize: "0.65rem",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              boxShadow: `0 2px 4px ${colors.primary_accent}4D`,
            }}
          >
            {autoFilledLabel}
          </div>
        )}
      </div>
    </FormField>
  );

  const renderPaymentMethodAutocomplete = () => (
    <FormField
      label={fieldLabels.paymentMethod}
      htmlFor="paymentMethod"
      colors={colors}
    >
      <div className="relative">
        <PaymentMethodAutocomplete
          value={formData.paymentMethod}
          onChange={(paymentMethodValue) => {
            setFieldValue("paymentMethod", paymentMethodValue);
            setUserModifiedFields((prev) => ({
              ...prev,
              paymentMethod: true,
            }));
            if (autoFilledFields.paymentMethod) {
              setAutoFilledFields((prev) => ({
                ...prev,
                paymentMethod: false,
              }));
            }
          }}
          transactionType={formData.transactionType}
          friendId={friendId}
          placeholder={fieldPlaceholders.paymentMethod}
          size="medium"
        />
        {autoFilledFields.paymentMethod && (
          <div
            className="absolute top-0 right-[-8px] transform translate-x-full"
            style={{
              background: `linear-gradient(135deg, ${colors.primary_accent} 0%, ${colors.tertiary_accent} 100%)`,
              color: colors.button_text,
              fontSize: "0.65rem",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              boxShadow: `0 2px 4px ${colors.primary_accent}4D`,
            }}
          >
            {autoFilledLabel}
          </div>
        )}
      </div>
    </FormField>
  );

  const renderTransactionTypeAutocomplete = () => (
    <FormField
      label={fieldLabels.transactionType}
      htmlFor="transactionType"
      required
      colors={colors}
    >
      <div className="relative">
        <ThemedAutocomplete
          options={typeOptions}
          value={formData.transactionType || null}
          onChange={(event, newValue) => {
            setFieldValue(
              "transactionType",
              newValue ? newValue.toLowerCase() : "",
            );
            if (errors.transactionType) clearFieldError("transactionType");
            setUserModifiedFields((prev) => ({
              ...prev,
              transactionType: true,
            }));
            if (autoFilledFields.transactionType) {
              setAutoFilledFields((prev) => ({
                ...prev,
                transactionType: false,
              }));
            }
          }}
          onInputChange={(event, newValue, reason) => {
            if (reason === "clear") {
              setFieldValue("transactionType", "");
              if (errors.transactionType) clearFieldError("transactionType");
            }
          }}
          getOptionLabel={(option) => getTransactionTypeLabel(option)}
          filterOptions={transactionTypeFilterOptions}
          renderOption={(props, option, { inputValue }) => (
            <li
              {...props}
              style={{
                fontSize: "0.92rem",
                paddingTop: 4,
                paddingBottom: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 300,
              }}
              title={getTransactionTypeLabel(option)}
            >
              <HighlightedText
                text={getTransactionTypeLabel(option)}
                query={inputValue}
                title={getTransactionTypeLabel(option)}
              />
            </li>
          )}
          colors={colors}
          error={errors.transactionType}
          placeholder={fieldPlaceholders.transactionType}
          noOptionsText={noOptionsText}
        />
        {autoFilledFields.transactionType && (
          <div
            className="absolute top-0 right-[-8px] transform translate-x-full"
            style={{
              background: `linear-gradient(135deg, ${colors.primary_accent} 0%, ${colors.tertiary_accent} 100%)`,
              color: colors.button_text,
              fontSize: "0.65rem",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              boxShadow: `0 2px 4px ${colors.primary_accent}4D`,
            }}
          >
            {autoFilledLabel}
          </div>
        )}
      </div>
    </FormField>
  );

  const renderCommentsField = () => (
    <FormField
      label={fieldLabels.comments}
      htmlFor="comments"
      colors={colors}
      layout="horizontal"
    >
      <div className="relative">
        {autoFilledFields.comments && (
          <div
            className="absolute top-[-20px] right-0 lg:right-auto lg:left-[300px]"
            style={{
              background: `linear-gradient(135deg, ${colors.primary_accent} 0%, ${colors.tertiary_accent} 100%)`,
              color: colors.button_text,
              fontSize: "0.65rem",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              boxShadow: `0 2px 4px ${colors.primary_accent}4D`,
              zIndex: 10,
            }}
          >
            {autoFilledLabel}
          </div>
        )}
        <ThemedCommentField
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={(e) => {
            handleInputChange(e);
            setUserModifiedFields((prev) => ({ ...prev, comments: true }));
            if (autoFilledFields.comments) {
              setAutoFilledFields((prev) => ({ ...prev, comments: false }));
            }
          }}
          placeholder={fieldPlaceholders.comments}
          colors={colors}
          error={errors.comments}
        />
      </div>
    </FormField>
  );

  return (
    <FormPageShell
      title={pageTitle}
      onClose={() => {
        if (onClose) {
          onClose();
        } else {
          navigate(-1);
        }
      }}
      colors={colors}
      rightContent={
        formData.expenseName?.trim().length >= 2 && formData.date && (
          <PreviousExpenseIndicator
            expense={previousExpense}
            isLoading={loadingPreviousExpense}
            position="right"
            variant="gradient"
            showTooltip={true}
            dateFormat={dateFormat}
            label={previouslyAddedLabel}
            labelPosition="top"
            icon="calendar"
            tooltipConfig={{
              showAmount: true,
              showPaymentMethod: true,
              showType: true,
            }}
            colorScheme={{
              primary: colors.primary_accent,
              secondary: colors.tertiary_accent,
              text: colors.primary_text,
              subtext: colors.placeholder_text,
            }}
          />
        )
      }
      className="new-expense-container"
    >
      <div className="flex flex-col gap-3 lg:gap-4 mt-2">
        <FormRow first>
          {renderExpenseNameWithSuggestions()}
          {renderAmountInput()}
          {renderDateInput()}
        </FormRow>
        <FormRow>
          {renderTransactionTypeAutocomplete()}
          {renderCategoryAutocomplete()}
          {renderPaymentMethodAutocomplete()}
        </FormRow>
        <FormRow>
          {renderCommentsField()}
        </FormRow>
      </div>

      <div className="mt-2 lg:mt-3 w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <button
          onClick={handleLinkBudgets}
          className="px-6 py-2 font-semibold rounded w-full sm:w-auto"
          style={{
            backgroundColor: colors.button_bg,
            color: colors.button_text,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = colors.button_hover)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = colors.button_bg)
          }
        >
          {linkBudgetsLabel}
        </button>
        {showTable && (
          <button
            onClick={handleCloseTable}
            aria-label={closeLabel}
            className="px-2 py-1 rounded mt-2 sm:mt-0 hidden sm:block"
            style={{
              backgroundColor: colors.active_bg,
              color: colors.primary_text,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            X
          </button>
        )}
      </div>
      {showTable && (
        <div
          className="mt-2 sm:mt-3 w-full relative overflow-x-auto overflow-y-hidden mb-20 lg:mb-0"
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
                aria-label={closeLabel}
                className="px-2 py-1 rounded"
                style={{
                  backgroundColor: colors.active_bg,
                  color: colors.primary_text,
                  border: `1px solid ${colors.border_color}`,
                }}
              >
                X
              </button>
            </div>
          </div>

          <BudgetSelectionTable
            budgets={budgets}
            selectedBudgetIds={selectedBudgetIds}
            onSelectionChange={setSelectedBudgetIds}
          />
        </div>
      )}

      {budgetError && (
        <div className="text-red-500 text-sm mt-4">
          {errorLoadingBudgets}:{" "}
          {typeof budgetError === "string"
            ? budgetError
            : typeof budgetError === "object"
              ? budgetError.message ||
                budgetError.error ||
                JSON.stringify(budgetError).substring(0, 100)
              : tableNoRowsText}
        </div>
      )}

      <div
        className="w-full flex justify-end mt-2 lg:mt-3 pb-4 lg:pb-0 sticky bottom-0 left-0 right-0 pt-4 lg:pt-0 lg:static z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] lg:shadow-none"
        style={{
          backgroundColor: colors.secondary_bg,
        }}
      >
        {hasWriteAccess && (
          <SubmitButton
            onClick={handleSubmit}
            label={submitLabel}
            colors={colors}
          />
        )}
      </div>
    </FormPageShell>
  );
};

export default NewExpense;
