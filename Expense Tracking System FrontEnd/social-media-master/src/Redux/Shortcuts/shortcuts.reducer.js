/**
 * Keyboard Shortcuts Redux Reducer
 */

import {
  SHORTCUTS_FETCH_REQUEST,
  SHORTCUTS_FETCH_SUCCESS,
  SHORTCUTS_FETCH_FAILURE,
  SHORTCUTS_UPDATE_REQUEST,
  SHORTCUTS_UPDATE_SUCCESS,
  SHORTCUTS_UPDATE_FAILURE,
  SHORTCUTS_RESET_REQUEST,
  SHORTCUTS_RESET_SUCCESS,
  SHORTCUTS_RESET_FAILURE,
  RECOMMENDATIONS_FETCH_REQUEST,
  RECOMMENDATIONS_FETCH_SUCCESS,
  RECOMMENDATIONS_FETCH_FAILURE,
} from "./shortcuts.action";

const initialState = {
  // User's shortcut configurations
  shortcuts: [],

  // Counts
  customCount: 0,
  disabledCount: 0,
  rejectedRecommendationsCount: 0,

  // Recommendations
  recommendations: [],
  totalPotentialRecommendations: 0,

  // Loading states
  loading: false,
  updating: false,
  recommendationsLoading: false,

  // Error states
  error: null,
  recommendationsError: null,
};

export const shortcutsReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch shortcuts
    case SHORTCUTS_FETCH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SHORTCUTS_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        shortcuts: action.payload.shortcuts || [],
        customCount: action.payload.customCount || 0,
        disabledCount: action.payload.disabledCount || 0,
        rejectedRecommendationsCount:
          action.payload.rejectedRecommendationsCount || 0,
        error: null,
      };

    case SHORTCUTS_FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update shortcuts
    case SHORTCUTS_UPDATE_REQUEST:
      return {
        ...state,
        updating: true,
        error: null,
      };

    case SHORTCUTS_UPDATE_SUCCESS:
      return {
        ...state,
        updating: false,
        shortcuts: action.payload.shortcuts || state.shortcuts,
        customCount: action.payload.customCount ?? state.customCount,
        disabledCount: action.payload.disabledCount ?? state.disabledCount,
        rejectedRecommendationsCount:
          action.payload.rejectedRecommendationsCount ??
          state.rejectedRecommendationsCount,
        error: null,
      };

    case SHORTCUTS_UPDATE_FAILURE:
      return {
        ...state,
        updating: false,
        error: action.payload,
      };

    // Reset shortcuts
    case SHORTCUTS_RESET_REQUEST:
      return {
        ...state,
        updating: true,
        error: null,
      };

    case SHORTCUTS_RESET_SUCCESS:
      return {
        ...state,
        updating: false,
        shortcuts: [],
        customCount: 0,
        disabledCount: 0,
        rejectedRecommendationsCount: 0,
        error: null,
      };

    case SHORTCUTS_RESET_FAILURE:
      return {
        ...state,
        updating: false,
        error: action.payload,
      };

    // Fetch recommendations
    case RECOMMENDATIONS_FETCH_REQUEST:
      return {
        ...state,
        recommendationsLoading: true,
        recommendationsError: null,
      };

    case RECOMMENDATIONS_FETCH_SUCCESS:
      return {
        ...state,
        recommendationsLoading: false,
        recommendations: action.payload.recommendations || [],
        totalPotentialRecommendations: action.payload.totalPotential || 0,
        recommendationsError: null,
      };

    case RECOMMENDATIONS_FETCH_FAILURE:
      return {
        ...state,
        recommendationsLoading: false,
        recommendationsError: action.payload,
      };

    default:
      return state;
  }
};

export default shortcutsReducer;
