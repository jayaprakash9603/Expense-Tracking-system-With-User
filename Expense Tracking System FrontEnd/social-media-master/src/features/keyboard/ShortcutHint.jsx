/**
 * ShortcutHint - Component to display keyboard shortcut hints
 *
 * Shows a subtle keyboard hint next to buttons and actions.
 * Auto-detects if the action has a shortcut registered.
 */

import React from "react";
import { Box, Tooltip } from "@mui/material";
import { useShortcutHint } from "./useKeyboardShortcut";
import { useTheme } from "../../hooks/useTheme";

/**
 * Inline shortcut hint (small, next to button text)
 */
export function ShortcutHint({ actionId, showTooltip = true, size = "small" }) {
  const { colors } = useTheme();
  const { keys, formatted } = useShortcutHint(actionId);

  if (!keys || !formatted) return null;

  const sizeStyles = {
    small: { fontSize: "0.65rem", px: 0.5, py: 0.125 },
    medium: { fontSize: "0.7rem", px: 0.75, py: 0.25 },
    large: { fontSize: "0.8rem", px: 1, py: 0.375 },
  };

  const hint = (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "rgba(156, 163, 175, 0.1)",
        color: colors.secondary_text || "#9ca3af",
        borderRadius: "4px",
        fontFamily: '"SF Mono", "Monaco", "Menlo", monospace',
        fontWeight: 500,
        ml: 1,
        opacity: 0.7,
        transition: "opacity 0.15s ease",
        "&:hover": {
          opacity: 1,
        },
        ...sizeStyles[size],
      }}
    >
      {formatted}
    </Box>
  );

  if (showTooltip) {
    return (
      <Tooltip title={`Keyboard shortcut: ${formatted}`} placement="top" arrow>
        {hint}
      </Tooltip>
    );
  }

  return hint;
}

/**
 * Badge-style shortcut hint (for icon buttons or menu items)
 */
export function ShortcutBadge({
  actionId,
  position = "inline",
  size = "medium",
  showOnHover = false,
}) {
  const { colors } = useTheme();
  const { keys, formatted } = useShortcutHint(actionId);

  if (!keys || !formatted) return null;

  const isAbsolute = position !== "inline";

  const positionStyles = {
    inline: {},
    "bottom-right": { position: "absolute", bottom: -4, right: -4 },
    "bottom-left": { position: "absolute", bottom: -4, left: -4 },
    "top-right": { position: "absolute", top: -4, right: -4 },
    "top-left": { position: "absolute", top: -4, left: -4 },
  };

  const sizeStyles = {
    small: { fontSize: "0.55rem", px: 0.4, py: 0.1 },
    medium: { fontSize: "0.6rem", px: 0.5, py: 0.125 },
    large: { fontSize: "0.7rem", px: 0.6, py: 0.15 },
  };

  return (
    <Box
      className={showOnHover ? "shortcut-badge-hover" : ""}
      sx={{
        ...positionStyles[position],
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        backgroundColor: "rgba(156, 163, 175, 0.1)",
        color: colors.secondary_text || "#9ca3af",
        fontFamily: '"SF Mono", "Monaco", "Menlo", monospace',
        fontWeight: 600,
        borderRadius: "4px",
        boxShadow: isAbsolute ? "0 1px 2px rgba(0, 0, 0, 0.2)" : "none",
        zIndex: isAbsolute ? 1 : "auto",
        opacity: showOnHover ? 0 : 0.7,
        transition: "opacity 0.2s ease",
        ".menu-item:hover &, :hover > &": {
          opacity: 1,
        },
        ...sizeStyles[size],
      }}
    >
      {formatted}
    </Box>
  );
}

/**
 * Tooltip with shortcut info (wrap around any element)
 */
export function WithShortcutTooltip({ actionId, children, title }) {
  const { formatted } = useShortcutHint(actionId);

  const tooltipTitle = formatted
    ? `${title || ""} (${formatted})`.trim()
    : title || "";

  if (!tooltipTitle) return children;

  return (
    <Tooltip title={tooltipTitle} placement="top" arrow>
      {children}
    </Tooltip>
  );
}

export default ShortcutHint;
