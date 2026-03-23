import { categoryApi } from "@/infrastructure/api";
import { fetchCategoriesAction } from "./categories.slice";
import {
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  FETCH_CATEGORY_FLOW_REQUEST,
  FETCH_CATEGORY_FLOW_SUCCESS,
  FETCH_CATEGORY_FLOW_FAILURE,
  FETCH_CATEGORY_REQUEST,
  FETCH_CATEGORY_SUCCESS,
  FETCH_CATEGORY_FAILURE,
  CLEAR_CATEGORY_ERROR,
  RESET_CATEGORY_STATE,
} from "./categories.actionTypes";

export { fetchCategoriesAction };

export const createCategoryAction = (categoryData) => async (dispatch) => {
  dispatch({ type: CREATE_CATEGORY_REQUEST });
  const { data, error } = await categoryApi.create(categoryData);
  if (error) {
    dispatch({ type: CREATE_CATEGORY_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: CREATE_CATEGORY_SUCCESS, payload: data });
  return { success: true, data };
};

export const updateCategoryAction = (id, categoryData) => async (dispatch) => {
  dispatch({ type: UPDATE_CATEGORY_REQUEST });
  const { data, error } = await categoryApi.update(id, categoryData);
  if (error) {
    dispatch({ type: UPDATE_CATEGORY_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: UPDATE_CATEGORY_SUCCESS, payload: data });
  return { success: true, data };
};

export const deleteCategoryAction = (id) => async (dispatch) => {
  dispatch({ type: DELETE_CATEGORY_REQUEST });
  const { data, error } = await categoryApi.delete(id);
  if (error) {
    dispatch({ type: DELETE_CATEGORY_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: DELETE_CATEGORY_SUCCESS, payload: id });
  return { success: true, data };
};

export const fetchCategoryByIdAction = (id) => async (dispatch) => {
  dispatch({ type: FETCH_CATEGORY_REQUEST });
  const { data, error } = await categoryApi.getById(id);
  if (error) {
    dispatch({ type: FETCH_CATEGORY_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_CATEGORY_SUCCESS, payload: data });
  return { success: true, data };
};

export const fetchCategoryFlowAction = (params) => async (dispatch) => {
  dispatch({ type: FETCH_CATEGORY_FLOW_REQUEST });
  const { data, error } = await categoryApi.getFlow(params);
  if (error) {
    dispatch({ type: FETCH_CATEGORY_FLOW_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_CATEGORY_FLOW_SUCCESS, payload: data });
  return { success: true, data };
};

export const clearCategoryError = () => ({ type: CLEAR_CATEGORY_ERROR });
export const resetCategoryState = () => ({ type: RESET_CATEGORY_STATE });
