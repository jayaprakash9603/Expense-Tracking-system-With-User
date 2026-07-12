import {
  GENERATE_REPORT_REQUEST,
  GENERATE_REPORT_SUCCESS,
  GENERATE_REPORT_FAILURE,
  FETCH_REPORT_HISTORY_REQUEST,
  FETCH_REPORT_HISTORY_SUCCESS,
  FETCH_REPORT_HISTORY_FAILURE,
  DELETE_REPORT_SUCCESS,
  CLEAR_REPORT_ERROR,
  RESET_REPORT_STATE,
} from "./reports.actionTypes";

const initialState = {
  current: null,
  history: [],
  loading: false,
  error: null,
};

export const reportsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GENERATE_REPORT_REQUEST:
    case FETCH_REPORT_HISTORY_REQUEST:
      return { ...state, loading: true, error: null };
    case GENERATE_REPORT_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case FETCH_REPORT_HISTORY_SUCCESS:
      return {
        ...state,
        loading: false,
        history: Array.isArray(action.payload) ? action.payload : [],
      };
    case GENERATE_REPORT_FAILURE:
    case FETCH_REPORT_HISTORY_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case DELETE_REPORT_SUCCESS:
      return {
        ...state,
        history: state.history.filter((r) => r.id !== action.payload),
      };

    case CLEAR_REPORT_ERROR:
      return { ...state, error: null };
    case RESET_REPORT_STATE:
      return { ...initialState };

    default:
      return state;
  }
};
