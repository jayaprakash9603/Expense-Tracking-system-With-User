import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { EntityListPage } from "@/shared/patterns";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { deleteBillAction } from "@/redux/bills/bills.actions";
import { useBillList, BILL_SORT_OPTIONS } from "../hooks/useBillList";
import { BillCard } from "../components/BillCard";
import { ConfirmDialog } from "@/shared/components/overlay/ConfirmDialog";

export function BillListPageView() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const billList = useBillList();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteBillAction(deleteTarget.id));
    setDeleteTarget(null);
    billList.refresh();
  };

  return (
    <>
      <EntityListPage
        title={t("bills.title")}
        searchPlaceholder={t("bills.searchPlaceholder")}
        hook={billList}
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
        fab={{ icon: Plus, onPress: () => navigate("/bills/add") }}
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
