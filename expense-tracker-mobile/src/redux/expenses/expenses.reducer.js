import {
  FETCH_EXPENSES_REQUEST,
  FETCH_EXPENSES_SUCCESS,
  FETCH_EXPENSES_FAILURE,
  FETCH_EXPENSE_BY_ID_REQUEST,
  FETCH_EXPENSE_BY_ID_SUCCESS,
  FETCH_EXPENSE_BY_ID_FAILURE,
  CREATE_EXPENSE_REQUEST,
  CREATE_EXPENSE_SUCCESS,
  CREATE_EXPENSE_FAILURE,
  UPDATE_EXPENSE_REQUEST,
  UPDATE_EXPENSE_SUCCESS,
  UPDATE_EXPENSE_FAILURE,
  DELETE_EXPENSE_REQUEST,
  DELETE_EXPENSE_SUCCESS,
  DELETE_EXPENSE_FAILURE,
  FETCH_DAILY_SPENDING_REQUEST,
  FETCH_DAILY_SPENDING_SUCCESS,
  FETCH_DAILY_SPENDING_FAILURE,
  FETCH_CASHFLOW_REQUEST,
  FETCH_CASHFLOW_SUCCESS,
  FETCH_CASHFLOW_FAILURE,
  FETCH_CATEGORY_DISTRIBUTION_REQUEST,
  FETCH_CATEGORY_DISTRIBUTION_SUCCESS,
  FETCH_CATEGORY_DISTRIBUTION_FAILURE,
  FETCH_PAYMENT_METHOD_DISTRIBUTION_REQUEST,
  FETCH_PAYMENT_METHOD_DISTRIBUTION_SUCCESS,
  FETCH_PAYMENT_METHOD_DISTRIBUTION_FAILURE,
  CLEAR_EXPENSE_ERROR,
  RESET_EXPENSE_STATE,
} from "./expenses.actionTypes";
import { normalizeExpenseSelectedState } from "@/domain/expenses/expense.transformers";

const initialState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  dailySpending: [],
  cashflow: null,
  categoryDistribution: null,
  categoryDistributionLoading: false,
  paymentMethodDistribution: null,
  paymentMethodDistributionLoading: false,
  pagination: { page: 0, totalPages: 0, totalElements: 0, hasMore: false },
  mutating: false,
};

export const expensesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EXPENSES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_EXPENSES_SUCCESS: {
      const payload = action.payload;
      if (payload?.content) {
        return {
          ...state,
          loading: false,
          list: payload.content,
          pagination: {
            page: payload.number ?? 0,
            totalPages: payload.totalPages ?? 0,
            totalElements: payload.totalElements ?? 0,
            hasMore: !payload.last,
          },
        };
      }
      return {
        ...state,
        loading: false,
        list: Array.isArray(payload) ? payload : [],
      };
    }
    case FETCH_EXPENSES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case FETCH_EXPENSE_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_EXPENSE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        selected: normalizeExpenseSelectedState(action.payload),
      };
    case FETCH_EXPENSE_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CREATE_EXPENSE_REQUEST:
    case UPDATE_EXPENSE_REQUEST:
    case DELETE_EXPENSE_REQUEST:
      return { ...state, mutating: true, error: null };

    case CREATE_EXPENSE_SUCCESS:
      return { ...state, mutating: false, list: [action.payload, ...state.list] };
    case UPDATE_EXPENSE_SUCCESS:
      return {
        ...state,
        mutating: false,
        list: state.list.map((e) => (e.id === action.payload.id ? action.payload : e)),
        selected: state.selected?.id === action.payload.id ? action.payload : state.selected,
      };
    case DELETE_EXPENSE_SUCCESS:
      return {
        ...state,
        mutating: false,
        list: state.list.filter((e) => e.id !== action.payload),
        selected: state.selected?.id === action.payload ? null : state.selected,
      };

    case CREATE_EXPENSE_FAILURE:
    case UPDATE_EXPENSE_FAILURE:
    case DELETE_EXPENSE_FAILURE:
      return { ...state, mutating: false, error: action.payload };

    case FETCH_DAILY_SPENDING_REQUEST:
      return { ...state, loading: true };
    case FETCH_DAILY_SPENDING_SUCCESS:
      return { ...state, loading: false, dailySpending: action.payload };
    case FETCH_DAILY_SPENDING_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case FETCH_CASHFLOW_REQUEST:
      return { ...state, loading: true };
    case FETCH_CASHFLOW_SUCCESS:
      return { ...state, loading: false, cashflow: action.payload };
    case FETCH_CASHFLOW_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case FETCH_CATEGORY_DISTRIBUTION_REQUEST:
      return { ...state, categoryDistributionLoading: true };
    case FETCH_CATEGORY_DISTRIBUTION_SUCCESS:
      return { ...state, categoryDistributionLoading: false, categoryDistribution: action.payload };
    case FETCH_CATEGORY_DISTRIBUTION_FAILURE:
      return { ...state, categoryDistributionLoading: false, error: action.payload };

    case FETCH_PAYMENT_METHOD_DISTRIBUTION_REQUEST:
      return { ...state, paymentMethodDistributionLoading: true };
    case FETCH_PAYMENT_METHOD_DISTRIBUTION_SUCCESS:
      return { ...state, paymentMethodDistributionLoading: false, paymentMethodDistribution: action.payload };
    case FETCH_PAYMENT_METHOD_DISTRIBUTION_FAILURE:
      return { ...state, paymentMethodDistributionLoading: false, error: action.payload };

    case CLEAR_EXPENSE_ERROR:
      return { ...state, error: null };
    case RESET_EXPENSE_STATE:
      return { ...initialState };

    default:
      return state;
  }
};
