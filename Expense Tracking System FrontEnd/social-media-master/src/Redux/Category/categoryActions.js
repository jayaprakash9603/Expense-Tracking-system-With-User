import axios from "axios";
import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  FETCH_CATEGORY_EXPENSES_REQUEST,
  UPDATE_CATEGORY_FAILURE,
  UPDATE_CATEGORY_IN_LIST,
  UPDATE_CATEGORY_REQUEST,
  FETCH_CATEGORY_EXPENSES_FAILURE,
  FETCH_CATEGORY_EXPENSES_SUCCESS,
  FETCH_CATEGORY_FAILURE,
  FETCH_CATEGORY_SUCCESS,
  FETCH_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  FETCH_CATEGORY_ANALYTICS_REQUEST,
  FETCH_CATEGORY_ANALYTICS_SUCCESS,
  FETCH_CATEGORY_ANALYTICS_FAILURE,
  CLEAR_CATEGORY_ANALYTICS,
} from "./categoryTypes";
import { api, API_BASE_URL } from "../../config/api"; // Import the api instance

export const fetchCategories = (targetId) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CATEGORIES_REQUEST });
    try {
      const response = await api.get("/api/categories", {
        params: {
          targetId: targetId || "",
        },
      });
      dispatch({ type: FETCH_CATEGORIES_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_CATEGORIES_FAILURE, payload: error.message });
    }
  };
};

export const fetchUncategorizedExpenses =
  (targetId) => async (dispatch, getState) => {
    dispatch({ type: "FETCH_UNCATEGORIZED_EXPENSES_REQUEST" });
    try {
      const token = getState().auth?.token;
      const response = await api.get("/api/categories/uncategorized", {
        params: {
          targetId: targetId || "",
        },
      });
      dispatch({
        type: "FETCH_UNCATEGORIZED_EXPENSES_SUCCESS",
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: "FETCH_UNCATEGORIZED_EXPENSES_FAILURE",
        payload: error.message,
      });
    }
  };

export const createCategory =
  (formData, targetId) => async (dispatch, getState) => {
    dispatch({ type: "CREATE_CATEGORY_REQUEST" });
    try {
      const token = getState().auth?.token;
      const response = await api.post("/api/categories", formData, {
        params: {
          targetId: targetId || "",
        },
      });
      dispatch({
        type: "CREATE_CATEGORY_SUCCESS",
        payload: response.data,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to create category";
      dispatch({
        type: "CREATE_CATEGORY_FAILURE",
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

export const fetchCategoryById =
  (categoryId, targetId) => async (dispatch, getState) => {
    try {
      dispatch({ type: FETCH_CATEGORY_REQUEST });

      const response = await api.get(`/api/categories/${categoryId}`, {
        params: {
          targetId: targetId || "",
        },
      });

      dispatch({
        type: FETCH_CATEGORY_SUCCESS,
        payload: response.data,
      });

      return response.data;
    } catch (error) {
      dispatch({
        type: FETCH_CATEGORY_FAILURE,
        payload: error.response?.data?.message || "Failed to fetch category",
      });
      return error;
    }
  };

// Action to update an existing category
export const updateCategory =
  (categoryId, categoryData, targetId) => async (dispatch, getState) => {
    try {
      dispatch({ type: UPDATE_CATEGORY_REQUEST });

      const response = await api.put(
        `/api/categories/${categoryId}`,
        categoryData,
        {
          params: {
            targetId: targetId || "",
          },
        },
      );

      dispatch({
        type: UPDATE_CATEGORY_SUCCESS,
        payload: response.data,
      });

      // Also update the category in the categories list
      dispatch({
        type: UPDATE_CATEGORY_IN_LIST,
        payload: response.data,
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to update category";
      dispatch({
        type: UPDATE_CATEGORY_FAILURE,
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

// Action to fetch expenses for a specific category
export const fetchCategoryExpenses =
  (categoryId, page = 1, size = 1000, targetId) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: FETCH_CATEGORY_EXPENSES_REQUEST });

      const response = await api.get(
        `/api/categories/${categoryId}/filtered-expenses`,
        {
          params: {
            targetId: targetId || "",
            page,
            size,
          },
        },
      );

      dispatch({
        type: FETCH_CATEGORY_EXPENSES_SUCCESS,
        payload: response.data,
      });

      return response.data;
    } catch (error) {
      dispatch({
        type: FETCH_CATEGORY_EXPENSES_FAILURE,
        payload:
          error.response?.data?.message || "Failed to fetch category expenses",
      });
      return error;
    }
  };

export const deleteCategory = (categoryId, targetId) => async (dispatch) => {
  console.log("testing friend id", targetId);
  try {
    await api.delete(`/api/categories/${categoryId}`, {
      params: {
        targetId: targetId || "", // Send targetId or default to an empty string
      },
    });

    dispatch({
      type: DELETE_CATEGORY_SUCCESS,
      payload: categoryId,
    });
  } catch (error) {
    dispatch({
      type: DELETE_CATEGORY_FAILURE,
      payload: error.message,
    });
  }
};

/**
 * Fetch comprehensive analytics for a specific category.
 * Returns all analytics data including trends, budgets, payments, transactions, and insights.
 *
 * @param {number} categoryId - The category ID to analyze
 * @param {Object} options - Query parameters
 * @param {string} options.startDate - Start date (YYYY-MM-DD)
 * @param {string} options.endDate - End date (YYYY-MM-DD)
 * @param {string} options.trendType - DAILY | WEEKLY | MONTHLY | YEARLY
 * @param {number} options.targetId - Optional target user ID for friend expense viewing
 */
export const fetchCategoryAnalytics =
  (categoryId, { startDate, endDate, trendType = "MONTHLY", targetId } = {}) =>
  async (dispatch) => {
    dispatch({ type: FETCH_CATEGORY_ANALYTICS_REQUEST });

    try {
      const params = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        trendType,
        ...(targetId && { targetId }),
      };

      const { data } = await api.get(`/api/analytics/categories/${categoryId}`, {
        params,
      });

      dispatch({
        type: FETCH_CATEGORY_ANALYTICS_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to fetch category analytics";

      dispatch({
        type: FETCH_CATEGORY_ANALYTICS_FAILURE,
        payload: errorMessage,
      });

      throw new Error(errorMessage);
    }
  };

/**
 * Clear category analytics from state
 */
export const clearCategoryAnalytics = () => ({
  type: CLEAR_CATEGORY_ANALYTICS,
});
