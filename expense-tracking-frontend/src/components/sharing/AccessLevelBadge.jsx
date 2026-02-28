/**
 * =============================================================================
 * AccessLevelBadge - Reusable Access Level Badge Component
 * =============================================================================
 *
 * Displays access level with appropriate icon, color, and optional description.
 * Used across SharedWithMe and related sharing pages.
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React from "react";
import { Box, Chip, Typography, Tooltip, Avatar } from "@mui/material";
import {
  VisibilityOutlined as ViewIcon,
  EditOutlined as EditIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  BlockOutlined as BlockIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { ACCESS_LEVEL_CONFIG, getAccessConfig } from "../../utils/sharesUtils";

// =============================================================================
// Badge Variants
// =============================================================================

/**
 * Compact chip variant - just icon and label
 */
const ChipBadge = ({ config, size = "small", showIcon = true }) => {
  const Icon = config.icon;

  return (
    <Chip
      icon={
        showIcon ? (
          <Icon sx={{ fontSize: size === "small" ? 16 : 20 }} />
        ) : undefined
      }
      label={config.label}
      size={size}
      sx={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        borderColor: config.color,
        fontWeight: 600,
        fontSize: size === "small" ? "0.75rem" : "0.875rem",
        "& .MuiChip-icon": {
          color: config.color,
        },
      }}
      variant="outlined"
    />
  );
};

/**
 * Full badge with description
 */
const FullBadge = ({ config, colors, showDescription = true }) => {
  const Icon = config.icon;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        backgroundColor: `${config.color}10`,
        border: `1px solid ${config.color}30`,
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          backgroundColor: `${config.color}20`,
          color: config.color,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: config.color,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {config.label}
        </Typography>
        {showDescription && (
          <Typography
            variant="caption"
            sx={{
              color: colors.textSecondary,
              display: "block",
              mt: 0.25,
            }}
          >
            {config.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/**
 * Inline badge - icon and text inline
 */
const InlineBadge = ({ config }) => {
  const Icon = config.icon;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        color: config.color,
      }}
    >
      <Icon sx={{ fontSize: 16 }} />
      <Typography
        component="span"
        variant="body2"
        sx={{
          fontWeight: 600,
          color: config.color,
        }}
      >
        {config.label}
      </Typography>
    </Box>
  );
};

/**
 * Avatar badge - circular icon with tooltip
 */
const AvatarBadge = ({ config, size = 32 }) => {
  const Icon = config.icon;

  return (
    <Tooltip title={`${config.label}: ${config.description}`} arrow>
      <Avatar
        sx={{
          width: size,
          height: size,
          backgroundColor: `${config.color}20`,
          color: config.color,
        }}
      >
        <Icon sx={{ fontSize: size * 0.5 }} />
      </Avatar>
    </Tooltip>
  );
};

// =============================================================================
// Main Component
// =============================================================================

/**
 * AccessLevelBadge - Displays access level information
 * @param {Object} props
 * @param {string} props.level - Access level (FULL, WRITE, READ, NONE)
 * @param {string} props.variant - Display variant (chip, full, inline, avatar)
 * @param {string} props.size - Size (small, medium, large)
 * @param {boolean} props.showIcon - Whether to show icon
 * @param {boolean} props.showDescription - Whether to show description (full variant)
 * @param {boolean} props.showTooltip - Whether to show tooltip on hover
 */
const AccessLevelBadge = ({
  level,
  variant = "chip",
  size = "small",
  showIcon = true,
  showDescription = true,
  showTooltip = true,
}) => {
  const { colors } = useTheme();
  const config = getAccessConfig(level);

  // Wrap in tooltip if needed
  const wrapWithTooltip = (content) => {
    if (showTooltip && variant !== "full" && variant !== "avatar") {
      return (
        <Tooltip title={config.description} arrow>
          <Box component="span">{content}</Box>
        </Tooltip>
      );
    }
    return content;
  };

  switch (variant) {
    case "full":
      return (
        <FullBadge
          config={config}
          colors={colors}
          showDescription={showDescription}
        />
      );

    case "inline":
      return wrapWithTooltip(<InlineBadge config={config} />);

    case "avatar":
      return (
        <AvatarBadge
          config={config}
          size={size === "small" ? 24 : size === "large" ? 40 : 32}
        />
      );

    case "chip":
    default:
      return wrapWithTooltip(
        <ChipBadge config={config} size={size} showIcon={showIcon} />,
      );
  }
};

// =============================================================================
// Utility Components
// =============================================================================

/**
 * Access Level Legend - Shows all access levels with descriptions
 */
export const AccessLevelLegend = ({ compact = false }) => {
  const { colors } = useTheme();
  const levels = ["FULL", "WRITE", "READ", "NONE"];

  if (compact) {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {levels.map((level) => (
          <AccessLevelBadge
            key={level}
            level={level}
            variant="chip"
            size="small"
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: colors.textPrimary,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <InfoIcon sx={{ fontSize: 16 }} />
        Access Levels
      </Typography>
      {levels.map((level) => (
        <AccessLevelBadge key={level} level={level} variant="full" />
      ))}
    </Box>
  );
};

/**
 * Compare access levels - returns true if level1 >= level2
 * FULL > WRITE > READ > NONE
 */
export const compareAccessLevels = (level1, level2) => {
  const order = { FULL: 4, WRITE: 3, READ: 2, NONE: 1 };
  return (order[level1] || 0) >= (order[level2] || 0);
};

/**
 * Get permission capabilities for a level
 */
export const getPermissions = (level) => {
  const config = getAccessConfig(level);
  return config.permissions || [];
};

export default AccessLevelBadge;
