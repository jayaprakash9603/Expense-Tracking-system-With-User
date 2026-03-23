import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";
import {
  EntityCommonFormSection,
  ExpenseFormShell,
  ExpenseSubmitArea,
} from "@/shared/components/entity-form";
import { LinkedEntityTablePanel } from "@/shared/components/form/LinkedEntityTablePanel";
import { ExpenseSelectionTable } from "@/features/budgets/components/form/ExpenseSelectionTable";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { PAYMENT_METHOD_TYPES } from "@/domain/paymentMethods";
import { usePaymentMethodForm } from "../hooks/form/usePaymentMethodForm";
import { usePaymentMethodExpenseLinking } from "../hooks/usePaymentMethodExpenseLinking";

function translateFormErrors(errors, translate) {
  return Object.entries(errors || {}).reduce((acc, [key, value]) => {
    acc[key] = value ? translate(value) : value;
    return acc;
  }, {});
}

export function PaymentMethodFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const mode = id ? "edit" : "create";

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const formHook = usePaymentMethodForm({
    mode,
    entityId: id,
    onSuccess: () => {},
    onError: () => toast.error(t("common.error")),
  });

  const { formData, errors, isSubmitting, isLoading, isDirty, handleSubmit, handleChange } = formHook;

  const {
    showTable,
    setShowTable,
    expenses,
    expensesLoading,
    expenseError,
    selectedExpenseIds,
    setSelectedExpenseIds,
    selectionDirty,
    applyPaymentMethodToSelectedExpenses,
  } = usePaymentMethodExpenseLinking({ mode, paymentMethodName: formData?.name });

  const typeOptions = PAYMENT_METHOD_TYPES.map((typeValue) => ({
    value: typeValue,
    label: t(`categories.types.${typeValue.toLowerCase()}`),
  }));

  const renderFields = ({ formData, errors, handleChange }) => (
    <>
      <EntityCommonFormSection
        formData={formData}
        errors={translateFormErrors(errors, t)}
        handleChange={handleChange}
        typeOptions={typeOptions}
        showAmount
        amountDigitsOnly
        labels={{
          name: t("paymentMethods.form.name"),
          description: t("paymentMethods.form.description"),
          type: t("paymentMethods.form.type"),
          amount: t("paymentMethods.form.amount"),
          color: t("paymentMethods.form.color"),
          icon: t("paymentMethods.form.icon"),
        }}
      />

      <div className="mt-4">
        <LinkedEntityTablePanel
          linkLabel={t("budget.linkExpenses")}
          open={showTable}
          onOpenChange={setShowTable}
          error={expenseError || undefined}
          closeAriaLabel={t("common.close")}
          summaryWhenClosed={
            showTable
              ? undefined
              : selectedExpenseIds.length === 0
                ? t("budget.noExpensesSelected")
                : t("budget.expensesSelectedCount", { count: selectedExpenseIds.length })
          }
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
    </>
  );

  const pageTitle = t(mode === "create" ? "paymentMethods.addTitle" : "paymentMethods.editTitle");
  const submitLabel = t(mode === "create" ? "common.create" : "common.save");

  const handleFormSubmit = useCallback(async () => {
    const result = await handleSubmit();
    if (!result?.success) return;
    const resolvedPaymentMethodName = result.data?.name ?? formData?.name;
    if (selectedExpenseIds.length > 0 && resolvedPaymentMethodName) {
      const linkResult = await applyPaymentMethodToSelectedExpenses(resolvedPaymentMethodName);
      if (!linkResult?.success) {
        toast.error(t("paymentMethods.expenseLinkFailed") || "Failed to link expenses");
        return;
      }
    }
    toast.success(t(mode === "create" ? "paymentMethods.created" : "paymentMethods.updated"));
    navigate("/payment-method");
  }, [
    handleSubmit,
    applyPaymentMethodToSelectedExpenses,
    selectedExpenseIds.length,
    formData?.name,
    mode,
    navigate,
    t,
  ]);

  if (isLoading) {
    return (
      <ExpenseFormShell title={pageTitle} onClose={handleClose} className="entity-common-form">
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </ExpenseFormShell>
    );
  }

  return (
    <ExpenseFormShell title={pageTitle} onClose={handleClose} className="entity-common-form">
      <div className={cn("mt-2 flex flex-col gap-2 lg:gap-3", showTable && "pb-2")}>
        {renderFields({ formData, errors, handleChange })}
      </div>
      <ExpenseSubmitArea
        isSubmitting={isSubmitting}
        disabled={isSubmitting || (!isDirty && !selectionDirty)}
        onSubmit={handleFormSubmit}
        label={submitLabel}
      />
    </ExpenseFormShell>
  );
}

export default PaymentMethodFormPage;
