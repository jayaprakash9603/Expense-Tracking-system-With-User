/**
 * =============================================================================
 * ShareCard - Reusable Share Card Component
 * =============================================================================
 *
 * A reusable card component for displaying share information.
 * Used by MySharesPage, PublicSharesPage, and SharedWithMePage.
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  QrCode2 as QrCodeIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  MoreVert as MoreIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  CheckCircle as ActiveIcon,
  Cancel as RevokedIcon,
  Schedule as ExpiredIcon,
  Receipt as ExpenseIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  Public as PublicIcon,
  PersonAdd as SharedWithMeIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

// =============================================================================
// Constants
// =============================================================================

export const STATUS_COLORS = {
  active: "#10b981",
  expired: "#f59e0b",
  revoked: "#ef4444",
};

export const RESOURCE_ICONS = {
  EXPENSE: <ExpenseIcon />,
  CATEGORY: <CategoryIcon />,
  BUDGET: <BudgetIcon />,
};

// =============================================================================
// Utility Functions
// =============================================================================

export const getShareStatus = (share) => {
  if (!share.isActive) return "revoked";
  if (share.expiresAt && new Date(share.expiresAt) < new Date())
    return "expired";
  return "active";
};

export const formatDate = (dateString) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return "No expiry";
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;

  if (diff < 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return "Expires soon";
};

// =============================================================================
// Component
// =============================================================================

const ShareCard = ({
  share,
  // Action handlers
  onMenuOpen,
  onViewQr,
  onCopyLink,
  onDownloadQr,
  onRevokeClick,
  onAccessShare,
  // State
  copied,
  qrLoading,
  // Mode: "owner" | "public" | "shared-with-me"
  mode = "owner",
  // Show/hide specific actions
  showViewQr = true,
  showCopyLink = true,
  showDownloadQr = true,
  showRevoke = true,
  showMenu = true,
  showOwnerInfo = false,
}) => {
  const { colors } = useTheme();

  const status = getShareStatus(share);
  const statusColor = STATUS_COLORS[status];
  const StatusIcon =
    status === "active"
      ? ActiveIcon
      : status === "expired"
        ? ExpiredIcon
        : RevokedIcon;

  const isDisabled = status === "revoked" || status === "expired";

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        transition: "all 0.3s ease",
        position: "relative",
        cursor: mode !== "owner" && onAccessShare ? "pointer" : "default",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px rgba(20, 184, 166, 0.15)`,
          borderColor: colors.accent,
        },
      }}
      onClick={() => {
        if (mode !== "owner" && onAccessShare && !isDisabled) {
          onAccessShare(share);
        }
      }}
    >
      <CardContent sx={{ pb: 1, pt: 1.5, px: 2 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              {RESOURCE_ICONS[share.resourceType] || (
                <QrCodeIcon sx={{ color: colors.accent, fontSize: 20 }} />
              )}
              <Typography
                variant="subtitle1"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {share.shareName || `${share.resourceType} Share`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <Chip
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                size="small"
                sx={{
                  bgcolor: `${statusColor}20`,
                  color: statusColor,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: "20px",
                }}
              />
              {mode === "public" && (
                <Chip
                  icon={<PublicIcon sx={{ fontSize: 12 }} />}
                  label="Public"
                  size="small"
                  sx={{
                    bgcolor: `${colors.accent}20`,
                    color: colors.accent,
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    height: "20px",
                    "& .MuiChip-icon": { fontSize: 12 },
                  }}
                />
              )}
              {mode === "shared-with-me" && (
                <Chip
                  icon={<SharedWithMeIcon sx={{ fontSize: 12 }} />}
                  label="Shared"
                  size="small"
                  sx={{
                    bgcolor: `${colors.accent}20`,
                    color: colors.accent,
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    height: "20px",
                    "& .MuiChip-icon": { fontSize: 12 },
                  }}
                />
              )}
            </Box>
          </Box>
          {showMenu && mode === "owner" && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuOpen?.(e, share.id);
              }}
              sx={{
                color: colors.accent,
                "&:hover": { bgcolor: colors.hover_bg },
              }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Owner Info (for public/shared-with-me modes) */}
        {showOwnerInfo && share.owner && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 1,
              p: 0.5,
              bgcolor: colors.hover_bg,
              borderRadius: "4px",
            }}
          >
            <PersonIcon sx={{ fontSize: 14, color: colors.secondary_text }} />
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, fontSize: "0.75rem" }}
            >
              Shared by:{" "}
              {share.owner?.firstName || share.owner?.username || "Unknown"}
            </Typography>
          </Box>
        )}

        {/* Info Row */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            icon={
              share.permission === "VIEW" ? (
                <ViewIcon sx={{ fontSize: 14 }} />
              ) : (
                <EditIcon sx={{ fontSize: 14 }} />
              )
            }
            label={share.permission}
            size="small"
            sx={{
              bgcolor: colors.hover_bg,
              color: colors.primary_text,
              height: "22px",
              fontSize: "0.7rem",
            }}
          />
          <Chip
            label={`${share.resourceCount || 0} items`}
            size="small"
            sx={{
              bgcolor: colors.hover_bg,
              color: colors.secondary_text,
              height: "22px",
              fontSize: "0.7rem",
            }}
          />
        </Box>

        {/* Stats Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <TimeIcon sx={{ fontSize: 14, color: colors.secondary_text }} />
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, fontSize: "0.75rem" }}
            >
              {getTimeRemaining(share.expiresAt)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 14, color: colors.secondary_text }} />
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, fontSize: "0.75rem" }}
            >
              {share.accessCount || 0} views
            </Typography>
          </Box>
        </Box>

        {/* Share URL - Compact */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            p: 0.75,
            bgcolor: colors.hover_bg,
            borderRadius: "6px",
            cursor: "pointer",
            "&:hover": {
              bgcolor: colors.border,
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onCopyLink?.(
              share.shareUrl ||
                `${window.location.origin}/share/${share.token}`,
              share.id,
            );
          }}
        >
          <LinkIcon sx={{ fontSize: 12, color: colors.accent }} />
          <Typography
            variant="caption"
            sx={{
              color: colors.secondary_text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              fontSize: "0.7rem",
            }}
          >
            {share.shareUrl || `${window.location.origin}/share/${share.token}`}
          </Typography>
          {copied === share.id ? (
            <CheckIcon sx={{ fontSize: 12, color: STATUS_COLORS.active }} />
          ) : (
            <CopyIcon sx={{ fontSize: 12, color: colors.secondary_text }} />
          )}
        </Box>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: "flex-end",
          px: 1.5,
          pb: 1,
          pt: 0,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        {showViewQr && (
          <Tooltip title="View QR Code">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onViewQr?.(share);
              }}
              sx={{
                color: colors.accent,
                "&:hover": { bgcolor: colors.hover_bg },
              }}
              disabled={isDisabled || qrLoading}
            >
              <QrCodeIcon />
            </IconButton>
          </Tooltip>
        )}
        {showCopyLink && (
          <Tooltip title={copied === share.id ? "Copied!" : "Copy Link"}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink?.(
                  share.shareUrl ||
                    `${window.location.origin}/share/${share.token}`,
                  share.id,
                );
              }}
              sx={{
                color:
                  copied === share.id
                    ? STATUS_COLORS.active
                    : colors.secondary_text,
              }}
              disabled={isDisabled}
            >
              {copied === share.id ? <CheckIcon /> : <CopyIcon />}
            </IconButton>
          </Tooltip>
        )}
        {showDownloadQr && (
          <Tooltip title="Download QR">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadQr?.(share);
              }}
              sx={{
                color: colors.secondary_text,
                "&:hover": { bgcolor: colors.hover_bg },
              }}
              disabled={isDisabled || qrLoading}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {showRevoke && mode === "owner" && (
          <Tooltip title="Revoke Share">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRevokeClick?.(share);
              }}
              sx={{
                color: colors.error,
                "&:hover": { bgcolor: `${colors.error}20` },
              }}
              disabled={status !== "active"}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default ShareCard;
