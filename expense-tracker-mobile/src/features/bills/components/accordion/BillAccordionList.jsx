import { FileText } from "lucide-react";
import { NoDataPlaceholder } from "@/shared/components/feedback/NoDataPlaceholder";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";
import { useBillAccordionListView } from "@/features/bills/hooks/useBillAccordionListView";
import { BillAccordionListInner, BillAccordionListSkeleton } from "./BillAccordionListInner";

export function BillAccordionList({ rawBills, loading, onEdit, onDelete, className }) {
  const { t } = useLanguage();
  const view = useBillAccordionListView(rawBills);

  if (loading) {
    return <BillAccordionListSkeleton isMobile={view.isMobile} className={className} />;
  }

  if (!view.total) {
    return (
      <NoDataPlaceholder
        message={t("bills.emptyTitle")}
        subMessage={t("bills.emptyDescription")}
        icon={FileText}
        size="md"
        fullWidth
        className={cn(className)}
      />
    );
  }

  return (
    <BillAccordionListInner
      t={t}
      isMobile={view.isMobile}
      pageIndex={view.pageIndex}
      setPageIndex={view.setPageIndex}
      pageSize={view.pageSize}
      pageCount={view.pageCount}
      total={view.total}
      visibleBills={view.visibleBills}
      padCount={view.padCount}
      loadMoreRef={view.loadMoreRef}
      mobileLimit={view.mobileLimit}
      handlePageSizeChange={view.handlePageSizeChange}
      pageSizeOptions={view.pageSizeOptions}
      onEdit={onEdit}
      onDelete={onDelete}
      className={className}
    />
  );
}
