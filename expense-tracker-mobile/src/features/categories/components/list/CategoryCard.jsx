import { Pencil, Trash2 } from "lucide-react";
import { AppCard } from "@/shared/components/display/AppCard";
import { AppBadge } from "@/shared/components/display/AppBadge";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { Button } from "@/shared/components/app-shadcn";
import { MappedEntityIcon } from "@/shared/components/icons";

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
            <MappedEntityIcon
              variant="category"
              value={category.icon || category.title}
              renderMode="bare"
              iconClassName="h-4 w-4"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm md:text-base truncate">{category.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AppBadge variant="outline" className="text-[0.625rem]">
                {t(`categories.types.${category.subtitle?.toLowerCase()}`)}
              </AppBadge>
              {category.count > 0 && <span>{category.count} {t("categories.items")}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onEdit(category)}
              aria-label={t("common.edit")}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onDelete(category)}
              aria-label={t("common.delete")}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </AppCard>
  );
}

export default CategoryCard;
