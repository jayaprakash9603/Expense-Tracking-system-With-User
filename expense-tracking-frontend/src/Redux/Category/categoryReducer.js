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
  FETCH_CATEGORY_REQUEST,
  FETCH_CATEGORY_SUCCESS,
  FETCH_CATEGORY_FAILURE,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  UPDATE_CATEGORY_IN_LIST,
  FETCH_CATEGORY_EXPENSES_REQUEST,
  FETCH_CATEGORY_EXPENSES_SUCCESS,
  FETCH_CATEGORY_EXPENSES_FAILURE,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  FETCH_CATEGORY_ANALYTICS_REQUEST,
  FETCH_CATEGORY_ANALYTICS_SUCCESS,
  FETCH_CATEGORY_ANALYTICS_FAILURE,
  CLEAR_CATEGORY_ANALYTICS,
} from "./categoryTypes";

const initialState = {
  loading: false,
  categories: [],
  uncategorizedExpenses: [],
  currentCategory: null,
  categoryExpenses: null,
  error: "",
  // Category Analytics state
  categoryAnalytics: null,
  categoryAnalyticsLoading: false,
  categoryAnalyticsError: null,
};

const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch all categories
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

    // Fetch uncategorized expenses
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

    // Create a new category
    case CREATE_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: (() => {
          const exists = state.categories.some(
            (c) =>
              c.id === action.payload.id ||
              (c.name &&
                action.payload.name &&
                c.name.toLowerCase() === action.payload.name.toLowerCase())
          );
          return exists
            ? state.categories
            : [...state.categories, action.payload];
        })(),
        error: "",
      };
    case CREATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Fetch a single category by ID
    case FETCH_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        currentCategory: action.payload,
      };
    case FETCH_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update an existing category
    case UPDATE_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        currentCategory: action.payload,
      };
    case UPDATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case UPDATE_CATEGORY_IN_LIST:
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        ),
      };

    // Fetch expenses for a specific category
    case FETCH_CATEGORY_EXPENSES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_CATEGORY_EXPENSES_SUCCESS:
      return {
        ...state,
        loading: false,
        categoryExpenses: action.payload,
      };
    case FETCH_CATEGORY_EXPENSES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Delete a category
    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.payload
        ),
      };
    case DELETE_CATEGORY_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    // Category Analytics
    case FETCH_CATEGORY_ANALYTICS_REQUEST:
      return {
        ...state,
        categoryAnalyticsLoading: true,
        categoryAnalyticsError: null,
      };
    case FETCH_CATEGORY_ANALYTICS_SUCCESS:
      return {
        ...state,
        categoryAnalyticsLoading: false,
        categoryAnalytics: action.payload,
        categoryAnalyticsError: null,
      };
    case FETCH_CATEGORY_ANALYTICS_FAILURE:
      return {
        ...state,
        categoryAnalyticsLoading: false,
        categoryAnalyticsError: action.payload,
      };
    case CLEAR_CATEGORY_ANALYTICS:
      return {
        ...state,
        categoryAnalytics: null,
        categoryAnalyticsLoading: false,
        categoryAnalyticsError: null,
      };

    default:
      return state;
  }
};

export default categoryReducer;
