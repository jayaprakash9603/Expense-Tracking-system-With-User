import {
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  REGISTER_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  RESET_CLOUDINARY_STATE,
  UPDATE_PROFILE_SUCCESS,
  UPLOAD_TO_CLOUDINARY_FAILURE,
  UPLOAD_TO_CLOUDINARY_REQUEST,
  UPLOAD_TO_CLOUDINARY_SUCCESS,
} from "./auth.actionType";

const initialState = {
  jwt: null,
  error: null,
  loading: false,
  user: null,
  imageUrl: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_TO_CLOUDINARY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case UPLOAD_TO_CLOUDINARY_SUCCESS:
      return {
        ...state,
        loading: false,
        imageUrl: action.payload,
        error: null,
      };
    case UPLOAD_TO_CLOUDINARY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case RESET_CLOUDINARY_STATE:
      return {
        ...state,
        imageUrl: null,
        loading: false,
        error: null,
      };
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case GET_PROFILE_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_PROFILE_SUCCESS:
    case UPDATE_PROFILE_SUCCESS:
      return { ...state, user: action.payload, error: null, loading: false };
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      return { ...state, jwt: action.payload, loading: false, error: null };
    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case "LOGOUT":
      return { ...state, user: null, jwt: null };
    default:
      return state;
  }
};
