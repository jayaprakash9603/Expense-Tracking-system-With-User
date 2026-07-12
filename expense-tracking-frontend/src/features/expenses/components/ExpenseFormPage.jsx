import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  createExpenseAction,
  editExpenseAction,
  getExpenseAction,
} from "../../../Redux/Expenses/expense.action";
import {
  getListOfBudgetsById,
  getListOfBudgetsByExpenseId,
} from "../../../Redux/Budget/budget.action";
import {
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  ExpenseNameAutocomplete,
} from "../../../components/ui";
import PreviousExpenseIndicator from "../../../components/PreviousExpenseIndicator";
import { normalizePaymentMethod } from "../../../utils/paymentMethodUtils";
import { useLocation } from "react-router-dom";
import usePreviousExpense from "../hooks/usePreviousExpense";
import useExpenseAutoFill from "../hooks/useExpenseAutoFill";
import HighlightedText from "../../../components/common/HighlightedText";
import { createFuzzyFilterOptions } from "../../../utils/fuzzyMatchUtils";
import BudgetSelectionTable from "../../../components/common/BudgetSelectionTable/BudgetSelectionTable";
import ToastNotification from "../../../shared/ui/feedback/ToastNotification";
import useFormPage from "../../../shared/form/hooks/useFormPage";
import useFormState from "../../../shared/form/hooks/useFormState";
import useToast from "../../../shared/form/hooks/useToast";
import FormPageShell from "../../../shared/form/components/FormPageShell";
import FormField from "../../../shared/form/components/FormField";
import FormRow from "../../../shared/form/components/FormRow";
import SubmitButton from "../../../shared/form/components/SubmitButton";
import ThemedDatePicker from "../../../shared/form/fields/ThemedDatePicker";
import ThemedAmountField from "../../../shared/form/fields/ThemedAmountField";
import ThemedCommentField from "../../../shared/form/fields/ThemedCommentField";
import ThemedAutocomplete from "../../../shared/form/fields/ThemedAutocomplete";

const REDIRECT_CONFIG = {
  buildFriendPath: (fid) => `/friends/expenses/${fid}`,
  selfPath: "/friends/expenses",
  defaultPath: "/friends/expenses",
};

const TYPE_OPTIONS = ["gain", "loss"];

function computeSalaryType(dateStr) {
  const d = new Date(dateStr);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  let salaryDate = new Date(lastDay);
  if (salaryDate.getDay() === 6) salaryDate.setDate(salaryDate.getDate() - 1);
  else if (salaryDate.getDay() === 0) salaryDate.setDate(salaryDate.getDate() - 2);
  return d.toDateString() === salaryDate.toDateString() ? "gain" : "loss";
}

