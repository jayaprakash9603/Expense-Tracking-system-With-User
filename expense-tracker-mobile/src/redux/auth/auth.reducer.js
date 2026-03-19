import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
  SWITCH_MODE_SUCCESS,
} from "./auth.actionTypes";

const initialState = {
  jwt: null,
  error: null,
  loading: false,
  user: null,
  currentMode: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case GET_PROFILE_REQUEST:
      return { ...state, loading: true, error: null };

    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      return { ...state, jwt: action.payload, loading: false, error: null };

    case GET_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload,
        currentMode: action.payload?.currentMode || state.currentMode || "USER",
        loading: false,
        error: null,
      };

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
    case GET_PROFILE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case SWITCH_MODE_SUCCESS:
      return {
        ...state,
        currentMode: action.payload.currentMode,
        user: action.payload.user || state.user,
      };

    case LOGOUT:
      return { ...initialState };

    default:
      return state;
  }
};
