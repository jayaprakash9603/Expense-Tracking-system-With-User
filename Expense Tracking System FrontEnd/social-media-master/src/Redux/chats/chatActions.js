import axios from "axios";
import {
  SEND_GROUP_CHAT,
  SEND_GROUP_CHAT_SUCCESS,
  SEND_GROUP_CHAT_FAILURE,
  FETCH_GROUP_CHAT,
  FETCH_GROUP_CHAT_SUCCESS,
  FETCH_GROUP_CHAT_FAILURE,
  DELETE_CHAT_MESSAGE,
  DELETE_CHAT_MESSAGE_SUCCESS,
  DELETE_CHAT_MESSAGE_FAILURE,
  EDIT_CHAT_MESSAGE,
  EDIT_CHAT_MESSAGE_SUCCESS,
  EDIT_CHAT_MESSAGE_FAILURE,
  BULK_DELETE_CHAT_MESSAGES,
  BULK_DELETE_CHAT_MESSAGES_SUCCESS,
  BULK_DELETE_CHAT_MESSAGES_FAILURE,
  FETCH_UNREAD_GROUP_CHAT,
  FETCH_UNREAD_GROUP_CHAT_SUCCESS,
  FETCH_UNREAD_GROUP_CHAT_FAILURE,
  REPLY_CHAT,
  REPLY_CHAT_SUCCESS,
  REPLY_CHAT_FAILURE,
} from "./chatActionTypes";
import { api } from "../../config/api";

export const sendGroupChat = (groupId, content) => async (dispatch) => {
  dispatch({ type: SEND_GROUP_CHAT });
  try {
    const response = await api.post("/api/chats/group", { groupId, content });
    dispatch({ type: SEND_GROUP_CHAT_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: SEND_GROUP_CHAT_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const fetchGroupChat = (groupId) => async (dispatch) => {
  dispatch({ type: FETCH_GROUP_CHAT });
  try {
    const response = await api.get(`/api/chats/group/${groupId}`, {});
    dispatch({ type: FETCH_GROUP_CHAT_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: FETCH_GROUP_CHAT_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const fetchGroupChatHistory = (groupId, token) => async (dispatch) => {
  dispatch({ type: "FETCH_GROUP_CHAT_HISTORY" });
  try {
    const response = await api.get(`/api/chats/history/group/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    dispatch({
      type: "FETCH_GROUP_CHAT_HISTORY_SUCCESS",
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: "FETCH_GROUP_CHAT_HISTORY_FAILURE",
      payload: error.response?.data || error.message,
    });
  }
};

export const fetchUnreadGroupChat = (groupId, token) => async (dispatch) => {
  dispatch({ type: FETCH_UNREAD_GROUP_CHAT });
  try {
    const response = await api.get(`/api/chats/group/${groupId}/unread`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    dispatch({ type: FETCH_UNREAD_GROUP_CHAT_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: FETCH_UNREAD_GROUP_CHAT_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const deleteChatMessage = (chatId) => async (dispatch) => {
  dispatch({ type: DELETE_CHAT_MESSAGE });
  try {
    await api.delete(`/api/chats/${chatId}`, {});
    dispatch({ type: DELETE_CHAT_MESSAGE_SUCCESS });
  } catch (error) {
    dispatch({
      type: DELETE_CHAT_MESSAGE_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const editChatMessage = (chatId, content) => async (dispatch) => {
  dispatch({ type: EDIT_CHAT_MESSAGE });
  try {
    await api.put(`/api/chats/${chatId}/edit`, { content });
    dispatch({ type: EDIT_CHAT_MESSAGE_SUCCESS });
  } catch (error) {
    dispatch({
      type: EDIT_CHAT_MESSAGE_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

// Reply to a chat message
export const replyToChat = (chatId, content) => async (dispatch) => {
  dispatch({ type: REPLY_CHAT });
  try {
    const response = await api.post(`/api/chats/${chatId}/reply`, { content });
    dispatch({ type: REPLY_CHAT_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: REPLY_CHAT_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};
