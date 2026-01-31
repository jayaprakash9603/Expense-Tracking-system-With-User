/**
 * =============================================================================
 * ShareConfigStep - Step 2: Configure Share Settings
 * =============================================================================
 *
 * Second step in the share creation flow allowing users to:
 * - Set a share name (optional)
 * - Choose permission level (View Only / Edit Access)
 * - Set share expiry duration
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React from "react";
import { Box, Typography, Paper, Grid, TextField, Chip } from "@mui/material";
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Component
// =============================================================================

const ShareConfigStep = ({
  shareName,
  permission,
  expiryOption,
  customExpiry,
  expiryOptions,
  onShareNameChange,
  onPermissionChange,
  onExpiryOptionChange,
  onCustomExpiryChange,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: colors.primary_text, mb: 1 }}
      >
        Configure Share Settings
      </Typography>
      <Typography sx={{ mb: 3, color: colors.secondary_text }}>
        Set the permission level and how long this share will be active.
      </Typography>

      {/* Share Name */}
      <TextField
        fullWidth
        label="Share Name (Optional)"
        value={shareName}
        onChange={(e) => onShareNameChange(e.target.value)}
        placeholder="e.g., January 2026 Expenses"
        sx={{ mb: 3 }}
        InputProps={{
          sx: {
            color: colors.primary_text,
            backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
          },
        }}
        InputLabelProps={{
          sx: { color: colors.secondary_text },
        }}
      />

      {/* Permission Selection */}
      <Typography
        variant="subtitle1"
        sx={{ color: colors.primary_text, mb: 2, fontWeight: 600 }}
      >
        Permission Level
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper
            onClick={() => onPermissionChange("VIEW")}
            sx={{
              p: 3,
              cursor: "pointer",
              border: `2px solid ${
                permission === "VIEW"
                  ? colors.primary
                  : isDark
                    ? "#333333"
                    : colors.border
              }`,
              backgroundColor:
                permission === "VIEW"
                  ? `${colors.primary}15`
                  : isDark
                    ? "#1a1a1a"
                    : colors.card_bg,
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: colors.primary,
              },
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
            >
              <LockIcon
                sx={{
                  color:
                    permission === "VIEW"
                      ? colors.primary
                      : colors.secondary_text,
                  fontSize: 24,
                }}
              />
              <Typography
                variant="subtitle1"
                sx={{ color: colors.primary_text, fontWeight: 600 }}
              >
                View Only
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              Recipients can only see the data. They cannot make any changes.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper
            onClick={() => onPermissionChange("EDIT")}
            sx={{
              p: 3,
              cursor: "pointer",
              border: `2px solid ${
                permission === "EDIT"
                  ? colors.primary
                  : isDark
                    ? "#333333"
                    : colors.border
              }`,
              backgroundColor:
                permission === "EDIT"
                  ? `${colors.primary}15`
                  : isDark
                    ? "#1a1a1a"
                    : colors.card_bg,
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: colors.primary,
              },
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
            >
              <LockOpenIcon
                sx={{
                  color:
                    permission === "EDIT"
                      ? colors.primary
                      : colors.secondary_text,
                  fontSize: 24,
                }}
              />
              <Typography
                variant="subtitle1"
                sx={{ color: colors.primary_text, fontWeight: 600 }}
              >
                Edit Access
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              Recipients can add or update items in the shared collection.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Expiry Selection */}
      <Typography
        variant="subtitle1"
        sx={{ color: colors.primary_text, mb: 2, fontWeight: 600 }}
      >
        Share Expiry
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {expiryOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            onClick={() => onExpiryOptionChange(option.value)}
            icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
            sx={{
              backgroundColor:
                expiryOption === option.value
                  ? colors.primary
                  : isDark
                    ? "#1a1a1a"
                    : colors.card_bg,
              color:
                expiryOption === option.value ? "#fff" : colors.primary_text,
              border: `1px solid ${
                expiryOption === option.value
                  ? colors.primary
                  : isDark
                    ? "#333333"
                    : colors.border
              }`,
              "&:hover": {
                backgroundColor:
                  expiryOption === option.value
                    ? colors.primary
                    : `${colors.primary}20`,
              },
            }}
          />
        ))}
      </Box>

      {/* Custom Expiry Date */}
      {expiryOption === "custom" && (
        <TextField
          fullWidth
          type="datetime-local"
          label="Custom Expiry Date"
          value={customExpiry}
          onChange={(e) => onCustomExpiryChange(e.target.value)}
          InputLabelProps={{
            shrink: true,
            sx: { color: colors.secondary_text },
          }}
          InputProps={{
            sx: {
              color: colors.primary_text,
              backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
            },
          }}
          sx={{ mt: 2 }}
        />
      )}
    </Box>
  );
};

export default ShareConfigStep;
