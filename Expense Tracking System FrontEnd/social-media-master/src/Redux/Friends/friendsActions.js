import { api } from "../../config/api";
import axios from "axios";
import {
  FETCH_FRIEND_SUGGESTIONS_REQUEST,
  FETCH_FRIEND_SUGGESTIONS_SUCCESS,
  FETCH_FRIEND_SUGGESTIONS_FAILURE,
  SEND_FRIEND_REQUEST_REQUEST,
  SEND_FRIEND_REQUEST_SUCCESS,
  SEND_FRIEND_REQUEST_FAILURE,
  FETCH_FRIEND_REQUESTS_REQUEST,
  FETCH_FRIEND_REQUESTS_SUCCESS,
  FETCH_FRIEND_REQUESTS_FAILURE,
  RESPOND_TO_FRIEND_REQUEST_REQUEST,
  RESPOND_TO_FRIEND_REQUEST_SUCCESS,
  RESPOND_TO_FRIEND_REQUEST_FAILURE,
  ADD_NEW_FRIEND_REQUEST,
  REMOVE_FRIEND_REQUEST,
  FETCH_FRIENDS_REQUEST,
  FETCH_FRIENDS_SUCCESS,
  FETCH_FRIENDS_FAILURE,
  SET_ACCESS_LEVEL_REQUEST,
  SET_ACCESS_LEVEL_SUCCESS,
  SET_ACCESS_LEVEL_FAILURE,
  FETCH_I_SHARED_WITH_REQUEST,
  FETCH_I_SHARED_WITH_SUCCESS,
  FETCH_I_SHARED_WITH_FAILURE,
  FETCH_SHARED_WITH_ME_REQUEST,
  FETCH_SHARED_WITH_ME_SUCCESS,
  FETCH_SHARED_WITH_ME_FAILURE,
  FETCH_FRIENDS_EXPENSES_SUCCESS,
  FETCH_FRIENDS_EXPENSES_FAILURE,
  FETCH_FRIENDSHIP_SUCCESS,
  FETCH_FRIENDSHIP_FAILURE,
} from "./friendsActionTypes";

