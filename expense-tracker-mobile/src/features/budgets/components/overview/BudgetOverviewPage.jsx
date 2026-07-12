import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Search, PiggyBank, ArrowUpDown } from "lucide-react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import {
  FlowRangeGranularityTabs,
  FlowPeriodNavigation,
} from "@/shared/components/flow/FlowRangeNavigator";
import { FlowToggle } from "@/shared/components/flow/FlowToggle";
import { FlowReportsToolbarButton } from "@/shared/components/flow";
import { BudgetViewModeToggle } from "@/features/budgets/components/overview/BudgetViewModeToggle";
import { BudgetOverviewStatCards } from "@/features/budgets/components/overview/BudgetOverviewStatCards";
import { BudgetCard } from "@/features/budgets/components/list/BudgetCard";
import { ExpenseQuickActions } from "@/shared/components/entity-form";
import { ConfirmDialog } from "@/shared/components/overlay/ConfirmDialog";
import { deleteBudgetAction } from "@/redux/budgets/budgets.actions";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { AppInput } from "@/shared/components/form/AppInput";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { BUDGET_SORT_OPTIONS, BUDGET_SCROLL_CHUNK_SIZE } from "@/features/budgets/config/budgetConfig";

export function BudgetOverviewPage({
  viewMode,
  onViewModeChange,
  activeRange,
  setActiveRange,
  rangeLabel,
  flowTab,
  setFlowTab,
  goNext,
  goPrev,
  resetOffset,
  rangeOptions,
  budgetList,
  overviewStats,
  onAddBudget,
  onUploadBudget,
  onEditBudget,
  onAfterDelete,
}) {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const {
    items,
    loading,
    search,
    setSearch,
    sort,
    toggleSort,
    isEmpty,
    isSearchEmpty,
  } = budgetList;

  const [visibleCount, setVisibleCount] = useState(BUDGET_SCROLL_CHUNK_SIZE);

  useEffect(() => {
    setVisibleCount(BUDGET_SCROLL_CHUNK_SIZE);
  }, [items.length, search, sort.field, sort.order]);

  const displayedItems = useMemo(
    () => items.slice(0, Math.min(visibleCount, items.length)),
    [items, visibleCount],
  );

  const hasMoreInList = visibleCount < items.length;

  const handleBudgetScroll = useCallback(
    (e) => {
      const el = e.currentTarget;
      const thresholdPx = 96;
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < thresholdPx;
      if (!nearBottom) return;
      setVisibleCount((c) => {
        if (c >= items.length) return c;
        return Math.min(c + BUDGET_SCROLL_CHUNK_SIZE, items.length);
      });
    },
    [items.length],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget?.id) return;
    await dispatch(deleteBudgetAction(deleteTarget.id));
    setDeleteTarget(null);
    onAfterDelete?.();
  }, [deleteTarget, dispatch, onAfterDelete]);

  const resolvedSearchPlaceholder = t("budgets.searchPlaceholder");

  if (loading && items.length === 0) {
    return (
      <PageContainer>
        <LoadingSpinner size="lg" className="mt-20" />
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer className="relative flex min-h-0 flex-col overflow-y-visible pb-4 pt-2 md:pt-3 lg:pt-3 xl:pt-4">
        <div className="pointer-events-none fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
          <div className="pointer-events-auto">
            <ExpenseQuickActions
              floating
              onAdd={onAddBudget}
              onUpload={onUploadBudget}
              addLabel={t("budgets.addNew")}
              uploadLabel={t("navigation.upload")}
            />
          </div>
        </div>

        <ContentSection className="sticky top-0 z-20 -mx-4 mb-3 px-4 pb-2 pt-2 lg:static lg:mx-0 lg:mb-5 lg:p-0 bg-background/95 backdrop-blur lg:bg-transparent lg:backdrop-blur-none">
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-col gap-3 lg:hidden">
              <div className="flex w-full gap-2">
                <div className="min-w-0 flex-1 basis-0">
                  <FlowRangeGranularityTabs
                    compact
                    activeRange={activeRange}
                    setActiveRange={setActiveRange}
                    rangeOptions={rangeOptions}
                  />
                </div>
                <div className="min-w-0 flex-1 basis-0">
                  <FlowToggle compact value={flowTab} onChange={setFlowTab} />
                </div>
              </div>
              <div className="flex w-full min-w-0 items-center gap-2">
                <div className="min-w-0 flex-1" />
                <FlowPeriodNavigation
                  rangeLabel={rangeLabel}
                  onPrev={goPrev}
                  onNext={goNext}
                  onReset={resetOffset}
                  className="min-w-0 max-w-full shrink"
                />
                <div className="flex min-w-0 flex-1 justify-end">
                  <BudgetViewModeToggle value={viewMode} onChange={onViewModeChange} />
                </div>
              </div>
            </div>
            <div className="relative hidden min-h-[2.75rem] w-full flex-col gap-3 sm:min-h-[2.5rem] lg:block lg:min-h-[2.75rem]">
              <div className="flex w-full items-center justify-between gap-2 lg:pointer-events-none lg:absolute lg:left-0 lg:right-0 lg:top-1/2 lg:z-[1] lg:-translate-y-1/2">
                <div className="lg:pointer-events-auto">
                  <FlowRangeGranularityTabs
                    activeRange={activeRange}
                    setActiveRange={setActiveRange}
                    rangeOptions={rangeOptions}
                  />
                </div>
                <div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:pointer-events-auto">
                  <FlowReportsToolbarButton to="/budget/reports" />
                  <BudgetViewModeToggle value={viewMode} onChange={onViewModeChange} />
                  <FlowToggle value={flowTab} onChange={setFlowTab} className="w-auto" />
                </div>
              </div>
              <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center lg:pointer-events-none lg:absolute lg:left-1/2 lg:top-1/2 lg:z-[2] lg:-translate-x-1/2 lg:-translate-y-1/2">
                <div className="flex items-center justify-center gap-2 lg:pointer-events-auto">
                  <FlowPeriodNavigation
                    rangeLabel={rangeLabel}
                    onPrev={goPrev}
                    onNext={goNext}
                    onReset={resetOffset}
                  />
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection>
          <BudgetOverviewStatCards stats={overviewStats} loading={loading} />
        </ContentSection>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold md:text-2xl">{t("budgets.title")}</h1>
        </div>

        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <AppIcon icon={Search} color="muted" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2" />
            <AppInput
              placeholder={resolvedSearchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {BUDGET_SORT_OPTIONS.length > 0 ? (
            <AppButton variant="outline" size="icon" onClick={() => toggleSort(sort.field)}>
              <AppIcon icon={ArrowUpDown} color="soft" size="sm" />
            </AppButton>
          ) : null}
        </div>

        {isEmpty ? (
          <EmptyState
            icon={PiggyBank}
            title={t("budgets.emptyTitle")}
            description={t("budgets.emptyDescription")}
            action={{ label: t("budgets.addNew"), onClick: onAddBudget }}
          />
        ) : null}

        {isSearchEmpty ? (
          <EmptyState
            icon={Search}
            title={t("common.noResults")}
            description={t("common.emptyState.noMatch", { search })}
            action={{ label: t("common.emptyState.clearSearch"), onClick: () => setSearch("") }}
          />
        ) : null}

        {!isEmpty && !isSearchEmpty ? (
          <div
            className="flex min-h-0 w-full flex-1 flex-col"
            style={{ maxHeight: "min(72vh, calc(100dvh - 15rem))" }}
          >
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border border-border/60 bg-muted/15 p-2 sm:p-3 [scrollbar-gutter:stable]"
              onScroll={handleBudgetScroll}
            >
              <ResponsiveGrid preset="cards">
                {displayedItems.map((item, index) => (
                  <div key={item.id || index} className="min-w-0">
                    <BudgetCard
                      budget={item}
                      onEdit={(b) => onEditBudget(b.id)}
                      onDelete={setDeleteTarget}
                    />
                  </div>
                ))}
              </ResponsiveGrid>
              {hasMoreInList ? (
                <div className="flex justify-center py-3">
                  <span className="text-xs text-muted-foreground">{t("budgets.scrollForMore")}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {loading && items.length > 0 ? (
          <LoadingSpinner size="sm" className="my-4" />
        ) : null}
      </PageContainer>

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
