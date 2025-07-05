import {
  FETCH_PAYMENT_METHODS_WITH_EXPENSES_REQUEST,
  FETCH_PAYMENT_METHODS_WITH_EXPENSES_SUCCESS,
  FETCH_PAYMENT_METHODS_WITH_EXPENSES_FAILURE,
  DELETE_PAYMENT_METHOD_REQUEST,
  DELETE_PAYMENT_METHOD_SUCCESS,
  DELETE_PAYMENT_METHOD_FAILURE,
  CREATE_PAYMENT_METHOD_REQUEST,
  CREATE_PAYMENT_METHOD_SUCCESS,
  CREATE_PAYMENT_METHOD_FAILURE,
  FETCH_PAYMENT_METHOD_BY_ID_REQUEST,
  FETCH_PAYMENT_METHOD_BY_ID_SUCCESS,
  FETCH_PAYMENT_METHOD_BY_ID_FAILURE,
  UPDATE_PAYMENT_METHOD_REQUEST,
  UPDATE_PAYMENT_METHOD_SUCCESS,
  UPDATE_PAYMENT_METHOD_FAILURE,
  FETCH_PAYMENT_METHOD_BY_TARGET_ID_REQUEST,
  FETCH_PAYMENT_METHOD_BY_TARGET_ID_SUCCESS,
  FETCH_PAYMENT_METHOD_BY_TARGET_ID_FAILURE,
  GET_ALL_PAYMENT_METHOD_REQUEST,
  GET_ALL_PAYMENT_METHOD_SUCCESS,
  GET_ALL_PAYMENT_METHOD_FAILURE,
} from "./paymentMethod.actionType";

const initialState = {
  paymentMethodExpenses: null,
  paymentMethod: {},
  paymentMethods: [],
  loading: false,
  error: null,
};

export const paymentMethodReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PAYMENT_METHODS_WITH_EXPENSES_REQUEST:
    case DELETE_PAYMENT_METHOD_REQUEST:
    case CREATE_PAYMENT_METHOD_REQUEST:
    case FETCH_PAYMENT_METHOD_BY_ID_REQUEST:
    case UPDATE_PAYMENT_METHOD_REQUEST:
    case FETCH_PAYMENT_METHOD_BY_TARGET_ID_REQUEST:
    case GET_ALL_PAYMENT_METHOD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_PAYMENT_METHODS_WITH_EXPENSES_SUCCESS:
      return {
        ...state,
        loading: false,
        paymentMethodExpenses: action.payload,
        error: null,
      };

    case GET_ALL_PAYMENT_METHOD_SUCCESS:
      return {
        ...state,
        loading: false,
        paymentMethods: action.payload,
        error: null,
      };

    case DELETE_PAYMENT_METHOD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case CREATE_PAYMENT_METHOD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case FETCH_PAYMENT_METHOD_BY_ID_SUCCESS:
    case FETCH_PAYMENT_METHOD_BY_TARGET_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        paymentMethod: action.payload,
        error: null,
      };

    case UPDATE_PAYMENT_METHOD_SUCCESS:
      return {
        ...state,
        loading: false,
        paymentMethod: action.payload,
        error: null,
      };

    case FETCH_PAYMENT_METHODS_WITH_EXPENSES_FAILURE:
    case DELETE_PAYMENT_METHOD_FAILURE:
    case CREATE_PAYMENT_METHOD_FAILURE:
    case FETCH_PAYMENT_METHOD_BY_ID_FAILURE:
    case UPDATE_PAYMENT_METHOD_FAILURE:
    case FETCH_PAYMENT_METHOD_BY_TARGET_ID_FAILURE:
    case GET_ALL_PAYMENT_METHOD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
