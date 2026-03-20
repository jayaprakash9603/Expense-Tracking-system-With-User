import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExpenseFormShell,
  ExpenseFormRow,
  ExpenseFieldLayout,
  ExpenseSubmitArea,
  ExpenseThemedAmountField,
  ExpenseThemedDatePicker,
  ExpenseThemedCommentField,
} from "@/features/expenses/components/form";
import { useBudgetForm } from "../hooks/useBudgetForm";
import { ExpenseSelectionTable } from "../components/ExpenseSelectionTable";
import { LinkedEntityTablePanel } from "@/shared/components/form/LinkedEntityTablePanel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function budgetNameInputClassName(error) {
  return cn(
    "h-12 rounded-lg border-2 bg-card px-3 py-2 text-sm font-medium shadow-sm transition-[border-color,box-shadow]",
    "placeholder:text-muted-foreground focus-visible:outline-none",
    error
      ? "border-destructive focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/30"
      : "border-primary/55 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25",
  );
}

export function BudgetFormPageView({ mode: modeProp } = {}) {
  const { t } = useLanguage();
  const { id, friendId } = useParams();
  const navigate = useNavigate();
  const mode = modeProp || (id ? "edit" : "create");
  const isCreateMode = mode === "create";

  const formHook = useBudgetForm({
    mode,
    entityId: id,
    friendId: friendId || "",
    onSuccess: () => {
      toast.success(t(isCreateMode ? "budget.created" : "budget.updated"));
      navigate(isCreateMode ? "/budgets" : -1);
    },
    onError: () => toast.error(t("common.error")),
  });

  const {
    formData,
    errors,
    isSubmitting,
    isLoading,
    isDirty,
    showTable,
    expenses,
    expenseError,
    expensesLoading,
    selectedExpenseIds,
    setSelectedExpenseIds,
    setShowTable,
    refreshLinkedExpenses,
    handleChange,
    handleSubmit,
  } = formHook;

  const pageTitle = t(isCreateMode ? "budget.addBudget" : "budget.editBudget");
  const submitLabel = t(isCreateMode ? "common.create" : "common.save");

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (isLoading) {
    return (
      <ExpenseFormShell title={pageTitle} onClose={handleClose} className="budget-form-container">
        <BudgetFormPageSkeleton />
      </ExpenseFormShell>
    );
  }

  return (
    <ExpenseFormShell title={pageTitle} onClose={handleClose} className="budget-form-container">
      <div className={cn("mt-2 flex flex-col gap-3 lg:gap-4", showTable && "pb-2")}>
        <ExpenseFormRow first className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
          <ExpenseFieldLayout
            label={t("budget.name")}
            htmlFor="budgetName"
            required
            error={errors.name ? t(errors.name) : undefined}
          >
            <Input
              id="budgetName"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("budget.name")}
              className={budgetNameInputClassName(Boolean(errors.name))}
              style={{ maxWidth: "100%" }}
            />
          </ExpenseFieldLayout>

          <ExpenseFieldLayout
            label={t("budget.amount")}
            htmlFor="budgetAmount"
            required
            error={errors.amount ? t(errors.amount) : undefined}
          >
            <ExpenseThemedAmountField
              id="budgetAmount"
              name="amount"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="0.00"
              error={Boolean(errors.amount)}
              height={48}
              maxWidth="100%"
            />
          </ExpenseFieldLayout>
        </ExpenseFormRow>

        <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
          <ExpenseFieldLayout
            label={t("budget.startDate")}
            htmlFor="budgetStartDate"
            required
            error={errors.startDate ? t(errors.startDate) : undefined}
          >
            <ExpenseThemedDatePicker
              value={formData.startDate}
              onChange={(nextDate) => {
                handleChange("startDate", nextDate);
                if (showTable) refreshLinkedExpenses(nextDate, formData.endDate);
              }}
              dateFormat="DD/MM/YYYY"
              error={Boolean(errors.startDate)}
              disableFuture={false}
              placeholder={t("budget.startDate")}
              height={48}
              width="100%"
            />
          </ExpenseFieldLayout>

          <ExpenseFieldLayout
            label={t("budget.endDate")}
            htmlFor="budgetEndDate"
            required
            error={errors.endDate ? t(errors.endDate) : undefined}
          >
            <ExpenseThemedDatePicker
              value={formData.endDate}
              onChange={(nextDate) => {
                handleChange("endDate", nextDate);
                if (showTable) refreshLinkedExpenses(formData.startDate, nextDate);
              }}
              dateFormat="DD/MM/YYYY"
              error={Boolean(errors.endDate)}
              disableFuture={false}
              placeholder={t("budget.endDate")}
              height={48}
              width="100%"
            />
          </ExpenseFieldLayout>
        </ExpenseFormRow>

        <ExpenseFormRow>
          <ExpenseFieldLayout
            label={t("budget.description")}
            htmlFor="budgetDescription"
            layout="horizontal"
            required
            error={errors.description ? t(errors.description) : undefined}
            contentClassName="w-full max-w-full lg:max-w-[760px]"
          >
            <ExpenseThemedCommentField
              id="budgetDescription"
              name="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={t("budget.description")}
              error={Boolean(errors.description)}
              maxWidth="760px"
              minRows={3}
              maxRows={5}
            />
          </ExpenseFieldLayout>
        </ExpenseFormRow>

        <LinkedEntityTablePanel
          linkLabel={t("budget.linkExpenses")}
          open={showTable}
          onOpenChange={setShowTable}
          error={expenseError || undefined}
          closeAriaLabel={t("common.close")}
        >
          <ExpenseSelectionTable
            expenses={expenses}
            selectedExpenseIds={selectedExpenseIds}
            onSelectionChange={setSelectedExpenseIds}
            emptyText={t("budget.noExpensesForDate")}
            loading={expensesLoading}
          />
        </LinkedEntityTablePanel>
      </div>

      <ExpenseSubmitArea
        isSubmitting={isSubmitting}
        disabled={isSubmitting || !isDirty}
        onSubmit={handleSubmit}
        label={submitLabel}
      />
    </ExpenseFormShell>
  );
}

export default BudgetFormPageView;
