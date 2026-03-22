import { DollarSign, List } from "lucide-react";
import { AppBadge } from "@/shared/components/display/AppBadge";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { cn } from "@/lib/utils";

function formatBillDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(String(dateStr).slice(0, 10));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BillAccordionPanels({ bill, lines, isGain }) {
  const { t } = useLanguage();
  const { format } = useMoneyFormatter();

  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
          <DollarSign className="h-4 w-4" />
          {t("bills.accordion.billSummary")}
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{t("bills.form.amount")}</dt>
            <dd className="font-bold tabular-nums">{format(Math.abs(Number(bill.amount) || 0))}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{t("bills.accordion.netAmount")}</dt>
            <dd className="font-bold tabular-nums">{format(bill.netAmount)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{t("bills.accordion.creditDue")}</dt>
            <dd className={cn("font-bold tabular-nums", bill.creditDue > 0 && "text-red-600")}>
              {format(bill.creditDue)}
            </dd>
          </div>
          <div className="border-t border-border pt-2" />
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{t("bills.form.dueDate")}</dt>
            <dd className="font-medium">{formatBillDate(bill.date)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{t("bills.accordion.type")}</dt>
            <dd>
              <AppBadge
                variant={isGain ? "secondary" : "destructive"}
                className={cn(
                  "text-[0.625rem] font-bold uppercase",
                  isGain && "border border-emerald-500/40 bg-emerald-500/15 text-emerald-700",
                )}
              >
                {isGain ? t("bills.accordion.gain") : t("bills.accordion.loss")}
              </AppBadge>
            </dd>
          </div>
        </dl>
      </div>
      <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
          <List className="h-4 w-4" />
          {t("bills.accordion.detailedExpenses")}
        </div>
        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("bills.accordion.noLines")}</p>
        ) : (
          <ul className="space-y-2">
            {lines.map((line, idx) => (
              <li
                key={`${line.itemName}-${idx}`}
                className="rounded-md border border-border/80 bg-card px-2.5 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold">{line.itemName}</span>
                  <span className="shrink-0 text-sm font-bold tabular-nums">
                    {format(line.totalPrice ?? 0)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("bills.accordion.lineMeta", {
                    qty: line.quantity,
                    price: format(Number(line.unitPrice) || 0),
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
