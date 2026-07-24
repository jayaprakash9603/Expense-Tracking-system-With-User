import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useFeature from "../hooks/useFeature";
import {
  isPathEnabledInState,
  hasUtilitiesHubContentInState,
  SUB_FEATURE_KEYS,
} from "../config/featureCatalog";
import FeatureUnavailable from "../features/errors/pages/FeatureUnavailablePage";

const FeatureRoute = ({ feature, children }) => {
  const enabledByFeature = useFeature(feature);
  const location = useLocation();
  const featureFlags = useSelector((state) => state.featureFlags);
  const enabledByPath = isPathEnabledInState(featureFlags, location.pathname);
  const utilitiesHubEnabled =
    feature !== SUB_FEATURE_KEYS.UTILITIES_TOOLS ||
    hasUtilitiesHubContentInState(featureFlags);
  const enabled = enabledByFeature && enabledByPath && utilitiesHubEnabled;

  if (!enabled) {
    return <FeatureUnavailable featureKey={feature} />;
  }

  return children || <Outlet />;
};

export default FeatureRoute;
