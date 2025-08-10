import { api } from "../../config/api";
import {
  FETCH_ALL_GROUPS_FAILURE,
  FETCH_ALL_GROUPS_REQUEST,
  FETCH_ALL_GROUPS_SUCCESS,
  FETCH_GROUP_RECOMMENDATIONS_FAILURE,
  FETCH_GROUP_RECOMMENDATIONS_REQUEST,
  FETCH_GROUP_RECOMMENDATIONS_SUCCESS,
  FETCH_PENDING_INVITATIONS_FAILURE,
  FETCH_PENDING_INVITATIONS_REQUEST,
  FETCH_PENDING_INVITATIONS_SUCCESS,
  FETCH_USER_GROUPS_FAILURE,
  FETCH_USER_GROUPS_REQUEST,
  FETCH_USER_GROUPS_SUCCESS,
  LEAVE_GROUP_FAILURE,
  LEAVE_GROUP_REQUEST,
  LEAVE_GROUP_SUCCESS,
  RESPOND_INVITATION_FAILURE,
  RESPOND_INVITATION_REQUEST,
  RESPOND_INVITATION_SUCCESS,
} from "./groupsActionTypes";

export const CREATE_GROUP_REQUEST = "CREATE_GROUP_REQUEST";
export const CREATE_GROUP_SUCCESS = "CREATE_GROUP_SUCCESS";
export const CREATE_GROUP_FAILURE = "CREATE_GROUP_FAILURE";

export const createGroup = (groupData) => async (dispatch) => {
  dispatch({ type: CREATE_GROUP_REQUEST });
  try {
    const response = await api.post("/api/groups", groupData);
    dispatch({
      type: CREATE_GROUP_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to create group";
    dispatch({
      type: CREATE_GROUP_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

export const fetchPendingInvitations = () => async (dispatch) => {
  dispatch({ type: FETCH_PENDING_INVITATIONS_REQUEST });
  try {
    const response = await api.get("/api/groups/invitations/pending");
    dispatch({
      type: FETCH_PENDING_INVITATIONS_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to Get Invitations data";
    dispatch({
      type: FETCH_PENDING_INVITATIONS_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

export const fetchGroupRecommendations = () => async (dispatch) => {
  dispatch({ type: FETCH_GROUP_RECOMMENDATIONS_REQUEST });
  try {
    const response = await api.get("/api/groups/recommendations");
    dispatch({
      type: FETCH_GROUP_RECOMMENDATIONS_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to Get Group Recommendations";
    dispatch({
      type: FETCH_GROUP_RECOMMENDATIONS_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

// Fetch all groups created by the user
export const fetchUserGroups = () => async (dispatch) => {
  dispatch({ type: FETCH_USER_GROUPS_REQUEST });
  try {
    const response = await api.get("/api/groups/created");
    dispatch({
      type: FETCH_USER_GROUPS_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch user groups";
    dispatch({
      type: FETCH_USER_GROUPS_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

export const fetchAllGroups = () => async (dispatch) => {
  dispatch({ type: FETCH_ALL_GROUPS_REQUEST });
  try {
    const response = await api.get("/api/groups");
    dispatch({
      type: FETCH_ALL_GROUPS_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch all groups";
    dispatch({
      type: FETCH_ALL_GROUPS_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

export const respondToInvitation =
  (invitationId, accept) => async (dispatch) => {
    dispatch({ type: RESPOND_INVITATION_REQUEST });
    try {
      const response = await api.put(
        `/api/groups/invitations/${invitationId}/respond?accept=${accept}`
      );
      dispatch({
        type: RESPOND_INVITATION_SUCCESS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to respond to invitation";
      dispatch({
        type: RESPOND_INVITATION_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

export const leaveGroup = (groupId) => async (dispatch) => {
  dispatch({ type: LEAVE_GROUP_REQUEST });

  try {
    const response = await api.post(`/api/groups/${groupId}/leave`);
    dispatch({
      type: LEAVE_GROUP_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to leave group";
    dispatch({
      type: LEAVE_GROUP_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};
