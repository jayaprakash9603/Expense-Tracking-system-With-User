import { FileText } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { EntityListPage } from "@/shared/patterns";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { deleteBillAction } from "@/redux/bills/bills.actions";
import { useBillList, BILL_SORT_OPTIONS } from "../hooks/useBillList";
import { BillCard } from "../components/BillCard";
import { ConfirmDialog } from "@/shared/components/overlay/ConfirmDialog";
import { ExpenseQuickActions } from "@/features/expenses/components";

export function BillListPageView() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const billList = useBillList();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const goAddBill = useCallback(() => {
    navigate("/bills/add");
  }, [navigate]);

  const goUploadBills = useCallback(() => {
    navigate("/bill/upload");
  }, [navigate]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteBillAction(deleteTarget.id));
    setDeleteTarget(null);
    billList.refresh();
  };

  const quickActions = (
    <ExpenseQuickActions onAdd={goAddBill} onUpload={goUploadBills} />
  );

  return (
    <>
      <EntityListPage
        title={t("bills.title")}
        searchPlaceholder={t("bills.searchPlaceholder")}
        hook={billList}
        headerActions={quickActions}
        emptyAction={{ label: t("bills.addNew"), onClick: goAddBill }}
        floatingSlot={
          <div className="pointer-events-none fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
            <div className="pointer-events-auto">
              <ExpenseQuickActions floating onAdd={goAddBill} onUpload={goUploadBills} />
            </div>
          </div>
        }
        renderItem={(item) => (
          <BillCard
            bill={item}
            onEdit={(b) => navigate(`/bills/edit/${b.id}`)}
            onDelete={setDeleteTarget}
          />
        )}
        emptyState={{
          icon: FileText,
          title: t("bills.emptyTitle"),
          description: t("bills.emptyDescription"),
          actionLabel: t("bills.addNew"),
        }}
        sortOptions={BILL_SORT_OPTIONS}
      />
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

export default BillListPageView;
