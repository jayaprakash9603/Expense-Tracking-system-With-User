import * as actionTypes from "./admin.actionTypes";

const initialState = {
  // Analytics
  analytics: {
    overview: null,
    topCategories: [],
    recentActivity: [],
    topUsers: [],
    timeRange: "7d",
    loading: false,
    error: null,
  },

  // Users
  users: {
    list: [],
    totalCount: 0,
    page: 0,
    size: 20,
    loading: false,
    error: null,
  },

  userStats: {
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    newThisMonth: 0,
    byRole: {},
    loading: false,
    error: null,
  },

  // Roles
  roles: {
    list: [],
    loading: false,
    error: null,
  },

  // Reports
  reports: {
    list: [],
    totalCount: 0,
    generating: false,
    loading: false,
    error: null,
  },

  // Audit Logs
  auditLogs: {
    list: [],
    totalCount: 0,
    totalPages: 0,
    page: 0,
    size: 20,
    stats: null,
    loading: false,
    error: null,
  },

  // Settings
  settings: {
    data: null,
    loading: false,
    saving: false,
    error: null,
  },

  // General
  actionLoading: false,
  actionError: null,
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    // ============ ANALYTICS ============
    case actionTypes.FETCH_ADMIN_ANALYTICS_REQUEST:
      return {
        ...state,
        analytics: { ...state.analytics, loading: true, error: null },
      };
    case actionTypes.FETCH_ADMIN_ANALYTICS_SUCCESS:
      return {
        ...state,
        analytics: { ...state.analytics, overview: action.payload, loading: false },
      };
    case actionTypes.FETCH_ADMIN_ANALYTICS_FAILURE:
      return {
        ...state,
        analytics: { ...state.analytics, loading: false, error: action.payload },
      };

    case actionTypes.FETCH_TOP_CATEGORIES_REQUEST:
      return {
        ...state,
        analytics: { ...state.analytics, loading: true },
      };
    case actionTypes.FETCH_TOP_CATEGORIES_SUCCESS:
      return {
        ...state,
        analytics: { ...state.analytics, topCategories: action.payload, loading: false },
      };
    case actionTypes.FETCH_TOP_CATEGORIES_FAILURE:
      return {
        ...state,
        analytics: { ...state.analytics, loading: false, error: action.payload },
      };

    case actionTypes.FETCH_RECENT_ACTIVITY_REQUEST:
      return {
        ...state,
        analytics: { ...state.analytics, loading: true },
      };
    case actionTypes.FETCH_RECENT_ACTIVITY_SUCCESS:
      return {
        ...state,
        analytics: { ...state.analytics, recentActivity: action.payload, loading: false },
      };
    case actionTypes.FETCH_RECENT_ACTIVITY_FAILURE:
      return {
        ...state,
        analytics: { ...state.analytics, loading: false, error: action.payload },
      };

    case actionTypes.FETCH_TOP_USERS_REQUEST:
      return {
        ...state,
        analytics: { ...state.analytics, loading: true },
      };
    case actionTypes.FETCH_TOP_USERS_SUCCESS:
      return {
        ...state,
        analytics: { ...state.analytics, topUsers: action.payload, loading: false },
      };
    case actionTypes.FETCH_TOP_USERS_FAILURE:
      return {
        ...state,
        analytics: { ...state.analytics, loading: false, error: action.payload },
      };

    case actionTypes.SET_ANALYTICS_TIME_RANGE:
      return {
        ...state,
        analytics: { ...state.analytics, timeRange: action.payload },
      };

    // ============ USERS ============
    case actionTypes.FETCH_ALL_USERS_REQUEST:
      return {
        ...state,
        users: { ...state.users, loading: true, error: null },
      };
    case actionTypes.FETCH_ALL_USERS_SUCCESS:
      return {
        ...state,
        users: {
          ...state.users,
          list: action.payload.content || action.payload.users || action.payload,
          totalCount: action.payload.totalElements || action.payload.length || 0,
          page: action.payload.number || 0,
          loading: false,
        },
      };
    case actionTypes.FETCH_ALL_USERS_FAILURE:
      return {
        ...state,
        users: { ...state.users, loading: false, error: action.payload },
      };

    case actionTypes.FETCH_USER_STATS_REQUEST:
      return {
        ...state,
        userStats: { ...state.userStats, loading: true, error: null },
      };
    case actionTypes.FETCH_USER_STATS_SUCCESS:
      return {
        ...state,
        userStats: { ...action.payload, loading: false, error: null },
      };
    case actionTypes.FETCH_USER_STATS_FAILURE:
      return {
        ...state,
        userStats: { ...state.userStats, loading: false, error: action.payload },
      };

    case actionTypes.UPDATE_USER_STATUS_REQUEST:
      return { ...state, actionLoading: true, actionError: null };
    case actionTypes.UPDATE_USER_STATUS_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        users: {
          ...state.users,
          list: state.users.list.map((user) =>
            user.id === action.payload.userId
              ? { ...user, status: action.payload.status }
              : user
          ),
        },
      };
    case actionTypes.UPDATE_USER_STATUS_FAILURE:
      return { ...state, actionLoading: false, actionError: action.payload };

    case actionTypes.DELETE_USER_REQUEST:
      return { ...state, actionLoading: true, actionError: null };
    case actionTypes.DELETE_USER_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        users: {
          ...state.users,
          list: state.users.list.filter((user) => user.id !== action.payload),
          totalCount: state.users.totalCount - 1,
        },
      };
    case actionTypes.DELETE_USER_FAILURE:
      return { ...state, actionLoading: false, actionError: action.payload };

    case actionTypes.BULK_USER_ACTION_REQUEST:
      return { ...state, actionLoading: true, actionError: null };
    case actionTypes.BULK_USER_ACTION_SUCCESS:
      // Refresh users list after bulk action
      return { ...state, actionLoading: false };
    case actionTypes.BULK_USER_ACTION_FAILURE:
      return { ...state, actionLoading: false, actionError: action.payload };

    // ============ ROLES ============
    case actionTypes.FETCH_ALL_ROLES_REQUEST:
      return {
        ...state,
        roles: { ...state.roles, loading: true, error: null },
      };
    case actionTypes.FETCH_ALL_ROLES_SUCCESS:
      return {
        ...state,
        roles: { ...state.roles, list: action.payload, loading: false },
      };
    case actionTypes.FETCH_ALL_ROLES_FAILURE:
      return {
        ...state,
        roles: { ...state.roles, loading: false, error: action.payload },
      };

    case actionTypes.CREATE_ROLE_REQUEST:
      return { ...state, actionLoading: true, actionError: null };
    case actionTypes.CREATE_ROLE_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        roles: { ...state.roles, list: [...state.roles.list, action.payload] },
      };
    case actionTypes.CREATE_ROLE_FAILURE:
      return { ...state, actionLoading: false, actionError: action.payload };

    case actionTypes.UPDATE_ROLE_REQUEST:
      return { ...state, actionLoading: true, actionError: null };
    case actionTypes.UPDATE_ROLE_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        roles: {
          ...state.roles,
          list: state.roles.list.map((role) =>
            role.id === action.payload.id ? action.payload : role
          ),
        },
      };
    case actionTypes.UPDATE_ROLE_FAILURE:
      return { ...state, actionLoading: false, actionError: action.payload };

    case actionTypes.DELETE_ROLE_REQUEST:
      return { ...state, actionLoading: true, actionError: null };
    case actionTypes.DELETE_ROLE_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        roles: {
          ...state.roles,
          list: state.roles.list.filter((role) => role.id !== action.payload),
        },
      };
    case actionTypes.DELETE_ROLE_FAILURE:
      return { ...state, actionLoading: false, actionError: action.payload };

    case actionTypes.ASSIGN_ROLE_TO_USER_REQUEST:
    case actionTypes.REMOVE_ROLE_FROM_USER_REQUEST:
      return { ...state, actionLoading: true, actionError: null };
    case actionTypes.ASSIGN_ROLE_TO_USER_SUCCESS:
    case actionTypes.REMOVE_ROLE_FROM_USER_SUCCESS:
      return { ...state, actionLoading: false };
    case actionTypes.ASSIGN_ROLE_TO_USER_FAILURE:
    case actionTypes.REMOVE_ROLE_FROM_USER_FAILURE:
      return { ...state, actionLoading: false, actionError: action.payload };

    // ============ REPORTS ============
    case actionTypes.FETCH_ADMIN_REPORTS_REQUEST:
      return {
        ...state,
        reports: { ...state.reports, loading: true, error: null },
      };
    case actionTypes.FETCH_ADMIN_REPORTS_SUCCESS:
      return {
        ...state,
        reports: {
          ...state.reports,
          list: action.payload.content || action.payload,
          totalCount: action.payload.totalElements || action.payload.length || 0,
          loading: false,
        },
      };
    case actionTypes.FETCH_ADMIN_REPORTS_FAILURE:
      return {
        ...state,
        reports: { ...state.reports, loading: false, error: action.payload },
      };

    case actionTypes.GENERATE_REPORT_REQUEST:
      return {
        ...state,
        reports: { ...state.reports, generating: true, error: null },
      };
    case actionTypes.GENERATE_REPORT_SUCCESS:
      return {
        ...state,
        reports: {
          ...state.reports,
          list: [action.payload, ...state.reports.list],
          generating: false,
        },
      };
    case actionTypes.GENERATE_REPORT_FAILURE:
      return {
        ...state,
        reports: { ...state.reports, generating: false, error: action.payload },
      };

    case actionTypes.DELETE_REPORT_REQUEST:
      return { ...state, actionLoading: true, actionError: null };
    case actionTypes.DELETE_REPORT_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        reports: {
          ...state.reports,
          list: state.reports.list.filter((report) => report.id !== action.payload),
        },
      };
    case actionTypes.DELETE_REPORT_FAILURE:
      return { ...state, actionLoading: false, actionError: action.payload };

    // ============ AUDIT LOGS ============
    case actionTypes.FETCH_AUDIT_LOGS_REQUEST:
      return {
        ...state,
        auditLogs: { ...state.auditLogs, loading: true, error: null },
      };
    case actionTypes.FETCH_AUDIT_LOGS_SUCCESS:
      return {
        ...state,
        auditLogs: {
          ...state.auditLogs,
          list: action.payload.content || [],
          totalCount: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0,
          page: action.payload.currentPage || 0,
          size: action.payload.size || 20,
          loading: false,
        },
      };
    case actionTypes.FETCH_AUDIT_LOGS_FAILURE:
      return {
        ...state,
        auditLogs: { ...state.auditLogs, loading: false, error: action.payload },
      };

    case actionTypes.FETCH_AUDIT_STATS_REQUEST:
      return {
        ...state,
        auditLogs: { ...state.auditLogs, loading: true },
      };
    case actionTypes.FETCH_AUDIT_STATS_SUCCESS:
      return {
        ...state,
        auditLogs: { ...state.auditLogs, stats: action.payload, loading: false },
      };
    case actionTypes.FETCH_AUDIT_STATS_FAILURE:
      return {
        ...state,
        auditLogs: { ...state.auditLogs, loading: false, error: action.payload },
      };

    case actionTypes.FETCH_USER_AUDIT_LOGS_REQUEST:
      return {
        ...state,
        auditLogs: { ...state.auditLogs, loading: true, error: null },
      };
    case actionTypes.FETCH_USER_AUDIT_LOGS_SUCCESS:
      return {
        ...state,
        auditLogs: {
          ...state.auditLogs,
          list: action.payload.content || [],
          totalCount: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0,
          page: action.payload.currentPage || 0,
          loading: false,
        },
      };
    case actionTypes.FETCH_USER_AUDIT_LOGS_FAILURE:
      return {
        ...state,
        auditLogs: { ...state.auditLogs, loading: false, error: action.payload },
      };

    // ============ SETTINGS ============
    case actionTypes.FETCH_ADMIN_SETTINGS_REQUEST:
      return {
        ...state,
        settings: { ...state.settings, loading: true, error: null },
      };
    case actionTypes.FETCH_ADMIN_SETTINGS_SUCCESS:
      return {
        ...state,
        settings: { ...state.settings, data: action.payload, loading: false },
      };
    case actionTypes.FETCH_ADMIN_SETTINGS_FAILURE:
      return {
        ...state,
        settings: { ...state.settings, loading: false, error: action.payload },
      };

    case actionTypes.UPDATE_ADMIN_SETTINGS_REQUEST:
      return {
        ...state,
        settings: { ...state.settings, saving: true, error: null },
      };
    case actionTypes.UPDATE_ADMIN_SETTINGS_SUCCESS:
      return {
        ...state,
        settings: { ...state.settings, data: action.payload, saving: false },
      };
    case actionTypes.UPDATE_ADMIN_SETTINGS_FAILURE:
      return {
        ...state,
        settings: { ...state.settings, saving: false, error: action.payload },
      };

    // ============ GENERAL ============
    case actionTypes.CLEAR_ADMIN_ERROR:
      return {
        ...state,
        actionError: null,
        analytics: { ...state.analytics, error: null },
        users: { ...state.users, error: null },
        userStats: { ...state.userStats, error: null },
        roles: { ...state.roles, error: null },
        reports: { ...state.reports, error: null },
        auditLogs: { ...state.auditLogs, error: null },
        settings: { ...state.settings, error: null },
      };

    default:
      return state;
  }
};

export default adminReducer;