export default function ExpenseFormPage({ mode, onClose, onSuccess }) {
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const i18nPrefix = isEditMode ? "editExpense" : "newExpense";
  const today = new Date().toISOString().split("T")[0];

  const location = useLocation();
  const dateFromQuery = isCreateMode
    ? new URLSearchParams(location.search).get("date")
    : null;

  const {
    colors,
    t,
    dateFormat,
    navigate,
    dispatch,
    params,
    friendId,
    hasWriteAccess,
  } = useFormPage({ redirectConfig: REDIRECT_CONFIG });

  const expenseId = isEditMode ? params?.id : null;

  const initialData = useMemo(
    () => ({
      expenseName: "",
      amount: "",
      netAmount: "",
      paymentMethod: "cash",
      transactionType: "loss",
      comments: "",
      date: dateFromQuery || today,
      ...(isEditMode ? { category: "", categoryName: "" } : { creditDue: "" }),
    }),
    [dateFromQuery, today, isEditMode],
  );

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    setFieldValue,
    handleInputChange,
    clearFieldError,
  } = useFormState(initialData);

  const { showSuccess, showError, toastProps } = useToast();

  const [showTable, setShowTable] = useState(false);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    isCreateMode ? formData.expenseName : null,
    isCreateMode ? formData.date : null,
    isCreateMode ? friendId : null,
  );

  const { autoFilledFields, markUserModified } = useExpenseAutoFill(
    isCreateMode ? previousExpense : null,
    isCreateMode ? formData.expenseName : null,
    formData,
    setFormData,
  );

  const { expense } = useSelector((state) => state.expenses || {});
  const { budgets, error: budgetError } = useSelector(
    (state) => state.budgets || {},
  );

  useEffect(() => {
    if (isEditMode && expenseId) {
      dispatch(getExpenseAction(expenseId, friendId || ""));
      const fetchDate = expense?.date || today;
      dispatch(
        getListOfBudgetsByExpenseId({
          id: expenseId,
          date: fetchDate,
          targetId: friendId || "",
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, expenseId, dispatch, friendId]);

  useEffect(() => {
    if (isCreateMode) {
      dispatch(getListOfBudgetsById(today, friendId || ""));
    }
  }, [isCreateMode, dispatch, today, friendId]);

  useEffect(() => {
    if (isEditMode && expense) {
      setFormData({
        expenseName: expense.expense.expenseName || "",
        amount: expense.expense.amount || "",
        netAmount: expense.expense.netAmount || "",
        paymentMethod: normalizePaymentMethod(
          expense.expense.paymentMethod || "cash",
        ),
        transactionType: expense.expense.type || "loss",
        comments: expense.expense.comments || "",
        date: expense.date || today,
        category: expense.categoryId || "",
        categoryName: expense.categoryName || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense, setFormData]);

  useEffect(() => {
    if (budgets && Array.isArray(budgets)) {
      const initial = budgets
        .filter((b) => b.includeInBudget)
        .map((b) => b.id);
      setSelectedBudgetIds(initial);
    }
  }, [budgets]);

  useEffect(() => {
    if (isCreateMode && dateFromQuery) {
      setFormData((prev) => ({
        ...prev,
        transactionType: computeSalaryType(dateFromQuery),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFromQuery]);

  const pageTitle = t(`${i18nPrefix}.title`);
  const linkBudgetsLabel = t(`${i18nPrefix}.actions.linkBudgets`);
  const submitLabel = t(`${i18nPrefix}.actions.submit`);
  const successMessage = t(`${i18nPrefix}.actions.successMessage`);
  const noOptionsText = t(`${i18nPrefix}.autocomplete.noOptions`);
  const errorLoadingBudgets = t(`${i18nPrefix}.messages.errorLoadingBudgets`);
  const tableNoRowsText = t(`${i18nPrefix}.table.noRows`);
  const closeLabel = t("common.close");
  const updateErrorMessage = isEditMode
    ? t("editExpense.messages.updateError")
    : "";
  const autoFilledLabel = isCreateMode
    ? t("newExpense.indicators.autoFilled")
    : "";
  const previouslyAddedLabel = isCreateMode
    ? t("newExpense.header.previouslyAdded")
    : "";

  const fieldLabels = useMemo(
    () => ({
      expenseName: t(`${i18nPrefix}.fields.expenseName`),
      amount: t(`${i18nPrefix}.fields.amount`),
      date: t(`${i18nPrefix}.fields.date`),
      transactionType: t(`${i18nPrefix}.fields.transactionType`),
      category: t(`${i18nPrefix}.fields.category`),
      paymentMethod: t(`${i18nPrefix}.fields.paymentMethod`),
      comments: t(`${i18nPrefix}.fields.comments`),
    }),
    [t, i18nPrefix],
  );

  const fieldPlaceholders = useMemo(
    () => ({
      expenseName: t(`${i18nPrefix}.placeholders.expenseName`),
      amount: t(`${i18nPrefix}.placeholders.amount`),
      date: t(`${i18nPrefix}.placeholders.date`),
      transactionType: t(`${i18nPrefix}.placeholders.transactionType`),
      category: t(`${i18nPrefix}.placeholders.category`),
      paymentMethod: t(`${i18nPrefix}.placeholders.paymentMethod`),
      comments: t(`${i18nPrefix}.placeholders.comments`),
    }),
    [t, i18nPrefix],
  );

  const validationMessages = useMemo(
    () => ({
      expenseName: t(`${i18nPrefix}.validation.expenseName`),
      amount: t(`${i18nPrefix}.validation.amount`),
      date: t(`${i18nPrefix}.validation.date`),
      transactionType: t(`${i18nPrefix}.validation.transactionType`),
    }),
    [t, i18nPrefix],
  );

  const transactionTypeLabels = useMemo(
    () => ({
      gain: t(`${i18nPrefix}.transactionTypes.gain`),
      loss: t(`${i18nPrefix}.transactionTypes.loss`),
    }),
    [t, i18nPrefix],
  );

  const getTransactionTypeLabel = (option) => {
    if (!option) return "";
    const key = option.toLowerCase();
    return (
      transactionTypeLabels[key] ||
      option.charAt(0).toUpperCase() + option.slice(1)
    );
  };

  const transactionTypeFilterOptions = useMemo(
    () => createFuzzyFilterOptions({ getOptionLabel: getTransactionTypeLabel }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactionTypeLabels],
  );

  const handleDateChange = (formatted, dayjsValue) => {
    const newType = computeSalaryType(formatted);
    setFormData((prev) => ({
      ...prev,
      date: formatted,
      ...(isEditMode ? { transactionType: newType } : {}),
    }));
    clearFieldError("date");

    if (isEditMode) {
      dispatch(
        getListOfBudgetsByExpenseId({
          id: expenseId,
          date: formatted,
          targetId: friendId || "",
        }),
      );
    } else {
      dispatch(getListOfBudgetsById(dayjsValue, friendId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasWriteAccess) return;

    const newErrors = {};
    if (!formData.expenseName) {
      newErrors.expenseName = isEditMode ? validationMessages.expenseName : true;
    }
    const parsedAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = isEditMode ? validationMessages.amount : true;
    }
    if (!formData.date) {
      newErrors.date = isEditMode ? validationMessages.date : true;
    }
    if (!formData.transactionType) {
      newErrors.transactionType = isEditMode
        ? validationMessages.transactionType
        : true;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const normalizedPm = normalizePaymentMethod(formData.paymentMethod);
    const amt = parseFloat(formData.amount) || 0;
    const derivedCreditDue = normalizedPm === "creditNeedToPaid" ? amt : 0;
    const budgetIds = selectedBudgetIds;

    if (isEditMode) {
      try {
        setIsSubmitting(true);
        await dispatch(
          editExpenseAction(
            expenseId,
            {
              date: formData.date,
              budgetIds,
              categoryId: formData.category || "",
              expense: {
                expenseName: formData.expenseName,
                amount: formData.amount,
                netAmount: formData.amount,
                paymentMethod: normalizedPm,
                type: (formData.transactionType || "").toLowerCase(),
                comments: formData.comments,
                creditDue: derivedCreditDue,
              },
            },
            friendId || "",
          ),
        );
        showSuccess(successMessage);
        navigate(-1, { state: { successMessage } });
      } catch {
        showError(updateErrorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      dispatch(
        createExpenseAction(
          {
            date: formData.date,
            budgetIds,
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
        navigate(-1, { state: { toastMessage: successMessage } });
      }
      if (onSuccess) onSuccess(successMessage);
    }
  };

  const handleLinkBudgets = () => setShowTable(true);
  const handleCloseTable = () => setShowTable(false);
  const handleOnClose = () => {
    if (isCreateMode && typeof onClose === "function") {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const renderAutoFillBadge = (field) => {
    if (!isCreateMode || !autoFilledFields[field]) return null;
    return (
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
    );
  };

  const formLabelWidth = "120px";

  const renderExpenseNameWithSuggestions = () => (
    <FormField
      label={fieldLabels.expenseName}
      htmlFor="expenseName"
      required
      error={errors.expenseName}
      colors={colors}
      labelWidth={formLabelWidth}
    >
      <ExpenseNameAutocomplete
        value={formData.expenseName}
        onChange={(val) => {
          setFieldValue("expenseName", val);
          if (errors.expenseName && val) clearFieldError("expenseName");
        }}
        friendId={friendId}
        placeholder={fieldPlaceholders.expenseName}
        error={!!errors.expenseName}
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
      labelWidth={formLabelWidth}
    >
      <ThemedAmountField
        id="amount"
        name="amount"
        value={formData.amount || ""}
        onChange={
          isEditMode
            ? (e) => setFieldValue("amount", e.target.value)
            : handleInputChange
        }
        onClearError={() => clearFieldError("amount")}
        placeholder={fieldPlaceholders.amount}
        colors={colors}
        error={!!errors.amount}
        height="48px"
        maxWidth="300px"
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
      labelWidth={formLabelWidth}
    >
      <ThemedDatePicker
        value={formData.date}
        onChange={handleDateChange}
        colors={colors}
        dateFormat={dateFormat}
        error={!!errors.date}
        disableFuture
        placeholder={fieldPlaceholders.date}
        height={48}
        width={300}
      />
    </FormField>
  );

  const renderTransactionTypeAutocomplete = () => (
    <FormField
      label={fieldLabels.transactionType}
      htmlFor="transactionType"
      required
      error={errors.transactionType}
      colors={colors}
      labelWidth={formLabelWidth}
    >
      <div className="relative">
        <ThemedAutocomplete
          options={TYPE_OPTIONS}
          value={(formData.transactionType || "").toLowerCase() || null}
          onChange={(_, newValue) => {
            setFieldValue(
              "transactionType",
              newValue ? newValue.toLowerCase() : "",
            );
            if (errors.transactionType) clearFieldError("transactionType");
            if (isCreateMode) markUserModified("transactionType");
          }}
          onInputChange={(event, newValue, reason) => {
            if (isEditMode) {
              setFieldValue("transactionType", (newValue || "").toLowerCase());
            } else if (reason === "clear") {
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
          error={!!errors.transactionType}
          placeholder={fieldPlaceholders.transactionType}
          noOptionsText={noOptionsText}
          maxWidth="300px"
        />
        {renderAutoFillBadge("transactionType")}
      </div>
    </FormField>
  );

  const renderCategoryAutocomplete = () => (
    <FormField
      label={fieldLabels.category}
      htmlFor="category"
      error={errors.category}
      colors={colors}
      labelWidth={formLabelWidth}
    >
      <div className="relative">
        <CategoryAutocomplete
          value={formData.category}
          onChange={(categoryId) => {
            setFieldValue("category", categoryId);
            if (isCreateMode) markUserModified("category");
          }}
          friendId={friendId}
          placeholder={fieldPlaceholders.category}
          error={!!errors.category}
          size="medium"
        />
        {renderAutoFillBadge("category")}
      </div>
    </FormField>
  );

  const renderPaymentMethodAutocomplete = () => (
    <FormField
      label={fieldLabels.paymentMethod}
      htmlFor="paymentMethod"
      colors={colors}
      labelWidth={formLabelWidth}
    >
      <div className="relative">
        <PaymentMethodAutocomplete
          value={formData.paymentMethod}
          onChange={(val) => {
            setFieldValue("paymentMethod", val);
            if (isCreateMode) markUserModified("paymentMethod");
          }}
          transactionType={formData.transactionType}
          friendId={friendId}
          placeholder={fieldPlaceholders.paymentMethod}
          size="medium"
        />
        {renderAutoFillBadge("paymentMethod")}
      </div>
    </FormField>
  );

  const renderCommentsField = () => (
    <FormField
      label={fieldLabels.comments}
      htmlFor="comments"
      colors={colors}
      layout="horizontal"
      labelWidth={formLabelWidth}
    >
      <div className="relative">
        {isCreateMode && autoFilledFields.comments && (
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
          value={formData.comments || ""}
          onChange={(e) => {
            if (isCreateMode) {
              handleInputChange(e);
              markUserModified("comments");
            } else {
              setFieldValue("comments", e.target.value);
            }
          }}
          placeholder={fieldPlaceholders.comments}
          colors={colors}
          error={errors.comments}
          minRows={3}
          maxRows={5}
          maxWidth="920px"
        />
      </div>
    </FormField>
  );

  const tableVars = {
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
  };

  return (
    <>
      <FormPageShell
        title={pageTitle}
        onClose={handleOnClose}
        colors={colors}
        rightContent={
          isCreateMode &&
          formData.expenseName?.trim().length >= 2 &&
          formData.date && (
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
      >
        <div className="flex flex-col">
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
          <FormRow>{renderCommentsField()}</FormRow>
        </div>

        <div
          className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mt-4"
        >
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
            className={`w-full relative mt-3 overflow-hidden ${
              isCreateMode ? "mb-20 lg:mb-0" : ""
            }`}
            style={{ ...tableVars, maxHeight: "360px" }}
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
          className={`w-full flex justify-end mt-4 sm:mt-8 ${
            isCreateMode
              ? "pb-4 lg:pb-0 sticky bottom-0 left-0 right-0 pt-4 lg:pt-0 lg:static z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] lg:shadow-none"
              : ""
          }`}
          style={isCreateMode ? { backgroundColor: colors.secondary_bg } : undefined}
        >
          {hasWriteAccess && (
            <SubmitButton
              onClick={handleSubmit}
              label={submitLabel}
              isSubmitting={isEditMode ? isSubmitting : undefined}
              colors={colors}
            />
          )}
        </div>

        {isEditMode && <ToastNotification {...toastProps} />}
      </FormPageShell>
    </>
  );
}
