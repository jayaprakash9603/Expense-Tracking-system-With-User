import { FolderOpen, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { EntityListPage } from "@/shared/patterns";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { deleteCategoryAction } from "@/redux/categories/categories.actions";
import { useCategoryList, CATEGORY_SORT_OPTIONS } from "../hooks/useCategoryList";
import { CategoryCard } from "../components/CategoryCard";
import { ConfirmDialog } from "@/shared/components/overlay/ConfirmDialog";

export function CategoryListPageView() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const categoryList = useCategoryList();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteCategoryAction(deleteTarget.id));
    setDeleteTarget(null);
    categoryList.refresh();
  };

  return (
    <>
      <EntityListPage
        title={t("categories.title")}
        searchPlaceholder={t("categories.searchPlaceholder")}
        hook={categoryList}
        renderItem={(item) => (
          <CategoryCard
            category={item}
            onEdit={(c) => navigate(`/categories/edit/${c.id}`)}
            onDelete={setDeleteTarget}
          />
        )}
        emptyState={{
          icon: FolderOpen,
          title: t("categories.emptyTitle"),
          description: t("categories.emptyDescription"),
          actionLabel: t("categories.addNew"),
        }}
        fab={{ icon: Plus, onPress: () => navigate("/categories/add") }}
        sortOptions={CATEGORY_SORT_OPTIONS}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("categories.deleteTitle")}
        description={t("categories.deleteDescription")}
        onConfirm={handleDelete}
        destructive
      />
    </>
  );
}

export default CategoryListPageView;
