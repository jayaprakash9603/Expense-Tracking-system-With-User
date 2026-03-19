import { Pencil, Trash2 } from "lucide-react";
import { AppCard } from "@/shared/components/AppCard";
import { AppBadge } from "@/shared/components/AppBadge";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function CategoryCard({ category, onEdit, onDelete }) {
  const { t } = useLanguage();

  return (
    <AppCard className="p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: category.color + "20", color: category.color }}
          >
            {category.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm md:text-base truncate">{category.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AppBadge variant="outline" className="text-[10px]">
                {t(`categories.types.${category.subtitle?.toLowerCase()}`)}
              </AppBadge>
              {category.count > 0 && <span>{category.count} {t("categories.items")}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          {onEdit && (
            <button onClick={() => onEdit(category)} className="p-1 rounded hover:bg-muted">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(category)} className="p-1 rounded hover:bg-muted">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          )}
        </div>
      </div>
    </AppCard>
  );
}

export default CategoryCard;
