import { CalendarDays, FileText, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { Button } from "@/shared/components/app-shadcn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function BudgetProgressBar({ budget }) {
  const w = budget.progressWidth ?? 0;
  const over = budget.isOverBudget;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", over ? "bg-destructive" : "bg-primary")}
        style={{ width: `${Math.min(100, w)}%` }}
      />
    </div>
  );
}

export function BudgetCard({ budget, onEdit, onDelete, className }) {
  const { t } = useLanguage();
  const { format } = useMoneyFormatter();
  const navigate = useNavigate();
  const start = budget.startDate ? String(budget.startDate).slice(0, 10) : "";
  const end = budget.endDate ? String(budget.endDate).slice(0, 10) : "";
  const rangeLabel =
    start && end ? `${start} - ${end}` : start || end || "—";

  const openReport = () => {
    const q = new URLSearchParams();
    if (start) q.set("from", start);
    if (end) q.set("to", end);
    navigate(`/expenses/reports?${q.toString()}`);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/30 bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {budget.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[0.625rem] font-semibold uppercase tracking-wide">
              {t(`budgets.status.${budget.status}`)}
            </Badge>
            {budget.category ? (
              <span className="truncate text-xs text-muted-foreground">{budget.category}</span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={t("common.aria.menu")}>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {onEdit ? (
                <DropdownMenuItem onClick={() => onEdit(budget)}>
                  {t("common.edit")}
                </DropdownMenuItem>
              ) : null}
              {onDelete ? (
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(budget)}>
                  {t("common.delete")}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {budget.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{budget.description}</p>
      ) : null}

      <div className="mt-3 flex items-baseline justify-between gap-2 text-sm">
        <span className="text-foreground">
          {t("budget.card.spentLabel")}: {format(budget.spent)}
        </span>
        <span className="tabular-nums font-medium text-foreground">{budget.percentage}%</span>
      </div>

      <div className="mt-2">
        <BudgetProgressBar budget={budget} />
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-foreground">
          {t("budget.card.budgetLabel")}: {format(budget.amount)}
        </span>
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            budget.isOverBudget ? "text-destructive" : "text-foreground",
          )}
        >
          {t("budget.card.remainingLabel")}: {format(budget.remaining)}
        </span>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{rangeLabel}</span>
          </div>
          <button
            type="button"
            onClick={openReport}
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            {t("budget.card.viewReport")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BudgetCard;
