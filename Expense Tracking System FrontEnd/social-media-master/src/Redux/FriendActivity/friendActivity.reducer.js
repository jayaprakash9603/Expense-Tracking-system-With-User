/**
 * Friend Activity Reducer
 * Manages friend activity state in Redux store.
 */

import {
  FETCH_FRIEND_ACTIVITIES_REQUEST,
  FETCH_FRIEND_ACTIVITIES_SUCCESS,
  FETCH_FRIEND_ACTIVITIES_FAILURE,
  FETCH_FRIEND_ACTIVITIES_PAGED_REQUEST,
  FETCH_FRIEND_ACTIVITIES_PAGED_SUCCESS,
  FETCH_FRIEND_ACTIVITIES_PAGED_FAILURE,
  FETCH_UNREAD_ACTIVITIES_REQUEST,
  FETCH_UNREAD_ACTIVITIES_SUCCESS,
  FETCH_UNREAD_ACTIVITIES_FAILURE,
  FETCH_UNREAD_COUNT_REQUEST,
  FETCH_UNREAD_COUNT_SUCCESS,
  FETCH_UNREAD_COUNT_FAILURE,
  FETCH_ACTIVITIES_BY_SERVICE_REQUEST,
  FETCH_ACTIVITIES_BY_SERVICE_SUCCESS,
  FETCH_ACTIVITIES_BY_SERVICE_FAILURE,
  FETCH_ACTIVITIES_BY_FRIEND_REQUEST,
  FETCH_ACTIVITIES_BY_FRIEND_SUCCESS,
  FETCH_ACTIVITIES_BY_FRIEND_FAILURE,
  FETCH_RECENT_ACTIVITIES_REQUEST,
  FETCH_RECENT_ACTIVITIES_SUCCESS,
  FETCH_RECENT_ACTIVITIES_FAILURE,
  MARK_ACTIVITY_READ_REQUEST,
  MARK_ACTIVITY_READ_SUCCESS,
  MARK_ACTIVITY_READ_FAILURE,
  MARK_ALL_ACTIVITIES_READ_REQUEST,
  MARK_ALL_ACTIVITIES_READ_SUCCESS,
  MARK_ALL_ACTIVITIES_READ_FAILURE,
  FETCH_ACTIVITY_SUMMARY_REQUEST,
  FETCH_ACTIVITY_SUMMARY_SUCCESS,
  FETCH_ACTIVITY_SUMMARY_FAILURE,
  CLEAR_FRIEND_ACTIVITIES,
  SET_ACTIVITY_FILTERS,
  RESET_ACTIVITY_FILTERS,
} from "./friendActivity.actionTypes";

const initialFilters = {
  searchTerm: "",
  serviceFilter: "all", // all, EXPENSE, BILL, BUDGET, CATEGORY, PAYMENT
  actionFilter: "all", // all, CREATE, UPDATE, DELETE
  friendFilter: null, // null or friendId
  dateRange: null, // null or { start, end }
  readStatus: "all", // all, read, unread
  sortBy: "timestamp", // timestamp, action, service
  sortOrder: "desc", // asc, desc
};

const initialState = {
  // Activities data
  activities: [],
  loadingActivities: false,
  activitiesError: null,

  // Paginated activities
  pagedActivities: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 20,
  },
  loadingPagedActivities: false,
  pagedActivitiesError: null,

  // Unread activities
  unreadActivities: [],
  loadingUnreadActivities: false,
  unreadActivitiesError: null,

  // Unread count
  unreadCount: 0,
  loadingUnreadCount: false,
  unreadCountError: null,

  // Activities by service
  activitiesByService: {},
  loadingServiceActivities: false,
  serviceActivitiesError: null,

  // Activities by friend
  activitiesByFriend: {},
  loadingFriendActivities: false,
  friendActivitiesError: null,

  // Recent activities
  recentActivities: [],
  loadingRecentActivities: false,
  recentActivitiesError: null,

  // Mark as read
  markingAsRead: false,
  markAsReadError: null,

  // Activity summary
  summary: null,
  loadingSummary: false,
  summaryError: null,

  // Filters
  filters: initialFilters,
};

/**
 * Helper to update an activity as read in an array
 */
const markActivityReadInArray = (activities, activityId) =>
  activities.map((activity) =>
    activity.id === activityId ? { ...activity, isRead: true } : activity,
  );

/**
 * Helper to mark all activities as read in an array
 */
const markAllActivitiesReadInArray = (activities) =>
  activities.map((activity) => ({ ...activity, isRead: true }));

const friendActivityReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch all activities
    case FETCH_FRIEND_ACTIVITIES_REQUEST:
      return {
        ...state,
        loadingActivities: true,
        activitiesError: null,
      };
    case FETCH_FRIEND_ACTIVITIES_SUCCESS:
      return {
        ...state,
        loadingActivities: false,
        activities: action.payload,
        activitiesError: null,
      };
    case FETCH_FRIEND_ACTIVITIES_FAILURE:
      return {
        ...state,
        loadingActivities: false,
        activitiesError: action.payload,
      };

    // Fetch paginated activities
    case FETCH_FRIEND_ACTIVITIES_PAGED_REQUEST:
      return {
        ...state,
        loadingPagedActivities: true,
        pagedActivitiesError: null,
      };
    case FETCH_FRIEND_ACTIVITIES_PAGED_SUCCESS:
      return {
        ...state,
        loadingPagedActivities: false,
        pagedActivities: action.payload,
        pagedActivitiesError: null,
      };
    case FETCH_FRIEND_ACTIVITIES_PAGED_FAILURE:
      return {
        ...state,
        loadingPagedActivities: false,
        pagedActivitiesError: action.payload,
      };

    // Fetch unread activities
    case FETCH_UNREAD_ACTIVITIES_REQUEST:
      return {
        ...state,
        loadingUnreadActivities: true,
        unreadActivitiesError: null,
      };
    case FETCH_UNREAD_ACTIVITIES_SUCCESS:
      return {
        ...state,
        loadingUnreadActivities: false,
        unreadActivities: action.payload,
        unreadActivitiesError: null,
      };
    case FETCH_UNREAD_ACTIVITIES_FAILURE:
      return {
        ...state,
        loadingUnreadActivities: false,
        unreadActivitiesError: action.payload,
      };

    // Fetch unread count
    case FETCH_UNREAD_COUNT_REQUEST:
      return {
        ...state,
        loadingUnreadCount: true,
        unreadCountError: null,
      };
    case FETCH_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        loadingUnreadCount: false,
        unreadCount: action.payload,
        unreadCountError: null,
      };
    case FETCH_UNREAD_COUNT_FAILURE:
      return {
        ...state,
        loadingUnreadCount: false,
        unreadCountError: action.payload,
      };

    // Fetch activities by service
    case FETCH_ACTIVITIES_BY_SERVICE_REQUEST:
      return {
        ...state,
        loadingServiceActivities: true,
        serviceActivitiesError: null,
      };
    case FETCH_ACTIVITIES_BY_SERVICE_SUCCESS:
      return {
        ...state,
        loadingServiceActivities: false,
        activitiesByService: {
          ...state.activitiesByService,
          [action.payload.service]: action.payload.data,
        },
        serviceActivitiesError: null,
      };
    case FETCH_ACTIVITIES_BY_SERVICE_FAILURE:
      return {
        ...state,
        loadingServiceActivities: false,
        serviceActivitiesError: action.payload,
      };

    // Fetch activities by friend
    case FETCH_ACTIVITIES_BY_FRIEND_REQUEST:
      return {
        ...state,
        loadingFriendActivities: true,
        friendActivitiesError: null,
      };
    case FETCH_ACTIVITIES_BY_FRIEND_SUCCESS:
      return {
        ...state,
        loadingFriendActivities: false,
        activitiesByFriend: {
          ...state.activitiesByFriend,
          [action.payload.friendId]: action.payload.data,
        },
        friendActivitiesError: null,
      };
    case FETCH_ACTIVITIES_BY_FRIEND_FAILURE:
      return {
        ...state,
        loadingFriendActivities: false,
        friendActivitiesError: action.payload,
      };

    // Fetch recent activities
    case FETCH_RECENT_ACTIVITIES_REQUEST:
      return {
        ...state,
        loadingRecentActivities: true,
        recentActivitiesError: null,
      };
    case FETCH_RECENT_ACTIVITIES_SUCCESS:
      return {
        ...state,
        loadingRecentActivities: false,
        recentActivities: action.payload,
        recentActivitiesError: null,
      };
    case FETCH_RECENT_ACTIVITIES_FAILURE:
      return {
        ...state,
        loadingRecentActivities: false,
        recentActivitiesError: action.payload,
      };

    // Mark activity as read
    case MARK_ACTIVITY_READ_REQUEST:
      return {
        ...state,
        markingAsRead: true,
        markAsReadError: null,
      };
    case MARK_ACTIVITY_READ_SUCCESS:
      return {
        ...state,
        markingAsRead: false,
        activities: markActivityReadInArray(state.activities, action.payload),
        unreadActivities: state.unreadActivities.filter(
          (a) => a.id !== action.payload,
        ),
        recentActivities: markActivityReadInArray(
          state.recentActivities,
          action.payload,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        markAsReadError: null,
      };
    case MARK_ACTIVITY_READ_FAILURE:
      return {
        ...state,
        markingAsRead: false,
        markAsReadError: action.payload,
      };

    // Mark all activities as read
    case MARK_ALL_ACTIVITIES_READ_REQUEST:
      return {
        ...state,
        markingAsRead: true,
        markAsReadError: null,
      };
    case MARK_ALL_ACTIVITIES_READ_SUCCESS:
      return {
        ...state,
        markingAsRead: false,
        activities: markAllActivitiesReadInArray(state.activities),
        unreadActivities: [],
        recentActivities: markAllActivitiesReadInArray(state.recentActivities),
        unreadCount: 0,
        markAsReadError: null,
      };
    case MARK_ALL_ACTIVITIES_READ_FAILURE:
      return {
        ...state,
        markingAsRead: false,
        markAsReadError: action.payload,
      };

    // Fetch activity summary
    case FETCH_ACTIVITY_SUMMARY_REQUEST:
      return {
        ...state,
        loadingSummary: true,
        summaryError: null,
      };
    case FETCH_ACTIVITY_SUMMARY_SUCCESS:
      return {
        ...state,
        loadingSummary: false,
        summary: action.payload,
        summaryError: null,
      };
    case FETCH_ACTIVITY_SUMMARY_FAILURE:
      return {
        ...state,
        loadingSummary: false,
        summaryError: action.payload,
      };

    // Clear activities
    case CLEAR_FRIEND_ACTIVITIES:
      return initialState;

    // Set filters
    case SET_ACTIVITY_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    // Reset filters
    case RESET_ACTIVITY_FILTERS:
      return {
        ...state,
        filters: initialFilters,
      };

    default:
      return state;
  }
};

export default friendActivityReducer;
