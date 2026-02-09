/**
 * =============================================================================
 * ShareReviewStep - Step 3: Review and Generate QR Code
 * =============================================================================
 *
 * Final step in the share creation flow allowing users to:
 * - Review all share settings
 * - See selected items summary
 * - Generate the QR code
 *
 * @author Expense Tracking System
 * @version 1.1
 * =============================================================================
 */

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  Public as PublicIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Icon Mapping
// =============================================================================

const ICONS = {
  EXPENSE: <ReceiptIcon />,
  CATEGORY: <CategoryIcon />,
  BUDGET: <BudgetIcon />,
};

const VISIBILITY_ICONS = {
  LINK_ONLY: <LinkIcon />,
  PUBLIC: <PublicIcon />,
  FRIENDS_ONLY: <PeopleIcon />,
  SPECIFIC_USERS: <PersonAddIcon />,
};

const VISIBILITY_LABELS = {
  LINK_ONLY: "Link Only",
  PUBLIC: "Public",
  FRIENDS_ONLY: "Friends Only",
  SPECIFIC_USERS: "Specific Friends",
};

// =============================================================================
// Component
// =============================================================================

const ShareReviewStep = ({
  shareName,
  resourceType,
  selectedItems,
  permission,
  expiryOption,
  customExpiry,
  dataTypeOptions,
  expiryOptions,
  visibility,
  visibilityOptions,
  selectedFriends,
  error,
  createShareError,
}) => {
  const { colors, isDark } = useTheme();

  const dataTypeLabel =
    dataTypeOptions.find((o) => o.value === resourceType)?.label ||
    resourceType;

  const expiryLabel =
    expiryOption === "custom"
      ? customExpiry
        ? new Date(customExpiry).toLocaleDateString()
        : "Custom date"
      : expiryOption === "never"
        ? "Never expires"
        : expiryOptions.find((o) => o.value === expiryOption)?.label ||
          expiryOption;

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: colors.primary_text, mb: 1 }}
      >
        Review Your Share
      </Typography>
      <Typography sx={{ mb: 3, color: colors.secondary_text }}>
        Confirm the details below and generate your QR code.
      </Typography>

      {/* Summary Card */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
          borderColor: isDark ? "#333333" : colors.border,
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Grid container spacing={3}>
          {/* Share Name */}
          {shareName && (
            <Grid item xs={12} sm={6}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.secondary_text,
                  textTransform: "uppercase",
                }}
              >
                Share Name
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: colors.primary_text, fontWeight: 500 }}
              >
                {shareName}
              </Typography>
            </Grid>
          )}

          {/* Data Type */}
          <Grid item xs={12} sm={6}>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, textTransform: "uppercase" }}
            >
              Data Type
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <Box sx={{ color: colors.primary, "& svg": { fontSize: 20 } }}>
                {ICONS[resourceType]}
              </Box>
              <Typography
                variant="body1"
                sx={{ color: colors.primary_text, fontWeight: 500 }}
              >
                {dataTypeLabel}
              </Typography>
            </Box>
          </Grid>

          {/* Items Count */}
          <Grid item xs={12} sm={6}>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, textTransform: "uppercase" }}
            >
              Selected Items
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: colors.primary_text, fontWeight: 500 }}
            >
              {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}
            </Typography>
          </Grid>

          {/* Permission */}
          <Grid item xs={12} sm={6}>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, textTransform: "uppercase" }}
            >
              Permission
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              {permission === "VIEW" ? (
                <LockIcon sx={{ fontSize: 20, color: colors.primary }} />
              ) : (
                <LockOpenIcon sx={{ fontSize: 20, color: colors.primary }} />
              )}
              <Typography
                variant="body1"
                sx={{ color: colors.primary_text, fontWeight: 500 }}
              >
                {permission === "VIEW" ? "View Only" : "Edit Access"}
              </Typography>
            </Box>
          </Grid>

          {/* Expiry */}
          <Grid item xs={12} sm={6}>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, textTransform: "uppercase" }}
            >
              Expires In
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <ScheduleIcon sx={{ fontSize: 20, color: colors.primary }} />
              <Typography
                variant="body1"
                sx={{ color: colors.primary_text, fontWeight: 500 }}
              >
                {expiryLabel}
              </Typography>
            </Box>
          </Grid>

          {/* Visibility */}
          <Grid item xs={12} sm={6}>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, textTransform: "uppercase" }}
            >
              Visibility
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <Box sx={{ color: colors.primary, "& svg": { fontSize: 20 } }}>
                {VISIBILITY_ICONS[visibility] || <LinkIcon />}
              </Box>
              <Typography
                variant="body1"
                sx={{ color: colors.primary_text, fontWeight: 500 }}
              >
                {VISIBILITY_LABELS[visibility] || visibility}
              </Typography>
            </Box>
          </Grid>

          {/* Selected Friends (if SPECIFIC_USERS) */}
          {visibility === "SPECIFIC_USERS" && selectedFriends?.length > 0 && (
            <Grid item xs={12}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.secondary_text,
                  textTransform: "uppercase",
                }}
              >
                Shared With
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {selectedFriends.map((friend) => (
                  <Chip
                    key={friend.id}
                    avatar={
                      <Avatar src={friend.image} sx={{ width: 24, height: 24 }}>
                        {friend.firstName?.[0] || friend.email?.[0]}
                      </Avatar>
                    }
                    label={
                      `${friend.firstName || ""} ${friend.lastName || ""}`.trim() ||
                      friend.email
                    }
                    size="small"
                    sx={{
                      backgroundColor: isDark ? "#2a2a2a" : colors.card_bg,
                      color: colors.primary_text,
                      border: `1px solid ${isDark ? "#444" : colors.border}`,
                    }}
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Selected Items Preview */}
      <Typography
        variant="subtitle1"
        sx={{ color: colors.primary_text, mb: 2, fontWeight: 600 }}
      >
        Items to Share:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {selectedItems.slice(0, 10).map((item) => (
          <Chip
            key={item.externalRef}
            label={item.displayName}
            size="small"
            sx={{
              backgroundColor: colors.primary,
              color: "#fff",
            }}
          />
        ))}
        {selectedItems.length > 10 && (
          <Chip
            label={`+${selectedItems.length - 10} more`}
            size="small"
            sx={{
              backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
              color: colors.primary_text,
              border: `1px solid ${isDark ? "#333333" : colors.border}`,
            }}
          />
        )}
      </Box>

      {/* Error Display */}
      {(error || createShareError) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || createShareError}
        </Alert>
      )}
    </Box>
  );
};

export default ShareReviewStep;
