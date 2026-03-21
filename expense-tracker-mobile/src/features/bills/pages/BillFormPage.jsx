import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Link2, ListPlus, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { ExpenseFormShell } from "@/features/expenses/components/form/ExpenseFormShell";
import { ExpenseSubmitArea } from "@/features/expenses/components/form/ExpenseSubmitArea";
import { PreviousExpenseIndicator } from "@/features/expenses/components/form/PreviousExpenseIndicator";
import { BudgetSelectionTable } from "@/features/expenses/components/budget/BudgetSelectionTable";
import { Button } from "@/components/ui/button";
import {
  computeBillExpensesTotal,
  filterValidBillExpenses,
} from "@/domain/bills/billExpenseLineUtils";
import { BILL_FORM_LABELS, BILL_FORM_MODE_CONFIG, BILL_FORM_PLACEHOLDERS } from "../config/billConfig";
import { useBillForm } from "../hooks/useBillForm";
import { useBillExpenseItems } from "../hooks/useBillExpenseItems";
import { BillFormFields } from "../components/BillFormFields";
import { BillFormLoadingState } from "../components/BillFormLoadingState";
import { BillExpenseItemsTable } from "../components/BillExpenseItemsTable";
import { BillExpenseItemsSummary } from "../components/BillExpenseItemsSummary";

