import {
  FETCH_BUDGETS_REQUEST,
  FETCH_BUDGETS_SUCCESS,
  FETCH_BUDGETS_FAILURE,
  FETCH_BUDGET_BY_ID_REQUEST,
  FETCH_BUDGET_BY_ID_SUCCESS,
  FETCH_BUDGET_BY_ID_FAILURE,
  CREATE_BUDGET_REQUEST,
  CREATE_BUDGET_SUCCESS,
  CREATE_BUDGET_FAILURE,
  UPDATE_BUDGET_REQUEST,
  UPDATE_BUDGET_SUCCESS,
  UPDATE_BUDGET_FAILURE,
  DELETE_BUDGET_REQUEST,
  DELETE_BUDGET_SUCCESS,
  DELETE_BUDGET_FAILURE,
  FETCH_BUDGET_OVERVIEW_REQUEST,
  FETCH_BUDGET_OVERVIEW_SUCCESS,
  FETCH_BUDGET_OVERVIEW_FAILURE,
  CLEAR_BUDGET_ERROR,
  RESET_BUDGET_STATE,
} from "./budgets.actionTypes";

const initialState = {
  list: [],
  selected: null,
  overview: null,
  loading: false,
  error: null,
  mutating: false,
};

export const budgetsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BUDGETS_REQUEST:
    case FETCH_BUDGET_OVERVIEW_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_BUDGETS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: Array.isArray(action.payload) ? action.payload : [],
      };
    case FETCH_BUDGETS_FAILURE:
    case FETCH_BUDGET_OVERVIEW_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_BUDGET_OVERVIEW_SUCCESS:
      return { ...state, loading: false, overview: action.payload };

    case FETCH_BUDGET_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_BUDGET_BY_ID_SUCCESS:
      return { ...state, loading: false, selected: action.payload };
    case FETCH_BUDGET_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CREATE_BUDGET_REQUEST:
    case UPDATE_BUDGET_REQUEST:
    case DELETE_BUDGET_REQUEST:
      return { ...state, mutating: true, error: null };
    case CREATE_BUDGET_SUCCESS:
      return { ...state, mutating: false, list: [action.payload, ...state.list] };
    case UPDATE_BUDGET_SUCCESS:
      return {
        ...state,
        mutating: false,
        list: state.list.map((b) => (b.id === action.payload.id ? action.payload : b)),
        selected: state.selected?.id === action.payload.id ? action.payload : state.selected,
      };
    case DELETE_BUDGET_SUCCESS:
      return {
        ...state,
        mutating: false,
        list: state.list.filter((b) => b.id !== action.payload),
        selected: state.selected?.id === action.payload ? null : state.selected,
      };
    case CREATE_BUDGET_FAILURE:
    case UPDATE_BUDGET_FAILURE:
    case DELETE_BUDGET_FAILURE:
      return { ...state, mutating: false, error: action.payload };

    case CLEAR_BUDGET_ERROR:
      return { ...state, error: null };
    case RESET_BUDGET_STATE:
      return { ...initialState };

    default:
      return state;
  }
};
