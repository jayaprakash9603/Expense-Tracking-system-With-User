import { PiggyBank, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { EntityListPage } from "@/shared/patterns";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { deleteBudgetAction } from "@/redux/budgets/budgets.actions";
import { useBudgetList, BUDGET_SORT_OPTIONS } from "../hooks/useBudgetList";
import { useBudgetCharts } from "../hooks/useBudgetCharts";
import { BudgetCard } from "../components/BudgetCard";
import { BudgetProgressChart } from "../components/BudgetProgressChart";
import { BudgetDistributionChart } from "../components/BudgetDistributionChart";
import { LossGainChart } from "../components/LossGainChart";
import { ConfirmDialog } from "@/shared/components/overlay/ConfirmDialog";
import { Button } from "@/shared/components/app-shadcn";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { AppIcon } from "@/shared/components/display/AppIcon";

export function BudgetListPageView() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const budgetList = useBudgetList();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const { progress, distribution, lossGain } = useBudgetCharts();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteBudgetAction(deleteTarget.id));
    setDeleteTarget(null);
    budgetList.refresh();
  };

  return (
    <>
      <div className="px-4 pt-2">
        <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground" onClick={() => setShowCharts((v) => !v)}>
          {t("budget.title")} {t("chart.area")}
          <AppIcon icon={showCharts ? ChevronUp : ChevronDown} color="muted" size="sm" />
        </Button>
        {showCharts && (
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="md" className="mt-3">
            <BudgetProgressChart data={progress.data} config={progress.config} />
            <BudgetDistributionChart data={distribution.data} config={distribution.config} />
            <LossGainChart data={lossGain.data} config={lossGain.config} />
          </ResponsiveGrid>
        )}
      </div>
      <EntityListPage
        title={t("budgets.title")}
        searchPlaceholder={t("budgets.searchPlaceholder")}
        hook={budgetList}
        renderItem={(item) => (
          <BudgetCard
            budget={item}
            onEdit={(b) => navigate(`/budgets/edit/${b.id}`)}
            onDelete={setDeleteTarget}
          />
        )}
        emptyState={{
          icon: PiggyBank,
          title: t("budgets.emptyTitle"),
          description: t("budgets.emptyDescription"),
          actionLabel: t("budgets.addNew"),
        }}
        fab={{ icon: Plus, onPress: () => navigate("/budgets/add") }}
        sortOptions={BUDGET_SORT_OPTIONS}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("budgets.deleteTitle")}
        description={t("budgets.deleteDescription")}
        onConfirm={handleDelete}
        destructive
      />
    </>
  );
}

export default BudgetListPageView;
