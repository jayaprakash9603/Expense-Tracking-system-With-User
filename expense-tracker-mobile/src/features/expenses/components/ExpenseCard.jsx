import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/shared/components/AppCard";
import { AppBadge } from "@/shared/components/AppBadge";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatMoney } from "@/domain/shared/money";

const TYPE_VARIANTS = {
  NEED: "default",
  WANT: "secondary",
  INVESTMENT: "outline",
  SAVINGS: "success",
};

export function ExpenseCard({ expense, onEdit, onDelete, currency = "INR" }) {
  const { t } = useLanguage();

  return (
    <AppCard className="p-3 md:p-4">
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
            {formatMoney(expense.amount, currency)}
          </span>
          <div className="flex gap-1">
            {onEdit && (
              <button onClick={() => onEdit(expense)} className="p-1 rounded hover:bg-muted">
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(expense)} className="p-1 rounded hover:bg-muted">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            )}
          </div>
        </div>
      </div>
    </AppCard>
  );
}

export default ExpenseCard;
