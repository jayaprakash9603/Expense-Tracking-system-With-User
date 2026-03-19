import { CheckCircle, Clock, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/shared/components/AppCard";
import { AppBadge } from "@/shared/components/AppBadge";
import { AppIcon, AppIconBox } from "@/shared/components/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatMoney } from "@/domain/shared/money";
import { getDaysUntilDue } from "@/domain/bills/bill.rules";
import { BILL_STATUS_COLORS } from "../config/billConfig";

const STATUS_ICONS = {
  PENDING: Clock,
  PAID: CheckCircle,
  OVERDUE: AlertTriangle,
};

export function BillCard({ bill, onEdit, onDelete, onMarkPaid, currency = "INR" }) {
  const { t } = useLanguage();
  const StatusIcon = STATUS_ICONS[bill.status] || Clock;
  const daysUntil = getDaysUntilDue(bill);
  const iconColor = bill.isOverdue ? "error" : "primary";

  return (
    <AppCard className="p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <AppIconBox icon={StatusIcon} color={iconColor} size="sm" />
          <div className="min-w-0">
            <h3 className="font-medium text-sm md:text-base truncate">{bill.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{bill.subtitle}</span>
              <span>•</span>
              <span className={cn(bill.isOverdue && "text-destructive font-medium")}>
                {bill.isOverdue
                  ? t("bills.overdue")
                  : daysUntil === 0
                    ? t("bills.dueToday")
                    : `${daysUntil} ${t("bills.daysLeft")}`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <div className="text-right">
            <span className="font-semibold text-sm md:text-base whitespace-nowrap block">
              {formatMoney(bill.amount, currency)}
            </span>
            <AppBadge variant={BILL_STATUS_COLORS[bill.status] || "secondary"} className="text-[10px]">
              {t(`bills.statuses.${bill.status?.toLowerCase()}`)}
            </AppBadge>
          </div>
          <div className="flex flex-col gap-1">
            {onEdit && (
              <button onClick={() => onEdit(bill)} className="p-1 rounded hover:bg-muted">
                <AppIcon icon={Pencil} color="soft" size="xs" className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(bill)} className="p-1 rounded hover:bg-muted">
                <AppIcon icon={Trash2} color="error" size="xs" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </AppCard>
  );
}

export default BillCard;
