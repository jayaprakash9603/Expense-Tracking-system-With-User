import { useEntityList } from "@/shared/patterns";
import { fetchNotificationsAction } from "@/redux/notifications/notifications.actions";
import { selectNotificationList } from "@/redux/selectors";
import { toListItem } from "@/domain/notifications/notification.transformers";

export function useNotificationList(options = {}) {
  return useEntityList({
    fetchAction: fetchNotificationsAction,
    selector: selectNotificationList,
    searchFields: ["title", "message"],
    defaultSort: { field: "createdAt", order: "desc" },
    transformItem: toListItem,
    ...options,
  });
}

export default useNotificationList;
