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
  GET_GROUP_BY_ID_FAILURE,
  GET_GROUP_BY_ID_REQUEST,
  GET_GROUP_BY_ID_SUCCESS,
  LEAVE_GROUP_FAILURE,
  LEAVE_GROUP_REQUEST,
  LEAVE_GROUP_SUCCESS,
  RESPOND_INVITATION_FAILURE,
  RESPOND_INVITATION_REQUEST,
  RESPOND_INVITATION_SUCCESS,
  FETCH_FRIENDS_NOT_IN_GROUP_REQUEST,
  FETCH_FRIENDS_NOT_IN_GROUP_SUCCESS,
  FETCH_FRIENDS_NOT_IN_GROUP_FAILURE,
  INVITE_FRIEND_TO_GROUP_REQUEST,
  INVITE_FRIEND_TO_GROUP_SUCCESS,
  INVITE_FRIEND_TO_GROUP_FAILURE,
  FETCH_SENT_INVITATIONS_REQUEST,
  FETCH_SENT_INVITATIONS_SUCCESS,
  FETCH_SENT_INVITATIONS_FAILURE,
  CANCEL_INVITATION_REQUEST,
  CANCEL_INVITATION_SUCCESS,
  CANCEL_INVITATION_FAILURE,
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

export const getGroupById = (id) => async (dispatch) => {
  dispatch({ type: GET_GROUP_BY_ID_REQUEST });
  try {
    const response = await api.get(`/api/groups/${id}`);
    dispatch({
      type: GET_GROUP_BY_ID_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to get group";
    dispatch({
      type: GET_GROUP_BY_ID_FAILURE,
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

export const fetchFriendsNotInGroup = (groupId) => async (dispatch) => {
  dispatch({ type: FETCH_FRIENDS_NOT_IN_GROUP_REQUEST });
  try {
    const response = await api.get(
      `/api/groups/${groupId}/friends-not-in-group`
    );
    dispatch({
      type: FETCH_FRIENDS_NOT_IN_GROUP_SUCCESS,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friends not in group";
    dispatch({
      type: FETCH_FRIENDS_NOT_IN_GROUP_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};
export const inviteFriendToGroup =
  (groupId, userId, role, message) => async (dispatch, getState) => {
    dispatch({ type: INVITE_FRIEND_TO_GROUP_REQUEST });
    try {
      // Get token from state if needed, or rely on axios interceptor
      const payload = { userId, role, message };
      const response = await api.post(`/api/groups/${groupId}/invite`, payload);
      dispatch({
        type: INVITE_FRIEND_TO_GROUP_SUCCESS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to invite friend to group";
      dispatch({
        type: INVITE_FRIEND_TO_GROUP_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

export const fetchSentInvitations = (groupId) => async (dispatch) => {
  dispatch({ type: FETCH_SENT_INVITATIONS_REQUEST });
  try {
    const response = await api.get(`/api/groups/${groupId}/invitations/sent`);
    dispatch({
      type: FETCH_SENT_INVITATIONS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_SENT_INVITATIONS_FAILURE,
      payload: error.response?.data?.error || error.message,
    });
  }
};

export const cancelInvitation = (invitationId) => async (dispatch) => {
  dispatch({ type: CANCEL_INVITATION_REQUEST });
  try {
    const response = await api.put(
      `/api/groups/invitations/${invitationId}/cancel`
    );
    dispatch({
      type: CANCEL_INVITATION_SUCCESS,
      payload: { invitationId, ...response.data },
    });
  } catch (error) {
    dispatch({
      type: CANCEL_INVITATION_FAILURE,
      payload: error.response?.data?.error || error.message,
    });
  }
};
