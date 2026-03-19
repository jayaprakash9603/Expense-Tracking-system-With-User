import { Bell, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/shared/components/AppCard";
import { AppIcon, AppIconBox } from "@/shared/components/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function NotificationCard({ notification, onMarkRead, onDelete }) {
  const { t } = useLanguage();

  return (
    <AppCard className={cn("p-3 md:p-4", !notification.read && "border-l-2 border-l-primary bg-primary/5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <AppIconBox icon={Bell} color="primary" size="sm" className="mt-0.5" />
          <div className="min-w-0">
            <h3 className={cn("text-sm md:text-base truncate", !notification.read && "font-semibold")}>
              {notification.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.subtitle}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{notification.date}</p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {!notification.read && onMarkRead && (
            <button onClick={() => onMarkRead(notification)} className="p-1 rounded hover:bg-muted">
              <AppIcon icon={Check} color="primary" size="xs" className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(notification)} className="p-1 rounded hover:bg-muted">
              <AppIcon icon={Trash2} color="error" size="xs" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </AppCard>
  );
}

export default NotificationCard;
