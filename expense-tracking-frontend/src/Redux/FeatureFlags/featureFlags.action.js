import { api } from "../../config/api";
import { safeApiCall } from "../../utils/api/safeApiCall";
import {
  buildDefaultModules,
  buildDefaultSubFeatures,
} from "../../config/featureCatalog";
import * as actionTypes from "./featureFlags.actionType";

export const fetchFeatureFlags = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_FEATURE_FLAGS_REQUEST });

  const { data, error } = await safeApiCall(() =>
    api.get("/api/config/features", { skipAuth: true }),
  );

  if (error) {
    dispatch({
      type: actionTypes.FETCH_FEATURE_FLAGS_FAILURE,
      payload: error.message || "Failed to fetch feature flags",
    });
    return {
      modules: buildDefaultModules(),
      subFeatures: buildDefaultSubFeatures(),
    };
  }

  dispatch({
    type: actionTypes.FETCH_FEATURE_FLAGS_SUCCESS,
    payload: {
      dormancyEnabled: data?.dormancyEnabled ?? true,
      modules: {
        ...buildDefaultModules(),
        ...(data?.modules || {}),
      },
      subFeatures: {
        ...buildDefaultSubFeatures(),
        ...(data?.subFeatures || {}),
      },
    },
  });

  return data;
};
