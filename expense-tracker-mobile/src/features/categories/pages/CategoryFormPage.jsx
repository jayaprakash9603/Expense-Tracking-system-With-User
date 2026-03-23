import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import {
  EntityCommonFormSection,
  ExpenseFormShell,
  ExpenseSubmitArea,
} from "@/shared/components/entity-form";
import { LinkedEntityTablePanel } from "@/shared/components/form/LinkedEntityTablePanel";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { ExpenseSelectionTable } from "@/features/budgets/components/form/ExpenseSelectionTable";
import { useCategoryForm } from "../hooks/form/useCategoryForm";
import { useCategoryExpenseLinking } from "../hooks/useCategoryExpenseLinking";
import { CATEGORY_TYPES } from "@/domain/categories/category.model";
import { cn } from "@/lib/utils";

export function CategoryFormPageView() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const mode = id ? "edit" : "create";

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const formHook = useCategoryForm({
    mode,
    entityId: id,
    onSuccess: () => {},
    onError: () => toast.error(t("common.error")),
  });

  const {
    showTable,
    setShowTable,
    expenses,
    expensesLoading,
    expenseError,
    selectedExpenseIds,
    setSelectedExpenseIds,
    selectionDirty,
    applyCategoryToSelectedExpenses,
  } = useCategoryExpenseLinking({ mode, categoryId: id });

  const typeOptions = CATEGORY_TYPES.map((typeValue) => ({
    value: typeValue,
    label: t(`categories.types.${typeValue.toLowerCase()}`),
  }));

  const renderFields = ({ formData, errors, handleChange }) => {
    const translatedErrors = Object.entries(errors || {}).reduce((acc, [key, value]) => {
      acc[key] = value ? t(value) : value;
      return acc;
    }, {});

    return (
      <>
        <EntityCommonFormSection
          formData={formData}
          errors={translatedErrors}
          handleChange={handleChange}
          typeOptions={typeOptions}
          labels={{
            name: t("categories.form.name"),
            description: t("categories.form.description"),
            type: t("categories.form.type"),
            color: t("categories.form.color"),
            icon: t("categories.form.icon"),
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
  };

  const pageTitle = t(mode === "create" ? "categories.addTitle" : "categories.editTitle");
  const submitLabel = t(mode === "create" ? "common.create" : "common.save");
  const { formData, errors, isSubmitting, isLoading, isDirty, handleSubmit, handleChange } =
    formHook;

  const handleFormSubmit = useCallback(async () => {
    const result = await handleSubmit();
    if (!result?.success) return;
    const resolvedCategoryId = result.data?.id ?? id;
    if (selectedExpenseIds.length > 0 && resolvedCategoryId) {
      const linkResult = await applyCategoryToSelectedExpenses(resolvedCategoryId);
      if (!linkResult?.success) {
        toast.error(t("categories.expenseLinkFailed"));
        return;
      }
    }
    toast.success(t(mode === "create" ? "categories.created" : "categories.updated"));
    navigate("/categories");
  }, [
    handleSubmit,
    selectedExpenseIds,
    applyCategoryToSelectedExpenses,
    id,
    mode,
    t,
    navigate,
  ]);

  const canSubmit = isDirty || selectionDirty;

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
        disabled={isSubmitting || !canSubmit}
        onSubmit={handleFormSubmit}
        label={submitLabel}
      />
    </ExpenseFormShell>
  );
}

export default CategoryFormPageView;
