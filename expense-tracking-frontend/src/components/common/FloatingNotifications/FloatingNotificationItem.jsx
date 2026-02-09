/**
 * FloatingNotificationItem Component
 *
 * A single floating notification with:
 * - Smooth animations (slide in/out)
 * - Auto-dismiss with progress bar
 * - Interactive actions (close, click)
 * - Theme support (dark/light)
 * - Priority-based styling
 * - Accessibility support
 *
 * Follows Material Design principles and React best practices
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, IconButton, Typography, Fade, Slide } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  getNotificationConfig,
  getAdjustedDuration,
} from "./constants/notificationTypes";

/**
 * Props Interface:
 * @param {Object} notification - Notification data object
 * @param {Function} onClose - Callback when notification is closed
 * @param {Function} onClick - Callback when notification is clicked
 * @param {Object} colors - Theme colors object
 * @param {boolean} isDark - Dark mode flag
 * @param {number} index - Position index for stacking
 * @param {boolean} pauseOnHover - Pause auto-dismiss on hover
 */
const FloatingNotificationItem = ({
  notification,
  onClose,
  onClick,
  colors,
  isDark = false,
  index = 0,
  pauseOnHover = true,
}) => {
  // State
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [isReady, setIsReady] = useState(false); // Delay before starting timer

  // Get notification configuration
  const config = useMemo(
    () => getNotificationConfig(notification.type || "DEFAULT"),
    [notification.type]
  );

  // Get adjusted duration based on priority
  const duration = useMemo(
    () => getAdjustedDuration(notification.type, notification.duration),
    [notification.type, notification.duration]
  );

  // Icon component
  const IconComponent = config.icon;

  /**
   * Handle close with animation
   */
  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  }, [notification.id, onClose]);

  /**
   * Handle notification click (body click, not close button)
   */
  const handleBodyClick = useCallback(() => {
    if (onClick) {
      onClick(notification);
    }
  }, [notification, onClick]);

  /**
   * Auto-dismiss timer with progress
   * Wait for animation to complete before starting timer
   */
  useEffect(() => {
    // Wait 500ms for entrance animation to complete before starting timer
    const startDelay = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused || !isReady) return;

    const interval = 50; // Update every 50ms for smooth animation
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, isPaused, isReady, duration, handleClose]);

  /**
   * Pause on hover
   */
  useEffect(() => {
    if (pauseOnHover) {
      setIsPaused(isHovered);
    }
  }, [isHovered, pauseOnHover]);

  /**
   * Format timestamp
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";

    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diff = Math.floor((now - notificationTime) / 1000); // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  /**
   * Theme-aware colors
   */
  const themeColors = {
    cardBg: isDark ? "rgba(26, 26, 26, 0.98)" : "rgba(255, 255, 255, 0.98)",
    cardBgHover: isDark
      ? "rgba(30, 30, 30, 0.98)"
      : "rgba(250, 250, 250, 0.98)",
    textPrimary: isDark ? "#f5f5f5" : "#111827",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    textMuted: isDark ? "#6b7280" : "#9ca3af",
    progressBg: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
    shadow: isDark
      ? "0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)"
      : "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
    shadowHover: isDark
      ? "0 12px 48px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)"
      : "0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
  };

  return (
    <Slide direction="left" in={isVisible} timeout={300}>
      <Fade in={isVisible} timeout={300}>
        <Box
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick ? handleBodyClick : undefined}
          sx={{
            position: "relative",
            width: "380px",
            maxWidth: "calc(100vw - 32px)",
            mb: 1.5,
            borderRadius: "12px",
            overflow: "hidden",
            cursor: onClick ? "pointer" : "default",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isHovered
              ? "translateX(-4px) scale(1.02)"
              : "translateX(0) scale(1)",
            boxShadow: isHovered ? themeColors.shadowHover : themeColors.shadow,
            backdropFilter: "blur(10px)",
            animation: `slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${
              index * 0.05
            }s both`,
            "@keyframes slideInRight": {
              from: {
                opacity: 0,
                transform: "translateX(100%)",
              },
              to: {
                opacity: 1,
                transform: "translateX(0)",
              },
            },
          }}
        >
          {/* Progress Bar - Only show when timer is active */}
          {isReady && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: themeColors.progressBg,
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${progress}%`,
                  background: config.gradient,
                  transition: isPaused ? "none" : "width 0.05s linear",
                }}
              />
            </Box>
          )}

          {/* Left Color Bar */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              background: config.gradient,
            }}
          />

          {/* Content */}
          <Box
            sx={{
              backgroundColor: themeColors.cardBg,
              p: 2,
              pl: 2.5,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
              transition: "background-color 0.2s ease",
              "&:hover": {
                backgroundColor: themeColors.cardBgHover,
              },
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                flexShrink: 0,
                width: 42,
                height: 42,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: config.gradient,
                boxShadow: `0 4px 12px ${config.color}30`,
                animation: "iconPulse 2s ease-in-out infinite",
                "@keyframes iconPulse": {
                  "0%, 100%": {
                    boxShadow: `0 4px 12px ${config.color}30`,
                  },
                  "50%": {
                    boxShadow: `0 6px 20px ${config.color}50`,
                  },
                },
              }}
            >
              <IconComponent sx={{ fontSize: 24, color: "#ffffff" }} />
            </Box>

            {/* Text Content */}
            <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: themeColors.textPrimary,
                  fontSize: "14px",
                  lineHeight: 1.4,
                  mb: 0.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {notification.title || "Notification"}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: themeColors.textSecondary,
                  fontSize: "13px",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {notification.message || notification.body || ""}
              </Typography>

              {/* Timestamp */}
              <Typography
                variant="caption"
                sx={{
                  color: themeColors.textMuted,
                  fontSize: "11px",
                  mt: 0.5,
                  display: "block",
                  fontWeight: 500,
                }}
              >
                {formatTime(notification.timestamp || notification.createdAt)}
              </Typography>
            </Box>

            {/* Close Button */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              sx={{
                flexShrink: 0,
                width: 28,
                height: 28,
                color: themeColors.textMuted,
                opacity: 0.7,
                transition: "all 0.2s ease",
                "&:hover": {
                  opacity: 1,
                  backgroundColor: `${config.color}20`,
                  color: config.color,
                  transform: "rotate(90deg)",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Fade>
    </Slide>
  );
};

export default React.memo(FloatingNotificationItem);
