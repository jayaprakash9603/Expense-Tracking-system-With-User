/**
 * =============================================================================
 * MySharesPage - View and Manage All Shared QR Codes
 * =============================================================================
 *
 * Production-grade My Shares page following the Budget.jsx pattern:
 * 1. Display all shared QR codes in card/list view
 * 2. Show share status (active, expired, revoked)
 * 3. Quick actions (view QR, copy link, revoke)
 * 4. Statistics dashboard with SharedOverviewCards
 *
 * @author Expense Tracking System
 * @version 2.0
 * =============================================================================
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Skeleton,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";
import {
  QrCode2 as QrCodeIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  MoreVert as MoreIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
  Cancel as RevokedIcon,
  Schedule as ExpiredIcon,
  TrendingUp as StatsIcon,
  Receipt as ExpenseIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTheme } from "../../hooks/useTheme";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import {
  fetchMyShares,
  fetchShareStats,
  revokeShare,
  clearCurrentShare,
  regenerateQr,
} from "../../Redux/Shares/shares.actions";
import QrDisplayScreen from "../../components/sharing/QrDisplayScreen";
import ShareModal from "../../components/sharing/ShareModal";

// =============================================================================
// Constants
// =============================================================================

const STATUS_COLORS = {
  active: "#10b981",
  expired: "#f59e0b",
  revoked: "#ef4444",
};

const RESOURCE_ICONS = {
  EXPENSE: <ExpenseIcon />,
  CATEGORY: <CategoryIcon />,
  BUDGET: <BudgetIcon />,
};

// =============================================================================
// Main Component
// =============================================================================

const MySharesPage = () => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");

  // Redux state
  const {
    myShares = [],
    mySharesLoading,
    mySharesError,
    shareStats,
    revokeLoading,
  } = useSelector((state) => state.shares);

  // Local state
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShare, setSelectedShare] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [shareToRevoke, setShareToRevoke] = useState(null);
  const [copied, setCopied] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuShareId, setMenuShareId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [qrLoading, setQrLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const loadData = useCallback(() => {
    dispatch(fetchMyShares(false));
    dispatch(fetchShareStats());
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

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const handleMenuOpen = (event, shareId) => {
    setAnchorEl(event.currentTarget);
    setMenuShareId(shareId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuShareId(null);
  };

  const handleViewQr = async (share) => {
    handleMenuClose();
    setQrLoading(true);

    try {
      // Generate QR code on-demand
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

  const handleRevokeClick = (share) => {
    setShareToRevoke(share);
    setShowRevokeConfirm(true);
    handleMenuClose();
  };

  const handleRevokeConfirm = async () => {
    if (shareToRevoke) {
      const result = await dispatch(revokeShare(shareToRevoke.token));
      if (result.success) {
        toast.success("Share revoked successfully");
        loadData();
      } else {
        toast.error(result.error || "Failed to revoke share");
      }
    }
    setShowRevokeConfirm(false);
    setShareToRevoke(null);
  };

  const handleDownloadQr = async (share) => {
    handleMenuClose();

    try {
      // Generate QR code first if not available
      let qrCodeDataUri = share.qrCodeDataUri;
      let shareUrl =
        share.shareUrl || `${window.location.origin}/share/${share.token}`;

      if (!qrCodeDataUri) {
        setQrLoading(true);
        const result = await dispatch(regenerateQr(share.token));
        if (result.success) {
          qrCodeDataUri = result.data?.qrCodeDataUri;
          shareUrl = result.data?.shareUrl || shareUrl;
        } else {
          toast.error("Failed to generate QR code for download");
          setQrLoading(false);
          return;
        }
        setQrLoading(false);
      }

      if (qrCodeDataUri) {
        // Download as PNG
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

  // ---------------------------------------------------------------------------
  // Filtered Data & Statistics
  // ---------------------------------------------------------------------------

  const activeCount = useMemo(
    () => myShares.filter((s) => getShareStatus(s) === "active").length,
    [myShares],
  );
  const expiredCount = useMemo(
    () => myShares.filter((s) => getShareStatus(s) === "expired").length,
    [myShares],
  );
  const revokedCount = useMemo(
    () => myShares.filter((s) => getShareStatus(s) === "revoked").length,
    [myShares],
  );

  // Filter shares based on active tab and search term
  const filteredShares = useMemo(() => {
    let filtered = [...myShares];

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (share) =>
          share.shareName?.toLowerCase().includes(search) ||
          share.resourceType?.toLowerCase().includes(search) ||
          share.token?.toLowerCase().includes(search),
      );
    }

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter((s) => getShareStatus(s) === "active");
    } else if (activeTab === 2) {
      filtered = filtered.filter((s) => getShareStatus(s) === "expired");
    } else if (activeTab === 3) {
      filtered = filtered.filter((s) => getShareStatus(s) === "revoked");
    }

    return filtered;
  }, [myShares, searchTerm, activeTab]);

  // Prepare data for SharedOverviewCards (shares mode)
  const overviewCardsData = useMemo(
    () => [
      {
        totalShares: myShares.length,
        activeShares: activeCount,
        totalViews: shareStats?.totalAccessCount || 0,
        expiredShares: expiredCount,
      },
    ],
    [myShares.length, activeCount, expiredCount, shareStats],
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  // ---------------------------------------------------------------------------
  // Render Functions
  // ---------------------------------------------------------------------------

  const renderShareCard = (share) => {
    const status = getShareStatus(share);
    const statusColor = STATUS_COLORS[status];
    const StatusIcon =
      status === "active"
        ? ActiveIcon
        : status === "expired"
          ? ExpiredIcon
          : RevokedIcon;

    return (
      <Card
        key={share.id}
        sx={{
          background: `linear-gradient(135deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          transition: "all 0.3s ease",
          position: "relative",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 8px 24px rgba(20, 184, 166, 0.15)`,
            borderColor: colors.accent,
          },
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
            </Box>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, share.id)}
              sx={{
                color: colors.accent,
                "&:hover": { bgcolor: colors.hover_bg },
              }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Box>

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
            onClick={() =>
              copyToClipboard(
                share.shareUrl ||
                  `${window.location.origin}/share/${share.token}`,
                share.id,
              )
            }
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
            justifyContent: "flex-end",
            px: 1.5,
            pb: 1,
            pt: 0,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <Tooltip title="View QR Code">
            <IconButton
              size="small"
              onClick={() => handleViewQr(share)}
              sx={{
                color: colors.accent,
                "&:hover": { bgcolor: colors.hover_bg },
              }}
              disabled={status === "revoked" || qrLoading}
            >
              <QrCodeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={copied === share.id ? "Copied!" : "Copy Link"}>
            <IconButton
              size="small"
              onClick={() =>
                copyToClipboard(
                  share.shareUrl ||
                    `${window.location.origin}/share/${share.token}`,
                  share.id,
                )
              }
              sx={{
                color:
                  copied === share.id
                    ? STATUS_COLORS.active
                    : colors.secondary_text,
              }}
              disabled={status === "revoked"}
            >
              {copied === share.id ? <CheckIcon /> : <CopyIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download QR">
            <IconButton
              size="small"
              onClick={() => handleDownloadQr(share)}
              sx={{
                color: colors.secondary_text,
                "&:hover": { bgcolor: colors.hover_bg },
              }}
              disabled={status === "revoked" || qrLoading}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Revoke Share">
            <IconButton
              size="small"
              onClick={() => handleRevokeClick(share)}
              sx={{
                color: colors.error,
                "&:hover": { bgcolor: `${colors.error}20` },
              }}
              disabled={status !== "active"}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
      <QrCodeIcon
        sx={{ fontSize: 48, color: colors.secondary_text, mb: 1.5 }}
      />
      <Typography
        variant="h6"
        sx={{ color: colors.primary_text, mb: 0.5, fontSize: "1rem" }}
      >
        No shares yet
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: colors.secondary_text, mb: 2, fontSize: "0.85rem" }}
      >
        Create your first share to generate a QR code.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon fontSize="small" />}
        onClick={() => setShowShareModal(true)}
        sx={{
          textTransform: "none",
          backgroundColor: colors.accent,
          px: 2,
          py: 0.75,
          fontSize: "0.875rem",
          "&:hover": { backgroundColor: colors.accent_hover },
        }}
      >
        Create New Share
      </Button>
    </Box>
  );

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  if (mySharesLoading && myShares.length === 0) {
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
                height={150}
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
          <Typography
            variant="h3"
            sx={{
              color: colors.primary_text,
              fontWeight: "bold",
              fontSize: isSmallScreen ? "1.25rem" : "1.5rem",
            }}
          >
            My Shares
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Tooltip title="Refresh">
            <IconButton
              onClick={loadData}
              disabled={mySharesLoading}
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
          <Button
            variant="contained"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => setShowShareModal(true)}
            sx={{
              textTransform: "none",
              bgcolor: colors.accent,
              color: "#fff",
              fontWeight: 600,
              px: 2,
              py: 0.75,
              fontSize: "0.875rem",
              borderRadius: "6px",
              "&:hover": {
                bgcolor: colors.accent_hover,
              },
            }}
          >
            New Share
          </Button>
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
      {mySharesError && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => {}}>
          {mySharesError}
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
          <Tab label={`All (${myShares.length})`} />
          <Tab label={`Active (${activeCount})`} />
          <Tab label={`Expired (${expiredCount})`} />
          <Tab label={`Revoked (${revokedCount})`} />
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
          placeholder="Search by name, type, or token..."
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
                key={share.id}
              >
                {renderShareCard(share)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            handleViewQr(myShares.find((s) => s.id === menuShareId))
          }
        >
          <ListItemIcon>
            <QrCodeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View QR Code</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const share = myShares.find((s) => s.id === menuShareId);
            if (share)
              copyToClipboard(
                share.shareUrl ||
                  `${window.location.origin}/share/${share.token}`,
                share.id,
              );
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleDownloadQr(myShares.find((s) => s.id === menuShareId))
          }
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download QR</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() =>
            handleRevokeClick(myShares.find((s) => s.id === menuShareId))
          }
          sx={{ color: colors.error }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: colors.error }} />
          </ListItemIcon>
          <ListItemText>Revoke Share</ListItemText>
        </MenuItem>
      </Menu>

      {/* QR Display Modal */}
      <QrDisplayScreen
        open={showQrModal}
        onClose={() => {
          setShowQrModal(false);
          setSelectedShare(null);
        }}
        share={selectedShare}
      />

      {/* Create Share Modal */}
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShareCreated={(share) => {
          setShowShareModal(false);
          loadData();
          setSelectedShare(share);
          setShowQrModal(true);
        }}
      />

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.modal_bg,
            color: colors.primary_text,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon sx={{ color: colors.error }} />
          Revoke Share?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.secondary_text }}>
            This will permanently deactivate this share. Anyone with the QR code
            or link will no longer be able to access the shared data.
          </Typography>
          {shareToRevoke && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Share: {shareToRevoke.shareName || shareToRevoke.resourceType}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRevokeConfirm(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRevokeConfirm}
            disabled={revokeLoading}
            startIcon={
              revokeLoading ? <CircularProgress size={16} /> : <DeleteIcon />
            }
          >
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MySharesPage;
