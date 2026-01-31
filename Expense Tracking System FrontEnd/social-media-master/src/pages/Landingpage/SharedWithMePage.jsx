/**
 * =============================================================================
 * SharedWithMePage - View QR-Code Shares Shared With Me
 * =============================================================================
 *
 * Production-grade Shared With Me page following the MySharesPage pattern:
 * 1. Display all QR-code shares that others have shared with the user
 * 2. Show share status (active, expired)
 * 3. Quick actions (view, copy link, save/bookmark)
 * 4. Statistics dashboard with SharedOverviewCards
 *
 * @author Expense Tracking System
 * @version 3.0
 * =============================================================================
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert,
  Tooltip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Skeleton,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import {
  QrCode2 as QrCodeIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  CheckCircle as ActiveIcon,
  Cancel as RevokedIcon,
  Schedule as ExpiredIcon,
  Receipt as ExpenseIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  OpenInNew as OpenIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTheme } from "../../hooks/useTheme";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import {
  fetchSharedWithMe,
  toggleSaveShare,
  regenerateQr,
} from "../../Redux/Shares/shares.actions";
import QrDisplayScreen from "../../components/sharing/QrDisplayScreen";

// =============================================================================
// Constants
// =============================================================================

const STATUS_COLORS = {
  active: "#10b981",
  expired: "#f59e0b",
  revoked: "#ef4444",
};

const RESOURCE_ICONS = {
  EXPENSE: <ExpenseIcon sx={{ fontSize: 20 }} />,
  CATEGORY: <CategoryIcon sx={{ fontSize: 20 }} />,
  BUDGET: <BudgetIcon sx={{ fontSize: 20 }} />,
};

// =============================================================================
// Main Component
// =============================================================================

const SharedWithMePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  // Redux state
  const {
    sharedWithMe = [],
    sharedWithMeLoading,
    sharedWithMeError,
    toggleSaveLoading,
  } = useSelector((state) => state.shares);

  // Local state
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShare, setSelectedShare] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [qrLoading, setQrLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const loadData = useCallback(() => {
    dispatch(fetchSharedWithMe());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------------------------------------------------------------------
  // Utility Functions
  // ---------------------------------------------------------------------------

  const getShareStatus = (share) => {
    if (!share.isActive) return "revoked";
    if (share.expiresAt && new Date(share.expiresAt) < new Date())
      return "expired";
    return "active";
  };

  const getTimeRemaining = (expiresAt) => {
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

  const copyToClipboard = async (text, shareId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(shareId);
      setTimeout(() => setCopied(null), 2000);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleViewQr = async (share) => {
    setQrLoading(true);
    try {
      const result = await dispatch(regenerateQr(share.token));
      if (result.success) {
        setSelectedShare({
          ...share,
          shareUrl:
            result.data?.shareUrl ||
            share.shareUrl ||
            `${window.location.origin}/share/${share.token}`,
          qrCodeDataUri: result.data?.qrCodeDataUri,
        });
        setShowQrModal(true);
      } else {
        toast.error(result.error || "Failed to generate QR code");
      }
    } catch (err) {
      toast.error("Failed to generate QR code");
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQr = async (share) => {
    try {
      let qrCodeDataUri = share.qrCodeDataUri;
      if (!qrCodeDataUri) {
        setQrLoading(true);
        const result = await dispatch(regenerateQr(share.token));
        if (result.success) {
          qrCodeDataUri = result.data?.qrCodeDataUri;
        } else {
          toast.error("Failed to generate QR code for download");
          setQrLoading(false);
          return;
        }
        setQrLoading(false);
      }
      if (qrCodeDataUri) {
        const link = document.createElement("a");
        link.href = qrCodeDataUri;
        link.download = `share-qr-${share.shareName || share.token?.substring(0, 8) || "code"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR code downloaded!");
      }
    } catch (err) {
      toast.error("Failed to download QR code");
    }
  };

  const handleAccessShare = (share) => {
    if (share.token) {
      navigate(`/share/${share.token}`);
    } else {
      toast.error("Unable to access this share");
    }
  };

  const handleToggleSave = async (share) => {
    if (!share.token) return;
    const result = await dispatch(toggleSaveShare(share.token));
    if (result.success) {
      toast.success(result.data?.isSaved ? "Share saved!" : "Share unsaved");
    } else {
      toast.error(result.error || "Failed to update save status");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  // ---------------------------------------------------------------------------
  // Filtered Data & Statistics
  // ---------------------------------------------------------------------------

  const activeCount = useMemo(
    () => sharedWithMe.filter((s) => getShareStatus(s) === "active").length,
    [sharedWithMe],
  );

  const savedCount = useMemo(
    () => sharedWithMe.filter((s) => s.isSaved).length,
    [sharedWithMe],
  );

  const editableCount = useMemo(
    () => sharedWithMe.filter((s) => s.permission === "EDIT").length,
    [sharedWithMe],
  );

  const expiredCount = useMemo(
    () => sharedWithMe.filter((s) => getShareStatus(s) === "expired").length,
    [sharedWithMe],
  );

  // Filter shares based on active tab and search term
  const filteredShares = useMemo(() => {
    let filtered = [...sharedWithMe];

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (share) =>
          share.shareName?.toLowerCase().includes(search) ||
          share.owner?.firstName?.toLowerCase().includes(search) ||
          share.owner?.lastName?.toLowerCase().includes(search) ||
          share.owner?.username?.toLowerCase().includes(search) ||
          share.resourceType?.toLowerCase().includes(search) ||
          share.token?.toLowerCase().includes(search),
      );
    }

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter((s) => getShareStatus(s) === "active");
    } else if (activeTab === 2) {
      filtered = filtered.filter((s) => s.isSaved);
    } else if (activeTab === 3) {
      filtered = filtered.filter((s) => s.permission === "EDIT");
    }

    return filtered;
  }, [sharedWithMe, searchTerm, activeTab]);

  // Prepare data for SharedOverviewCards
  const overviewCardsData = useMemo(
    () => [
      {
        totalShares: sharedWithMe.length,
        activeShares: activeCount,
        totalViews: sharedWithMe.reduce(
          (sum, s) => sum + (s.accessCount || 0),
          0,
        ),
        expiredShares: expiredCount,
      },
    ],
    [sharedWithMe.length, activeCount, expiredCount],
  );

  // ---------------------------------------------------------------------------
  // Render Functions
  // ---------------------------------------------------------------------------

  const renderShareCard = (share) => {
    const status = getShareStatus(share);
    const statusColor = STATUS_COLORS[status];
    const isDisabled = status === "revoked" || status === "expired";

    return (
      <Card
        key={share.id}
        sx={{
          background: `linear-gradient(135deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          transition: "all 0.3s ease",
          position: "relative",
          cursor: !isDisabled ? "pointer" : "default",
          opacity: isDisabled ? 0.7 : 1,
          "&:hover": {
            transform: !isDisabled ? "translateY(-4px)" : "none",
            boxShadow: !isDisabled
              ? `0 8px 24px rgba(20, 184, 166, 0.15)`
              : "none",
            borderColor: !isDisabled ? colors.accent : colors.border,
          },
        }}
        onClick={() => !isDisabled && handleAccessShare(share)}
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
                <Chip
                  icon={<ShareIcon sx={{ fontSize: 12 }} />}
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
              </Box>
            </Box>
            <Tooltip title={share.isSaved ? "Unsave" : "Save for later"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSave(share);
                }}
                disabled={toggleSaveLoading}
                sx={{
                  color: share.isSaved ? "#ffc107" : colors.secondary_text,
                  "&:hover": { bgcolor: colors.hover_bg },
                }}
              >
                {share.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Owner Info */}
          {share.owner && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                p: 0.75,
                bgcolor: colors.hover_bg,
                borderRadius: "6px",
              }}
            >
              <Avatar
                src={share.owner?.profileImage}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: colors.accent,
                  fontSize: "0.7rem",
                }}
              >
                {share.owner?.firstName?.[0] ||
                  share.owner?.username?.[0] ||
                  "?"}
              </Avatar>
              <Typography
                variant="caption"
                sx={{ color: colors.secondary_text, fontSize: "0.75rem" }}
              >
                Shared by{" "}
                <strong style={{ color: colors.primary_text }}>
                  {share.owner?.firstName || share.owner?.username || "Unknown"}
                </strong>
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
              copyToClipboard(
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
              {share.shareUrl ||
                `${window.location.origin}/share/${share.token}`}
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
            justifyContent: "space-between",
            px: 1.5,
            pb: 1,
            pt: 0,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <Button
            size="small"
            variant="contained"
            startIcon={<OpenIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleAccessShare(share);
            }}
            disabled={isDisabled}
            sx={{
              textTransform: "none",
              bgcolor: colors.accent,
              fontSize: "0.75rem",
              px: 1.5,
              py: 0.5,
              "&:hover": { bgcolor: colors.accent_hover },
              "&:disabled": { bgcolor: colors.disabled },
            }}
          >
            View Data
          </Button>
          <Box>
            <Tooltip title="View QR Code">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewQr(share);
                }}
                sx={{
                  color: colors.accent,
                  "&:hover": { bgcolor: colors.hover_bg },
                }}
                disabled={isDisabled || qrLoading}
              >
                <QrCodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={copied === share.id ? "Copied!" : "Copy Link"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(
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
                {copied === share.id ? (
                  <CheckIcon fontSize="small" />
                ) : (
                  <CopyIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Download QR">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadQr(share);
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
          </Box>
        </CardActions>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Box
      sx={{
        p: 4,
        textAlign: "center",
        backgroundColor: "transparent",
        border: `2px dashed ${colors.border}`,
        borderRadius: "12px",
      }}
    >
      <ShareIcon sx={{ fontSize: 48, color: colors.secondary_text, mb: 1.5 }} />
      <Typography
        variant="h6"
        sx={{ color: colors.primary_text, mb: 0.5, fontSize: "1rem" }}
      >
        {searchTerm ? "No shares match your search" : "No shares yet"}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: colors.secondary_text, mb: 2, fontSize: "0.85rem" }}
      >
        {searchTerm
          ? "Try a different search term"
          : "When someone shares data with you via a QR code or link, it will appear here after you access it."}
      </Typography>
    </Box>
  );

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  if (sharedWithMeLoading && sharedWithMe.length === 0) {
    return (
      <Box
        sx={{
          backgroundColor: colors.secondary_bg,
          width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          borderRadius: "8px",
          border: `1px solid ${colors.border}`,
          p: isSmallScreen ? 1.5 : 2,
          mr: isSmallScreen ? 0 : "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Skeleton variant="text" height={40} width={200} sx={{ mb: 1 }} />
        <Divider sx={{ mb: 1.5 }} />
        <Skeleton
          variant="rectangular"
          height={100}
          sx={{ mb: 1.5, borderRadius: 2 }}
        />
        <Skeleton
          variant="rectangular"
          height={48}
          sx={{ mb: 1.5, borderRadius: 2 }}
        />
        <Skeleton
          variant="rectangular"
          height={40}
          width={400}
          sx={{ mb: 1.5, borderRadius: 2 }}
        />
        <Grid container spacing={1.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton
                variant="rectangular"
                height={180}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: colors.secondary_bg,
        width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        borderRadius: "8px",
        border: `1px solid ${colors.border}`,
        p: isSmallScreen ? 1.5 : 2,
        mr: isSmallScreen ? 0 : "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isSmallScreen ? "flex-start" : "center",
          mb: 1.5,
          gap: isSmallScreen ? 1 : 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ShareIcon sx={{ fontSize: 28, color: colors.accent }} />
          <Typography
            variant="h3"
            sx={{
              color: colors.primary_text,
              fontWeight: "bold",
              fontSize: isSmallScreen ? "1.25rem" : "1.5rem",
            }}
          >
            Shared With Me
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Tooltip title="Refresh">
            <IconButton
              onClick={loadData}
              disabled={sharedWithMeLoading}
              sx={{
                color: colors.accent,
                bgcolor: colors.card_bg,
                border: `1px solid ${colors.border}`,
                borderRadius: "6px",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: colors.hover_bg,
                  borderColor: colors.accent,
                },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={handleViewModeToggle}
            sx={{
              color: colors.accent,
              bgcolor: colors.card_bg,
              border: `1px solid ${colors.border}`,
              borderRadius: "6px",
              width: 36,
              height: 36,
              "&:hover": {
                bgcolor: colors.hover_bg,
                borderColor: colors.accent,
              },
            }}
          >
            {viewMode === "grid" ? (
              <ListViewIcon fontSize="small" />
            ) : (
              <GridViewIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ borderColor: colors.border, mb: 1.5 }} />

      {/* Error Alert */}
      {sharedWithMeError && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => {}}>
          {sharedWithMeError}
        </Alert>
      )}

      {/* Statistics Cards */}
      <SharedOverviewCards data={overviewCardsData} mode="shares" />

      {/* Tabs */}
      <Box
        sx={{
          mb: 1.5,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          backgroundColor: colors.card_bg,
          border: "none",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "none",
              py: 1.5,
              minHeight: 48,
              color: colors.secondary_text,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&.Mui-selected": {
                color: colors.accent,
                transform: "scale(1.02)",
              },
              "&:hover": {
                color: colors.accent,
                backgroundColor: `${colors.accent}14`,
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              backgroundColor: colors.accent,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            },
          }}
        >
          <Tab label={`All (${sharedWithMe.length})`} />
          <Tab label={`Active (${activeCount})`} />
          <Tab label={`Saved (${savedCount})`} />
          <Tab label={`Editable (${editableCount})`} />
        </Tabs>
      </Box>

      {/* Search & Filter Bar */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          p: 1.5,
          mb: 1.5,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <TextField
          placeholder="Search by name, owner, type, or token..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.accent, fontSize: "1.2rem" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: isSmallScreen ? "100%" : 400,
            "& .MuiOutlinedInput-root": {
              bgcolor: colors.secondary_bg,
              color: colors.primary_text,
              borderRadius: "8px",
              height: "40px",
              "& fieldset": {
                borderColor: colors.border,
                borderWidth: "1.5px",
              },
              "&:hover fieldset": {
                borderColor: colors.accent,
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.accent,
                borderWidth: "2px",
              },
            },
            "& .MuiInputBase-input": {
              fontSize: "0.875rem",
              "&::placeholder": {
                color: colors.secondary_text,
                opacity: 0.8,
              },
            },
          }}
        />
      </Box>

      {/* Shares Grid/List - Scrollable Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: colors.border,
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: colors.accent,
          },
        }}
      >
        {filteredShares.length === 0 ? (
          renderEmptyState()
        ) : (
          <Grid container spacing={1.5}>
            {filteredShares.map((share) => (
              <Grid
                item
                xs={12}
                sm={viewMode === "list" ? 12 : 6}
                md={viewMode === "list" ? 12 : 4}
                lg={viewMode === "list" ? 12 : 3}
                key={share.id || share.token}
              >
                {renderShareCard(share)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* QR Display Modal */}
      <QrDisplayScreen
        open={showQrModal}
        onClose={() => {
          setShowQrModal(false);
          setSelectedShare(null);
        }}
        share={selectedShare}
      />
    </Box>
  );
};

export default SharedWithMePage;
