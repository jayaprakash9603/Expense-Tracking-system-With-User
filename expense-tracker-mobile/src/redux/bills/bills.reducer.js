import {
  FETCH_BILLS_REQUEST,
  FETCH_BILLS_SUCCESS,
  FETCH_BILLS_FAILURE,
  CREATE_BILL_REQUEST,
  CREATE_BILL_SUCCESS,
  CREATE_BILL_FAILURE,
  UPDATE_BILL_REQUEST,
  UPDATE_BILL_SUCCESS,
  UPDATE_BILL_FAILURE,
  DELETE_BILL_REQUEST,
  DELETE_BILL_SUCCESS,
  DELETE_BILL_FAILURE,
  MARK_BILL_PAID_REQUEST,
  MARK_BILL_PAID_SUCCESS,
  MARK_BILL_PAID_FAILURE,
  FETCH_UPCOMING_BILLS_REQUEST,
  FETCH_UPCOMING_BILLS_SUCCESS,
  FETCH_UPCOMING_BILLS_FAILURE,
  CLEAR_BILL_ERROR,
  RESET_BILL_STATE,
} from "./bills.actionTypes";

const initialState = {
  list: [],
  upcoming: [],
  loading: false,
  error: null,
  mutating: false,
};

export const billsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BILLS_REQUEST:
    case FETCH_UPCOMING_BILLS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_BILLS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: Array.isArray(action.payload) ? action.payload : [],
      };
    case FETCH_UPCOMING_BILLS_SUCCESS:
      return {
        ...state,
        loading: false,
        upcoming: Array.isArray(action.payload) ? action.payload : [],
      };
    case FETCH_BILLS_FAILURE:
    case FETCH_UPCOMING_BILLS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CREATE_BILL_REQUEST:
    case UPDATE_BILL_REQUEST:
    case DELETE_BILL_REQUEST:
    case MARK_BILL_PAID_REQUEST:
      return { ...state, mutating: true, error: null };
    case CREATE_BILL_SUCCESS:
      return { ...state, mutating: false, list: [action.payload, ...state.list] };
    case UPDATE_BILL_SUCCESS:
    case MARK_BILL_PAID_SUCCESS:
      return {
        ...state,
        mutating: false,
        list: state.list.map((b) =>
          b.id === action.payload?.id ? action.payload : b
        ),
      };
    case DELETE_BILL_SUCCESS:
      return {
        ...state,
        mutating: false,
        list: state.list.filter((b) => b.id !== action.payload),
      };
    case CREATE_BILL_FAILURE:
    case UPDATE_BILL_FAILURE:
    case DELETE_BILL_FAILURE:
    case MARK_BILL_PAID_FAILURE:
      return { ...state, mutating: false, error: action.payload };

    case CLEAR_BILL_ERROR:
      return { ...state, error: null };
    case RESET_BILL_STATE:
      return { ...initialState };

    default:
      return state;
  }
};
