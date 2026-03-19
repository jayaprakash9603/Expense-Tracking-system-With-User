import { BellOff, CheckCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { EntityListPage } from "@/shared/patterns";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { AppButton } from "@/shared/components/AppButton";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "@/redux/notifications/notifications.actions";
import { selectUnreadCount } from "@/redux/selectors";
import { useNotificationList } from "../hooks/useNotificationList";
import { NotificationCard } from "../components/NotificationCard";

export function NotificationListPageView() {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const notificationList = useNotificationList();
  const unreadCount = useSelector(selectUnreadCount);

  const handleMarkRead = (notification) => {
    dispatch(markNotificationReadAction(notification.id));
  };

  const handleDelete = (notification) => {
    dispatch(deleteNotificationAction(notification.id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsReadAction());
  };

  return (
    <EntityListPage
      title={t("notifications.title")}
      searchPlaceholder={t("notifications.searchPlaceholder")}
      hook={notificationList}
      renderItem={(item) => (
        <NotificationCard
          notification={item}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
        />
      )}
      emptyState={{
        icon: BellOff,
        title: t("notifications.emptyTitle"),
        description: t("notifications.emptyDescription"),
      }}
      headerActions={
        unreadCount > 0 && (
          <AppButton variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-1" />
            {t("notifications.markAllRead")}
          </AppButton>
        )
      }
    />
  );
}

export default NotificationListPageView;
