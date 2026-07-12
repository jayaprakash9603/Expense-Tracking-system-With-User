import * as types from "./userSettings.actionTypes";

const initialState = {
  settings: null,
  loading: false,
  error: null,
  exists: false,
};

export const userSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_USER_SETTINGS_REQUEST:
    case types.UPDATE_USER_SETTINGS_REQUEST:
    case types.CREATE_DEFAULT_SETTINGS_REQUEST:
    case types.RESET_USER_SETTINGS_REQUEST:
    case types.CHECK_SETTINGS_EXIST_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_USER_SETTINGS_SUCCESS:
    case types.CREATE_DEFAULT_SETTINGS_SUCCESS:
    case types.RESET_USER_SETTINGS_SUCCESS:
      return { ...state, settings: action.payload, loading: false, error: null, exists: true };

    case types.UPDATE_USER_SETTINGS_SUCCESS:
      return { ...state, settings: action.payload, loading: false, error: null };

    case types.CHECK_SETTINGS_EXIST_SUCCESS:
      return { ...state, exists: action.payload, loading: false, error: null };

    case types.FETCH_USER_SETTINGS_FAILURE:
      return { ...state, loading: false, error: action.payload, exists: false };

    case types.UPDATE_USER_SETTINGS_FAILURE:
    case types.CREATE_DEFAULT_SETTINGS_FAILURE:
    case types.RESET_USER_SETTINGS_FAILURE:
    case types.CHECK_SETTINGS_EXIST_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.CLEAR_USER_SETTINGS:
      return initialState;

    default:
      return state;
  }
};
