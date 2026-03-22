import { CheckCircle, Clock, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/shared/components/display/AppCard";
import { AppBadge } from "@/shared/components/display/AppBadge";
import { AppIcon, AppIconBox } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { getDaysUntilDue } from "@/domain/bills/bill.rules";
import { BILL_STATUS_COLORS } from "../../config/billConfig";
import { Button } from "@/shared/components/app-shadcn";

const STATUS_ICONS = {
  PENDING: Clock,
  PAID: CheckCircle,
  OVERDUE: AlertTriangle,
};

function BillCardActions({ bill, onEdit, onDelete, t, className }) {
  return (
    <div className={cn("flex gap-1", className)}>
      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onEdit(bill)}
          aria-label={t("common.edit")}
        >
          <AppIcon icon={Pencil} color="soft" size="xs" className="h-3.5 w-3.5" />
        </Button>
      )}
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onDelete(bill)}
          aria-label={t("common.delete")}
        >
          <AppIcon icon={Trash2} color="error" size="xs" className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export function BillCard({ bill, onEdit, onDelete, layout = "row" }) {
  const { t } = useLanguage();
  const { format } = useMoneyFormatter();
  const StatusIcon = STATUS_ICONS[bill.status] || Clock;
  const daysUntil = getDaysUntilDue(bill);
  const iconColor = bill.isOverdue ? "error" : "primary";
  const dueLabel = bill.isOverdue
    ? t("bills.overdue")
    : daysUntil === 0
      ? t("bills.dueToday")
      : `${daysUntil} ${t("bills.daysLeft")}`;

  if (layout === "grid") {
    return (
      <AppCard className="flex h-full min-h-[10.5rem] flex-col p-3 md:p-4">
        <div className="flex items-start gap-2">
          <AppIconBox icon={StatusIcon} color={iconColor} size="sm" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm leading-snug md:text-base">{bill.title}</h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{bill.subtitle}</p>
          </div>
        </div>
        <p
          className={cn(
            "mt-2 text-xs text-muted-foreground",
            bill.isOverdue && "font-medium text-destructive",
          )}
        >
          {dueLabel}
        </p>
        <div className="mt-auto flex flex-col gap-2 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold tabular-nums md:text-base">{format(bill.amount)}</span>
            <AppBadge variant={BILL_STATUS_COLORS[bill.status] || "secondary"} className="text-[0.625rem] shrink-0">
              {t(`bills.statuses.${bill.status?.toLowerCase()}`)}
            </AppBadge>
          </div>
          <BillCardActions bill={bill} onEdit={onEdit} onDelete={onDelete} t={t} className="justify-end" />
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <AppIconBox icon={StatusIcon} color={iconColor} size="sm" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium md:text-base">{bill.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{bill.subtitle}</span>
              <span>•</span>
              <span className={cn(bill.isOverdue && "font-medium text-destructive")}>{dueLabel}</span>
            </div>
          </div>
        </div>
        <div className="ml-3 flex items-center gap-2">
          <div className="text-right">
            <span className="block whitespace-nowrap text-sm font-semibold md:text-base">{format(bill.amount)}</span>
            <AppBadge variant={BILL_STATUS_COLORS[bill.status] || "secondary"} className="text-[0.625rem]">
              {t(`bills.statuses.${bill.status?.toLowerCase()}`)}
            </AppBadge>
          </div>
          <div className="flex flex-col gap-1">
            <BillCardActions bill={bill} onEdit={onEdit} onDelete={onDelete} t={t} className="flex-col gap-1" />
          </div>
        </div>
      </div>
    </AppCard>
  );
}

export default BillCard;
