import {
  FETCH_NOTIFICATIONS_REQUEST,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
  DELETE_NOTIFICATION_SUCCESS,
  FETCH_UNREAD_COUNT_SUCCESS,
  CLEAR_NOTIFICATION_ERROR,
  RESET_NOTIFICATION_STATE,
} from "./notifications.actionTypes";

const initialState = {
  list: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_NOTIFICATIONS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: Array.isArray(action.payload) ? action.payload : [],
      };
    case FETCH_NOTIFICATIONS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case MARK_NOTIFICATION_READ_SUCCESS:
      return {
        ...state,
        list: state.list.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(state.unreadCount - 1, 0),
      };
    case MARK_ALL_NOTIFICATIONS_READ_SUCCESS:
      return {
        ...state,
        list: state.list.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };

    case DELETE_NOTIFICATION_SUCCESS: {
      const removed = state.list.find((n) => n.id === action.payload);
      return {
        ...state,
        list: state.list.filter((n) => n.id !== action.payload),
        unreadCount:
          removed && !removed.read
            ? Math.max(state.unreadCount - 1, 0)
            : state.unreadCount,
      };
    }

    case FETCH_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        unreadCount: Number(action.payload?.count ?? action.payload ?? 0),
      };

    case CLEAR_NOTIFICATION_ERROR:
      return { ...state, error: null };
    case RESET_NOTIFICATION_STATE:
      return { ...initialState };

    default:
      return state;
  }
};
