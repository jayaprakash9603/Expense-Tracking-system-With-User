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
 * UI/UX Improvements:
 * - Structured, visually appealing detail cards
 * - Scrollable, clean list of selected items
 * - High-contrast summaries for better readability
 *
 * @author Expense Tracking System
 * @version 2.0
 * =============================================================================
 */

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  CreditCard as PaymentMethodIcon,
  Description as BillIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  Public as PublicIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Icon Mapping
// =============================================================================

const ICONS = {
  EXPENSE: <ReceiptIcon />,
  CATEGORY: <CategoryIcon />,
  PAYMENT_METHOD: <PaymentMethodIcon />,
  BILL: <BillIcon />,
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
// Helper Component for Details
// =============================================================================

const DetailCard = ({ icon, title, value, valueColor, isDark, colors }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
      p: 2,
      borderRadius: "16px",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
      height: "100%",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "12px",
        backgroundColor: `${colors.primary_accent}15`,
        color: colors.primary_accent,
        flexShrink: 0,
        "& svg": { fontSize: 20 },
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: colors.secondary_text,
          textTransform: "uppercase",
          fontWeight: 600,
          letterSpacing: "0.5px",
          display: "block",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: valueColor || colors.primary_text,
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

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
    dataTypeOptions.find((o) => o.value === resourceType)?.label || resourceType;

  const expiryLabel =
    expiryOption === "custom"
      ? customExpiry
        ? new Date(customExpiry).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Custom date"
      : expiryOption === "never"
        ? "Never expires"
        : expiryOptions.find((o) => o.value === expiryOption)?.label || expiryOption;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: colors.primary_text, fontWeight: 700, mb: 1 }}>
          Review & Generate
        </Typography>
        <Typography sx={{ color: colors.secondary_text, fontSize: "0.95rem" }}>
          Please review your share configurations before generating the QR code.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Share Name */}
        {shareName && (
          <Grid item xs={12} sm={6} md={4}>
            <DetailCard
              icon={<BadgeIcon />}
              title="Share Name"
              value={shareName}
              isDark={isDark}
              colors={colors}
            />
          </Grid>
        )}

        {/* Data Type */}
        <Grid item xs={12} sm={6} md={4}>
          <DetailCard
            icon={ICONS[resourceType] || ICONS.EXPENSE}
            title="Data Type"
            value={dataTypeLabel}
            isDark={isDark}
            colors={colors}
          />
        </Grid>

        {/* Permission */}
        <Grid item xs={12} sm={6} md={4}>
          <DetailCard
            icon={permission === "VIEW" ? <LockIcon /> : <LockOpenIcon />}
            title="Permission"
            value={permission === "VIEW" ? "View Only" : "Edit Access"}
            valueColor={permission === "VIEW" ? undefined : colors.primary_accent}
            isDark={isDark}
            colors={colors}
          />
        </Grid>

        {/* Expiry */}
        <Grid item xs={12} sm={6} md={4}>
          <DetailCard
            icon={<ScheduleIcon />}
            title="Expires In"
            value={expiryLabel}
            isDark={isDark}
            colors={colors}
          />
        </Grid>

        {/* Visibility */}
        <Grid item xs={12} sm={6} md={4}>
          <DetailCard
            icon={VISIBILITY_ICONS[visibility] || <LinkIcon />}
            title="Visibility"
            value={VISIBILITY_LABELS[visibility] || visibility}
            isDark={isDark}
            colors={colors}
          />
        </Grid>
      </Grid>

      {/* Specific Friends Section */}
      {visibility === "SPECIFIC_USERS" && selectedFriends?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: colors.primary_text, fontWeight: 600, mb: 1.5, textTransform: "uppercase", letterSpacing: "0.5px" }}
          >
            Shared With ({selectedFriends.length} friend{selectedFriends.length > 1 ? "s" : ""})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {selectedFriends.map((friend) => (
              <Box
                key={friend.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1,
                  pr: 2,
                  borderRadius: "50px",
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                }}
              >
                <Avatar src={friend.image} sx={{ width: 28, height: 28, fontSize: "0.8rem", bgcolor: colors.primary_accent }}>
                  {friend.firstName?.[0] || friend.email?.[0]}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500, color: colors.primary_text }}>
                  {`${friend.firstName || ""} ${friend.lastName || ""}`.trim() || friend.email}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Selected Items List */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: colors.primary_text,
            fontWeight: 600,
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Selected Items to Share ({selectedItems.length})
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            overflow: "auto",
            backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#ffffff",
            borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)",
            borderRadius: "16px",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
              borderRadius: "3px",
            },
          }}
        >
          <List disablePadding>
            {selectedItems.map((item, index) => (
              <React.Fragment key={item.externalRef}>
                <ListItem sx={{ px: 2.5, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        backgroundColor: `${colors.primary_accent}15`,
                        color: colors.primary_accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "& svg": { fontSize: 18 },
                      }}
                    >
                      {ICONS[resourceType] || ICONS.EXPENSE}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.displayName}
                    secondary={item.subtitle}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                      color: colors.primary_text,
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                      color: colors.secondary_text,
                    }}
                  />
                </ListItem>
                {index < selectedItems.length - 1 && (
                  <Divider sx={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Error Display */}
      {(error || createShareError) && (
        <Alert severity="error" sx={{ mt: 3, borderRadius: "12px", flexShrink: 0 }}>
          {error || createShareError}
        </Alert>
      )}
    </Box>
  );
};

export default ShareReviewStep;