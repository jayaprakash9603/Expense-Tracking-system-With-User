import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import {
  FlowRangeGranularityTabs,
  FlowPeriodNavigation,
} from "@/shared/components/flow/FlowRangeNavigator";
import { FlowToggle } from "@/shared/components/flow/FlowToggle";
import { BillViewModeToggle } from "@/features/bills/components/BillViewModeToggle";
import { BillOverviewStatCards } from "@/features/bills/components/BillOverviewStatCards";
import { BillAccordionList } from "@/features/bills/components/BillAccordionList";
import { ExpenseQuickActions } from "@/features/expenses/components";
import { ConfirmDialog } from "@/shared/components/overlay/ConfirmDialog";
import { deleteBillAction } from "@/redux/bills/bills.actions";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function BillOverviewPage({
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
  loading,
  overviewStats,
  accordionRawBills,
  onAddBill,
  onUploadBill,
  onEditBill,
  onAfterDelete,
}) {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget?.id) return;
    await dispatch(deleteBillAction(deleteTarget.id));
    setDeleteTarget(null);
    onAfterDelete?.();
  }, [deleteTarget, dispatch, onAfterDelete]);

  return (
    <>
      <PageContainer className="relative overflow-y-visible pb-4 pt-2 md:pt-3 lg:pt-3 xl:pt-4">
        <div className="pointer-events-none fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
          <div className="pointer-events-auto">
            <ExpenseQuickActions floating onAdd={onAddBill} onUpload={onUploadBill} />
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
                  <BillViewModeToggle value={viewMode} onChange={onViewModeChange} />
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
                  <BillViewModeToggle value={viewMode} onChange={onViewModeChange} />
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
          <BillOverviewStatCards stats={overviewStats} loading={loading} />
        </ContentSection>

        <ContentSection className="mb-0">
          <BillAccordionList
            key={`${rangeLabel}-${flowTab}`}
            rawBills={accordionRawBills}
            loading={loading}
            onEdit={(bill) => onEditBill(bill.id)}
            onDelete={(bill) => setDeleteTarget(bill)}
          />
        </ContentSection>
      </PageContainer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("bills.deleteTitle")}
        description={t("bills.deleteDescription")}
        onConfirm={handleDelete}
        destructive
      />
    </>
  );
}
