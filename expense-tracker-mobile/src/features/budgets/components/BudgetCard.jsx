import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/shared/components/AppCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { Progress } from "@/components/ui/progress";

export function BudgetCard({ budget, onEdit, onDelete }) {
  const { t } = useLanguage();
  const { format } = useMoneyFormatter();
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
          {format(budget.spent)} {t("budgets.of")} {format(budget.amount)}
        </span>
        <span className="text-muted-foreground">
          {format(budget.remaining)} {t("budgets.remaining")}
        </span>
      </div>
    </AppCard>
  );
}

export default BudgetCard;
