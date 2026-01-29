/**
 * =============================================================================
 * MySharesPage - View and Manage All Shared QR Codes
 * =============================================================================
 *
 * Production-grade My Shares page following the MFA/Settings pattern:
 * 1. Display all shared QR codes in card/list view
 * 2. Show share status (active, expired, revoked)
 * 3. Quick actions (view QR, copy link, revoke)
 * 4. Statistics dashboard
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React, { useState, useEffect, useCallback } from "react";
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
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Skeleton,
  useMediaQuery,
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
import {
  fetchMyShares,
  fetchShareStats,
  revokeShare,
  clearCurrentShare,
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
  const [filterStatus, setFilterStatus] = useState("all");
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

  const handleViewQr = (share) => {
    setSelectedShare({
      ...share,
      shareUrl:
        share.shareUrl || `${window.location.origin}/share/${share.token}`,
    });
    setShowQrModal(true);
    handleMenuClose();
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

  const handleDownloadQr = (share) => {
    if (share.qrCodeDataUri) {
      const link = document.createElement("a");
      link.href = share.qrCodeDataUri;
      link.download = `share-qr-${share.token?.substring(0, 8) || "code"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded!");
    }
    handleMenuClose();
  };

  // ---------------------------------------------------------------------------
  // Filtered Data
  // ---------------------------------------------------------------------------

  const filteredShares = myShares.filter((share) => {
    // Filter by status
    const status = getShareStatus(share);
    if (filterStatus !== "all" && status !== filterStatus) return false;

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        share.shareName?.toLowerCase().includes(search) ||
        share.resourceType?.toLowerCase().includes(search) ||
        share.token?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const activeCount = myShares.filter(
    (s) => getShareStatus(s) === "active",
  ).length;
  const expiredCount = myShares.filter(
    (s) => getShareStatus(s) === "expired",
  ).length;
  const revokedCount = myShares.filter(
    (s) => getShareStatus(s) === "revoked",
  ).length;

  // ---------------------------------------------------------------------------
  // Render Functions
  // ---------------------------------------------------------------------------

  const renderStatsCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: "center",
            backgroundColor: "transparent",
            border: `1px solid ${colors.border}`,
            borderLeft: `4px solid ${colors.accent}`,
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: colors.accent, fontWeight: "bold" }}
          >
            {myShares.length}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            Total Shares
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: "center",
            backgroundColor: "transparent",
            border: `1px solid ${colors.border}`,
            borderLeft: `4px solid ${STATUS_COLORS.active}`,
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: STATUS_COLORS.active, fontWeight: "bold" }}
          >
            {activeCount}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            Active
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: "center",
            backgroundColor: "transparent",
            border: `1px solid ${colors.border}`,
            borderLeft: `4px solid ${STATUS_COLORS.expired}`,
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: STATUS_COLORS.expired, fontWeight: "bold" }}
          >
            {expiredCount}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            Expired
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: "center",
            backgroundColor: "transparent",
            border: `1px solid ${colors.border}`,
            borderLeft: `4px solid ${shareStats?.totalAccessCount || 0 > 0 ? colors.info : colors.secondary_text}`,
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: colors.info, fontWeight: "bold" }}
          >
            {shareStats?.totalAccessCount || 0}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            Total Views
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

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
        elevation={0}
        sx={{
          backgroundColor: colors.card_bg,
          border: `1px solid ${colors.border}`,
          borderTop: `3px solid ${statusColor}`,
          borderRadius: "8px",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3)`,
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {RESOURCE_ICONS[share.resourceType] || <QrCodeIcon />}
              <Typography variant="h6" sx={{ color: colors.primary_text }}>
                {share.shareName || `${share.resourceType} Share`}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, share.id)}
            >
              <MoreIcon sx={{ color: colors.secondary_text }} />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip
              icon={<StatusIcon sx={{ fontSize: 16 }} />}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              size="small"
              sx={{
                backgroundColor: `${statusColor}20`,
                color: statusColor,
                fontWeight: 500,
              }}
            />
            <Chip
              icon={
                share.permission === "VIEW" ? (
                  <ViewIcon sx={{ fontSize: 16 }} />
                ) : (
                  <EditIcon sx={{ fontSize: 16 }} />
                )
              }
              label={share.permission}
              size="small"
              sx={{
                backgroundColor: colors.hover_bg,
                color: colors.primary_text,
              }}
            />
            <Chip
              label={`${share.resourceCount || 0} items`}
              size="small"
              sx={{
                backgroundColor: colors.hover_bg,
                color: colors.secondary_text,
              }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TimeIcon sx={{ fontSize: 16, color: colors.secondary_text }} />
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                {getTimeRemaining(share.expiresAt)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: colors.secondary_text }} />
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                {share.accessCount || 0} views
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: colors.secondary_text }}>
              Created: {formatDate(share.createdAt)}
            </Typography>
          </Box>
        </CardContent>

        <Divider sx={{ borderColor: colors.border }} />

        <CardActions sx={{ justifyContent: "space-between", px: 2, py: 1 }}>
          <Tooltip title="View QR Code">
            <IconButton
              size="small"
              onClick={() => handleViewQr(share)}
              sx={{ color: colors.accent }}
              disabled={status === "revoked"}
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
              sx={{ color: colors.secondary_text }}
              disabled={status === "revoked" || !share.qrCodeDataUri}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Revoke Share">
            <IconButton
              size="small"
              onClick={() => handleRevokeClick(share)}
              sx={{ color: colors.error }}
              disabled={status !== "active"}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: "center",
        backgroundColor: "transparent",
        border: `2px dashed ${colors.border}`,
        borderRadius: "12px",
      }}
    >
      <QrCodeIcon sx={{ fontSize: 64, color: colors.secondary_text, mb: 2 }} />
      <Typography variant="h6" sx={{ color: colors.primary_text, mb: 1 }}>
        No shares yet
      </Typography>
      <Typography variant="body2" sx={{ color: colors.secondary_text, mb: 3 }}>
        Create your first share to generate a QR code and share your data with
        friends.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setShowShareModal(true)}
        sx={{
          backgroundColor: colors.accent,
          "&:hover": { backgroundColor: colors.accent_hover },
        }}
      >
        Create New Share
      </Button>
    </Paper>
  );

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  if (mySharesLoading && myShares.length === 0) {
    return (
      <Box
        sx={{
          backgroundColor: colors.secondary_bg,
          width: isSmallScreen
            ? "100vw"
            : isTablet
              ? "100vw"
              : "calc(100vw - 370px)",
          height: isSmallScreen
            ? "auto"
            : isTablet
              ? "auto"
              : "calc(100vh - 100px)",
          minHeight: isSmallScreen ? "100vh" : "auto",
          marginRight: isSmallScreen ? 0 : isTablet ? 0 : "20px",
          borderRadius: isSmallScreen ? 0 : "8px",
          boxSizing: "border-box",
          overflow: "auto",
          p: isSmallScreen ? 2 : 3,
        }}
      >
        <Skeleton
          variant="rectangular"
          height={100}
          sx={{ mb: 2, borderRadius: 2 }}
        />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rectangular"
                height={200}
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
        width: isSmallScreen
          ? "100vw"
          : isTablet
            ? "100vw"
            : "calc(100vw - 370px)",
        height: isSmallScreen
          ? "auto"
          : isTablet
            ? "auto"
            : "calc(100vh - 100px)",
        minHeight: isSmallScreen ? "100vh" : "auto",
        marginRight: isSmallScreen ? 0 : isTablet ? 0 : "20px",
        borderRadius: isSmallScreen ? 0 : "8px",
        boxSizing: "border-box",
        overflow: "auto",
        p: isSmallScreen ? 2 : 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ color: colors.primary_text, fontWeight: "bold" }}
          >
            My Shares
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            Manage your shared QR codes and track access
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadData} disabled={mySharesLoading}>
              <RefreshIcon sx={{ color: colors.secondary_text }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowShareModal(true)}
            sx={{
              backgroundColor: colors.accent,
              "&:hover": { backgroundColor: colors.accent_hover },
            }}
          >
            New Share
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {mySharesError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {mySharesError}
        </Alert>
      )}

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters & Controls */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: "transparent",
          border: `1px solid ${colors.border}`,
          borderRadius: "8px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Search shares..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.secondary_text }} />
                </InputAdornment>
              ),
              sx: {
                color: colors.primary_text,
                backgroundColor: colors.card_bg,
                borderRadius: "8px",
                "& fieldset": {
                  borderColor: colors.border,
                },
                "&:hover fieldset": {
                  borderColor: colors.accent,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.accent,
                },
              },
            }}
            sx={{ minWidth: 200, flexGrow: 1, maxWidth: 300 }}
          />

          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(_, v) => v && setFilterStatus(v)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                color: colors.secondary_text,
                borderColor: colors.border,
                "&.Mui-selected": {
                  backgroundColor: colors.accent,
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: colors.accent_hover,
                  },
                },
              },
            }}
          >
            <ToggleButton value="all">All ({myShares.length})</ToggleButton>
            <ToggleButton value="active">
              <Badge
                badgeContent={activeCount}
                color="success"
                sx={{ "& .MuiBadge-badge": { right: -8 } }}
              >
                Active
              </Badge>
            </ToggleButton>
            <ToggleButton value="expired">
              Expired ({expiredCount})
            </ToggleButton>
            <ToggleButton value="revoked">
              Revoked ({revokedCount})
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                color: colors.secondary_text,
                borderColor: colors.border,
                "&.Mui-selected": {
                  backgroundColor: colors.accent,
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: colors.accent_hover,
                  },
                },
              },
            }}
          >
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Shares Grid/List */}
      {filteredShares.length === 0 ? (
        renderEmptyState()
      ) : (
        <Grid container spacing={2}>
          {filteredShares.map((share) => (
            <Grid
              item
              xs={12}
              sm={viewMode === "list" ? 12 : 6}
              md={viewMode === "list" ? 12 : 4}
              key={share.id}
            >
              {renderShareCard(share)}
            </Grid>
          ))}
        </Grid>
      )}

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
