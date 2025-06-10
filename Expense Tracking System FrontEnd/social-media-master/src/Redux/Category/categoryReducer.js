import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  FETCH_UNCATEGORIZED_EXPENSES_REQUEST,
  FETCH_UNCATEGORIZED_EXPENSES_SUCCESS,
  FETCH_UNCATEGORIZED_EXPENSES_FAILURE,
} from "./categoryTypes";

const initialState = {
  loading: false,
  categories: [],
  error: "",
};

const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CATEGORIES_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload,
        error: "",
      };
    case FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        categories: [],
        error: action.payload,
      };
    case FETCH_UNCATEGORIZED_EXPENSES_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_UNCATEGORIZED_EXPENSES_SUCCESS:
      return {
        ...state,
        loading: false,
        uncategorizedExpenses: action.payload,
        error: "",
      };
    case FETCH_UNCATEGORIZED_EXPENSES_FAILURE:
      return {
        ...state,
        loading: false,
        uncategorizedExpenses: [],
        error: action.payload,
      };
    case CREATE_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: [...state.categories, action.payload],
        error: "",
      };
    case CREATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default categoryReducer;
