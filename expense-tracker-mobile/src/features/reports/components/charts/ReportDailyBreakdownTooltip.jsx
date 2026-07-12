import React from "react";
import { format } from "date-fns";
import { ArrowUpDown, Calendar, CheckSquare, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { buildReportDailyBreakdown } from "@/features/reports/utils/buildReportDailyBreakdown";
import { getCategoryIconComponent, getPaymentMethodIconComponent } from "@/shared/icons";
import { cn } from "@/lib/utils";

const MAX_ROWS = 6;

function formatDateLabel(label) {
  if (!label || typeof label !== "string") return label;
  try {
    if (label.includes("-")) return format(new Date(label), "MMM dd, yyyy").toUpperCase();
  } catch {
    return label;
  }
  return label;
}

function resolveDisplayTotals(payload, tooltipSelectedType) {
  const expenseEntry = payload.find((p) => p.dataKey === "expense");
  const incomeEntry = payload.find((p) => p.dataKey === "income");
  const hasDual = Boolean(expenseEntry && incomeEntry);
  const amountEntry =
    payload.find((p) => p.dataKey === "expense" || p.dataKey === "amount") || payload[0];
  if (hasDual) {
    return {
      spending: Number(expenseEntry?.value ?? 0),
      income: Number(incomeEntry?.value ?? 0),
    };
  }
  const v = Number(amountEntry?.value ?? 0);
  if (tooltipSelectedType === "gain") {
    return { spending: 0, income: v };
  }
  return { spending: v, income: 0 };
}

function BreakdownRowIcon({ breakdownMode, name, tone }) {
  const Icon =
    breakdownMode === "category" ? getCategoryIconComponent(name) : getPaymentMethodIconComponent(name);
  const accent = tone === "loss" ? "text-red-600 dark:text-red-400" : "text-teal-600 dark:text-teal-400";
  return <Icon className={cn("h-3 w-3 shrink-0", accent)} strokeWidth={2.25} aria-hidden />;
}

function TooltipTotalsHeader({ dateLabel, spending, income, formatMoney, t }) {
  return (
    <CardHeader className="relative space-y-0 overflow-hidden bg-amber-500 p-2 pb-2 pt-2 text-white shadow-none dark:bg-amber-600">
      <div
        className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-gradient-to-br from-white/35 via-white/10 to-transparent"
        aria-hidden
      />
      <div className="relative mb-1.5 flex items-center justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-1 text-[0.5625rem] font-bold uppercase tracking-wider text-white/95">
          <Calendar className="h-3 w-3 shrink-0" />
          <span className="truncate">{dateLabel}</span>
        </div>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-[1px]"
          aria-hidden
        >
          <ArrowUpDown className="h-3 w-3" strokeWidth={2.5} />
        </span>
      </div>
      <div className="relative grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <div className="text-[0.5625rem] font-medium text-white/90">{t("dashboard.totalSpending")}</div>
          <div className="truncate text-sm font-bold leading-tight text-white">{formatMoney(spending)}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[0.5625rem] font-medium text-white/90">{t("dashboard.totalIncome")}</div>
          <div className="truncate text-sm font-bold leading-tight text-cyan-100 dark:text-cyan-200">
            {formatMoney(income)}
          </div>
        </div>
      </div>
    </CardHeader>
  );
}

function BreakdownBlock({ title, count, rows, tone, breakdownMode, formatMoney, t }) {
  const visible = rows.slice(0, MAX_ROWS);
  const extra = Math.max(0, rows.length - MAX_ROWS);
  const isLoss = tone === "loss";
  const ring = isLoss
    ? "border-red-500/45 bg-red-50/90 shadow-[inset_0_1px_0_0_rgba(248,113,113,0.12)] dark:border-red-500/50 dark:bg-red-950/45 dark:shadow-[inset_0_1px_0_0_rgba(248,113,113,0.12)]"
    : "border-teal-500/45 bg-teal-50/90 shadow-[inset_0_1px_0_0_rgba(45,212,191,0.12)] dark:border-teal-500/50 dark:bg-teal-950/45 dark:shadow-[inset_0_1px_0_0_rgba(45,212,191,0.12)]";
  const accent = isLoss ? "text-red-600 dark:text-red-400" : "text-teal-600 dark:text-teal-400";
  const amountClass = isLoss ? "text-red-600 dark:text-red-400" : "text-teal-600 dark:text-teal-300";

  return (
    <div className={cn("rounded-md border px-2 py-1.5", ring)}>
      <div className="mb-1.5 flex items-center justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-1">
          <CheckSquare className={cn("h-3 w-3 shrink-0", accent)} strokeWidth={2.5} />
          <span className={cn("truncate text-[0.5625rem] font-semibold uppercase tracking-wide", accent)}>
            {title}
          </span>
        </div>
        <Badge
          variant="secondary"
          className="h-4 min-w-[1rem] justify-center rounded-full border-0 bg-background/80 px-1 text-[0.5rem] font-bold text-foreground shadow-sm dark:bg-zinc-800/90"
        >
          {count}
        </Badge>
      </div>
      <div className="space-y-1">
        {visible.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-1.5 text-[0.625rem]">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 text-foreground">
              <BreakdownRowIcon breakdownMode={breakdownMode} name={row.name} tone={tone} />
              <span className="truncate font-medium">{row.name}</span>
            </div>
            <span className={cn("shrink-0 font-semibold tabular-nums", amountClass)}>{formatMoney(row.amount)}</span>
          </div>
        ))}
        {extra > 0 ? (
          <div className="text-center text-[0.5625rem] text-muted-foreground">
            +{extra} {t("dashboard.more")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TooltipNetFooter({ net, formatMoney, netPositive, t }) {
  return (
    <CardFooter className="flex flex-col border-t border-amber-500/25 bg-muted/20 px-2 py-2 dark:border-amber-400/20 dark:bg-muted/30">
      <div className="flex items-center justify-center gap-1 text-[0.6875rem]">
        <span className="font-semibold text-muted-foreground">{t("reports.dailyTooltip.netLabel")}</span>
        <span className={cn("font-bold tabular-nums", netPositive ? "text-teal-600 dark:text-teal-400" : "text-red-600 dark:text-red-400")}>
          {netPositive ? "+" : ""}
          {formatMoney(net)}
        </span>
        <ChevronUp
          className={cn(
            "h-3.5 w-3.5",
            netPositive ? "text-teal-600 dark:text-teal-400" : "rotate-180 text-red-600 dark:text-red-400",
          )}
          aria-hidden
        />
      </div>
    </CardFooter>
  );
}

function DailyBreakdownTooltipCard({
  dateLabel,
  spending,
  income,
  lossTitle,
  gainTitle,
  lossRows,
  gainRows,
  net,
  formatMoney,
  t,
  breakdownMode,
}) {
  const netPositive = net >= 0;
  const hasLoss = lossRows.length > 0;
  const hasGain = gainRows.length > 0;

  return (
    <Card
      className={cn(
        "w-[14rem] max-w-[90vw] overflow-hidden border-2 border-amber-500/45 bg-card text-card-foreground shadow-lg",
        "dark:border-amber-400/40",
      )}
    >
      <TooltipTotalsHeader dateLabel={dateLabel} spending={spending} income={income} formatMoney={formatMoney} t={t} />
      <CardContent className="space-y-1.5 bg-muted/25 p-2 dark:bg-muted/15">
        {hasLoss ? (
          <BreakdownBlock
            title={lossTitle}
            count={lossRows.length}
            rows={lossRows}
            tone="loss"
            breakdownMode={breakdownMode}
            formatMoney={formatMoney}
            t={t}
          />
        ) : null}
        {hasGain ? (
          <BreakdownBlock
            title={gainTitle}
            count={gainRows.length}
            rows={gainRows}
            tone="gain"
            breakdownMode={breakdownMode}
            formatMoney={formatMoney}
            t={t}
          />
        ) : null}
        {!hasLoss && !hasGain ? (
          <p className="text-center text-[0.5625rem] text-muted-foreground">{t("reports.dailyTooltip.noBreakdown")}</p>
        ) : null}
      </CardContent>
      <TooltipNetFooter net={net} formatMoney={formatMoney} netPositive={netPositive} t={t} />
    </Card>
  );
}

export function ReportDailyBreakdownTooltip({
  active,
  payload,
  label,
  coordinate,
  viewBox,
  breakdownMode,
  tooltipSelectedType = "loss",
}) {
  const { format: formatMoney } = useMoneyFormatter();
  const { t } = useLanguage();

  if (!active || !payload?.length || !breakdownMode) return null;

  const payloadRow = payload[0].payload;
  const expenses = payloadRow.expenses || [];
  const unknown = t("chart.uncategorized");
  const { lossRows, gainRows } = buildReportDailyBreakdown(expenses, breakdownMode, unknown);
  const { spending, income } = resolveDisplayTotals(payload, tooltipSelectedType);
  const net = income - spending;
  const dateLabel = formatDateLabel(label);
  const lossTitle =
    breakdownMode === "category" ? t("reports.dailyTooltip.lossCategories") : t("reports.dailyTooltip.lossPaymentMethods");
  const gainTitle =
    breakdownMode === "category" ? t("reports.dailyTooltip.gainCategories") : t("reports.dailyTooltip.gainPaymentMethods");

  const chartWidth = viewBox?.width || 400;
  const cursorX = coordinate?.x || 0;
  const showOnLeft = cursorX > chartWidth * 0.4;
  const positionStyle = showOnLeft
    ? { transform: "translateX(-100%)", marginLeft: "-0.75rem" }
    : { marginLeft: "0.75rem" };

  return (
    <div style={positionStyle}>
      <DailyBreakdownTooltipCard
        dateLabel={dateLabel}
        spending={spending}
        income={income}
        lossTitle={lossTitle}
        gainTitle={gainTitle}
        lossRows={lossRows}
        gainRows={gainRows}
        net={net}
        formatMoney={formatMoney}
        t={t}
        breakdownMode={breakdownMode}
      />
    </div>
  );
}

export default ReportDailyBreakdownTooltip;
