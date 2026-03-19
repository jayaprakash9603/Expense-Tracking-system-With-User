import { friendApi } from "@/infrastructure/api";
import {
  FETCH_FRIENDS_REQUEST,
  FETCH_FRIENDS_SUCCESS,
  FETCH_FRIENDS_FAILURE,
  SEND_FRIEND_REQUEST_SUCCESS,
  ACCEPT_FRIEND_REQUEST_SUCCESS,
  REJECT_FRIEND_REQUEST_SUCCESS,
  REMOVE_FRIEND_SUCCESS,
  FETCH_FRIEND_REQUESTS_REQUEST,
  FETCH_FRIEND_REQUESTS_SUCCESS,
  FETCH_FRIEND_REQUESTS_FAILURE,
  CLEAR_FRIEND_ERROR,
  RESET_FRIEND_STATE,
} from "./friends.actionTypes";

export const fetchFriendsAction = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIENDS_REQUEST });
  const { data, error } = await friendApi.getAll();
  if (error) {
    dispatch({ type: FETCH_FRIENDS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_FRIENDS_SUCCESS, payload: data });
  return { success: true, data };
};

export const sendFriendRequestAction = (requestData) => async (dispatch) => {
  const { data, error } = await friendApi.sendRequest(requestData);
  if (error) return { success: false, error };
  dispatch({ type: SEND_FRIEND_REQUEST_SUCCESS, payload: data });
  return { success: true, data };
};

export const acceptFriendRequestAction = (id) => async (dispatch) => {
  const { data, error } = await friendApi.respondToRequest(id, true);
  if (error) return { success: false, error };
  dispatch({ type: ACCEPT_FRIEND_REQUEST_SUCCESS, payload: { id, data } });
  return { success: true, data };
};

export const rejectFriendRequestAction = (id) => async (dispatch) => {
  const { error } = await friendApi.respondToRequest(id, false);
  if (error) return { success: false, error };
  dispatch({ type: REJECT_FRIEND_REQUEST_SUCCESS, payload: id });
  return { success: true };
};

export const removeFriendAction = (id) => async (dispatch) => {
  const { error } = await friendApi.remove(id);
  if (error) return { success: false, error };
  dispatch({ type: REMOVE_FRIEND_SUCCESS, payload: id });
  return { success: true };
};

export const fetchFriendRequestsAction = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIEND_REQUESTS_REQUEST });
  const { data, error } = await friendApi.getIncomingRequests();
  if (error) {
    dispatch({ type: FETCH_FRIEND_REQUESTS_FAILURE, payload: error.message });
    return { success: false, error };
  }
  dispatch({ type: FETCH_FRIEND_REQUESTS_SUCCESS, payload: data });
  return { success: true, data };
};

export const clearFriendError = () => ({ type: CLEAR_FRIEND_ERROR });
export const resetFriendState = () => ({ type: RESET_FRIEND_STATE });
