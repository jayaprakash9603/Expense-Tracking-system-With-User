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

const initialState = {
  list: [],
  requests: [],
  loading: false,
  error: null,
};

export const friendsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FRIENDS_REQUEST:
    case FETCH_FRIEND_REQUESTS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_FRIENDS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: Array.isArray(action.payload) ? action.payload : [],
      };
    case FETCH_FRIEND_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        requests: Array.isArray(action.payload) ? action.payload : [],
      };
    case FETCH_FRIENDS_FAILURE:
    case FETCH_FRIEND_REQUESTS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case SEND_FRIEND_REQUEST_SUCCESS:
      return { ...state, requests: [...state.requests, action.payload] };
    case ACCEPT_FRIEND_REQUEST_SUCCESS:
      return {
        ...state,
        requests: state.requests.filter((r) => r.id !== action.payload.id),
        list: [...state.list, action.payload.data],
      };
    case REJECT_FRIEND_REQUEST_SUCCESS:
      return {
        ...state,
        requests: state.requests.filter((r) => r.id !== action.payload),
      };
    case REMOVE_FRIEND_SUCCESS:
      return { ...state, list: state.list.filter((f) => f.id !== action.payload) };

    case CLEAR_FRIEND_ERROR:
      return { ...state, error: null };
    case RESET_FRIEND_STATE:
      return { ...initialState };

    default:
      return state;
  }
};
