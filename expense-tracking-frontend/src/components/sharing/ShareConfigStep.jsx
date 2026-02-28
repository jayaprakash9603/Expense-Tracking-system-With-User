/**
 * =============================================================================
 * ShareConfigStep - Step 2: Configure Share Settings
 * =============================================================================
 *
 * Second step in the share creation flow allowing users to:
 * - Set a share name (optional)
 * - Choose visibility (Link Only, Public, Friends Only, Specific Friends)
 * - Choose permission level (View Only / Edit Access)
 * - Set share expiry duration
 * - Select specific friends (when visibility is SPECIFIC_USERS)
 *
 * @author Expense Tracking System
 * @version 1.3
 * =============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  CircularProgress,
  Collapse,
  Alert,
  ButtonBase,
} from "@mui/material";
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  Public as PublicIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  AllInclusive as AllInclusiveIcon,
  Today as TodayIcon,
  Event as EventIcon,
  DateRange as DateRangeIcon,
  CalendarMonth as CalendarMonthIcon,
  EditCalendar as EditCalendarIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Visibility Config with Colors
// =============================================================================

const VISIBILITY_CONFIG = {
  LINK_ONLY: {
    icon: LinkIcon,
    color: "#6366f1", // Indigo
    bgLight: "rgba(99, 102, 241, 0.1)",
    bgSelected: "rgba(99, 102, 241, 0.2)",
  },
  PUBLIC: {
    icon: PublicIcon,
    color: "#10b981", // Emerald
    bgLight: "rgba(16, 185, 129, 0.1)",
    bgSelected: "rgba(16, 185, 129, 0.2)",
  },
  FRIENDS_ONLY: {
    icon: PeopleIcon,
    color: "#f59e0b", // Amber
    bgLight: "rgba(245, 158, 11, 0.1)",
    bgSelected: "rgba(245, 158, 11, 0.2)",
  },
  SPECIFIC_USERS: {
    icon: PersonAddIcon,
    color: "#ec4899", // Pink
    bgLight: "rgba(236, 72, 153, 0.1)",
    bgSelected: "rgba(236, 72, 153, 0.2)",
  },
};

// =============================================================================
// Expiry Config with Icons and Colors
// =============================================================================

const EXPIRY_CONFIG = {
  never: {
    icon: AllInclusiveIcon,
    color: "#8b5cf6", // Purple
    bgLight: "rgba(139, 92, 246, 0.1)",
    bgSelected: "rgba(139, 92, 246, 0.2)",
  },
  "1day": {
    icon: TodayIcon,
    color: "#ef4444", // Red
    bgLight: "rgba(239, 68, 68, 0.1)",
    bgSelected: "rgba(239, 68, 68, 0.2)",
  },
  "7days": {
    icon: EventIcon,
    color: "#f97316", // Orange
    bgLight: "rgba(249, 115, 22, 0.1)",
    bgSelected: "rgba(249, 115, 22, 0.2)",
  },
  "30days": {
    icon: DateRangeIcon,
    color: "#0ea5e9", // Sky Blue
    bgLight: "rgba(14, 165, 233, 0.1)",
    bgSelected: "rgba(14, 165, 233, 0.2)",
  },
  "90days": {
    icon: CalendarMonthIcon,
    color: "#14b8a6", // Teal
    bgLight: "rgba(20, 184, 166, 0.1)",
    bgSelected: "rgba(20, 184, 166, 0.2)",
  },
  custom: {
    icon: EditCalendarIcon,
    color: "#ec4899", // Pink
    bgLight: "rgba(236, 72, 153, 0.1)",
    bgSelected: "rgba(236, 72, 153, 0.2)",
  },
};

// =============================================================================
// Component
// =============================================================================

const ShareConfigStep = ({
  shareName,
  permission,
  expiryOption,
  customExpiry,
  expiryOptions,
  visibility,
  visibilityOptions,
  selectedFriends,
  friends,
  loadingFriends,
  onShareNameChange,
  onPermissionChange,
  onExpiryOptionChange,
  onCustomExpiryChange,
  onVisibilityChange,
  onSelectedFriendsChange,
}) => {
  const { colors, isDark } = useTheme();
  const [friendSearchTerm, setFriendSearchTerm] = useState("");

  // Filter friends by search term
  const filteredFriends = useMemo(() => {
    if (!friends || !Array.isArray(friends)) return [];
    if (!friendSearchTerm) return friends;
    const search = friendSearchTerm.toLowerCase();
    return friends.filter(
      (friend) =>
        friend?.firstName?.toLowerCase().includes(search) ||
        friend?.lastName?.toLowerCase().includes(search) ||
        friend?.email?.toLowerCase().includes(search),
    );
  }, [friends, friendSearchTerm]);

  // Handle visibility change
  const handleVisibilityChange = (newVisibility) => {
    onVisibilityChange(newVisibility);
    // Clear selected friends when switching away from SPECIFIC_USERS
    if (newVisibility !== "SPECIFIC_USERS" && selectedFriends.length > 0) {
      onSelectedFriendsChange([]);
    }
  };

  // Handle friend toggle
  const handleFriendToggle = (friend) => {
    const isSelected = selectedFriends.some((f) => f.id === friend.id);
    if (isSelected) {
      onSelectedFriendsChange(
        selectedFriends.filter((f) => f.id !== friend.id),
      );
    } else {
      onSelectedFriendsChange([...selectedFriends, friend]);
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: colors.primary_text, mb: 1, fontWeight: 600 }}
      >
        Configure Share Settings
      </Typography>
      <Typography
        sx={{ mb: 2.5, color: colors.secondary_text, fontSize: "0.95rem" }}
      >
        Set visibility, permission level, and expiry duration.
      </Typography>

      {/* Share Name */}
      <TextField
        fullWidth
        size="medium"
        label="Share Name (Optional)"
        value={shareName}
        onChange={(e) => onShareNameChange(e.target.value)}
        placeholder="e.g., January 2026 Expenses"
        sx={{ mb: 3 }}
        InputProps={{
          sx: {
            color: colors.primary_text,
            backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
            fontSize: "1rem",
          },
        }}
        InputLabelProps={{
          sx: { color: colors.secondary_text, fontSize: "1rem" },
        }}
      />

      {/* Visibility Selection - Compact Colorful Cards */}
      <Typography
        variant="subtitle1"
        sx={{
          color: colors.primary_text,
          mb: 1.5,
          fontWeight: 600,
          fontSize: "1rem",
        }}
      >
        Visibility
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {visibilityOptions?.map((option) => {
          const config =
            VISIBILITY_CONFIG[option.value] || VISIBILITY_CONFIG.LINK_ONLY;
          const IconComponent = config.icon;
          const isSelected = visibility === option.value;

          return (
            <Grid item xs={6} sm={3} key={option.value}>
              <Paper
                onClick={() => handleVisibilityChange(option.value)}
                elevation={isSelected ? 3 : 0}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  border: `2px solid ${isSelected ? config.color : isDark ? "#333333" : colors.border}`,
                  backgroundColor: isSelected
                    ? config.bgSelected
                    : isDark
                      ? "#1a1a1a"
                      : colors.card_bg,
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 90,
                  "&:hover": {
                    borderColor: config.color,
                    backgroundColor: config.bgLight,
                    transform: "translateY(-2px)",
                  },
                  "&::before": isSelected
                    ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        backgroundColor: config.color,
                      }
                    : {},
                }}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <CheckCircleIcon
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      fontSize: 18,
                      color: config.color,
                    }}
                  />
                )}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected
                        ? config.color
                        : `${config.color}30`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <IconComponent
                      sx={{
                        color: isSelected ? "#fff" : config.color,
                        fontSize: 24,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isSelected ? config.color : colors.primary_text,
                      fontWeight: 600,
                      textAlign: "center",
                      fontSize: "0.85rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {option.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Friend Selector (for SPECIFIC_USERS) */}
      <Collapse in={visibility === "SPECIFIC_USERS"}>
        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
            border: `2px solid ${VISIBILITY_CONFIG.SPECIFIC_USERS.color}40`,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <PeopleIcon
                sx={{
                  color: VISIBILITY_CONFIG.SPECIFIC_USERS.color,
                  fontSize: 24,
                }}
              />
              <Typography
                variant="subtitle1"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                Select Friends
              </Typography>
              {selectedFriends.length > 0 && (
                <Box
                  sx={{
                    backgroundColor: VISIBILITY_CONFIG.SPECIFIC_USERS.color,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1.5,
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {selectedFriends.length}
                </Box>
              )}
            </Box>
          </Box>

          {selectedFriends.length === 0 && (
            <Alert
              severity="info"
              icon={false}
              sx={{
                mb: 2,
                py: 1,
                backgroundColor: `${VISIBILITY_CONFIG.SPECIFIC_USERS.color}15`,
                border: `1px solid ${VISIBILITY_CONFIG.SPECIFIC_USERS.color}40`,
                fontSize: "0.9rem",
              }}
            >
              Select at least one friend
            </Alert>
          )}

          {/* Search Friends */}
          <TextField
            fullWidth
            size="medium"
            placeholder="Search friends..."
            value={friendSearchTerm}
            onChange={(e) => setFriendSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ color: colors.secondary_text, fontSize: 22 }}
                  />
                </InputAdornment>
              ),
              sx: {
                color: colors.primary_text,
                backgroundColor: isDark ? "#0d0d0d" : colors.background,
                fontSize: "1rem",
              },
            }}
          />

          {/* Friends List */}
          {loadingFriends ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress
                size={20}
                sx={{ color: VISIBILITY_CONFIG.SPECIFIC_USERS.color }}
              />
            </Box>
          ) : filteredFriends.length === 0 ? (
            <Typography
              sx={{
                textAlign: "center",
                py: 2,
                color: colors.secondary_text,
                fontSize: "0.8rem",
              }}
            >
              {friendSearchTerm
                ? "No friends match your search"
                : "No friends found"}
            </Typography>
          ) : (
            <List
              sx={{
                maxHeight: 220,
                overflow: "auto",
                // Custom themed scrollbar
                "&::-webkit-scrollbar": {
                  width: 8,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: isDark ? "#0d0d0d" : "#f1f1f1",
                  borderRadius: 4,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: VISIBILITY_CONFIG.SPECIFIC_USERS.color,
                  borderRadius: 4,
                  "&:hover": {
                    backgroundColor: "#d946a8",
                  },
                },
              }}
            >
              {filteredFriends.map((friend) => {
                const isSelected = selectedFriends.some(
                  (f) => f.id === friend.id,
                );
                return (
                  <ListItem
                    key={friend.id}
                    onClick={() => handleFriendToggle(friend)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      mb: 1,
                      py: 1.5,
                      px: 1,
                      border: `2px solid ${isSelected ? VISIBILITY_CONFIG.SPECIFIC_USERS.color : "transparent"}`,
                      backgroundColor: isSelected
                        ? VISIBILITY_CONFIG.SPECIFIC_USERS.bgSelected
                        : "transparent",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        backgroundColor: isSelected
                          ? VISIBILITY_CONFIG.SPECIFIC_USERS.bgSelected
                          : isDark
                            ? "#2a2a2a"
                            : colors.hover,
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      sx={{
                        color: colors.secondary_text,
                        "&.Mui-checked": {
                          color: VISIBILITY_CONFIG.SPECIFIC_USERS.color,
                        },
                        p: 1,
                      }}
                    />
                    <ListItemAvatar>
                      <Avatar
                        src={friend.profileImage || friend.image}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: isSelected
                            ? VISIBILITY_CONFIG.SPECIFIC_USERS.color
                            : colors.primary,
                          transition: "all 0.15s ease",
                          fontSize: "1rem",
                        }}
                      >
                        {friend.firstName?.[0] || friend.email?.[0] || "?"}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        `${friend.firstName || ""} ${friend.lastName || ""}`.trim() ||
                        friend.email ||
                        "Unknown"
                      }
                      secondary={friend.email || ""}
                      primaryTypographyProps={{
                        sx: {
                          color: isSelected
                            ? VISIBILITY_CONFIG.SPECIFIC_USERS.color
                            : colors.primary_text,
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: "0.95rem",
                        },
                      }}
                      secondaryTypographyProps={{
                        sx: {
                          color: colors.secondary_text,
                          fontSize: "0.85rem",
                        },
                      }}
                    />
                    {isSelected && (
                      <CheckCircleIcon
                        sx={{
                          color: VISIBILITY_CONFIG.SPECIFIC_USERS.color,
                          fontSize: 20,
                        }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      </Collapse>

      {/* Permission & Expiry Row */}
      <Grid container spacing={3}>
        {/* Permission Selection - Left Column */}
        <Grid item xs={12} sm={6}>
          <Typography
            variant="subtitle1"
            sx={{
              color: colors.primary_text,
              mb: 1.5,
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            Permission
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {/* View Only */}
            <ButtonBase
              onClick={() => onPermissionChange("VIEW")}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                border: `2px solid ${permission === "VIEW" ? "#3b82f6" : isDark ? "#333333" : colors.border}`,
                backgroundColor:
                  permission === "VIEW"
                    ? "rgba(59, 130, 246, 0.15)"
                    : isDark
                      ? "#1a1a1a"
                      : colors.card_bg,
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                minHeight: 90,
                "&:hover": {
                  borderColor: "#3b82f6",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    permission === "VIEW"
                      ? "#3b82f6"
                      : "rgba(59, 130, 246, 0.2)",
                }}
              >
                <LockIcon
                  sx={{
                    color: permission === "VIEW" ? "#fff" : "#3b82f6",
                    fontSize: 22,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color:
                    permission === "VIEW" ? "#3b82f6" : colors.primary_text,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                View Only
              </Typography>
            </ButtonBase>

            {/* Edit Access */}
            <ButtonBase
              onClick={() => onPermissionChange("EDIT")}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                border: `2px solid ${permission === "EDIT" ? "#22c55e" : isDark ? "#333333" : colors.border}`,
                backgroundColor:
                  permission === "EDIT"
                    ? "rgba(34, 197, 94, 0.15)"
                    : isDark
                      ? "#1a1a1a"
                      : colors.card_bg,
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                minHeight: 90,
                "&:hover": {
                  borderColor: "#22c55e",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    permission === "EDIT"
                      ? "#22c55e"
                      : "rgba(34, 197, 94, 0.2)",
                }}
              >
                <LockOpenIcon
                  sx={{
                    color: permission === "EDIT" ? "#fff" : "#22c55e",
                    fontSize: 22,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color:
                    permission === "EDIT" ? "#22c55e" : colors.primary_text,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Edit Access
              </Typography>
            </ButtonBase>
          </Box>
        </Grid>

        {/* Expiry Selection - Right Column */}
        <Grid item xs={12} sm={6}>
          <Typography
            variant="subtitle1"
            sx={{
              color: colors.primary_text,
              mb: 1.5,
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            Expiry
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
              minHeight: 90,
            }}
          >
            {expiryOptions.map((option) => {
              const config = EXPIRY_CONFIG[option.value] || EXPIRY_CONFIG.never;
              const IconComponent = config.icon;
              const isSelected = expiryOption === option.value;

              return (
                <ButtonBase
                  key={option.value}
                  onClick={() => onExpiryOptionChange(option.value)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    border: `2px solid ${isSelected ? config.color : isDark ? "#333333" : colors.border}`,
                    backgroundColor: isSelected
                      ? config.bgSelected
                      : isDark
                        ? "#1a1a1a"
                        : colors.card_bg,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    "&:hover": {
                      borderColor: config.color,
                      backgroundColor: config.bgLight,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <IconComponent
                    sx={{
                      color: isSelected ? config.color : colors.secondary_text,
                      fontSize: 18,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: isSelected ? config.color : colors.primary_text,
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: "0.8rem",
                    }}
                  >
                    {option.label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Grid>
      </Grid>

      {/* Custom Expiry Date */}
      <Collapse in={expiryOption === "custom"}>
        <TextField
          fullWidth
          size="medium"
          type="datetime-local"
          label="Custom Expiry Date"
          value={customExpiry}
          onChange={(e) => onCustomExpiryChange(e.target.value)}
          InputLabelProps={{
            shrink: true,
            sx: { color: colors.secondary_text, fontSize: "1rem" },
          }}
          InputProps={{
            sx: {
              color: colors.primary_text,
              backgroundColor: isDark ? "#1a1a1a" : colors.card_bg,
              fontSize: "1rem",
            },
          }}
          sx={{ mt: 2.5 }}
        />
      </Collapse>
    </Box>
  );
};

export default ShareConfigStep;
