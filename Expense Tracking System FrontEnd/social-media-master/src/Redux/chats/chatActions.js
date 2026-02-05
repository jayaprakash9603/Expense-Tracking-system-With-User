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
  FETCH_CONVERSATIONS_LIST,
  FETCH_CONVERSATIONS_LIST_SUCCESS,
  FETCH_CONVERSATIONS_LIST_FAILURE,
  FETCH_ONE_TO_ONE_CHAT,
  FETCH_ONE_TO_ONE_CHAT_SUCCESS,
  FETCH_ONE_TO_ONE_CHAT_FAILURE,
  SEND_ONE_TO_ONE_MESSAGE,
  SEND_ONE_TO_ONE_MESSAGE_SUCCESS,
  SEND_ONE_TO_ONE_MESSAGE_FAILURE,
  RECEIVE_ONE_TO_ONE_MESSAGE,
  SET_ACTIVE_CONVERSATION,
  CLEAR_ACTIVE_CONVERSATION,
  UPDATE_TYPING_STATUS,
  CLEAR_TYPING_STATUS,
  UPDATE_ONLINE_STATUS,
  UPDATE_ONLINE_STATUS_BATCH,
  ADD_REACTION,
  ADD_REACTION_SUCCESS,
  ADD_REACTION_FAILURE,
  REMOVE_REACTION,
  REMOVE_REACTION_SUCCESS,
  REMOVE_REACTION_FAILURE,
  UPDATE_MESSAGE_REACTION,
  MARK_MESSAGES_READ,
  MARK_MESSAGES_READ_SUCCESS,
  UPDATE_READ_RECEIPT,
  FETCH_FRIENDS_PRESENCE,
  FETCH_FRIENDS_PRESENCE_SUCCESS,
  FETCH_FRIENDS_PRESENCE_FAILURE,
  UPDATE_LAST_SEEN,
  UPDATE_CONVERSATION_LAST_MESSAGE,
  INCREMENT_UNREAD_COUNT,
  RESET_UNREAD_COUNT,
  SET_WEBSOCKET_CONNECTED,
  SET_WEBSOCKET_DISCONNECTED,
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

export const fetchConversationsList = () => async (dispatch) => {
  dispatch({ type: FETCH_CONVERSATIONS_LIST });
  try {
    const response = await api.get("/api/chats/conversations");
    dispatch({
      type: FETCH_CONVERSATIONS_LIST_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_CONVERSATIONS_LIST_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const fetchOneToOneChat = (friendId) => async (dispatch) => {
  if (friendId === null || friendId === undefined) {
    return;
  }
  dispatch({ type: FETCH_ONE_TO_ONE_CHAT });
  try {
    const response = await api.get(`/api/chats/between?userId2=${friendId}`);
    dispatch({
      type: FETCH_ONE_TO_ONE_CHAT_SUCCESS,
      payload: { friendId, messages: response.data },
    });
  } catch (error) {
    dispatch({
      type: FETCH_ONE_TO_ONE_CHAT_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const sendOneToOneMessage =
  (receiverId, content, replyToId = null) =>
  async (dispatch) => {
    dispatch({ type: SEND_ONE_TO_ONE_MESSAGE });
    try {
      const payload = { recipientId: receiverId, content };
      if (replyToId) {
        payload.replyToId = replyToId;
      }
      const response = await api.post("/api/chats/one-to-one", payload);
      dispatch({
        type: SEND_ONE_TO_ONE_MESSAGE_SUCCESS,
        payload: response.data,
      });
      return response.data;
    } catch (error) {
      dispatch({
        type: SEND_ONE_TO_ONE_MESSAGE_FAILURE,
        payload: error.response?.data || error.message,
      });
      throw error;
    }
  };

export const receiveOneToOneMessage = (message) => ({
  type: RECEIVE_ONE_TO_ONE_MESSAGE,
  payload: message,
});

export const setActiveConversation = (conversation) => ({
  type: SET_ACTIVE_CONVERSATION,
  payload: conversation,
});

export const clearActiveConversation = () => ({
  type: CLEAR_ACTIVE_CONVERSATION,
});

export const updateTypingStatus = (
  userId,
  isTyping,
  conversationType = "user",
) => ({
  type: UPDATE_TYPING_STATUS,
  payload: { userId, isTyping, conversationType },
});

export const clearTypingStatus = (userId) => ({
  type: CLEAR_TYPING_STATUS,
  payload: userId,
});

export const updateOnlineStatus = (userId, isOnline, lastSeen = null) => ({
  type: UPDATE_ONLINE_STATUS,
  payload: { userId, isOnline, lastSeen },
});

export const updateOnlineStatusBatch = (presenceMap) => ({
  type: UPDATE_ONLINE_STATUS_BATCH,
  payload: presenceMap,
});

export const addReaction = (messageId, reaction) => async (dispatch) => {
  dispatch({ type: ADD_REACTION });
  try {
    const response = await api.post(`/api/chats/${messageId}/reaction`, {
      reaction,
    });
    dispatch({ type: ADD_REACTION_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({
      type: ADD_REACTION_FAILURE,
      payload: error.response?.data || error.message,
    });
    throw error;
  }
};

export const removeReaction = (messageId) => async (dispatch) => {
  dispatch({ type: REMOVE_REACTION });
  try {
    const response = await api.delete(`/api/chats/${messageId}/reaction`);
    dispatch({ type: REMOVE_REACTION_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({
      type: REMOVE_REACTION_FAILURE,
      payload: error.response?.data || error.message,
    });
    throw error;
  }
};

export const updateMessageReaction = (messageId, reactions) => ({
  type: UPDATE_MESSAGE_REACTION,
  payload: { messageId, reactions },
});

export const markMessagesRead =
  (conversationId, conversationType = "user") =>
  async (dispatch) => {
    dispatch({ type: MARK_MESSAGES_READ });
    try {
      await api.post(`/api/chats/mark-read`, {
        conversationId,
        conversationType,
      });
      dispatch({
        type: MARK_MESSAGES_READ_SUCCESS,
        payload: { conversationId, conversationType },
      });
    } catch (error) {
      console.error("Failed to mark messages read:", error);
    }
  };

export const updateReadReceipt = (messageId, readBy) => ({
  type: UPDATE_READ_RECEIPT,
  payload: { messageId, readBy },
});

export const fetchFriendsPresence = (friendIds) => async (dispatch) => {
  dispatch({ type: FETCH_FRIENDS_PRESENCE });
  try {
    const response = await api.post("/api/chats/presence/batch", {
      userIds: friendIds,
    });
    dispatch({ type: FETCH_FRIENDS_PRESENCE_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: FETCH_FRIENDS_PRESENCE_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

export const updateLastSeen = (userId, lastSeen) => ({
  type: UPDATE_LAST_SEEN,
  payload: { userId, lastSeen },
});

export const updateConversationLastMessage = (conversationId, message) => ({
  type: UPDATE_CONVERSATION_LAST_MESSAGE,
  payload: { conversationId, message },
});

export const incrementUnreadCount = (conversationId) => ({
  type: INCREMENT_UNREAD_COUNT,
  payload: conversationId,
});

export const resetUnreadCount = (conversationId) => ({
  type: RESET_UNREAD_COUNT,
  payload: conversationId,
});

export const setWebSocketConnected = () => ({
  type: SET_WEBSOCKET_CONNECTED,
});

export const setWebSocketDisconnected = () => ({
  type: SET_WEBSOCKET_DISCONNECTED,
});
