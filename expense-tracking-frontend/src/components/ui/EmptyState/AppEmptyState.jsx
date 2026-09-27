import React from "react";
import { Box, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";
import { DENSITY, RADIUS, SPACING } from "@shared/theme/tokens";
import { PrimaryButton, GhostButton } from "../Button";

/**
 * AppEmptyState — centered placeholder for lists, tables, and panels.
 *
 * @example
 * <AppEmptyState
 *   title="No expenses yet"
 *   description="Create your first expense to get started."
 *   actionLabel="Add expense"
 *   onAction={handleAdd}
 * />
 */
const AppEmptyState = React.forwardRef(
  (
    {
      icon,
      title = "Nothing here yet",
      description = "",
      actionLabel,
      onAction,
      secondaryActionLabel,
      onSecondaryAction,
      size = "medium",
      density = "comfortable",
      className = "",
      sx = {},
      children,
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const isCompact = density === "compact" || size === "compact";
    const densityKey = isCompact ? "compact" : size === "large" ? "large" : "medium";
    const current = DENSITY[densityKey] || DENSITY.medium;

    const accent = colors.primary_accent || "#00dac6";
    const textColor = colors.primary_text || "#fff";
    const mutedColor = colors.secondary_text || "#9ca3af";

    const containerSx = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      py: isCompact ? SPACING[6] : SPACING[8],
      px: SPACING[4],
      borderRadius: RADIUS.md,
      border: `1px dashed ${colors.border_color || "rgb(75, 85, 99)"}`,
      bgcolor: colors.tertiary_bg || colors.secondary_bg || "transparent",
      ...sx,
    };

    const iconNode = icon ?? (
      <InboxOutlinedIcon
        sx={{
          fontSize: isCompact ? 40 : 56,
          color: `${accent}99`,
          mb: SPACING[2],
        }}
      />
    );

    return (
      <Box ref={ref} className={className} sx={containerSx} {...restProps}>
        {iconNode}
        <Typography
          variant={isCompact ? "subtitle1" : "h6"}
          sx={{ color: textColor, fontWeight: 600, fontSize: current.fontSize, mb: 0.5 }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            variant="body2"
            sx={{ color: mutedColor, maxWidth: 360, mb: children || actionLabel ? SPACING[4] : 0 }}
          >
            {description}
          </Typography>
        ) : null}
        {children}
        {(actionLabel || secondaryActionLabel) && (
          <Box sx={{ display: "flex", gap: SPACING[2], mt: SPACING[2], flexWrap: "wrap", justifyContent: "center" }}>
            {actionLabel ? (
              <PrimaryButton size={isCompact ? "small" : "medium"} onClick={onAction}>
                {actionLabel}
              </PrimaryButton>
            ) : null}
            {secondaryActionLabel ? (
              <GhostButton size={isCompact ? "small" : "medium"} onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </GhostButton>
            ) : null}
          </Box>
        )}
      </Box>
    );
  },
);

AppEmptyState.displayName = "AppEmptyState";

AppEmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  secondaryActionLabel: PropTypes.string,
  onSecondaryAction: PropTypes.func,
  size: PropTypes.oneOf(["compact", "small", "medium", "large"]),
  density: PropTypes.oneOf(["compact", "comfortable"]),
  className: PropTypes.string,
  sx: PropTypes.object,
  children: PropTypes.node,
};

export default AppEmptyState;
