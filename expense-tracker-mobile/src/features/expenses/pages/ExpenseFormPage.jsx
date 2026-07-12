import React, { useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { createFuzzyFilterOptions } from "@/shared/utils/fuzzy/expenseFuzzyUtils";
import {
  EXPENSE_FORM_LABELS,
  EXPENSE_FORM_PLACEHOLDERS,
  EXPENSE_FORM_MODE_CONFIG,
  EXPENSE_TYPE_OPTIONS,
} from "../config/expenseConfig";
import { useExpenseForm } from "../hooks/form/useExpenseForm";
import {
  ExpenseFormShell,
  ExpenseSubmitArea,
  PreviousExpenseIndicator,
} from "@/shared/components/entity-form";
import { ExpenseFormFields } from "../components/form/ExpenseFormFields";
import { ExpenseFormLoadingState } from "../components/form/ExpenseFormLoadingState";

function formatTransactionTypeLabel(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "gain") return "Gain";
  if (normalized === "loss") return "Loss";
  return value || "";
}

export function ExpenseFormPage({
  mode: modeProp,
  onClose,
  onSuccess,
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id, friendId } = useParams();
  const location = useLocation();

  const mode = modeProp || (id ? "edit" : "create");
  const dateFromQuery =
    mode === "create"
      ? new URLSearchParams(location.search).get("date") || ""
      : "";
  const handleFormError = useCallback(() => {
    toast.error(t("common.error"));
  }, [t]);

  const formHook = useExpenseForm({
    mode,
    entityId: id,
    friendId: friendId || "",
    dateFromQuery,
    onError: handleFormError,
  });

  const {
    isCreateMode,
    formData,
    errors,
    setFieldValue,
    clearFieldError,
    isLoading,
    isSubmitting,
    showTable,
    setShowTable,
    budgets,
    budgetsLoading,
    budgetError,
    selectedBudgetIds,
    setSelectedBudgetIds,
    previousExpense,
    loadingPreviousExpense,
    autoFilledFields,
    markUserModified,
    autoFillNoticeToken,
    handleDateChange,
    handleSubmit,
  } = formHook;

  const modeConfig = EXPENSE_FORM_MODE_CONFIG[mode] || EXPENSE_FORM_MODE_CONFIG.create;
  const pageTitle = t(modeConfig.titleKey);
  const submitLabel = t(modeConfig.submitLabelKey);
  const successMessage = t(modeConfig.successMessageKey);
  const linkBudgetsLabel = t("expenseForm.actions.linkBudgets");
  const previouslyAddedLabel = t("expenseForm.actions.previouslyAdded");
  const noExpenseNamesLabel = t("expenseForm.actions.noExpenseNames");
  const noOptionsLabel = t("expenseForm.actions.noOptions");

  const transactionTypeFilterOptions = useMemo(
    () =>
      createFuzzyFilterOptions({
        getOptionLabel: formatTransactionTypeLabel,
      }),
    [],
  );

  const handleFormSubmit = useCallback(async () => {
    const result = await handleSubmit();
    if (!result?.success) return;

    toast.success(successMessage);
    onSuccess?.(successMessage);

    if (isCreateMode && typeof onClose === "function") {
      onClose();
      return;
    }
    navigate(-1);
  }, [handleSubmit, successMessage, onSuccess, isCreateMode, onClose, navigate]);

  const handleClose = useCallback(() => {
    if (isCreateMode && typeof onClose === "function") {
      onClose();
      return;
    }
    navigate(-1);
  }, [isCreateMode, onClose, navigate]);

  const canShowPreviousExpense = Boolean(
    isCreateMode &&
      String(formData.expenseName || "").trim().length >= 2 &&
      formData.date,
  );

  if (isLoading) {
    return (
      <ExpenseFormLoadingState title={pageTitle} loadingLabel={t("common.loading")} onClose={handleClose} />
    );
  }

  return (
    <ExpenseFormShell
      title={pageTitle}
      onClose={handleClose}
      rightContent={
        canShowPreviousExpense ? (
          <PreviousExpenseIndicator
            expense={previousExpense}
            isLoading={loadingPreviousExpense}
            position="right"
            variant="gradient"
            showTooltip
            dateFormat="DD MMM YYYY"
            label={previouslyAddedLabel}
            labelPosition="top"
            icon="calendar"
            className="max-w-[min(100%,14rem)] shrink-0"
          />
        ) : null
      }
      className="new-expense-container"
    >
      <ExpenseFormFields
        t={t}
        formData={formData}
        errors={errors}
        setFieldValue={setFieldValue}
        clearFieldError={clearFieldError}
        friendId={friendId}
        showTable={showTable}
        setShowTable={setShowTable}
        budgets={budgets}
        budgetsLoading={budgetsLoading}
        budgetError={budgetError}
        selectedBudgetIds={selectedBudgetIds}
        setSelectedBudgetIds={setSelectedBudgetIds}
        isCreateMode={isCreateMode}
        autoFilledFields={autoFilledFields}
        markUserModified={markUserModified}
        autoFillNoticeToken={autoFillNoticeToken}
        handleDateChange={handleDateChange}
        labels={EXPENSE_FORM_LABELS}
        placeholders={EXPENSE_FORM_PLACEHOLDERS}
        expenseTypeOptions={EXPENSE_TYPE_OPTIONS}
        transactionTypeFilterOptions={transactionTypeFilterOptions}
        formatTransactionTypeLabel={formatTransactionTypeLabel}
        noExpenseNamesLabel={noExpenseNamesLabel}
        noOptionsLabel={noOptionsLabel}
        linkBudgetsLabel={linkBudgetsLabel}
      />

      <ExpenseSubmitArea
        isSubmitting={isSubmitting}
        disabled={isSubmitting}
        onSubmit={handleFormSubmit}
        label={submitLabel}
      />
    </ExpenseFormShell>
  );
}

export default ExpenseFormPage;
