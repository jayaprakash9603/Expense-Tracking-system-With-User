import React from "react";
import { Skeleton as MuiSkeleton } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";
import { DENSITY, RADIUS } from "@shared/theme/tokens";

/**
 * AppSkeleton — theme-aware loading placeholder.
 *
 * @example
 * <AppSkeleton variant="text" width="60%" />
 * <AppSkeleton variant="rounded" height={120} />
 */
const AppSkeleton = React.forwardRef(
  (
    {
      variant = "text",
      width,
      height,
      size = "medium",
      density = "comfortable",
      animation = "pulse",
      className = "",
      sx = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors, mode } = useTheme();
    const isCompact = density === "compact" || size === "compact";
    const densityKey = isCompact ? "compact" : size === "large" ? "large" : "medium";
    const current = DENSITY[densityKey] || DENSITY.medium;

    const baseColor =
      colors.tertiary_bg || colors.secondary_bg || (mode === "dark" ? "#2a2a2e" : "#e5e7eb");
    const highlightColor =
      colors.hover_bg || (mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)");

    const defaultHeight =
      height ??
      (variant === "text"
        ? current.fontSize
        : variant === "circular"
          ? current.controlHeight
          : current.controlHeight * 2);

    const skeletonSx = {
      bgcolor: baseColor,
      "&::after": {
        background: `linear-gradient(90deg, transparent, ${highlightColor}, transparent)`,
      },
      borderRadius:
        variant === "circular" ? RADIUS.full : variant === "rounded" ? RADIUS.md : RADIUS.xs,
      fontSize: current.fontSize,
      ...sx,
    };

    return (
      <MuiSkeleton
        ref={ref}
        variant={variant}
        width={width}
        height={defaultHeight}
        animation={animation}
        className={className}
        sx={skeletonSx}
        {...restProps}
      />
    );
  },
);

AppSkeleton.displayName = "AppSkeleton";

AppSkeleton.propTypes = {
  variant: PropTypes.oneOf(["text", "rectangular", "rounded", "circular"]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOf(["compact", "small", "medium", "large"]),
  density: PropTypes.oneOf(["compact", "comfortable"]),
  animation: PropTypes.oneOf(["pulse", "wave", false]),
  className: PropTypes.string,
  sx: PropTypes.object,
};

export default AppSkeleton;
