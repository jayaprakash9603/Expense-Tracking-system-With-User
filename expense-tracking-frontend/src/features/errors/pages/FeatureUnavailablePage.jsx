import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import BlockIcon from "@mui/icons-material/Block";
import { useTheme } from "../../../hooks/useTheme";
import ErrorStatePage from "../components/ErrorStatePage";
import { getEnabledQuickLinks } from "../utils/errorPageLinks";
import { getFeatureDisplayName } from "../utils/featureDisplayName";

const FeatureUnavailable = ({ featureKey }) => {
  const location = useLocation();
  const { colors } = useTheme();
  const featureFlags = useSelector((state) => state.featureFlags);
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const isAdminMode = currentMode === "ADMIN";
  const featureName = getFeatureDisplayName(featureKey);
  const attemptedRoute = location.pathname;

  const quickLinks = getEnabledQuickLinks(featureFlags, { isAdminMode });
  const defaultRoute = isAdminMode ? "/admin/dashboard" : "/dashboard";

  return (
    <ErrorStatePage
      embedded
      icon={
        <BlockIcon
          sx={{
            fontSize: 120,
            color: colors.primary_accent,
            opacity: 0.85,
          }}
        />
      }
      title="Feature Unavailable"
      message={`The ${featureName} feature is currently disabled in your application configuration. Please use an available section or return to your dashboard.`}
      attemptedRoute={attemptedRoute}
      primaryCta={{
        label: isAdminMode ? "Go to Admin Dashboard" : "Go to Dashboard",
        path: defaultRoute,
      }}
      quickLinks={quickLinks}
    />
  );
};

export default FeatureUnavailable;
