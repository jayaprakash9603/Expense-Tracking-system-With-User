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
} from "./categoryTypes";
import { api, API_BASE_URL } from "../../config/api"; // Import the api instance

const token = localStorage.getItem("jwt");
export const fetchCategories = () => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CATEGORIES_REQUEST });
    try {
      const response = await api.get("/api/categories"); // Use the api instance for dynamic URL handling
      dispatch({ type: FETCH_CATEGORIES_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_CATEGORIES_FAILURE, payload: error.message });
    }
  };
};

export const fetchUncategorizedExpenses = () => async (dispatch, getState) => {
  dispatch({ type: "FETCH_UNCATEGORIZED_EXPENSES_REQUEST" });
  try {
    const token = getState().auth?.token;
    const response = await api.get("/api/categories/uncategorized", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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

export const createCategory = (formData) => async (dispatch, getState) => {
  dispatch({ type: "CREATE_CATEGORY_REQUEST" });
  try {
    const token = getState().auth?.token;
    const response = await api.post("/api/categories", formData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    dispatch({
      type: "CREATE_CATEGORY_SUCCESS",
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: "CREATE_CATEGORY_FAILURE",
      payload: error.message,
    });
  }
};

export const fetchCategoryById = (categoryId) => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_CATEGORY_REQUEST });

    console.log("token: ", token);
    const response = await axios.get(
      `${API_BASE_URL}/api/categories/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
    throw error;
  }
};

// Action to update an existing category
export const updateCategory =
  (categoryId, categoryData) => async (dispatch, getState) => {
    try {
      dispatch({ type: UPDATE_CATEGORY_REQUEST });

      const response = await axios.put(
        `${API_BASE_URL}/api/categories/${categoryId}`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
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
      dispatch({
        type: UPDATE_CATEGORY_FAILURE,
        payload: error.response?.data?.message || "Failed to update category",
      });
      throw error;
    }
  };

// Action to fetch expenses for a specific category
export const fetchCategoryExpenses =
  (categoryId, page = 1, size = 1000) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: FETCH_CATEGORY_EXPENSES_REQUEST });

      const response = await axios.get(
        `${API_BASE_URL}/api/categories/${categoryId}/expenses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
      throw error;
    }
  };

export const deleteCategory = (categoryId) => async (dispatch) => {
  try {
    const token = localStorage.getItem("jwt");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await axios.delete(
      `http://localhost:8080/api/categories/${categoryId}`,
      config
    );

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
