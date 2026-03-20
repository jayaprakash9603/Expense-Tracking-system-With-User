import React, { useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { cn } from "@/lib/utils";
import { createFuzzyFilterOptions } from "../utils/expenseFuzzyUtils";
import {
  EXPENSE_FORM_LABELS,
  EXPENSE_FORM_PLACEHOLDERS,
  EXPENSE_FORM_MODE_CONFIG,
  EXPENSE_TYPE_OPTIONS,
} from "../config/expenseConfig";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { BudgetSelectionTable } from "../components/budget/BudgetSelectionTable";
import {
  ExpenseFormShell,
  ExpenseFormRow,
  ExpenseFieldLayout,
  ExpenseSubmitArea,
  ExpenseThemedAmountField,
  ExpenseThemedDatePicker,
  ExpenseThemedCommentField,
  ExpenseThemedAutocomplete,
  ExpenseNameAutocomplete,
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  AutoFillBadge,
  PreviousExpenseIndicator,
} from "../components/form";

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
      <ExpenseFormShell title={pageTitle} onClose={handleClose}>
        <div className="py-10 text-center text-sm text-muted-foreground">
          {t("common.loading")}
        </div>
      </ExpenseFormShell>
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
          />
        ) : null
      }
      className="new-expense-container"
    >
      <div className={cn("mt-2 flex flex-col gap-3 lg:gap-4", showTable && "pb-2")}>
        <ExpenseFormRow first className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
          <ExpenseFieldLayout
            label={t(EXPENSE_FORM_LABELS.expenseName)}
            htmlFor="expenseName"
            required
            error={errors.expenseName}
          >
            <ExpenseNameAutocomplete
              value={formData.expenseName}
              onChange={(value) => {
                setFieldValue("expenseName", value);
                clearFieldError("expenseName");
              }}
              friendId={friendId}
              placeholder={t(EXPENSE_FORM_PLACEHOLDERS.expenseName)}
              error={Boolean(errors.expenseName)}
              maxSuggestions={500}
              noDataText={noExpenseNamesLabel}
            />
          </ExpenseFieldLayout>

          <ExpenseFieldLayout
            label={t(EXPENSE_FORM_LABELS.amount)}
            htmlFor="amount"
            required
            error={errors.amount}
          >
            <ExpenseThemedAmountField
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={(event) => {
                setFieldValue("amount", event.target.value);
                clearFieldError("amount");
              }}
              placeholder={t(EXPENSE_FORM_PLACEHOLDERS.amount)}
              error={Boolean(errors.amount)}
              height={48}
              maxWidth="100%"
            />
          </ExpenseFieldLayout>

          <ExpenseFieldLayout
            label={t(EXPENSE_FORM_LABELS.date)}
            htmlFor="date"
            required
            error={errors.date}
          >
            <ExpenseThemedDatePicker
              value={formData.date}
              onChange={(nextDate) => {
                handleDateChange(nextDate);
              }}
              dateFormat="DD/MM/YYYY"
              error={Boolean(errors.date)}
              disableFuture
              placeholder={t(EXPENSE_FORM_PLACEHOLDERS.date)}
              height={48}
              width="100%"
            />
          </ExpenseFieldLayout>
        </ExpenseFormRow>

        <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
          <ExpenseFieldLayout
            label={t(EXPENSE_FORM_LABELS.transactionType)}
            htmlFor="transactionType"
            required
            error={errors.transactionType}
          >
            <div className="relative">
              <ExpenseThemedAutocomplete
                options={EXPENSE_TYPE_OPTIONS}
                value={formData.transactionType}
                onChange={(_, value) => {
                  const nextValue = String(value || "").toLowerCase();
                  setFieldValue("transactionType", nextValue);
                  clearFieldError("transactionType");
                  markUserModified("transactionType");
                }}
                onInputChange={(_, nextValue, reason) => {
                  if (reason === "clear") {
                    setFieldValue("transactionType", "");
                    clearFieldError("transactionType");
                  }
                }}
                getOptionLabel={formatTransactionTypeLabel}
                isOptionEqualToValue={(option, value) =>
                  String(option || "").toLowerCase() ===
                  String(value || "").toLowerCase()
                }
                filterOptions={transactionTypeFilterOptions}
                placeholder={t(EXPENSE_FORM_PLACEHOLDERS.transactionType)}
                noOptionsText={noOptionsLabel}
                error={Boolean(errors.transactionType)}
                renderOption={(option, state) => (
                  <HighlightedText
                    text={formatTransactionTypeLabel(option)}
                    query={state.inputValue}
                    title={formatTransactionTypeLabel(option)}
                  />
                )}
              />
              <AutoFillBadge
                visible={isCreateMode && autoFilledFields.transactionType}
              />
            </div>
          </ExpenseFieldLayout>

          <ExpenseFieldLayout
            label={t(EXPENSE_FORM_LABELS.category)}
            htmlFor="category"
            error={errors.category}
          >
            <div className="relative">
              <CategoryAutocomplete
                value={formData.category}
                onChange={(categoryId) => {
                  setFieldValue("category", categoryId);
                  markUserModified("category");
                }}
                friendId={friendId}
                placeholder={t(EXPENSE_FORM_PLACEHOLDERS.category)}
                error={Boolean(errors.category)}
              />
              <AutoFillBadge
                visible={isCreateMode && autoFilledFields.category}
              />
            </div>
          </ExpenseFieldLayout>

          <ExpenseFieldLayout
            label={t(EXPENSE_FORM_LABELS.paymentMethod)}
            htmlFor="paymentMethod"
          >
            <div className="relative">
              <PaymentMethodAutocomplete
                value={formData.paymentMethod}
                onChange={(value) => {
                  setFieldValue("paymentMethod", value);
                  markUserModified("paymentMethod");
                }}
                transactionType={formData.transactionType}
                friendId={friendId}
                placeholder={t(EXPENSE_FORM_PLACEHOLDERS.paymentMethod)}
              />
              <AutoFillBadge
                visible={isCreateMode && autoFilledFields.paymentMethod}
              />
            </div>
          </ExpenseFieldLayout>
        </ExpenseFormRow>

        <ExpenseFormRow>
          <ExpenseFieldLayout
            label={t(EXPENSE_FORM_LABELS.comments)}
            htmlFor="comments"
            layout="horizontal"
            contentClassName="w-full max-w-full lg:max-w-[760px]"
          >
            <div className="relative">
              <AutoFillBadge
                visible={isCreateMode && autoFilledFields.comments}
                className="top-[-20px] right-0 translate-x-0 lg:right-auto lg:left-[300px]"
              />
              <ExpenseThemedCommentField
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={(event) => {
                  setFieldValue("comments", event.target.value);
                  markUserModified("comments");
                }}
                placeholder={t(EXPENSE_FORM_PLACEHOLDERS.comments)}
                maxWidth="760px"
                minRows={2}
                maxRows={3}
              />
            </div>
          </ExpenseFieldLayout>
        </ExpenseFormRow>
      <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => setShowTable(true)}
          >
            {linkBudgetsLabel}
          </Button>
        </div>
        {showTable ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="hidden sm:inline-flex"
            onClick={() => setShowTable(false)}
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {showTable ? (
        <div className="relative mt-4 w-full overflow-hidden rounded-lg border border-border/60 bg-card/50">
          <div className="mb-2 flex justify-end px-1 pt-1 sm:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowTable(false)}
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full min-w-0">
            <BudgetSelectionTable
              budgets={budgets}
              selectedBudgetIds={selectedBudgetIds}
              onSelectionChange={setSelectedBudgetIds}
              loading={budgetsLoading}
            />
          </div>
        </div>
      ) : null}

      {budgetError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {budgetError}
        </div>
      ) : null}
      </div>

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
