import axios from "axios";
import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
} from "./categoryTypes";
import { api } from "../../config/api"; // Import the api instance

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
