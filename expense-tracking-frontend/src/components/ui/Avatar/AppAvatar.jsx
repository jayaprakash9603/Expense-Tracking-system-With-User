import React from "react";
import { Avatar as MuiAvatar } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";
import { DENSITY, RADIUS } from "@shared/theme/tokens";

/**
 * AppAvatar — theme-aware user/entity avatar.
 *
 * @example
 * <AppAvatar alt="Jane Doe" src={photoUrl} />
 * <AppAvatar>{initials}</AppAvatar>
 */
const AppAvatar = React.forwardRef(
  (
    {
      src,
      alt = "",
      children,
      size = "medium",
      density = "comfortable",
      variant = "circular",
      color = "default",
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

    const dimension = current.controlHeight;
    const accent = colors.primary_accent || "#00dac6";

    const colorMap = {
      default: {
        bg: colors.secondary_bg || "#374151",
        fg: colors.primary_text || "#fff",
      },
      primary: {
        bg: `${accent}33`,
        fg: accent,
      },
      accent: {
        bg: accent,
        fg: colors.button_text || "#000",
      },
    };
    const palette = colorMap[color] || colorMap.default;

    const avatarSx = {
      width: dimension,
      height: dimension,
      fontSize: current.fontSize,
      fontWeight: 600,
      bgcolor: palette.bg,
      color: palette.fg,
      border: `2px solid ${colors.border_color || "transparent"}`,
      borderRadius: variant === "rounded" ? RADIUS.md : RADIUS.full,
      ...sx,
    };

    return (
      <MuiAvatar
        ref={ref}
        src={src}
        alt={alt}
        variant={variant}
        className={className}
        sx={avatarSx}
        {...restProps}
      >
        {children}
      </MuiAvatar>
    );
  },
);

AppAvatar.displayName = "AppAvatar";

AppAvatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(["compact", "small", "medium", "large"]),
  density: PropTypes.oneOf(["compact", "comfortable"]),
  variant: PropTypes.oneOf(["circular", "rounded", "square"]),
  color: PropTypes.oneOf(["default", "primary", "accent"]),
  className: PropTypes.string,
  sx: PropTypes.object,
};

export default AppAvatar;
