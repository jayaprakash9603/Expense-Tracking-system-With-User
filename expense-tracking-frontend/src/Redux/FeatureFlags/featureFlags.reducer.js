import {
  buildDefaultModules,
  buildDefaultSubFeatures,
} from "../../config/featureCatalog";
import * as actionTypes from "./featureFlags.actionType";

const initialState = {
  dormancyEnabled: true,
  modules: buildDefaultModules(),
  subFeatures: buildDefaultSubFeatures(),
  loaded: false,
  loading: false,
  error: null,
};

const featureFlagsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_FEATURE_FLAGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case actionTypes.FETCH_FEATURE_FLAGS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        dormancyEnabled: action.payload.dormancyEnabled,
        modules: action.payload.modules,
        subFeatures: action.payload.subFeatures,
        error: null,
      };
    case actionTypes.FETCH_FEATURE_FLAGS_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        modules: buildDefaultModules(),
        subFeatures: buildDefaultSubFeatures(),
        error: action.payload,
      };
    default:
      return state;
  }
};

export default featureFlagsReducer;
