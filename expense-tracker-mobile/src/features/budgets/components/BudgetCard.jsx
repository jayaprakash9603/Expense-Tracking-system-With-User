import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/shared/components/AppCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatMoney } from "@/domain/shared/money";
import { Progress } from "@/components/ui/progress";

export function BudgetCard({ budget, onEdit, onDelete, currency = "INR" }) {
  const { t } = useLanguage();
  const statusColor = budget.isOverBudget
    ? "text-destructive"
    : budget.percentage >= 80
      ? "text-yellow-500"
      : "text-green-500";

  return (
    <AppCard className="p-3 md:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm md:text-base truncate">{budget.title}</h3>
          <p className="text-xs text-muted-foreground">{budget.subtitle}</p>
        </div>
        <div className="flex gap-1 ml-2">
          {onEdit && (
            <button onClick={() => onEdit(budget)} className="p-1 rounded hover:bg-muted">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(budget)} className="p-1 rounded hover:bg-muted">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          )}
        </div>
      </div>
      <Progress value={budget.percentage} className="h-2 mb-2" />
      <div className="flex justify-between text-xs">
        <span className={cn("font-medium", statusColor)}>
          {formatMoney(budget.spent, currency)} {t("budgets.of")} {formatMoney(budget.amount, currency)}
        </span>
        <span className="text-muted-foreground">
          {formatMoney(budget.remaining, currency)} {t("budgets.remaining")}
        </span>
      </div>
    </AppCard>
  );
}

export default BudgetCard;
