import React from "react";
import { format } from "date-fns";
import { Calendar, ArrowDownRight, ArrowUpRight, ReceiptText } from "lucide-react";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useIsMobile } from "@/shared/hooks/theme/useMediaQuery";
import {
  extractExpenseDetails,
  resolveExpenseCategoryLabel,
  resolveExpenseDisplayName,
} from "@/shared/utils/expense/expenseDisplayUtils";

const MAX_ITEMS_MOBILE = 3;
const MAX_ITEMS_DESKTOP = 5;

function CompactTooltip({ dateLabel, amountValue, expenses, isLoss, formatMoney, t }) {
  const displayExpenses = expenses.slice(0, MAX_ITEMS_MOBILE);
  const remainingCount = Math.max(0, expenses.length - MAX_ITEMS_MOBILE);

  return (
    <div className="w-[180px] rounded-lg overflow-hidden shadow-lg border border-border bg-card text-card-foreground">
      <div className={`px-2.5 py-2 text-white ${isLoss ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-emerald-500 to-emerald-600"}`}>
        <div className="text-[9px] font-bold uppercase tracking-wider text-white/80 mb-1">
          {dateLabel}
        </div>
        <div className="text-[9px] text-white/70 mb-0.5">
          {isLoss ? t("dashboard.totalSpending") : t("dashboard.totalIncome")}
        </div>
        <div className="flex items-center gap-2">
          {isLoss ? <ArrowDownRight className="w-3.5 h-3.5 text-white/80 shrink-0" /> : <ArrowUpRight className="w-3.5 h-3.5 text-white/80 shrink-0" />}
          <span className="text-sm font-bold">{formatMoney(amountValue)}</span>
        </div>
      </div>
      {displayExpenses.length > 0 && (
        <div className="px-2.5 py-2 space-y-1">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-0.5">
            <span>{t("dashboard.transactions")}</span>
            <span>{expenses.length}</span>
          </div>
          {displayExpenses.map((expense, idx) => {
            const details = extractExpenseDetails(expense);
            const label = resolveExpenseDisplayName(details) || t("chart.unknown");
            return (
              <div key={idx} className="flex justify-between items-center text-[10px]">
                <span className="text-foreground truncate mr-1.5 max-w-[90px]">
                  {label}
                </span>
                <span className={`font-semibold whitespace-nowrap ${isLoss ? "text-red-500" : "text-emerald-500"}`}>
                  {formatMoney(details.amount)}
                </span>
              </div>
            );
          })}
          {remainingCount > 0 && (
            <div className="text-[9px] text-muted-foreground text-center">+{remainingCount} {t("dashboard.more")}</div>
          )}
        </div>
      )}
    </div>
  );
}

function FullTooltip({ dateLabel, amountValue, expenses, isLoss, formatMoney, t }) {
  const displayExpenses = expenses.slice(0, MAX_ITEMS_DESKTOP);
  const remainingCount = Math.max(0, expenses.length - MAX_ITEMS_DESKTOP);

  return (
    <div className="w-[260px] rounded-xl overflow-hidden shadow-xl border border-border bg-card text-card-foreground">
      <div className={`p-3 text-white relative overflow-hidden ${isLoss ? "bg-gradient-to-br from-red-500 to-red-700" : "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/90 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          {dateLabel}
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            {isLoss ? <ArrowDownRight className="w-5 h-5 text-white" /> : <ArrowUpRight className="w-5 h-5 text-white" />}
          </div>
          <div>
            <div className="text-xs font-medium text-white/80 mb-0.5">
              {isLoss ? t("dashboard.totalSpending") : t("dashboard.totalIncome")}
            </div>
            <div className="text-lg font-bold leading-none">{formatMoney(amountValue)}</div>
          </div>
        </div>
      </div>

      {displayExpenses.length > 0 && (
        <div className="p-3 bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <ReceiptText className="w-3.5 h-3.5" />
              <span>{t("dashboard.transactions")}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isLoss ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                {expenses.length}
              </span>
            </div>
            {remainingCount > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                +{remainingCount} {t("dashboard.more")}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {displayExpenses.map((expense, idx) => {
              const details = extractExpenseDetails(expense);
              const label = resolveExpenseDisplayName(details) || t("chart.unknown");
              const categoryLabel = resolveExpenseCategoryLabel(details) || t("chart.uncategorized");
              return (
                <div key={idx} className="p-2 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-foreground truncate mr-2">
                      {label}
                    </span>
                    <span className={`text-xs font-bold whitespace-nowrap ${isLoss ? "text-red-500" : "text-emerald-500"}`}>
                      {formatMoney(details.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isLoss ? "bg-red-500" : "bg-emerald-500"}`} />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {categoryLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function SpendingChartTooltip({ active, payload, label, coordinate, viewBox, selectedType = "loss" }) {
  const { format: formatMoney } = useMoneyFormatter();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  if (!active || !payload || !payload.length) return null;

  const payloadRow = payload[0].payload;
  const expenseEntry = payload.find((p) => p.dataKey === "expense");
  const incomeEntry = payload.find((p) => p.dataKey === "income");
  const hasDualSeries = Boolean(expenseEntry && incomeEntry);
  const amountEntry =
    (hasDualSeries ? expenseEntry : null) ||
    payload.find((p) => p.dataKey === "expense" || p.dataKey === "amount") ||
    payload[0];
  const isLoss = hasDualSeries ? true : selectedType === "loss";
  const amountValue = Number(amountEntry?.value ?? 0);
  const expenses = payloadRow.expenses || [];

  let dateLabel = label;
  try {
    if (label && typeof label === "string" && label.includes("-")) {
      dateLabel = format(new Date(label), "MMM dd, yyyy");
    }
  } catch {
    /* keep original */
  }

  const chartWidth = viewBox?.width || 400;
  const cursorX = coordinate?.x || 0;
  const showOnLeft = cursorX > chartWidth * 0.4;

  const content = isMobile
    ? <CompactTooltip dateLabel={dateLabel} amountValue={amountValue} expenses={expenses} isLoss={isLoss} formatMoney={formatMoney} t={t} />
    : <FullTooltip dateLabel={dateLabel} amountValue={amountValue} expenses={expenses} isLoss={isLoss} formatMoney={formatMoney} t={t} />;

  const positionStyle = showOnLeft
    ? { transform: "translateX(-100%)", marginLeft: -12 }
    : { marginLeft: 12 };

  return (
    <div style={positionStyle}>
      {content}
    </div>
  );
}

export default SpendingChartTooltip;
