import { Snackbar, Alert, Box, Typography, IconButton } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

const ToastNotification = ({
  open,
  message,
  onClose,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
  severity = "success",
}) => {
  const { colors } = useTheme();

  // Icon and color mapping based on severity
  const severityConfig = {
    success: {
      icon: <CheckCircleIcon sx={{ fontSize: "1.5rem" }} />,
      bgColor: "#4caf50",
      iconColor: "#ffffff",
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: "1.5rem" }} />,
      bgColor: "#f44336",
      iconColor: "#ffffff",
    },
    warning: {
      icon: <WarningIcon sx={{ fontSize: "1.5rem" }} />,
      bgColor: "#ff9800",
      iconColor: "#ffffff",
    },
    info: {
      icon: <InfoIcon sx={{ fontSize: "1.5rem" }} />,
      bgColor: "#2196f3",
      iconColor: "#ffffff",
    },
  };

  const config = severityConfig[severity] || severityConfig.success;

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={{
        "& .MuiSnackbarContent-root": {
          padding: 0,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minWidth: 300,
          maxWidth: 500,
          backgroundColor: colors.secondary_bg,
          border: `1px solid ${colors.border_color}`,
          borderRadius: 3,
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px ${config.bgColor}40`,
          overflow: "hidden",
          position: "relative",
          animation: "slideIn 0.3s ease-out",
          "@keyframes slideIn": {
            from: {
              transform: "translateX(100%)",
              opacity: 0,
            },
            to: {
              transform: "translateX(0)",
              opacity: 1,
            },
          },
        }}
      >
        {/* Color accent bar */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 5,
            backgroundColor: config.bgColor,
          }}
        />

        {/* Icon container with gradient background */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            ml: 2,
            borderRadius: 2,
            backgroundColor: `${config.bgColor}20`,
            color: config.bgColor,
            flexShrink: 0,
          }}
        >
          {config.icon}
        </Box>

        {/* Message content */}
        <Box sx={{ flex: 1, py: 1.5, pr: 1 }}>
          <Typography
            variant="body1"
            sx={{
              color: colors.primary_text,
              fontWeight: 600,
              fontSize: "0.95rem",
              lineHeight: 1.4,
              wordBreak: "break-word",
            }}
          >
            {message}
          </Typography>
        </Box>

        {/* Close button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            mr: 1.5,
            color: colors.secondary_text,
            backgroundColor: colors.hover_bg,
            width: 28,
            height: 28,
            flexShrink: 0,
            "&:hover": {
              backgroundColor: colors.tertiary_bg,
              color: colors.primary_text,
              transform: "scale(1.1)",
            },
            transition: "all 0.2s",
          }}
        >
          <CloseIcon sx={{ fontSize: "1rem" }} />
        </IconButton>

        {/* Progress bar animation */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: `${config.bgColor}30`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: "100%",
              backgroundColor: config.bgColor,
              animation: "progress 3s linear",
              "@keyframes progress": {
                from: { transform: "translateX(-100%)" },
                to: { transform: "translateX(0%)" },
              },
            }}
          />
        </Box>
      </Box>
    </Snackbar>
  );
};

export default ToastNotification;
