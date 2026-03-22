import React, { useMemo } from "react";
import dayjs from "dayjs";
import { CalendarDays, Clock3, Info, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/app-shadcn";
import { cn } from "@/lib/utils";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { formatPaymentMethodName } from "../../utils/expensePaymentMethodUtils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

function resolveTypeLabel(type, t) {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "loss" || normalized === "outflow") return t("flows.expensesTable.typeLoss");
  if (normalized === "gain" || normalized === "inflow") return t("flows.expensesTable.typeGain");
  return t("chart.unknown");
}

function resolveIndicatorIcon(icon) {
  if (icon === "clock") return Clock3;
  if (icon === "info") return Info;
  return CalendarDays;
}

export function PreviousExpenseIndicator({
  expense = null,
  isLoading = false,
  position = "right",
  showTooltip = true,
  dateFormat = "DD MMM YYYY",
  label: labelProp,
  labelPosition = "top",
  variant = "gradient",
  colorScheme,
  icon = "calendar",
  className,
}) {
  const { t } = useLanguage();
  const label = labelProp ?? t("expenseForm.actions.previouslyAdded");
  const { format } = useMoneyFormatter();
  const details = expense ? extractExpenseDetails(expense) : null;
  const Icon = resolveIndicatorIcon(icon);
  const formattedDate = useMemo(() => {
    const dateValue = expense?.date || details?.date;
    if (!dateValue || !dayjs(dateValue).isValid()) return "--";
    return dayjs(dateValue).format(dateFormat);
  }, [expense?.date, details?.date, dateFormat]);

  const primaryColor = colorScheme?.primary || "hsl(var(--primary))";
  const secondaryColor = colorScheme?.secondary || "hsl(var(--primary))";
  const textColor = colorScheme?.text || "hsl(var(--primary))";
  const baseStyles = {
    borderLeftColor: primaryColor,
    color: textColor,
  };
  const variantStyles =
    variant === "solid"
      ? { background: `${primaryColor}1f` }
      : variant === "outline"
        ? { background: "transparent", border: `1px solid ${primaryColor}` }
        : {
            background: `linear-gradient(135deg, ${primaryColor}1f 0%, ${secondaryColor}1a 100%)`,
          };

  if (!expense && !isLoading) return null;

  const indicator = (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-r-md border-l-4 px-3 py-2 shadow-sm",
        position === "left" ? "justify-start" : "justify-end",
        className,
      )}
      style={{ ...baseStyles, ...variantStyles }}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      <span className="flex flex-col leading-tight">
        {labelPosition !== "none" ? (
          <span className="text-[0.625rem] uppercase tracking-wide opacity-80">{label}</span>
        ) : null}
        <span className="text-sm font-semibold">{isLoading ? t("common.loading") : formattedDate}</span>
      </span>
    </div>
  );

  if (!showTooltip || !details || isLoading) {
    return indicator;
  }

  const amount = Number(details.amount ?? 0);
  const paymentMethod = formatPaymentMethodName(details.paymentMethod || "");
  const typeLabel = resolveTypeLabel(details.type, t);
  const normalizedType = String(details?.type || "").toLowerCase();
  const typeClass =
    normalizedType === "loss" || normalizedType === "outflow"
      ? "text-red-500"
      : ["gain", "income", "inflow", "profit"].includes(normalizedType)
        ? "text-emerald-500"
        : "text-muted-foreground";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{indicator}</TooltipTrigger>
        <TooltipContent
          align={position === "left" ? "start" : "end"}
          sideOffset={8}
          className="w-64 rounded-md border bg-card p-3 text-card-foreground shadow-lg"
        >
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("common.amount")}</span>
              <span className="font-semibold">{format(amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("expenseForm.fields.paymentMethod")}</span>
              <span className="font-medium">{paymentMethod || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("expenses.columns.type")}</span>
              <span className={cn("font-semibold", typeClass)}>{typeLabel}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default PreviousExpenseIndicator;
