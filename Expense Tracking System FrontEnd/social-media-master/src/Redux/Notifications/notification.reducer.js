import * as actionTypes from "./notification.actionType";

// ==========================================
// PERFORMANCE CONFIGURATION
// ==========================================
// Limit duplicate check to recent notifications for O(1) performance
const DUPLICATE_CHECK_LIMIT = 50;

// Maximum notifications to keep in Redux to prevent memory bloat
const MAX_NOTIFICATIONS_IN_STORE = 500;

// ==========================================
// INITIAL STATE
// ==========================================
const initialState = {
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,
  preferences: null,
  loading: false,
  error: null,
  filter: "all", // all, read, unread
  lastFetched: null,
};

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==========================================
    // FETCH NOTIFICATIONS
    // ==========================================
    case actionTypes.FETCH_NOTIFICATIONS_REQUEST:
    case actionTypes.FETCH_UNREAD_NOTIFICATIONS_REQUEST:
    case actionTypes.FETCH_UNREAD_COUNT_REQUEST:
    case actionTypes.FETCH_PREFERENCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload,
        lastFetched: new Date().toISOString(),
        error: null,
      };

    case actionTypes.FETCH_UNREAD_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        unreadNotifications: action.payload,
        error: null,
      };

    case actionTypes.FETCH_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        loading: false,
        unreadCount: action.payload,
        error: null,
      };

    case actionTypes.FETCH_NOTIFICATIONS_FAILURE:
    case actionTypes.FETCH_UNREAD_NOTIFICATIONS_FAILURE:
    case actionTypes.FETCH_UNREAD_COUNT_FAILURE:
    case actionTypes.FETCH_PREFERENCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ==========================================
    // MARK AS READ
    // ==========================================
    case actionTypes.MARK_NOTIFICATION_READ_REQUEST:
    case actionTypes.MARK_ALL_READ_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.MARK_NOTIFICATION_READ_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification
        ),
        unreadNotifications: state.unreadNotifications.filter(
          (notification) => notification.id !== action.payload
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        error: null,
      };

    case actionTypes.MARK_ALL_READ_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadNotifications: [],
        unreadCount: 0,
        error: null,
      };

    case actionTypes.MARK_NOTIFICATION_READ_FAILURE:
    case actionTypes.MARK_ALL_READ_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ==========================================
    // DELETE NOTIFICATIONS
    // ==========================================
    case actionTypes.DELETE_NOTIFICATION_REQUEST:
    case actionTypes.DELETE_ALL_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.DELETE_NOTIFICATION_SUCCESS:
      const deletedNotification = state.notifications.find(
        (n) => n.id === action.payload
      );
      const wasUnread = deletedNotification && !deletedNotification.isRead;

      return {
        ...state,
        loading: false,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
        unreadNotifications: state.unreadNotifications.filter(
          (notification) => notification.id !== action.payload
        ),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
        error: null,
      };

    case actionTypes.DELETE_ALL_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: [],
        unreadNotifications: [],
        unreadCount: 0,
        error: null,
      };

    case actionTypes.DELETE_NOTIFICATION_FAILURE:
    case actionTypes.DELETE_ALL_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ==========================================
    // PREFERENCES
    // ==========================================
    case actionTypes.UPDATE_PREFERENCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.FETCH_PREFERENCES_SUCCESS:
    case actionTypes.UPDATE_PREFERENCES_SUCCESS:
      return {
        ...state,
        loading: false,
        preferences: action.payload,
        error: null,
      };

    case actionTypes.UPDATE_PREFERENCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ==========================================
    // TEST NOTIFICATION
    // ==========================================
    case actionTypes.SEND_TEST_NOTIFICATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.SEND_TEST_NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case actionTypes.SEND_TEST_NOTIFICATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ==========================================
    // REALTIME NOTIFICATIONS
    // ==========================================
    case actionTypes.REALTIME_NOTIFICATION_RECEIVED:
    case actionTypes.ADD_NOTIFICATION:
      // ✅ OPTIMIZED: Check only first few notifications for duplicates
      // Most recent notifications are at the start, so check first N
      // This prevents O(n) search through thousands of notifications
      const recentNotifications = state.notifications.slice(
        0,
        DUPLICATE_CHECK_LIMIT
      );
      const notificationExists = recentNotifications.some(
        (n) => n.id === action.payload.id
      );

      if (notificationExists) {
        return state; // Duplicate found, skip
      }

      // ✅ OPTIMIZED: Limit total notifications in Redux to prevent memory bloat
      // Keep only most recent N notifications in memory
      const currentNotifications =
        state.notifications.length >= MAX_NOTIFICATIONS_IN_STORE
          ? state.notifications.slice(0, MAX_NOTIFICATIONS_IN_STORE - 1)
          : state.notifications;

      return {
        ...state,
        notifications: [action.payload, ...currentNotifications],
        unreadNotifications: !action.payload.isRead
          ? [action.payload, ...state.unreadNotifications]
          : state.unreadNotifications,
        unreadCount: !action.payload.isRead
          ? state.unreadCount + 1
          : state.unreadCount,
      };

    // ==========================================
    // FILTER & CLEAR
    // ==========================================
    case actionTypes.FILTER_NOTIFICATIONS:
      return {
        ...state,
        filter: action.payload,
      };

    case actionTypes.CLEAR_NOTIFICATIONS:
      return initialState;

    default:
      return state;
  }
};

// Selectors
export const selectAllNotifications = (state) =>
  state.notifications.notifications;

export const selectUnreadNotifications = (state) =>
  state.notifications.unreadNotifications;

export const selectUnreadCount = (state) => state.notifications.unreadCount;

export const selectNotificationPreferences = (state) =>
  state.notifications.preferences;

export const selectNotificationLoading = (state) => state.notifications.loading;

export const selectNotificationError = (state) => state.notifications.error;

export const selectFilteredNotifications = (state) => {
  const { notifications, filter } = state.notifications;

  switch (filter) {
    case "read":
      return notifications.filter((n) => n.isRead);
    case "unread":
      return notifications.filter((n) => !n.isRead);
    case "all":
    default:
      return notifications;
  }
};

export const selectNotificationsByType = (state, type) => {
  return state.notifications.notifications.filter((n) => n.type === type);
};

export const selectFriendRequestNotifications = (state) => {
  return state.notifications.notifications.filter(
    (n) =>
      n.type === "FRIEND_REQUEST_RECEIVED" ||
      n.type === "FRIEND_REQUEST_ACCEPTED" ||
      n.type === "FRIEND_REQUEST_REJECTED"
  );
};
