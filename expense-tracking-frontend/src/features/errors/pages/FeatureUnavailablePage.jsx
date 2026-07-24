import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import { Box, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BlockIcon from "@mui/icons-material/Block";

const FeatureUnavailable = ({ featureKey }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "60vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primary_bg,
        padding: 4,
      }}
    >
      <BlockIcon
        sx={{
          fontSize: 96,
          color: colors.primary_accent,
          opacity: 0.85,
          mb: 2,
        }}
      />
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "600",
          margin: "0 0 12px 0",
          color: colors.primary_text,
        }}
      >
        Feature Unavailable
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: colors.secondary_text,
          textAlign: "center",
          maxWidth: "480px",
          marginBottom: "24px",
        }}
      >
        This feature is currently disabled by your application configuration.
        {featureKey ? ` (${featureKey})` : ""}
      </p>
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate("/dashboard", { replace: true })}
        sx={{
          backgroundColor: colors.primary_accent,
          color: colors.button_text,
          textTransform: "none",
        }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default FeatureUnavailable;
