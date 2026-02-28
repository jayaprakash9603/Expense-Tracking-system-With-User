import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  QrCode2 as QrCodeIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import {
  revokeShare,
  regenerateQr,
  clearCurrentShare,
} from "../../Redux/Shares/shares.actions";
import ShareWithFriendModal from "./ShareWithFriendModal";

/**
 * Component to display QR code and share link.
 * Allows copying link, downloading QR, and revoking share.
 */
const QrDisplayScreen = ({ open, onClose, share }) => {
  const dispatch = useDispatch();
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  const { revokeLoading } = useSelector((state) => state.shares);

  const [copied, setCopied] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showShareWithFriend, setShowShareWithFriend] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [localQrCode, setLocalQrCode] = useState(null);

  // Copy share URL to clipboard
  const handleCopyLink = useCallback(async () => {
    if (share?.shareUrl) {
      try {
        await navigator.clipboard.writeText(share.shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  }, [share?.shareUrl]);

  // Download QR code as image
  const handleDownloadQr = useCallback(() => {
    const qrCode = localQrCode || share?.qrCodeDataUri;
    if (qrCode) {
      const link = document.createElement("a");
      link.href = qrCode;
      link.download = `share-qr-${share?.shareName || share?.token?.substring(0, 8) || "code"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [share, localQrCode]);

  // Regenerate QR code
  const handleRegenerateQr = useCallback(async () => {
    if (share?.token) {
      setRegenerating(true);
      try {
        const result = await dispatch(regenerateQr(share.token));
        if (result.success && result.data?.qrCodeDataUri) {
          setLocalQrCode(result.data.qrCodeDataUri);
        }
      } finally {
        setRegenerating(false);
      }
    }
  }, [dispatch, share?.token]);

  // Revoke share
  const handleRevoke = useCallback(async () => {
    if (share?.token) {
      const result = await dispatch(revokeShare(share.token));
      if (result.success) {
        setShowRevokeConfirm(false);
        onClose();
      }
    }
  }, [dispatch, share?.token, onClose]);

  // Handle close
  const handleClose = () => {
    dispatch(clearCurrentShare());
    setLocalQrCode(null);
    onClose();
  };

  // Get current QR code (local or from share prop)
  const currentQrCode = localQrCode || share?.qrCodeDataUri;

  // Format expiry date
  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return "Never";
    const date = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  if (!share) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.75)"
              : "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: colors.modal_bg,
          color: colors.primary_text,
          borderRadius: 3,
          width: 520,
          maxWidth: "95vw",
          height: "auto",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: isDark
            ? "0 24px 48px rgba(0, 0, 0, 0.4)"
            : "0 24px 48px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${colors.border}`,
          py: 2,
          px: 3,
          backgroundColor: colors.card_bg,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              backgroundColor: colors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QrCodeIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ color: colors.primary_text, fontWeight: 600 }}
          >
            {share.shareName || "Share QR Code"}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: colors.secondary_text }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 3,
          pb: 2,
          px: 3,
          textAlign: "center",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* QR Code Display */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
            p: 2,
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: isDark
              ? "0 4px 12px rgba(0, 0, 0, 0.3)"
              : "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {regenerating ? (
            <Box
              sx={{
                width: 200,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <CircularProgress sx={{ color: colors.accent }} />
              <Typography variant="body2" sx={{ color: "#666" }}>
                Regenerating...
              </Typography>
            </Box>
          ) : currentQrCode ? (
            <img
              src={currentQrCode}
              alt="Share QR Code"
              style={{ width: 200, height: 200 }}
            />
          ) : (
            <Box
              sx={{
                width: 200,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <QrCodeIcon sx={{ fontSize: 64, color: "#ccc" }} />
              <Typography variant="body2" sx={{ color: "#666" }}>
                QR Code Ready
              </Typography>
            </Box>
          )}
        </Box>

        {/* QR Actions */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}>
          <Tooltip title="Download QR Code">
            <span>
              <IconButton
                onClick={handleDownloadQr}
                sx={{ color: colors.accent }}
                disabled={!currentQrCode || regenerating}
              >
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Regenerate QR Code">
            <span>
              <IconButton
                onClick={handleRegenerateQr}
                sx={{ color: colors.accent }}
                disabled={regenerating}
              >
                {regenerating ? (
                  <CircularProgress size={24} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Share with Friends">
            <IconButton
              onClick={() => setShowShareWithFriend(true)}
              sx={{ color: colors.accent }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Share URL */}
        <TextField
          fullWidth
          value={share.shareUrl || ""}
          InputProps={{
            readOnly: true,
            sx: {
              color: colors.primary_text,
              fontSize: "0.85rem",
              backgroundColor: colors.card_bg,
              borderRadius: 2,
            },
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={copied ? "Copied!" : "Copy Link"}>
                  <IconButton onClick={handleCopyLink} size="small">
                    {copied ? (
                      <CheckIcon sx={{ color: colors.success, fontSize: 20 }} />
                    ) : (
                      <CopyIcon sx={{ color: colors.accent, fontSize: 20 }} />
                    )}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.border,
              },
              "&:hover fieldset": {
                borderColor: colors.accent,
              },
            },
          }}
        />

        {/* Share Info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1.5,
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          {/* Permission */}
          <Chip
            icon={share.permission === "VIEW" ? <ViewIcon /> : <EditIcon />}
            label={share.permission === "VIEW" ? "View Only" : "Edit Access"}
            size="small"
            sx={{
              backgroundColor: `${colors.accent}20`,
              color: colors.accent,
              fontWeight: 500,
              "& .MuiChip-icon": { color: colors.accent },
            }}
          />

          {/* Expiry */}
          <Chip
            icon={<TimeIcon />}
            label={formatExpiry(share.expiresAt)}
            size="small"
            sx={{
              backgroundColor: colors.card_bg,
              color: colors.secondary_text,
              border: `1px solid ${colors.border}`,
              "& .MuiChip-icon": { color: colors.secondary_text },
            }}
          />

          {/* Resource Count */}
          <Chip
            label={`${share.resourceCount || 0} items`}
            size="small"
            sx={{
              backgroundColor: colors.card_bg,
              color: colors.secondary_text,
              border: `1px solid ${colors.border}`,
            }}
          />
        </Box>

        {/* Status */}
        {share.isActive === false && (
          <Alert severity="warning" sx={{ mt: 1, width: "100%" }}>
            This share has been revoked and is no longer accessible.
          </Alert>
        )}

        {/* Instructions */}
        <Typography
          variant="body2"
          sx={{ color: colors.secondary_text, mt: 1, fontSize: "0.8rem" }}
        >
          Scan the QR code or share the link with friends to give them access to
          your data.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: colors.card_bg,
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        {/* Revoke Button */}
        {share.isActive !== false && (
          <>
            {showRevokeConfirm ? (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: colors.error }}>
                  Revoke this share?
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowRevokeConfirm(false)}
                  sx={{ color: colors.secondary_text }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={handleRevoke}
                  disabled={revokeLoading}
                  startIcon={
                    revokeLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DeleteIcon />
                    )
                  }
                >
                  Confirm
                </Button>
              </Box>
            ) : (
              <Button
                color="error"
                onClick={() => setShowRevokeConfirm(true)}
                startIcon={<DeleteIcon />}
              >
                Revoke Share
              </Button>
            )}
          </>
        )}

        <Button
          variant="contained"
          onClick={handleClose}
          sx={{
            backgroundColor: colors.accent,
            "&:hover": { backgroundColor: colors.accent_hover },
            ml: "auto",
          }}
        >
          Done
        </Button>
      </DialogActions>

      {/* Share with Friends Modal */}
      <ShareWithFriendModal
        open={showShareWithFriend}
        onClose={() => setShowShareWithFriend(false)}
        share={share}
      />
    </Dialog>
  );
};

export default QrDisplayScreen;
