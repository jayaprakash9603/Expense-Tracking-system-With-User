import { shareApi } from "@/infrastructure/api";
import {
  FETCH_SHARES_REQUEST,
  FETCH_SHARES_SUCCESS,
  FETCH_SHARES_FAILURE,
  CREATE_SHARE_SUCCESS,
  REVOKE_SHARE_SUCCESS,
  FETCH_SHARE_STATS_REQUEST,
  FETCH_SHARE_STATS_SUCCESS,
  FETCH_SHARE_STATS_FAILURE,
  CLEAR_SHARE_ERROR,
  RESET_SHARE_STATE,
} from "./shares.actionTypes";

export const fetchSharesAction = () => async (dispatch) => {
  dispatch({ type: FETCH_SHARES_REQUEST });
  const { data, error } = await shareApi.getMyShares();
  if (error) {
    dispatch({ type: FETCH_SHARES_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_SHARES_SUCCESS, payload: data });
  return { success: true, data };
};

export const createShareAction = (data) => async (dispatch) => {
  const { data: result, error } = await shareApi.create(data);
  if (error) return { success: false, error };
  dispatch({ type: CREATE_SHARE_SUCCESS, payload: result });
  return { success: true, data: result };
};

export const revokeShareAction = (token) => async (dispatch) => {
  const { error } = await shareApi.revoke(token);
  if (error) return { success: false, error };
  dispatch({ type: REVOKE_SHARE_SUCCESS, payload: token });
  return { success: true };
};

export const fetchShareStatsAction = () => async (dispatch) => {
  dispatch({ type: FETCH_SHARE_STATS_REQUEST });
  const { data, error } = await shareApi.getStats();
  if (error) {
    dispatch({ type: FETCH_SHARE_STATS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_SHARE_STATS_SUCCESS, payload: data });
  return { success: true, data };
};

export const clearShareError = () => ({ type: CLEAR_SHARE_ERROR });
export const resetShareState = () => ({ type: RESET_SHARE_STATE });
