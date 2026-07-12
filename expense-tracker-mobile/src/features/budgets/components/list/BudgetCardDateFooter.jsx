import { CalendarDays, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/app-shadcn";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function BudgetCardDateFooter({ budget }) {
  const { t } = useLanguage();
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
    <div className="mt-4 border-t border-border pt-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{rangeLabel}</span>
        </div>
        <Button
          type="button"
          variant="link"
          onClick={openReport}
          className="inline-flex h-auto shrink-0 items-center gap-1 p-0 font-semibold text-primary hover:underline"
        >
          <FileText className="h-3.5 w-3.5" />
          {t("budget.card.viewReport")}
        </Button>
      </div>
    </div>
  );
}
