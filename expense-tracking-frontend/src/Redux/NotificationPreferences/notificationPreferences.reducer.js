import * as actionTypes from "./notificationPreferences.actionType";

const initialState = {
  preferences: null,
  loading: false,
  updating: false,
  error: null,
  exists: null,
};

const notificationPreferencesReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch preferences
    case actionTypes.FETCH_NOTIFICATION_PREFERENCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.FETCH_NOTIFICATION_PREFERENCES_SUCCESS:
      return {
        ...state,
        preferences: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.FETCH_NOTIFICATION_PREFERENCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update preferences
    case actionTypes.UPDATE_NOTIFICATION_PREFERENCE_REQUEST:
      return {
        ...state,
        updating: true,
        error: null,
      };

    case actionTypes.UPDATE_NOTIFICATION_PREFERENCE_SUCCESS:
      return {
        ...state,
        preferences: action.payload,
        updating: false,
        error: null,
      };

    case actionTypes.UPDATE_NOTIFICATION_PREFERENCE_FAILURE:
      return {
        ...state,
        updating: false,
        error: action.payload,
      };

    // Reset preferences
    case actionTypes.RESET_NOTIFICATION_PREFERENCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.RESET_NOTIFICATION_PREFERENCES_SUCCESS:
      return {
        ...state,
        preferences: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.RESET_NOTIFICATION_PREFERENCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Delete preferences
    case actionTypes.DELETE_NOTIFICATION_PREFERENCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.DELETE_NOTIFICATION_PREFERENCES_SUCCESS:
      return {
        ...state,
        preferences: null,
        loading: false,
        error: null,
      };

    case actionTypes.DELETE_NOTIFICATION_PREFERENCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Check existence
    case actionTypes.CHECK_NOTIFICATION_PREFERENCES_EXIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.CHECK_NOTIFICATION_PREFERENCES_EXIST_SUCCESS:
      return {
        ...state,
        exists: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.CHECK_NOTIFICATION_PREFERENCES_EXIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Create default preferences
    case actionTypes.CREATE_DEFAULT_NOTIFICATION_PREFERENCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.CREATE_DEFAULT_NOTIFICATION_PREFERENCES_SUCCESS:
      return {
        ...state,
        preferences: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.CREATE_DEFAULT_NOTIFICATION_PREFERENCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default notificationPreferencesReducer;