export function BillFormPage({ mode: modeProp }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const mode = modeProp || (id ? "edit" : "create");
  const dateFromQuery =
    mode === "create" ? new URLSearchParams(location.search).get("date") || "" : "";

  const handleFormError = useCallback(() => {
    toast.error(t("common.error"));
  }, [t]);

  const formHook = useBillForm({
    mode,
    entityId: id ?? null,
    friendId: "",
    dateFromQuery,
    onError: handleFormError,
  });

  const {
    formData,
    errors,
    handleChange,
    setFieldValues,
    handleDateChange,
    isLoading,
    isSubmitting,
    handleSubmit,
    budgets,
    budgetsLoading,
    previousExpense,
    loadingPreviousExpense,
    autoFilledFields,
    markUserModified,
    autoFillNoticeToken,
    isCreateMode,
  } = formHook;

  const [showBudgetPanel, setShowBudgetPanel] = useState(false);

  const committedExpenses = formData.expenses || [];

  const handleExpenseCommit = useCallback(
    (valid) => {
      const total = computeBillExpensesTotal(valid);
      setFieldValues({
        expenses: valid,
        amount: String(total),
      });
    },
    [setFieldValues],
  );

  const {
    tempExpenses,
    showExpenseTable,
    lastRowRef,
    handleTempChange,
    addRow,
    removeRow,
    handleSave,
    closeTable,
    toggleTable,
  } = useBillExpenseItems({
    t,
    committedExpenses,
    onCommit: handleExpenseCommit,
    onBeforeOpenExpense: () => setShowBudgetPanel(false),
  });

  const handleBudgetSelectionChange = useCallback(
    (nextIds) => {
      setFieldValues({ budgetIds: nextIds });
    },
    [setFieldValues],
  );

  const openBudgetPanel = useCallback(() => {
    closeTable();
    setShowBudgetPanel(true);
  }, [closeTable]);

  const closeBudgetPanel = useCallback(() => {
    setShowBudgetPanel(false);
  }, []);

  const toggleBudgetPanel = useCallback(() => {
    if (showBudgetPanel) {
      closeBudgetPanel();
    } else {
      openBudgetPanel();
    }
  }, [showBudgetPanel, closeBudgetPanel, openBudgetPanel]);

  const toggleExpensePanel = useCallback(() => {
    if (!showExpenseTable) {
      setShowBudgetPanel(false);
    }
    toggleTable();
  }, [showExpenseTable, toggleTable]);

  const validCommittedLines = useMemo(
    () => filterValidBillExpenses(committedExpenses),
    [committedExpenses],
  );

  const modeConfig = BILL_FORM_MODE_CONFIG[mode] || BILL_FORM_MODE_CONFIG.create;
  const pageTitle = t(modeConfig.titleKey);
  const submitLabel = t(modeConfig.submitLabelKey);
  const successMessage = t(modeConfig.successMessageKey);

  const budgetButtonLabel = showBudgetPanel
    ? t("billForm.actions.hideBudget")
    : t("billForm.actions.linkBudget");
  const expenseButtonLabel = showExpenseTable
    ? t("billForm.actions.hideExpenseLines")
    : t("billForm.actions.addExpenseLines");

  const handleFormSubmit = useCallback(async () => {
    const result = await handleSubmit();
    if (!result?.success) return;
    toast.success(successMessage);
    navigate(-1);
  }, [handleSubmit, successMessage, navigate]);

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const canShowPreviousExpense = Boolean(
    isCreateMode &&
      String(formData.name || "").trim().length >= 2 &&
      formData.date,
  );

  const noExpenseNamesLabel = t("expenseForm.actions.noExpenseNames");
  const noOptionsLabel = t("expenseForm.actions.noOptions");

  if (isLoading && mode === "edit") {
    return (
      <BillFormLoadingState
        title={pageTitle}
        loadingLabel={t("common.loading")}
        onClose={handleClose}
      />
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
            label={t("expenseForm.actions.previouslyAdded")}
            labelPosition="top"
            icon="calendar"
            className="max-w-[min(100%,14rem)] shrink-0"
          />
        ) : null
      }
      className="bill-form-container"
    >
      <BillFormFields
        t={t}
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        labels={BILL_FORM_LABELS}
        placeholders={BILL_FORM_PLACEHOLDERS}
        handleDateChange={handleDateChange}
        autoFilledFields={autoFilledFields}
        markUserModified={markUserModified}
        autoFillNoticeToken={autoFillNoticeToken}
        isCreateMode={isCreateMode}
        noExpenseNamesLabel={noExpenseNamesLabel}
        noOptionsLabel={noOptionsLabel}
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant={showBudgetPanel ? "secondary" : "outline"}
          className="h-11 w-full justify-center gap-2 sm:w-auto"
          onClick={toggleBudgetPanel}
        >
          <Link2 className="h-4 w-4 shrink-0" aria-hidden />
          {budgetButtonLabel}
        </Button>
        <Button
          type="button"
          variant={showExpenseTable ? "secondary" : "outline"}
          className="h-11 w-full justify-center gap-2 sm:w-auto"
          onClick={toggleExpensePanel}
        >
          <ListPlus className="h-4 w-4 shrink-0" aria-hidden />
          {expenseButtonLabel}
        </Button>
      </div>

      {showBudgetPanel && (
        <div className="mt-4 w-full min-w-0">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold">{t("billForm.budgetPanel.title")}</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeBudgetPanel}
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full overflow-hidden rounded-lg border border-border/60 bg-card/50">
            <div className="w-full min-w-0 p-1 sm:p-2">
              <BudgetSelectionTable
                budgets={budgets}
                selectedBudgetIds={formData.budgetIds || []}
                onSelectionChange={handleBudgetSelectionChange}
                loading={budgetsLoading}
              />
            </div>
          </div>
        </div>
      )}

      {showExpenseTable && (
        <BillExpenseItemsTable
          tempExpenses={tempExpenses}
          onChange={handleTempChange}
          onAddRow={addRow}
          onRemoveRow={removeRow}
          onSave={handleSave}
          onClose={closeTable}
          lastRowRef={lastRowRef}
          t={t}
        />
      )}

      {!showBudgetPanel && !showExpenseTable && (
        <div className="mt-4">
          <BillExpenseItemsSummary
            expenses={validCommittedLines}
            t={t}
            errorMessage={errors.amount ? t(errors.amount) : undefined}
          />
        </div>
      )}

      <ExpenseSubmitArea
        isSubmitting={isSubmitting}
        disabled={isSubmitting}
        onSubmit={handleFormSubmit}
        label={submitLabel}
      />
    </ExpenseFormShell>
  );
}

export default BillFormPage;
