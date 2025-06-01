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
