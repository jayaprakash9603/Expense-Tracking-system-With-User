import {
  FETCH_PAYMENT_METHODS_REQUEST,
  FETCH_PAYMENT_METHODS_SUCCESS,
  FETCH_PAYMENT_METHODS_FAILURE,
  CREATE_PAYMENT_METHOD_SUCCESS,
  UPDATE_PAYMENT_METHOD_SUCCESS,
  DELETE_PAYMENT_METHOD_SUCCESS,
  CLEAR_PAYMENT_METHOD_ERROR,
  RESET_PAYMENT_METHOD_STATE,
} from "./paymentMethods.actionTypes";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export const paymentMethodsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PAYMENT_METHODS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_PAYMENT_METHODS_SUCCESS:
      return { ...state, loading: false, list: Array.isArray(action.payload) ? action.payload : [] };
    case FETCH_PAYMENT_METHODS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CREATE_PAYMENT_METHOD_SUCCESS:
      return { ...state, list: [...state.list, action.payload] };
    case UPDATE_PAYMENT_METHOD_SUCCESS:
      return {
        ...state,
        list: state.list.map((pm) => (pm.id === action.payload.id ? action.payload : pm)),
      };
    case DELETE_PAYMENT_METHOD_SUCCESS:
      return { ...state, list: state.list.filter((pm) => pm.id !== action.payload) };
    case CLEAR_PAYMENT_METHOD_ERROR:
      return { ...state, error: null };
    case RESET_PAYMENT_METHOD_STATE:
      return { ...initialState };
    default:
      return state;
  }
};
