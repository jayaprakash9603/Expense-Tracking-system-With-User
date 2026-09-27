import React from "react";
import { Badge as MuiBadge } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";
import { DENSITY, RADIUS, SEMANTIC } from "@shared/theme/tokens";

/**
 * AppBadge — theme-aware notification/count badge.
 *
 * @example
 * <AppBadge badgeContent={4} color="error">
 *   <NotificationsIcon />
 * </AppBadge>
 */
const AppBadge = React.forwardRef(
  (
    {
      children,
      badgeContent,
      color = "primary",
      variant = "standard",
      max = 99,
      showZero = false,
      invisible = false,
      overlap = "rectangular",
      anchorOrigin = { vertical: "top", horizontal: "right" },
      size = "medium",
      density = "comfortable",
      className = "",
      sx = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const isCompact = density === "compact" || size === "compact";
    const densityKey = isCompact ? "compact" : size === "large" ? "large" : "medium";
    const current = DENSITY[densityKey] || DENSITY.medium;

    const accent = colors.primary_accent || "#00dac6";

    const colorMap = {
      primary: { bg: accent, fg: colors.button_text || "#000" },
      secondary: {
        bg: colors.secondary_bg || "#374151",
        fg: colors.primary_text || "#fff",
      },
      error: { bg: colors.error || SEMANTIC.error, fg: "#fff" },
      success: { bg: colors.success || SEMANTIC.success, fg: "#fff" },
      warning: { bg: colors.warning || SEMANTIC.warning, fg: "#000" },
      info: { bg: SEMANTIC.info, fg: "#fff" },
    };
    const palette = colorMap[color] || colorMap.primary;

    const badgeSx = {
      "& .MuiBadge-badge": {
        minWidth: isCompact ? 16 : 20,
        height: isCompact ? 16 : 20,
        fontSize: isCompact ? "0.65rem" : current.fontSize,
        fontWeight: 600,
        borderRadius: RADIUS.full,
        bgcolor: palette.bg,
        color: palette.fg,
        border: `2px solid ${colors.primary_bg || colors.active_bg || "#1f1f23"}`,
        ...(variant === "dot"
          ? {
              minWidth: isCompact ? 8 : 10,
              height: isCompact ? 8 : 10,
              padding: 0,
            }
          : {}),
      },
      ...sx,
    };

    return (
      <MuiBadge
        ref={ref}
        badgeContent={badgeContent}
        variant={variant}
        max={max}
        showZero={showZero}
        invisible={invisible}
        overlap={overlap}
        anchorOrigin={anchorOrigin}
        className={className}
        sx={badgeSx}
        {...restProps}
      >
        {children}
      </MuiBadge>
    );
  },
);

AppBadge.displayName = "AppBadge";

AppBadge.propTypes = {
  children: PropTypes.node,
  badgeContent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.oneOf(["primary", "secondary", "error", "success", "warning", "info"]),
  variant: PropTypes.oneOf(["standard", "dot"]),
  max: PropTypes.number,
  showZero: PropTypes.bool,
  invisible: PropTypes.bool,
  overlap: PropTypes.oneOf(["rectangular", "circular"]),
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.oneOf(["top", "bottom"]),
    horizontal: PropTypes.oneOf(["left", "right"]),
  }),
  size: PropTypes.oneOf(["compact", "small", "medium", "large"]),
  density: PropTypes.oneOf(["compact", "comfortable"]),
  className: PropTypes.string,
  sx: PropTypes.object,
};

export default AppBadge;
