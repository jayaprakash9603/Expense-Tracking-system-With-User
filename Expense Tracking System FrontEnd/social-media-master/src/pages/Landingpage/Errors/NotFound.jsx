import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import { Box, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * NotFound Component
 * Displays a 404 error page when a route is not found
 */
const NotFound = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();

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
          marginBottom: "40px",
        }}
      >
        Oops! The page you're looking for doesn't exist. It might have been
        moved, deleted, or the URL might be incorrect.
      </p>

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
          onClick={() => navigate("/dashboard")}
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
          Go to Dashboard
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
            gap: "20px",
            marginTop: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/dashboard"
            style={{
              color: colors.primary_accent,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
          >
            Dashboard
          </a>
          <span style={{ color: colors.border_color }}>•</span>
          <a
            href="/expenses"
            style={{
              color: colors.primary_accent,
              textDecoration: "none",
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate("/expenses");
            }}
          >
            Expenses
          </a>
          <span style={{ color: colors.border_color }}>•</span>
          <a
            href="/groups"
            style={{
              color: colors.primary_accent,
              textDecoration: "none",
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate("/groups");
            }}
          >
            Groups
          </a>
          <span style={{ color: colors.border_color }}>•</span>
          <a
            href="/friends"
            style={{
              color: colors.primary_accent,
              textDecoration: "none",
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate("/friends");
            }}
          >
            Friends
          </a>
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
