import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../../../hooks/useTheme";
import { Box, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * NotFound Component
 * Displays a 404 error page when a route is not found
 */
const NotFound = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const isAdminMode = currentMode === "ADMIN";
  const attemptedAdminRoute = location.pathname?.startsWith("/admin");

  const defaultAdminRoute = "/admin/dashboard";
  const defaultUserRoute = "/dashboard";
  const adminQuickLinks = [
    { label: "Admin Dashboard", path: defaultAdminRoute },
    { label: "User Management", path: "/admin/users" },
    { label: "System Analytics", path: "/admin/analytics" },
    { label: "Audit Logs", path: "/admin/audit" },
  ];
  const userQuickLinks = [
    { label: "Dashboard", path: defaultUserRoute },
    { label: "Expenses", path: "/expenses" },
    { label: "Groups", path: "/groups" },
    { label: "Friends", path: "/friends" },
  ];

  let contextualMessage =
    "Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.";
  let primaryCta = {
    label: "Go to Dashboard",
    path: defaultUserRoute,
  };
  let quickLinks = userQuickLinks;

  if (isAdminMode && !attemptedAdminRoute) {
    contextualMessage =
      "You are currently in Admin Mode, but the page you tried to open belongs to the user experience.";
    primaryCta = {
      label: "Open Admin Dashboard",
      path: defaultAdminRoute,
    };
    quickLinks = adminQuickLinks;
  } else if (!isAdminMode && attemptedAdminRoute) {
    contextualMessage =
      "This page is available only in Admin Mode. Please switch back to your user workspace.";
    primaryCta = {
      label: "Return to User Dashboard",
      path: defaultUserRoute,
    };
    quickLinks = userQuickLinks;
  } else if (isAdminMode) {
    quickLinks = adminQuickLinks;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primary_bg,
        padding: 4,
      }}
    >
      {/* 404 Illustration */}
      <div
        style={{
          fontSize: "120px",
          marginBottom: "20px",
          animation: "float 3s ease-in-out infinite",
        }}
      >
        🔍
      </div>

      {/* 404 Text */}
      <h1
        style={{
          fontSize: "72px",
          fontWeight: "bold",
          margin: "0",
          color: colors.primary_accent,
          textShadow: `0 0 20px ${colors.primary_accent}40`,
        }}
      >
        404
      </h1>

      {/* Error Message */}
      <h2
        style={{
          fontSize: "28px",
          fontWeight: "600",
          margin: "20px 0 10px 0",
          color: colors.primary_text,
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          fontSize: "16px",
          color: colors.secondary_text,
          textAlign: "center",
          maxWidth: "500px",
          marginBottom: "16px",
        }}
      >
        {contextualMessage}
      </p>
      {location.pathname && (
        <p
          style={{
            fontSize: "14px",
            color: colors.tertiary_text || colors.secondary_text,
            textAlign: "center",
            maxWidth: "500px",
            marginBottom: "40px",
          }}
        >
          Attempted route: {location.pathname}
        </p>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate(primaryCta.path, { replace: true })}
          sx={{
            backgroundColor: colors.primary_accent,
            color: colors.button_text,
            padding: "12px 24px",
            fontSize: "16px",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: colors.tertiary_accent,
            },
          }}
        >
          {primaryCta.label}
        </Button>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            borderColor: colors.border_color,
            color: colors.primary_text,
            padding: "12px 24px",
            fontSize: "16px",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": {
              borderColor: colors.primary_accent,
              backgroundColor: `${colors.primary_accent}20`,
            },
          }}
        >
          Go Back
        </Button>
      </div>

      {/* Additional Help Text */}
      <div
        style={{
          marginTop: "60px",
          textAlign: "center",
          color: colors.secondary_text,
          fontSize: "14px",
        }}
      >
        <p>Need help? Try one of these popular pages:</p>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {quickLinks.map((link, index) => (
            <React.Fragment key={link.path}>
              {index > 0 && (
                <span style={{ color: colors.border_color }}>•</span>
              )}
              <a
                href={link.path}
                style={{
                  color: colors.primary_accent,
                  textDecoration: "none",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path, { replace: true });
                }}
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Box>
  );
};

export default NotFound;
