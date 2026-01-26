/**
 * RecommendationToast - Smart Shortcut Recommendation Notification
 * 
 * Displays contextual shortcut recommendations to users based on their
 * behavior patterns. Shows when user performs an action that could be
 * done faster with a keyboard shortcut.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, IconButton, Snackbar, Alert, Fade } from "@mui/material";
import { Keyboard, Close, ThumbUp, ThumbDown } from "@mui/icons-material";
import { useShortcutRecommendations } from "./useShortcutRecommendations";
import { formatShortcutKeys } from "./useKeyboardShortcut";
import { useTheme } from "../../hooks/useTheme";

/**
 * KeyboardKey - Styled keyboard key for display
 */
function KeyboardKey({ keyName }) {
  const { colors } = useTheme();
  
  // Format special keys for display
  const displayKey = keyName
    .replace('mod', '⌘')
    .replace('ctrl', 'Ctrl')
    .replace('alt', 'Alt')
    .replace('shift', '⇧')
    .replace('enter', '↵')
    .replace('escape', 'Esc')
    .replace('arrowup', '↑')
    .replace('arrowdown', '↓')
    .replace('arrowleft', '←')
    .replace('arrowright', '→');
  
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 24,
        height: 24,
        px: 0.75,
        mx: 0.25,
        borderRadius: "6px",
        backgroundColor: colors.active_bg || colors.card_bg || "#f5f5f5",
        border: `1px solid ${colors.border || "#ddd"}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        fontSize: "0.75rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 600,
        textTransform: "uppercase",
        color: colors.primary_text || "#333",
      }}
    >
      {displayKey}
    </Box>
  );
}

/**
 * ShortcutDisplay - Renders a keyboard shortcut combo
 */
function ShortcutDisplay({ keys }) {
  if (!keys) return null;
  
  const keyParts = formatShortcutKeys(keys).split("+");
  
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      {keyParts.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Typography component="span" sx={{ mx: 0.25, fontSize: "0.75rem", color: "#666" }}>
              +
            </Typography>
          )}
          <KeyboardKey keyName={key.trim()} />
        </React.Fragment>
      ))}
    </Box>
  );
}

/**
 * RecommendationToast - Main component
 */
export function RecommendationToast() {
  const { colors } = useTheme();
  const {
    currentRecommendation,
    acceptRecommendation,
    rejectRecommendation,
    dismissRecommendation,
  } = useShortcutRecommendations();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Show toast when recommendation changes
  useEffect(() => {
    if (currentRecommendation) {
      setIsVisible(true);
    }
  }, [currentRecommendation]);
  
  // Auto-dismiss after delay (unless paused)
  useEffect(() => {
    if (!isVisible || !currentRecommendation || isPaused) return;
    
    const timer = setTimeout(() => {
      handleClose();
    }, 8000); // 8 seconds
    
    return () => clearTimeout(timer);
  }, [isVisible, currentRecommendation, isPaused]);
  
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      dismissRecommendation?.();
    }, 300); // After fade animation
  }, [dismissRecommendation]);
  
  const handleAccept = useCallback(() => {
    acceptRecommendation?.(currentRecommendation?.actionId);
    handleClose();
  }, [acceptRecommendation, currentRecommendation, handleClose]);
  
  const handleReject = useCallback(() => {
    rejectRecommendation?.(currentRecommendation?.actionId);
    handleClose();
  }, [rejectRecommendation, currentRecommendation, handleClose]);
  
  if (!currentRecommendation) {
    return null;
  }
  
  return (
    <Snackbar
      open={isVisible}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      TransitionComponent={Fade}
      sx={{ maxWidth: 400 }}
    >
      <Alert
        severity="info"
        icon={<Keyboard />}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        sx={{
          backgroundColor: colors.card_bg || colors.primary_bg || "#fff",
          color: colors.primary_text || "#ffffff",
          border: `1px solid ${colors.border || "#e0e0e0"}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          "& .MuiAlert-icon": {
            color: colors.accent || colors.button_bg || "#1976d2",
          },
        }}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleAccept}
              title="Got it, thanks!"
              sx={{ color: colors.success_text || "#4caf50" }}
            >
              <ThumbUp fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleReject}
              title="Don't show again"
              sx={{ color: colors.secondary_text || "#9ca3af" }}
            >
              <ThumbDown fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleClose}
              title="Dismiss"
              sx={{ color: colors.secondary_text || "#9ca3af" }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            💡 Pro tip: Use a shortcut!
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {currentRecommendation.message || `Try "${currentRecommendation.label}" with:`}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShortcutDisplay keys={currentRecommendation.keys} />
            <Typography variant="caption" sx={{ color: colors.secondary_text || "#9ca3af" }}>
              (saves ~{Math.round((currentRecommendation.timeSaved || 2000) / 1000)}s each time)
            </Typography>
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
}

export default RecommendationToast;
