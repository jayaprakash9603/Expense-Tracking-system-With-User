import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
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
  const flagsReady = Boolean(featureFlags?.loaded);
  const enabledByPath = isPathEnabledInState(featureFlags, location.pathname);
  const utilitiesHubEnabled =
    feature !== SUB_FEATURE_KEYS.UTILITIES_TOOLS ||
    hasUtilitiesHubContentInState(featureFlags);
  const enabled = enabledByFeature && enabledByPath && utilitiesHubEnabled;

  // Wait for dormancy flags so dormant modules never mount or fire APIs early
  if (!flagsReady || featureFlags?.loading) {
    return (
      <Box
        sx={{
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!enabled) {
    return <FeatureUnavailable featureKey={feature} />;
  }

  return children || <Outlet />;
};

export default FeatureRoute;
