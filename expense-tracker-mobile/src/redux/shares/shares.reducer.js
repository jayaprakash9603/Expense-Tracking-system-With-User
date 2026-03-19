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

const initialState = {
  list: [],
  stats: null,
  loading: false,
  error: null,
};

export const sharesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SHARES_REQUEST:
    case FETCH_SHARE_STATS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_SHARES_SUCCESS:
      return {
        ...state,
        loading: false,
        list: Array.isArray(action.payload) ? action.payload : [],
      };
    case FETCH_SHARE_STATS_SUCCESS:
      return { ...state, loading: false, stats: action.payload };
    case FETCH_SHARES_FAILURE:
    case FETCH_SHARE_STATS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CREATE_SHARE_SUCCESS:
      return { ...state, list: [...state.list, action.payload] };
    case REVOKE_SHARE_SUCCESS:
      return {
        ...state,
        list: state.list.filter((s) => s.token !== action.payload),
      };
    case CLEAR_SHARE_ERROR:
      return { ...state, error: null };
    case RESET_SHARE_STATE:
      return { ...initialState };
    default:
      return state;
  }
};
