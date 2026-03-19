export const selectNotificationList = (state) => state.notifications.list;
export const selectNotificationLoading = (state) => state.notifications.loading;
export const selectNotificationError = (state) => state.notifications.error;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectUnreadNotifications = (state) =>
  state.notifications.list.filter((n) => !n.read);
