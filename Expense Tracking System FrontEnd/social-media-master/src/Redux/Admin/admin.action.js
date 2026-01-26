import { api } from "../../config/api";
import * as actionTypes from "./admin.actionTypes";

// ============ ANALYTICS ACTIONS ============

/**
 * Fetch admin analytics overview (system-wide stats)
 * @param {string} timeRange - Time range filter: '24h', '7d', '30d', '90d', '1y'
 */
export const fetchAdminAnalytics =
  (timeRange = "7d") =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_ADMIN_ANALYTICS_REQUEST });
    try {
      const { data } = await api.get(
        `/api/admin/analytics/overview?timeRange=${timeRange}`,
      );
      dispatch({
        type: actionTypes.FETCH_ADMIN_ANALYTICS_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch analytics";
      dispatch({
        type: actionTypes.FETCH_ADMIN_ANALYTICS_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

/**
 * Fetch top expense categories across all users
 */
export const fetchTopCategories =
  (timeRange = "7d", limit = 5) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_TOP_CATEGORIES_REQUEST });
    try {
      const { data } = await api.get(
        `/api/admin/analytics/top-categories?timeRange=${timeRange}&limit=${limit}`,
      );
      dispatch({
        type: actionTypes.FETCH_TOP_CATEGORIES_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch top categories";
      dispatch({
        type: actionTypes.FETCH_TOP_CATEGORIES_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

/**
 * Fetch recent system activity
 */
export const fetchRecentActivity =
  (hours = 1) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_RECENT_ACTIVITY_REQUEST });
    try {
      const { data } = await api.get(
        `/api/admin/analytics/recent-activity?hours=${hours}`,
      );
      dispatch({
        type: actionTypes.FETCH_RECENT_ACTIVITY_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch recent activity";
      dispatch({
        type: actionTypes.FETCH_RECENT_ACTIVITY_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

/**
 * Fetch top users by expense activity
 */
export const fetchTopUsers =
  (timeRange = "7d", limit = 5) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_TOP_USERS_REQUEST });
    try {
      const { data } = await api.get(
        `/api/admin/analytics/top-users?timeRange=${timeRange}&limit=${limit}`,
      );
      dispatch({
        type: actionTypes.FETCH_TOP_USERS_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch top users";
      dispatch({
        type: actionTypes.FETCH_TOP_USERS_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

/**
 * Fetch all dashboard analytics in a single call
 * Uses the /dashboard endpoint which returns all analytics data
 */
export const fetchDashboardAnalytics =
  (timeRange = "7d") =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_ADMIN_ANALYTICS_REQUEST });
    dispatch({ type: actionTypes.FETCH_TOP_CATEGORIES_REQUEST });
    dispatch({ type: actionTypes.FETCH_RECENT_ACTIVITY_REQUEST });
    dispatch({ type: actionTypes.FETCH_TOP_USERS_REQUEST });

    try {
      const { data } = await api.get(
        `/api/admin/analytics/dashboard?timeRange=${timeRange}`,
      );

      // Dispatch individual success actions for each data type
      if (data.overview) {
        dispatch({
          type: actionTypes.FETCH_ADMIN_ANALYTICS_SUCCESS,
          payload: data.overview,
        });
      }

      if (data.topCategories) {
        dispatch({
          type: actionTypes.FETCH_TOP_CATEGORIES_SUCCESS,
          payload: data.topCategories,
        });
      }

      if (data.recentActivity) {
        dispatch({
          type: actionTypes.FETCH_RECENT_ACTIVITY_SUCCESS,
          payload: data.recentActivity,
        });
      }

      if (data.topUsers) {
        dispatch({
          type: actionTypes.FETCH_TOP_USERS_SUCCESS,
          payload: data.topUsers,
        });
      }

      if (data.userStats) {
        dispatch({
          type: actionTypes.FETCH_USER_STATS_SUCCESS,
          payload: data.userStats,
        });
      }

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch dashboard analytics";
      dispatch({
        type: actionTypes.FETCH_ADMIN_ANALYTICS_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

/**
 * Set analytics time range filter
 */
export const setAnalyticsTimeRange = (timeRange) => ({
  type: actionTypes.SET_ANALYTICS_TIME_RANGE,
  payload: timeRange,
});

// ============ USER MANAGEMENT ACTIONS ============

/**
 * Fetch all users (admin only)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (0-indexed)
 * @param {number} params.size - Page size
 * @param {string} params.search - Search query
 * @param {string} params.status - Status filter
 * @param {string} params.role - Role filter
 */
export const fetchAllUsers =
  (params = {}) =>
  async (dispatch) => {
    const {
      page = 0,
      size = 20,
      search = null,
      status = null,
      role = null,
    } = params;

    dispatch({ type: actionTypes.FETCH_ALL_USERS_REQUEST });
    try {
      let url = `/api/admin/users?page=${page}&size=${size}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${status}`;
      if (role) url += `&role=${role}`;

      const { data } = await api.get(url);
      dispatch({
        type: actionTypes.FETCH_ALL_USERS_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch users";
      dispatch({
        type: actionTypes.FETCH_ALL_USERS_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

/**
 * Fetch user statistics
 */
export const fetchUserStats = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_USER_STATS_REQUEST });
  try {
    const { data } = await api.get("/api/admin/users/stats");
    dispatch({
      type: actionTypes.FETCH_USER_STATS_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch user stats";
    dispatch({
      type: actionTypes.FETCH_USER_STATS_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Update user status (active, inactive, suspended)
 */
export const updateUserStatus = (userId, status) => async (dispatch) => {
  dispatch({ type: actionTypes.UPDATE_USER_STATUS_REQUEST });
  try {
    const { data } = await api.put(`/api/admin/users/${userId}/status`, {
      status,
    });
    dispatch({
      type: actionTypes.UPDATE_USER_STATUS_SUCCESS,
      payload: { userId, status, user: data },
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update user status";
    dispatch({
      type: actionTypes.UPDATE_USER_STATUS_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = (userId) => async (dispatch) => {
  dispatch({ type: actionTypes.DELETE_USER_REQUEST });
  try {
    await api.delete(`/api/admin/users/${userId}`);
    dispatch({
      type: actionTypes.DELETE_USER_SUCCESS,
      payload: userId,
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete user";
    dispatch({
      type: actionTypes.DELETE_USER_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Bulk action on users
 */
export const bulkUserAction = (userIds, action) => async (dispatch) => {
  dispatch({ type: actionTypes.BULK_USER_ACTION_REQUEST });
  try {
    const { data } = await api.post("/api/admin/users/bulk-action", {
      userIds,
      action,
    });
    dispatch({
      type: actionTypes.BULK_USER_ACTION_SUCCESS,
      payload: { userIds, action, result: data },
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to perform bulk action";
    dispatch({
      type: actionTypes.BULK_USER_ACTION_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

// ============ ROLE MANAGEMENT ACTIONS ============

/**
 * Fetch all roles
 */
export const fetchAllRoles = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_ALL_ROLES_REQUEST });
  try {
    const { data } = await api.get("/api/roles");
    dispatch({
      type: actionTypes.FETCH_ALL_ROLES_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch roles";
    dispatch({
      type: actionTypes.FETCH_ALL_ROLES_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Create new role
 */
export const createRole = (roleData) => async (dispatch) => {
  dispatch({ type: actionTypes.CREATE_ROLE_REQUEST });
  try {
    const { data } = await api.post("/api/roles", roleData);
    dispatch({
      type: actionTypes.CREATE_ROLE_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to create role";
    dispatch({
      type: actionTypes.CREATE_ROLE_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Update role
 */
export const updateRole = (roleId, roleData) => async (dispatch) => {
  dispatch({ type: actionTypes.UPDATE_ROLE_REQUEST });
  try {
    const { data } = await api.put(`/api/roles/${roleId}`, roleData);
    dispatch({
      type: actionTypes.UPDATE_ROLE_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update role";
    dispatch({
      type: actionTypes.UPDATE_ROLE_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Delete role
 */
export const deleteRole = (roleId) => async (dispatch) => {
  dispatch({ type: actionTypes.DELETE_ROLE_REQUEST });
  try {
    await api.delete(`/api/roles/${roleId}`);
    dispatch({
      type: actionTypes.DELETE_ROLE_SUCCESS,
      payload: roleId,
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete role";
    dispatch({
      type: actionTypes.DELETE_ROLE_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Assign role to user
 */
export const assignRoleToUser = (userId, roleId) => async (dispatch) => {
  dispatch({ type: actionTypes.ASSIGN_ROLE_TO_USER_REQUEST });
  try {
    const { data } = await api.post(`/api/user/${userId}/roles/${roleId}`);
    dispatch({
      type: actionTypes.ASSIGN_ROLE_TO_USER_SUCCESS,
      payload: { userId, roleId, user: data },
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to assign role";
    dispatch({
      type: actionTypes.ASSIGN_ROLE_TO_USER_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = (userId, roleId) => async (dispatch) => {
  dispatch({ type: actionTypes.REMOVE_ROLE_FROM_USER_REQUEST });
  try {
    const { data } = await api.delete(`/api/user/${userId}/roles/${roleId}`);
    dispatch({
      type: actionTypes.REMOVE_ROLE_FROM_USER_SUCCESS,
      payload: { userId, roleId, user: data },
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to remove role";
    dispatch({
      type: actionTypes.REMOVE_ROLE_FROM_USER_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

// ============ REPORTS ACTIONS ============

/**
 * Fetch all admin reports
 */
export const fetchAdminReports =
  (page = 0, size = 20) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_ADMIN_REPORTS_REQUEST });
    try {
      const { data } = await api.get(
        `/api/admin/reports?page=${page}&size=${size}`,
      );
      dispatch({
        type: actionTypes.FETCH_ADMIN_REPORTS_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch reports";
      dispatch({
        type: actionTypes.FETCH_ADMIN_REPORTS_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

/**
 * Generate a new report
 */
export const generateReport = (reportConfig) => async (dispatch) => {
  dispatch({ type: actionTypes.GENERATE_REPORT_REQUEST });
  try {
    const { data } = await api.post(
      "/api/admin/reports/generate",
      reportConfig,
    );
    dispatch({
      type: actionTypes.GENERATE_REPORT_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to generate report";
    dispatch({
      type: actionTypes.GENERATE_REPORT_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Delete a report
 */
export const deleteReport = (reportId) => async (dispatch) => {
  dispatch({ type: actionTypes.DELETE_REPORT_REQUEST });
  try {
    await api.delete(`/api/admin/reports/${reportId}`);
    dispatch({
      type: actionTypes.DELETE_REPORT_SUCCESS,
      payload: reportId,
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete report";
    dispatch({
      type: actionTypes.DELETE_REPORT_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

// ============ AUDIT LOGS ACTIONS ============

/**
 * Fetch audit logs with pagination and filters
 */
export const fetchAuditLogs =
  ({ page = 0, size = 20, search, actionType, timeRange = "7d" } = {}) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_AUDIT_LOGS_REQUEST });
    try {
      let url = `/api/admin/audit-logs?page=${page}&size=${size}&timeRange=${timeRange}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (actionType && actionType !== "all")
        url += `&actionType=${actionType}`;

      const { data } = await api.get(url);
      dispatch({
        type: actionTypes.FETCH_AUDIT_LOGS_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch audit logs";
      dispatch({
        type: actionTypes.FETCH_AUDIT_LOGS_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

/**
 * Fetch audit log statistics
 */
export const fetchAuditStats =
  (timeRange = "7d") =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_AUDIT_STATS_REQUEST });
    try {
      const { data } = await api.get(
        `/api/admin/audit-logs/stats?timeRange=${timeRange}`,
      );
      dispatch({
        type: actionTypes.FETCH_AUDIT_STATS_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch audit stats";
      dispatch({
        type: actionTypes.FETCH_AUDIT_STATS_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

/**
 * Fetch audit logs for a specific user
 */
export const fetchUserAuditLogs =
  (userId, { page = 0, size = 20 } = {}) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_USER_AUDIT_LOGS_REQUEST });
    try {
      const { data } = await api.get(
        `/api/admin/audit-logs/user/${userId}?page=${page}&size=${size}`,
      );
      dispatch({
        type: actionTypes.FETCH_USER_AUDIT_LOGS_SUCCESS,
        payload: { userId, ...data },
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch user audit logs";
      dispatch({
        type: actionTypes.FETCH_USER_AUDIT_LOGS_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

// ============ SETTINGS ACTIONS ============

/**
 * Fetch admin settings
 */
export const fetchAdminSettings = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_ADMIN_SETTINGS_REQUEST });
  try {
    const { data } = await api.get("/api/admin/settings");
    dispatch({
      type: actionTypes.FETCH_ADMIN_SETTINGS_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch settings";
    dispatch({
      type: actionTypes.FETCH_ADMIN_SETTINGS_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Update admin settings
 */
export const updateAdminSettings = (settings) => async (dispatch) => {
  dispatch({ type: actionTypes.UPDATE_ADMIN_SETTINGS_REQUEST });
  try {
    const { data } = await api.put("/api/admin/settings", settings);
    dispatch({
      type: actionTypes.UPDATE_ADMIN_SETTINGS_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update settings";
    dispatch({
      type: actionTypes.UPDATE_ADMIN_SETTINGS_FAILURE,
      payload: errorMessage,
    });
    throw error;
  }
};

/**
 * Clear admin errors
 */
export const clearAdminError = () => ({
  type: actionTypes.CLEAR_ADMIN_ERROR,
});
