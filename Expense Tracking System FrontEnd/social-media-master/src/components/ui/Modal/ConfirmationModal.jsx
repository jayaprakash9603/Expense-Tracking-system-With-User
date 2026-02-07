/**
 * ConfirmationModal - Modal for simple confirmations (approve/decline)
 *
 * Usage:
 *   <ConfirmationModal
 *     open={showConfirm}
 *     onClose={() => setShowConfirm(false)}
 *     title="Confirm Delete"
 *     message="Are you sure you want to delete this item?"
 *     onConfirm={handleDelete}
 *     variant="danger"
 *   />
 *
 * Features:
 * - Pre-styled for confirmation prompts
 * - Three variants: default, danger, warning
 * - Optional data display
 * - Keyboard shortcuts (Y/N)
 */
import React, { forwardRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Box, Button, Typography } from "@mui/material";
import {
  Check as ConfirmIcon,
  Close as DeclineIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  HelpOutline as QuestionIcon,
} from "@mui/icons-material";
import AppModal from "./AppModal";
import { useTheme } from "../../../hooks/useTheme";

const ConfirmationModal = forwardRef(function ConfirmationModal(
  {
    // Core props
    open,
    onClose,
    title = "Confirmation",
    message = "Are you sure you want to proceed?",

    // Actions
    onConfirm,
    onDecline,
    confirmText = "Confirm",
    declineText = "Cancel",
    confirmIcon,
    declineIcon,

    // Variant
    variant = "default", // 'default' | 'danger' | 'warning'

    // Optional data display
    data,
    dataLabels = {},

    // Behavior
    loading = false,
    enableKeyboardShortcuts = true,

    // AppModal pass-through
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // Variant configurations
  const variantConfig = {
    default: {
      confirmColor: colors.primary_accent,
      icon: <QuestionIcon sx={{ fontSize: 48 }} />,
      iconBg: `${colors.primary_accent}20`,
      iconColor: colors.primary_accent,
    },
    danger: {
      confirmColor: "#f44336",
      icon: <DeleteIcon sx={{ fontSize: 48 }} />,
      iconBg: "#f4433620",
      iconColor: "#f44336",
    },
    warning: {
      confirmColor: "#ff9800",
      icon: <WarningIcon sx={{ fontSize: 48 }} />,
      iconBg: "#ff980020",
      iconColor: "#ff9800",
    },
  };

  const config = variantConfig[variant] || variantConfig.default;

  // Handle confirm
  const handleConfirm = useCallback(
    (event) => {
      onConfirm?.(event);
    },
    [onConfirm],
  );

  // Handle decline
  const handleDecline = useCallback(
    (event) => {
      onDecline?.(event);
      onClose?.(event, "decline");
    },
    [onDecline, onClose],
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!open || !enableKeyboardShortcuts || loading) return;

    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        handleConfirm(event);
      } else if (event.key.toLowerCase() === "n" || event.key === "Escape") {
        event.preventDefault();
        handleDecline(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, enableKeyboardShortcuts, loading, handleConfirm, handleDecline]);

  // Check if data exists
  const hasData = data && Object.keys(data).length > 0;

  // Footer actions
  const footer = (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        width: "100%",
        justifyContent: hasData ? "space-between" : "center",
      }}
    >
      {/* Decline Button */}
      <Button
        onClick={handleDecline}
        disabled={loading}
        variant="outlined"
        startIcon={declineIcon || <DeclineIcon />}
        title={enableKeyboardShortcuts ? `${declineText} (N)` : declineText}
        sx={{
          flex: hasData ? 1 : undefined,
          minWidth: 120,
          color: colors.secondary_text,
          borderColor: colors.border_color,
          "&:hover": {
            borderColor: "#f44336",
            backgroundColor: "#f4433610",
            color: "#f44336",
          },
        }}
      >
        {declineText}
      </Button>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={loading}
        variant="contained"
        startIcon={confirmIcon || <ConfirmIcon />}
        title={enableKeyboardShortcuts ? `${confirmText} (Y)` : confirmText}
        sx={{
          flex: hasData ? 1 : undefined,
          minWidth: 120,
          backgroundColor: config.confirmColor,
          "&:hover": {
            backgroundColor: config.confirmColor,
            opacity: 0.9,
          },
        }}
      >
        {confirmText}
      </Button>
    </Box>
  );

  return (
    <AppModal
      ref={ref}
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      footer={footer}
      footerAlign="center"
      size={hasData ? "md" : "sm"}
      disableEscapeKeyDown={loading}
      {...rest}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          py: hasData ? 1 : 2,
        }}
      >
        {/* Icon */}
        {!hasData && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: config.iconBg,
              color: config.iconColor,
              mb: 2,
            }}
          >
            {config.icon}
          </Box>
        )}

        {/* Message */}
        <Typography
          variant="body1"
          sx={{
            color: colors.primary_text,
            fontSize: "1.1rem",
            fontWeight: 500,
            maxWidth: 400,
            mb: hasData ? 3 : 0,
          }}
        >
          {message}
        </Typography>

        {/* Data display */}
        {hasData && (
          <Box
            sx={{
              width: "100%",
              backgroundColor: colors.tertiary_bg,
              borderRadius: 2,
              p: 2,
              textAlign: "left",
            }}
          >
            {Object.entries(data).map(([key, value]) => {
              if (value === undefined || value === null) return null;
              const label = dataLabels[key] || key;
              return (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.75,
                    borderBottom: `1px solid ${colors.border_color}`,
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: colors.secondary_text }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.primary_text, fontWeight: 500 }}
                  >
                    {String(value)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </AppModal>
  );
});

ConfirmationModal.propTypes = {
  /** Control visibility */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.string,
  /** Confirmation message */
  message: PropTypes.node,
  /** Confirm action handler */
  onConfirm: PropTypes.func,
  /** Decline action handler */
  onDecline: PropTypes.func,
  /** Confirm button text */
  confirmText: PropTypes.string,
  /** Decline button text */
  declineText: PropTypes.string,
  /** Custom confirm icon */
  confirmIcon: PropTypes.node,
  /** Custom decline icon */
  declineIcon: PropTypes.node,
  /** Visual variant */
  variant: PropTypes.oneOf(["default", "danger", "warning"]),
  /** Key-value data to display */
  data: PropTypes.object,
  /** Labels for data keys */
  dataLabels: PropTypes.object,
  /** Loading state */
  loading: PropTypes.bool,
  /** Enable Y/N keyboard shortcuts */
  enableKeyboardShortcuts: PropTypes.bool,
};

export default ConfirmationModal;
