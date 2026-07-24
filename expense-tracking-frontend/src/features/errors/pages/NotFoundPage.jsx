import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../../../hooks/useTheme";
import SearchIcon from "@mui/icons-material/Search";
import ErrorStatePage from "../components/ErrorStatePage";
import { getEnabledQuickLinks } from "../utils/errorPageLinks";

const NotFound = () => {
  const location = useLocation();
  const { colors } = useTheme();
  const featureFlags = useSelector((state) => state.featureFlags);
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const isAdminMode = currentMode === "ADMIN";
  const attemptedAdminRoute = location.pathname?.startsWith("/admin");

  const defaultAdminRoute = "/admin/dashboard";
  const defaultUserRoute = "/dashboard";

  let contextualMessage =
    "Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.";
  let primaryCta = {
    label: "Go to Dashboard",
    path: defaultUserRoute,
  };

  if (isAdminMode && !attemptedAdminRoute) {
    contextualMessage =
      "You are currently in Admin Mode, but the page you tried to open belongs to the user experience.";
    primaryCta = {
      label: "Open Admin Dashboard",
      path: defaultAdminRoute,
    };
  } else if (!isAdminMode && attemptedAdminRoute) {
    contextualMessage =
      "This page is available only in Admin Mode. Please switch back to your user workspace.";
    primaryCta = {
      label: "Return to User Dashboard",
      path: defaultUserRoute,
    };
  }

  const quickLinks = getEnabledQuickLinks(featureFlags, {
    isAdminMode: isAdminMode || attemptedAdminRoute,
  });

  return (
    <ErrorStatePage
      icon={
        <SearchIcon
          sx={{
            fontSize: 120,
            color: colors.primary_accent,
            opacity: 0.85,
          }}
        />
      }
      statusCode="404"
      title="Page Not Found"
      message={contextualMessage}
      attemptedRoute={location.pathname}
      primaryCta={primaryCta}
      quickLinks={quickLinks}
    />
  );
};

export default NotFound;
