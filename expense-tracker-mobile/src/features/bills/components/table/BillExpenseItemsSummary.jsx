import { Card, CardContent, Label } from "@/shared/components/app-shadcn";
import { cn } from "@/lib/utils";
import { computeBillExpensesTotal } from "@/domain/bills/billExpenseLineUtils";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { BILL_EXPENSE_SCROLL } from "../../config/billConfig";
import {
  LINKED_CLOSED_PLACEHOLDER_SURFACE_CLASS,
  LINKED_TABLE_RESERVE_MIN_HEIGHT_CLASS,
} from "@/shared/constants/linkedTableLayout";

export function BillExpenseItemsSummary({ expenses, t, errorMessage }) {
  const { format } = useMoneyFormatter();
  const total = computeBillExpensesTotal(expenses || []);

  if (!expenses?.length) {
    return (
      <div
        className={cn(LINKED_CLOSED_PLACEHOLDER_SURFACE_CLASS, LINKED_TABLE_RESERVE_MIN_HEIGHT_CLASS)}
      >
        <div className="flex flex-col gap-2">
          {errorMessage ? (
            <p className="text-xs font-medium text-destructive sm:text-sm">{errorMessage}</p>
          ) : null}
          <span>{t("billForm.summary.noItems")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card/50 px-2 py-2 sm:px-3 sm:py-3">
      {errorMessage ? (
        <p className="mb-2 text-xs font-medium text-destructive sm:text-sm">{errorMessage}</p>
      ) : null}
      <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {t("billForm.summary.title")}
      </p>
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pr-1 ${BILL_EXPENSE_SCROLL.summaryList}`}>
        {expenses.map((row, i) => (
          <Card key={`${row.itemName}-${i}`} className="border-border/60 shadow-sm flex flex-col">
            <CardContent className="space-y-1.5 p-2 sm:p-2.5 flex-1 flex flex-col">
              <div className="flex items-start gap-2">
                <span className="flex h-6 min-w-[1.5rem] shrink-0 items-center justify-center rounded-md bg-primary/15 text-[0.65rem] font-semibold text-primary">
                  {i + 1}
                </span>
                <p className="min-w-0 flex-1 text-xs font-semibold leading-snug sm:text-sm">{row.itemName}</p>
              </div>
              <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[0.65rem] mt-auto">
                <div className="min-w-0">
                  <Label className="text-[0.55rem] uppercase text-muted-foreground">
                    {t("billForm.lineItems.qty")}
                  </Label>
                  <p className="truncate tabular-nums text-xs">{row.quantity}</p>
                </div>
                <div className="min-w-0">
                  <Label className="text-[0.55rem] uppercase text-muted-foreground">
                    {t("billForm.lineItems.unitPrice")}
                  </Label>
                  <p className="truncate tabular-nums text-xs">{format(Number(row.unitPrice) || 0)}</p>
                </div>
                <div className="min-w-0">
                  <Label className="text-[0.55rem] uppercase text-muted-foreground">
                    {t("billForm.lineItems.total")}
                  </Label>
                  <p className="truncate tabular-nums text-xs font-medium">{format(row.totalPrice || 0)}</p>
                </div>
              </div>
              {String(row.comments || "").trim() ? (
                <div className="border-t border-border/50 pt-1.5 mt-1.5">
                  <Label className="text-[0.55rem] uppercase text-muted-foreground">
                    {t("billForm.lineItems.comments")}
                  </Label>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{row.comments}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-2 flex justify-between border-t border-border/60 pt-1.5 text-xs font-semibold sm:text-sm">
        <span>{t("billForm.summary.total")}</span>
        <span className="tabular-nums">{format(total)}</span>
      </div>
    </div>
  );
}
