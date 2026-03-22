import { Receipt, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { EntityListPage } from "@/shared/patterns";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { deleteExpenseAction } from "@/redux/expenses/expenses.actions";
import { useExpenseList, EXPENSE_SORT_OPTIONS } from "../hooks/list/useExpenseList";
import { useExpenseCharts } from "../hooks/charts/useExpenseCharts";
import { ExpenseCard } from "../components/list/ExpenseCard";
import { ExpenseFilters } from "../components/filters/ExpenseFilters";
import { DailySpendingChart } from "../components/charts/DailySpendingChart";
import { ExpenseCategoryChart } from "../components/charts/ExpenseCategoryChart";
import { useState } from "react";
import { ConfirmDialog } from "@/shared/components/overlay/ConfirmDialog";
import { Button } from "@/shared/components/app-shadcn";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { AppIcon } from "@/shared/components/display/AppIcon";

export function ExpenseListPageView() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const expenseList = useExpenseList();
  const [filters, setFilters] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const { daily, category } = useExpenseCharts();

  const handleEdit = (expense) => navigate(`/expenses/edit/${expense.id}`);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteExpenseAction(deleteTarget.id));
    setDeleteTarget(null);
    expenseList.refresh();
  };

  return (
    <>
      <div className="px-4 pt-2">
        <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground" onClick={() => setShowCharts((v) => !v)}>
          {t("expenses.title")} {t("chart.area")}
          <AppIcon icon={showCharts ? ChevronUp : ChevronDown} color="muted" size="sm" />
        </Button>
        {showCharts && (
          <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="md" className="mt-3">
            <DailySpendingChart data={daily.data} config={daily.config} />
            <ExpenseCategoryChart data={category.data} config={category.config} />
          </ResponsiveGrid>
        )}
      </div>
      <EntityListPage
        title={t("expenses.title")}
        searchPlaceholder={t("expenses.searchPlaceholder")}
        hook={expenseList}
        renderItem={(item) => (
          <ExpenseCard
            expense={item}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
        )}
        emptyState={{
          icon: Receipt,
          title: t("expenses.emptyTitle"),
          description: t("expenses.emptyDescription"),
          actionLabel: t("expenses.addNew"),
        }}
        fab={{ icon: Plus, onPress: () => navigate("/expenses/add") }}
        filters={
          <ExpenseFilters
            filters={filters}
            onFilterChange={setFilters}
            onClear={() => setFilters({})}
          />
        }
        sortOptions={EXPENSE_SORT_OPTIONS}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("expenses.deleteTitle")}
        description={t("expenses.deleteDescription")}
        onConfirm={handleDelete}
        destructive
      />
    </>
  );
}

export default ExpenseListPageView;
