/**
 * ActivityCard Component
 * Displays a single friend activity item with details and actions.
 */

import React, { useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Description as BillIcon,
  AccountBalanceWallet as BudgetIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  CheckCircle as ReadIcon,
  Add as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";
import useUserSettings from "../../../../hooks/useUserSettings";
import {
  formatRelativeTime,
  formatSmartDate,
  formatAmount,
  getEntityColor,
  getActionColor,
  parseMetadata,
} from "../utils";

/**
 * Get icon component based on entity type
 */
const getEntityIcon = (entityType) => {
  const icons = {
    EXPENSE: ReceiptIcon,
    BILL: BillIcon,
    BUDGET: BudgetIcon,
    CATEGORY: CategoryIcon,
    PAYMENT: PaymentIcon,
  };
  return icons[entityType] || ReceiptIcon;
};

/**
 * Get action icon component
 */
const getActionIcon = (action) => {
  const icons = {
    CREATE: CreateIcon,
    UPDATE: UpdateIcon,
    DELETE: DeleteIcon,
  };
  return icons[action] || UpdateIcon;
};

const ActivityCard = ({
  activity,
  onMarkAsRead,
  onViewDetails,
  compact = false,
  showAvatar = true,
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  const {
    id,
    actorUser,
    actorUserName,
    sourceService,
    entityType,
    action,
    description,
    actionText,
    amount,
    timestamp,
    isRead,
    entityPayload,
    metadata: rawMetadata,
  } = activity;

  // Parse metadata
  const metadata = useMemo(() => parseMetadata(rawMetadata), [rawMetadata]);

  // Get colors
  const entityColor = useMemo(() => getEntityColor(entityType), [entityType]);
  const actionColor = useMemo(() => getActionColor(action), [action]);

  // Get icons
  const EntityIconComponent = getEntityIcon(entityType);
  const ActionIconComponent = getActionIcon(action);

  // Format display values
  const displayAmount = useMemo(() => {
    if (amount == null) return null;
    return formatAmount(amount, currencySymbol);
  }, [amount, currencySymbol]);

  const relativeTime = useMemo(
    () => formatRelativeTime(timestamp),
    [timestamp],
  );
  const fullDate = useMemo(() => formatSmartDate(timestamp), [timestamp]);

  // Get avatar initials
  const avatarInitials = useMemo(() => {
    if (actorUser?.firstName && actorUser?.lastName) {
      return `${actorUser.firstName[0]}${actorUser.lastName[0]}`.toUpperCase();
    }
    if (actorUserName) {
      const parts = actorUserName.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return actorUserName.substring(0, 2).toUpperCase();
    }
    return "??";
  }, [actorUser, actorUserName]);

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    (e) => {
      e.stopPropagation();
      if (onMarkAsRead && !isRead) {
        onMarkAsRead(id);
      }
    },
    [onMarkAsRead, id, isRead],
  );

  // Handle click on card
  const handleClick = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(activity);
    }
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }
  }, [onViewDetails, activity, isRead, onMarkAsRead, id]);

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        p: compact ? 1.5 : 2,
        backgroundColor: isRead ? colors.secondary_bg : colors.primary_bg,
        borderRadius: "8px",
        border: `1px solid ${isRead ? colors.border_color : entityColor}40`,
        cursor: onViewDetails ? "pointer" : "default",
        transition: "all 0.2s ease",
        position: "relative",
        "&:hover": {
          backgroundColor: colors.tertiary_bg,
          transform: "translateX(4px)",
        },
        ...(!isRead && {
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "3px",
            backgroundColor: entityColor,
            borderRadius: "8px 0 0 8px",
          },
        }),
      }}
    >
      {/* Avatar / Icon */}
      {showAvatar ? (
        <Avatar
          sx={{
            width: compact ? 36 : 44,
            height: compact ? 36 : 44,
            backgroundColor: `${entityColor}20`,
            color: entityColor,
            fontSize: compact ? "0.875rem" : "1rem",
            fontWeight: 600,
          }}
        >
          {avatarInitials}
        </Avatar>
      ) : (
        <Box
          sx={{
            width: compact ? 36 : 44,
            height: compact ? 36 : 44,
            borderRadius: "50%",
            backgroundColor: `${entityColor}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EntityIconComponent
            sx={{
              fontSize: compact ? 20 : 24,
              color: entityColor,
            }}
          />
        </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant={compact ? "body2" : "subtitle2"}
            sx={{
              fontWeight: 600,
              color: colors.primary_text,
            }}
          >
            {actorUserName || "Someone"}
          </Typography>

          <Chip
            size="small"
            icon={<ActionIconComponent sx={{ fontSize: "14px !important" }} />}
            label={action}
            sx={{
              height: 20,
              fontSize: "0.7rem",
              backgroundColor: `${actionColor}20`,
              color: actionColor,
              "& .MuiChip-icon": { color: actionColor },
            }}
          />

          <Chip
            size="small"
            label={entityType}
            sx={{
              height: 20,
              fontSize: "0.7rem",
              backgroundColor: `${entityColor}20`,
              color: entityColor,
            }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: colors.secondary_text,
            mb: 0.5,
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {actionText || description}
        </Typography>

        {/* Footer Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mt: 0.5,
          }}
        >
          <Tooltip title={fullDate}>
            <Typography
              variant="caption"
              sx={{
                color: colors.tertiary_text,
                fontSize: "0.75rem",
              }}
            >
              {relativeTime}
            </Typography>
          </Tooltip>

          {/* Amount if present */}
          {displayAmount && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: amount < 0 ? "#ef4444" : "#22c55e",
              }}
            >
              {displayAmount}
            </Typography>
          )}
        </Box>

        {/* Entity details preview */}
        {entityPayload && !compact && (
          <Box
            sx={{
              mt: 1,
              p: 1,
              backgroundColor: colors.secondary_bg,
              borderRadius: "6px",
              borderLeft: `3px solid ${entityColor}`,
            }}
          >
            {entityPayload.name && (
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: colors.primary_text }}
              >
                {entityPayload.name}
              </Typography>
            )}
            {(entityPayload.category || metadata?.category) && (
              <Typography
                variant="caption"
                sx={{ color: colors.tertiary_text }}
              >
                Category: {entityPayload.category || metadata.category}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {!isRead && onMarkAsRead && (
          <Tooltip title="Mark as read">
            <IconButton
              size="small"
              onClick={handleMarkAsRead}
              sx={{
                color: colors.tertiary_text,
                "&:hover": {
                  color: "#22c55e",
                  backgroundColor: "#22c55e20",
                },
              }}
            >
              <MarkReadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {isRead && (
          <Tooltip title="Read">
            <ReadIcon
              sx={{
                fontSize: 18,
                color: "#22c55e",
                opacity: 0.6,
              }}
            />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(ActivityCard);