// Fetch friend suggestions
export const fetchFriendSuggestions = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIEND_SUGGESTIONS_REQUEST });

  try {
    const response = await api.get("/api/friendships/suggestions");
    // console.log("Friend suggestions response:", response.data);

    dispatch({
      type: FETCH_FRIEND_SUGGESTIONS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching friend suggestions:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friend suggestions";

    dispatch({
      type: FETCH_FRIEND_SUGGESTIONS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Send friend request
export const sendFriendRequest = (recipientId) => async (dispatch) => {
  dispatch({ type: SEND_FRIEND_REQUEST_REQUEST });

  try {
    const response = await api.post(
      `/api/friendships/request?recipientId=${recipientId}`
    );
    console.log("Send friend request response:", response.data);

    dispatch({
      type: SEND_FRIEND_REQUEST_SUCCESS,
      payload: {
        friendship: response.data,
        recipientId: recipientId,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error sending friend request:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to send friend request";

    dispatch({
      type: SEND_FRIEND_REQUEST_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Fetch incoming friend requests
export const fetchFriendRequests = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIEND_REQUESTS_REQUEST });

  try {
    const response = await api.get("/api/friendships/pending/incoming");
    // console.log("Friend requests response:", response.data);

    dispatch({
      type: FETCH_FRIEND_REQUESTS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friend requests";

    dispatch({
      type: FETCH_FRIEND_REQUESTS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Fetch user's friends
export const fetchFriends = () => async (dispatch) => {
  dispatch({ type: FETCH_FRIENDS_REQUEST });

  try {
    const response = await api.get("/api/friendships/friends");
    // console.log("Friends response:", response.data);

    dispatch({
      type: FETCH_FRIENDS_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching friends:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch friends";

    dispatch({
      type: FETCH_FRIENDS_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Respond to friend request (accept/reject)
export const respondToFriendRequest =
  (friendshipId, accept) => async (dispatch) => {
    dispatch({ type: RESPOND_TO_FRIEND_REQUEST_REQUEST });

    try {
      // The accept parameter is already a boolean, so we don't need to convert it
      const response = await api.put(
        `/api/friendships/${friendshipId}/respond?accept=${accept}`
      );
      // console.log(
      //   `${accept ? "Accept" : "Reject"} friend request response:`,
      //   response.data
      // );

      dispatch({
        type: RESPOND_TO_FRIEND_REQUEST_SUCCESS,
        payload: {
          friendshipId,
          accept,
          response: response.data,
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        `Error ${accept ? "accepting" : "rejecting"} friend request:`,
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${accept ? "accept" : "reject"} friend request`;

      dispatch({
        type: RESPOND_TO_FRIEND_REQUEST_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

// Add this new action
export const addNewFriendRequest = (friendship) => (dispatch) => {
  dispatch({
    type: ADD_NEW_FRIEND_REQUEST,
    payload: friendship,
  });
};

// Remove friend request from Redux store
export const removeFriendRequest = (friendshipId) => (dispatch) => {
  dispatch({
    type: REMOVE_FRIEND_REQUEST,
    payload: friendshipId,
  });
};

// Set access level for a friendship
export const setAccessLevel =
  (friendshipId, accessLevel) => async (dispatch) => {
    dispatch({ type: SET_ACCESS_LEVEL_REQUEST });

    try {
      const response = await api.put(
        `/api/friendships/${friendshipId}/access?accessLevel=${accessLevel}`
      );
      // console.log("Set access level response:", response.data);

      dispatch({
        type: SET_ACCESS_LEVEL_SUCCESS,
        payload: {
          friendship: response.data,
          friendshipId: friendshipId,
          accessLevel: accessLevel,
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error setting access level:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to set access level";

      dispatch({
        type: SET_ACCESS_LEVEL_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

// Fetch users I've shared expenses with
export const fetchISharedWith = () => async (dispatch) => {
  dispatch({ type: FETCH_I_SHARED_WITH_REQUEST });

  try {
    const response = await api.get("/api/friendships/i-shared-with");
    // console.log("I shared with response:", response.data);

    dispatch({
      type: FETCH_I_SHARED_WITH_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching users I shared with:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch users you've shared with";

    dispatch({
      type: FETCH_I_SHARED_WITH_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Fetch users who have shared expenses with me
export const fetchSharedWithMe = () => async (dispatch) => {
  dispatch({ type: FETCH_SHARED_WITH_ME_REQUEST });

  try {
    const response = await api.get("/api/friendships/shared-with-me");
    // console.log("Shared with me response:", response.data);

    dispatch({
      type: FETCH_SHARED_WITH_ME_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching users who shared with me:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch users who shared with you";

    dispatch({
      type: FETCH_SHARED_WITH_ME_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

// Fetch friends' expenses
export const fetchFriendsExpenses = (userId) => async (dispatch) => {
  try {
    const response = await api.get(`api/expenses/user/${userId}`);

    dispatch({
      type: FETCH_FRIENDS_EXPENSES_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_FRIENDS_EXPENSES_FAILURE,
      payload: error.message,
    });
  }
};

export const fetchFriendship = (friendId) => async (dispatch) => {
  try {
    const response = await api.get(`/api/friendships/details`, {
      params: {
        friendId: friendId,
      },
    });

    dispatch({
      type: FETCH_FRIENDSHIP_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_FRIENDSHIP_FAILURE,
      payload: error.message,
    });
  }
};

export const fetchFriendsDetailed = () => async (dispatch) => {
  try {
    const response = await api.get("/api/friendships/friends/detailed");
    dispatch({
      type: FETCH_FRIENDS_SUCCESS, // Ensure this matches the constant
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_FRIENDS_FAILURE, // Ensure this matches the constant
      payload: error.response?.data?.message || error.message,
    });
  }
};
