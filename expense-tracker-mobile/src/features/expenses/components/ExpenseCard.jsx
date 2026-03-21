import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/shared/components/display/AppCard";
import { AppBadge } from "@/shared/components/display/AppBadge";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { Button } from "@/shared/components/app-shadcn";

const TYPE_VARIANTS = {
  NEED: "default",
  WANT: "secondary",
  INVESTMENT: "outline",
  SAVINGS: "success",
};

export function ExpenseCard({ expense, onEdit, onDelete, className }) {
  const { t } = useLanguage();
  const { format } = useMoneyFormatter();

  return (
    <AppCard className={cn("p-3 md:p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm md:text-base truncate">{expense.title}</h3>
            {expense.type && (
              <AppBadge variant={TYPE_VARIANTS[expense.type] || "secondary"} className="text-[10px]">
                {t(`expenses.types.${expense.type?.toLowerCase()}`)}
              </AppBadge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{expense.subtitle}</span>
            <span>•</span>
            <span>{expense.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <span className={cn("font-semibold text-sm md:text-base whitespace-nowrap")}>
            {format(expense.amount)}
          </span>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onEdit(expense)}
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
                onClick={() => onDelete(expense)}
                aria-label={t("common.delete")}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppCard>
  );
}

export default ExpenseCard;
