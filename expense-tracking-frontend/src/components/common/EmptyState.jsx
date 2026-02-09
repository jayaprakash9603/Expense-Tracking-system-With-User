/**
 * =============================================================================
 * EmptyState - Reusable Empty State Component
 * =============================================================================
 *
 * A flexible empty state component for when no data is available.
 * Supports different variants and customizable content.
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  InboxOutlined as InboxIcon,
  SearchOff as SearchIcon,
  PersonOutline as PersonIcon,
  QrCode2 as QrCodeIcon,
  FolderOpenOutlined as FolderIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Preset Icons
// =============================================================================

const PRESET_ICONS = {
  inbox: InboxIcon,
  search: SearchIcon,
  person: PersonIcon,
  qrcode: QrCodeIcon,
  folder: FolderIcon,
};

// =============================================================================
// Component
// =============================================================================

/**
 * EmptyState - Displays when no data is available
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Custom icon component or preset name
 * @param {string} props.title - Main title text
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.action - Action button or component
 * @param {string} props.actionText - Text for default action button
 * @param {Function} props.onAction - Handler for default action button
 * @param {string} props.variant - Preset variant (search, shares, friends, etc.)
 * @param {Object} props.sx - Additional styles
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionText,
  onAction,
  variant,
  sx = {},
}) => {
  const { colors } = useTheme();

  // Get icon component
  const getIcon = () => {
    if (!icon && !variant) return InboxIcon;
    if (typeof icon === "string" && PRESET_ICONS[icon]) {
      return PRESET_ICONS[icon];
    }
    if (React.isValidElement(icon)) return () => icon;
    if (icon) return icon;

    // Default icons based on variant
    switch (variant) {
      case "search":
        return SearchIcon;
      case "shares":
        return QrCodeIcon;
      case "friends":
        return PersonIcon;
      default:
        return InboxIcon;
    }
  };

  // Get default content based on variant
  const getDefaultContent = () => {
    switch (variant) {
      case "search":
        return {
          title: "No Results Found",
          description: "Try adjusting your search or filters",
        };
      case "shares":
        return {
          title: "No Shares Found",
          description: "Create a share to get started",
        };
      case "friends":
        return {
          title: "No Friends Found",
          description:
            "When friends share access with you, they'll appear here",
        };
      default:
        return {
          title: "No Data Available",
          description: "There's nothing to display here yet",
        };
    }
  };

  const defaultContent = getDefaultContent();
  const IconComponent = getIcon();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 8,
        px: 3,
        ...sx,
      }}
    >
      <Box
        sx={{
          backgroundColor: colors.backgroundSecondary,
          borderRadius: "50%",
          p: 3,
          mb: 3,
        }}
      >
        <IconComponent
          sx={{
            fontSize: 64,
            color: colors.textTertiary,
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: colors.textSecondary,
          fontWeight: 600,
          mb: 1,
        }}
      >
        {title || defaultContent.title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: colors.textTertiary,
          maxWidth: 400,
          mb: action || actionText ? 3 : 0,
        }}
      >
        {description || defaultContent.description}
      </Typography>

      {action && action}

      {!action && actionText && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 2 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
