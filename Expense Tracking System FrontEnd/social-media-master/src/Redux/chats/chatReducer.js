import {
  SEND_GROUP_CHAT,
  SEND_GROUP_CHAT_SUCCESS,
  SEND_GROUP_CHAT_FAILURE,
  FETCH_GROUP_CHAT,
  FETCH_GROUP_CHAT_SUCCESS,
  FETCH_GROUP_CHAT_FAILURE,
  FETCH_GROUP_CHAT_HISTORY,
  FETCH_GROUP_CHAT_HISTORY_SUCCESS,
  FETCH_GROUP_CHAT_HISTORY_FAILURE,
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

const initialState = {
  loading: false,
  error: null,
  chat: null,
  groupChat: [],
  groupChatHistory: [],
  unreadGroupChat: [],
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case SEND_GROUP_CHAT:
      return { ...state, loading: true, error: null };
    case SEND_GROUP_CHAT_SUCCESS:
      return { ...state, loading: false, groupChat: action.payload };
    case SEND_GROUP_CHAT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_GROUP_CHAT:
      return { ...state, loading: true, error: null };
    case FETCH_GROUP_CHAT_SUCCESS:
      return { ...state, loading: false, groupChat: action.payload };
    case FETCH_GROUP_CHAT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_GROUP_CHAT_HISTORY:
      return { ...state, loading: true, error: null };
    case FETCH_GROUP_CHAT_HISTORY_SUCCESS:
      return { ...state, loading: false, groupChatHistory: action.payload };
    case FETCH_GROUP_CHAT_HISTORY_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case DELETE_CHAT_MESSAGE:
      return { ...state, loading: true, error: null };
    case DELETE_CHAT_MESSAGE_SUCCESS:
      return { ...state, loading: false };
    case DELETE_CHAT_MESSAGE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case EDIT_CHAT_MESSAGE:
      return { ...state, loading: true, error: null };
    case EDIT_CHAT_MESSAGE_SUCCESS:
      return { ...state, loading: false };
    case EDIT_CHAT_MESSAGE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case BULK_DELETE_CHAT_MESSAGES:
      return { ...state, loading: true, error: null };
    case BULK_DELETE_CHAT_MESSAGES_SUCCESS:
      return { ...state, loading: false };
    case BULK_DELETE_CHAT_MESSAGES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_UNREAD_GROUP_CHAT:
      return { ...state, loading: true, error: null };
    case FETCH_UNREAD_GROUP_CHAT_SUCCESS:
      return { ...state, loading: false, unreadGroupChat: action.payload };
    case FETCH_UNREAD_GROUP_CHAT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case REPLY_CHAT:
      return { ...state, loading: true, error: null };
    case REPLY_CHAT_SUCCESS:
      // append new reply to groupChat or set chat depending on API response
      // if API returns the created message, add to groupChat array
      return {
        ...state,
        loading: false,
        groupChat: Array.isArray(state.groupChat)
          ? [...state.groupChat, action.payload]
          : state.groupChat,
      };
    case REPLY_CHAT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default chatReducer;
