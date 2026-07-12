import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  FETCH_CATEGORY_REQUEST,
  FETCH_CATEGORY_SUCCESS,
  FETCH_CATEGORY_FAILURE,
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  FETCH_CATEGORY_FLOW_REQUEST,
  FETCH_CATEGORY_FLOW_SUCCESS,
  FETCH_CATEGORY_FLOW_FAILURE,
  CLEAR_CATEGORY_ERROR,
  RESET_CATEGORY_STATE,
} from "./categories.actionTypes";
import { categoriesListSliceHelpers } from "./categories.slice";

const initialState = {
  list: [],
  flow: null,
  selected: null,
  loading: false,
  selectedLoading: false,
  error: null,
  mutating: false,
};

export const categoriesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CATEGORIES_REQUEST:
    case FETCH_CATEGORY_FLOW_REQUEST:
      return categoriesListSliceHelpers.applyRequest(state);
    case FETCH_CATEGORIES_SUCCESS:
      return categoriesListSliceHelpers.applySuccess(state, action);
    case FETCH_CATEGORIES_FAILURE:
    case FETCH_CATEGORY_FLOW_FAILURE:
      return categoriesListSliceHelpers.applyFailure(state, action);
    case FETCH_CATEGORY_REQUEST:
      return { ...state, selectedLoading: true, error: null };
    case FETCH_CATEGORY_SUCCESS:
      return { ...state, selectedLoading: false, selected: action.payload || null };
    case FETCH_CATEGORY_FAILURE:
      return { ...state, selectedLoading: false, error: action.payload };
    case FETCH_CATEGORY_FLOW_SUCCESS:
      return { ...state, loading: false, flow: action.payload };

    case CREATE_CATEGORY_REQUEST:
    case UPDATE_CATEGORY_REQUEST:
    case DELETE_CATEGORY_REQUEST:
      return { ...state, mutating: true, error: null };
    case CREATE_CATEGORY_SUCCESS:
      return { ...state, mutating: false, list: [action.payload, ...state.list] };
    case UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        mutating: false,
        selected: action.payload?.id === state.selected?.id ? action.payload : state.selected,
        list: state.list.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        mutating: false,
        selected: state.selected?.id === action.payload ? null : state.selected,
        list: state.list.filter((c) => c.id !== action.payload),
      };
    case CREATE_CATEGORY_FAILURE:
    case UPDATE_CATEGORY_FAILURE:
    case DELETE_CATEGORY_FAILURE:
      return { ...state, mutating: false, error: action.payload };

    case CLEAR_CATEGORY_ERROR:
      return { ...state, error: null };
    case RESET_CATEGORY_STATE:
      return { ...initialState };

    default:
      return state;
  }
};
