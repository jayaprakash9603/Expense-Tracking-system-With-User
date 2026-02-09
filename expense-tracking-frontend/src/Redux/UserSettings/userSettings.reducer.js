import * as actionTypes from "./userSettings.actionType";

const initialState = {
  settings: null,
  loading: false,
  error: null,
  exists: false,
};

const userSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch User Settings
    case actionTypes.FETCH_USER_SETTINGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.FETCH_USER_SETTINGS_SUCCESS:
      return {
        ...state,
        settings: action.payload,
        loading: false,
        error: null,
        exists: true,
      };

    case actionTypes.FETCH_USER_SETTINGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        exists: false,
      };

    // Update User Settings
    case actionTypes.UPDATE_USER_SETTINGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.UPDATE_USER_SETTINGS_SUCCESS:
      return {
        ...state,
        settings: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.UPDATE_USER_SETTINGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Create Default Settings
    case actionTypes.CREATE_DEFAULT_SETTINGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.CREATE_DEFAULT_SETTINGS_SUCCESS:
      return {
        ...state,
        settings: action.payload,
        loading: false,
        error: null,
        exists: true,
      };

    case actionTypes.CREATE_DEFAULT_SETTINGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Reset Settings
    case actionTypes.RESET_USER_SETTINGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.RESET_USER_SETTINGS_SUCCESS:
      return {
        ...state,
        settings: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.RESET_USER_SETTINGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Check Settings Exist
    case actionTypes.CHECK_SETTINGS_EXIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.CHECK_SETTINGS_EXIST_SUCCESS:
      return {
        ...state,
        exists: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.CHECK_SETTINGS_EXIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Clear Settings (on logout)
    case actionTypes.CLEAR_USER_SETTINGS:
      return initialState;

    default:
      return state;
  }
};

export default userSettingsReducer;
