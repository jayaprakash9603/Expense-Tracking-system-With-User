import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  editExpenseAction,
  getExpenseAction,
} from "../../../Redux/Expenses/expense.action";
import { getListOfBudgetsByExpenseId } from "../../../Redux/Budget/budget.action";
import {
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  ExpenseNameAutocomplete,
} from "../../../components/ui";
import { normalizePaymentMethod } from "../../../utils/paymentMethodUtils";
import HighlightedText from "../../../components/common/HighlightedText";
import { createFuzzyFilterOptions } from "../../../utils/fuzzyMatchUtils";
import BudgetSelectionTable from "../../../components/common/BudgetSelectionTable/BudgetSelectionTable";
import ToastNotification from "../../../shared/components/ToastNotification";
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

const today = new Date().toISOString().split("T")[0];

const initialFormData = {
  expenseName: "",
  amount: "",
  netAmount: "",
  paymentMethod: "cash",
  transactionType: "loss",
  comments: "",
  date: today,
  category: "",
  categoryName: "",
};

const EditExpense = () => {
  const {
    colors,
    t,
    dateFormat,
    navigate,
    dispatch,
    params,
    friendId,
    hasWriteAccess,
  } = useFormPage({
    redirectConfig: {
      buildFriendPath: (fid) => `/friends/expenses/${fid}`,
      selfPath: "/friends/expenses",
      defaultPath: "/friends/expenses",
    },
  });

  const { formData, setFormData, errors, setErrors, setFieldValue, clearFieldError } =
    useFormState(initialFormData);
  const { showSuccess, showError, toastProps } = useToast();

  const pageTitle = t("editExpense.title");
  const linkBudgetsLabel = t("editExpense.actions.linkBudgets");
  const submitLabel = t("editExpense.actions.submit");
  const successMessage = t("editExpense.actions.successMessage");
  const updateErrorMessage = t("editExpense.messages.updateError");
  const errorLoadingBudgets = t("editExpense.messages.errorLoadingBudgets");
  const noOptionsText = t("editExpense.autocomplete.noOptions");
  const tableNoRowsText = t("editExpense.table.noRows");
  const closeLabel = t("common.close");

  const fieldLabels = useMemo(
    () => ({
      expenseName: t("editExpense.fields.expenseName"),
      amount: t("editExpense.fields.amount"),
      date: t("editExpense.fields.date"),
      transactionType: t("editExpense.fields.transactionType"),
      category: t("editExpense.fields.category"),
      paymentMethod: t("editExpense.fields.paymentMethod"),
      comments: t("editExpense.fields.comments"),
    }),
    [t],
  );

  const fieldPlaceholders = useMemo(
    () => ({
      expenseName: t("editExpense.placeholders.expenseName"),
      amount: t("editExpense.placeholders.amount"),
      date: t("editExpense.placeholders.date"),
      transactionType: t("editExpense.placeholders.transactionType"),
      category: t("editExpense.placeholders.category"),
      paymentMethod: t("editExpense.placeholders.paymentMethod"),
      comments: t("editExpense.placeholders.comments"),
      generic: t("editExpense.placeholders.generic"),
    }),
    [t],
  );

  const validationMessages = useMemo(
    () => ({
      expenseName: t("editExpense.validation.expenseName"),
      amount: t("editExpense.validation.amount"),
      date: t("editExpense.validation.date"),
      transactionType: t("editExpense.validation.transactionType"),
    }),
    [t],
  );

  const transactionTypeLabels = useMemo(
    () => ({
      gain: t("editExpense.transactionTypes.gain"),
      loss: t("editExpense.transactionTypes.loss"),
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

  const { expense } = useSelector((state) => state.expenses || {});
  const { budgets, error: budgetError } = useSelector(
    (state) => state.budgets || {},
  );

  const [showTable, setShowTable] = useState(false);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const id = params?.id;

  useEffect(() => {
    const fetchDate = expense?.date || today;
    dispatch(
      getListOfBudgetsByExpenseId({
        id,
        date: fetchDate,
        targetId: friendId || "",
      }),
    );
    dispatch(getExpenseAction(id || "", friendId || ""));
  }, [dispatch, id, friendId, expense?.date]);

  useEffect(() => {
    if (budgets && Array.isArray(budgets)) {
      const initialSelection = budgets
        .filter((budget) => budget.includeInBudget)
        .map((budget) => budget.id);
      setSelectedBudgetIds(initialSelection);
    }
  }, [budgets]);

  useEffect(() => {
    if (expense) {
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
  }, [expense, setFormData]);

  const handleDateChange = (formattedValue) => {
    const newDate = new Date(formattedValue);
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

    setFormData((prev) => ({
      ...prev,
      date: formattedValue,
      transactionType: isSalary ? "gain" : "loss",
    }));

    dispatch(
      getListOfBudgetsByExpenseId({
        id,
        date: formattedValue,
        targetId: friendId || "",
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.expenseName)
      newErrors.expenseName = validationMessages.expenseName;
    const parsedAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0)
      newErrors.amount = validationMessages.amount;
    if (!formData.date) newErrors.date = validationMessages.date;
    if (!formData.transactionType)
      newErrors.transactionType = validationMessages.transactionType;
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const budgetIds = selectedBudgetIds;

    try {
      setIsSubmitting(true);
      const normalizedPm = normalizePaymentMethod(formData.paymentMethod);
      const amt = parseFloat(formData.amount) || 0;
      const derivedCreditDue = normalizedPm === "creditNeedToPaid" ? amt : 0;

      if (!hasWriteAccess) return;

      await dispatch(
        editExpenseAction(
          id,
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
    } catch (err) {
      showError(updateErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkBudgets = () => setShowTable(true);
  const handleCloseTable = () => setShowTable(false);
  const handleOnClose = () => navigate(-1);

  const renderExpenseNameWithSuggestions = () => (
    <FormField
      label={fieldLabels.expenseName}
      htmlFor="expenseName"
      required
      error={errors.expenseName}
      colors={colors}
    >
      <ExpenseNameAutocomplete
        value={formData.expenseName}
        onChange={(val) => setFieldValue("expenseName", val)}
        friendId={friendId}
        placeholder={fieldPlaceholders.expenseName}
        error={!!errors.expenseName}
        size="medium"
        maxSuggestions={500}
        noDataText="No expense names found"
      />
    </FormField>
  );

  const renderCategoryAutocomplete = () => (
    <FormField
      label={fieldLabels.category}
      htmlFor="category"
      error={errors.category}
      colors={colors}
    >
      <CategoryAutocomplete
        value={formData.category}
        onChange={(categoryId) => setFieldValue("category", categoryId)}
        friendId={friendId}
        placeholder={fieldPlaceholders.category}
        size="medium"
        error={!!errors.category}
      />
    </FormField>
  );

  const renderPaymentMethodAutocomplete = () => (
    <FormField
      label={fieldLabels.paymentMethod}
      htmlFor="paymentMethod"
      colors={colors}
    >
      <PaymentMethodAutocomplete
        value={formData.paymentMethod}
        onChange={(paymentMethodValue) =>
          setFieldValue("paymentMethod", paymentMethodValue)
        }
        transactionType={formData.transactionType}
        friendId={friendId}
        placeholder={fieldPlaceholders.paymentMethod}
        size="medium"
      />
    </FormField>
  );

  return (
    <>
      <FormPageShell
        title={pageTitle}
        onClose={handleOnClose}
        colors={colors}
      >
        <FormRow first>
          {renderExpenseNameWithSuggestions()}
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
              value={formData.amount || ""}
              onChange={(e) => {
                setFieldValue("amount", e.target.value);
              }}
              onClearError={() => clearFieldError("amount")}
              placeholder={fieldPlaceholders.amount}
              colors={colors}
              error={!!errors.amount}
              maxWidth="300px"
            />
          </FormField>
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
              error={!!errors.date}
              disableFuture
              placeholder={fieldPlaceholders.date}
              width={300}
              height={56}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField
            label={fieldLabels.transactionType}
            htmlFor="transactionType"
            required
            error={errors.transactionType}
            colors={colors}
          >
            <ThemedAutocomplete
              options={typeOptions}
              value={(formData.transactionType || "").toLowerCase()}
              onChange={(_, newValue) =>
                setFieldValue(
                  "transactionType",
                  (newValue || "").toLowerCase(),
                )
              }
              onInputChange={(_, newValue) =>
                setFieldValue(
                  "transactionType",
                  (newValue || "").toLowerCase(),
                )
              }
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
          </FormField>
          {renderCategoryAutocomplete()}
          {renderPaymentMethodAutocomplete()}
        </FormRow>

        <FormRow>
          <FormField
            label={fieldLabels.comments}
            htmlFor="comments"
            colors={colors}
          >
            <ThemedCommentField
              id="comments"
              name="comments"
              value={formData.comments || ""}
              onChange={(e) => setFieldValue("comments", e.target.value)}
              placeholder={fieldPlaceholders.comments}
              colors={colors}
              minRows={3}
              maxRows={5}
              maxWidth="920px"
            />
          </FormField>
        </FormRow>

        <div className="mt-6 w-full flex flex-col sm:flex-row items-center justify-between gap-2">
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
              className="px-2 py-1 border rounded hover:bg-[#3a3a3a] mt-2 sm:mt-0 hidden sm:block"
              style={{
                backgroundColor: colors.active_bg,
                borderColor: colors.border_color,
                color: colors.primary_text,
              }}
            >
              X
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
                  aria-label={closeLabel}
                  className="px-2 py-1 border rounded hover:bg-[#3a3a3a]"
                  style={{
                    backgroundColor: colors.active_bg,
                    borderColor: colors.border_color,
                    color: colors.primary_text,
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
            {errorLoadingBudgets}: {budgetError.message || tableNoRowsText}
          </div>
        )}

        <div className="w-full flex justify-end mt-4 sm:mt-8">
          {hasWriteAccess && (
            <SubmitButton
              onClick={handleSubmit}
              label={submitLabel}
              isSubmitting={isSubmitting}
              colors={colors}
            />
          )}
        </div>

        <ToastNotification {...toastProps} />
      </FormPageShell>
    </>
  );
};

export default EditExpense;
