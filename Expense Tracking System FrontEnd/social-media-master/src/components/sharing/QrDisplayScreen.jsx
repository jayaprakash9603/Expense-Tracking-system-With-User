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
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
          color: isDark ? "#fff" : "#1a1a1a",
          borderRadius: 3,
          border: isDark
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: isDark
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${isDark ? "#333" : "#e5e5e5"}`,
          color: isDark ? "#fff" : "#1a1a1a",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QrCodeIcon sx={{ color: colors.accent }} />
          <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#1a1a1a" }}>
            {share.shareName || "Share QR Code"}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon sx={{ color: isDark ? "#888" : "#666" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, textAlign: "center" }}>
        {/* QR Code Display */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
            p: 2,
            backgroundColor: "#fff",
            borderRadius: 2,
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          {regenerating ? (
            <Box
              sx={{
                width: 250,
                height: 250,
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
              style={{ width: 250, height: 250 }}
            />
          ) : (
            <Box
              sx={{
                width: 250,
                height: 250,
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
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
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
              color: isDark ? "#fff" : "#1a1a1a",
              fontSize: "0.9rem",
              backgroundColor: isDark ? "#333" : "#f5f5f5",
            },
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={copied ? "Copied!" : "Copy Link"}>
                  <IconButton onClick={handleCopyLink}>
                    {copied ? (
                      <CheckIcon sx={{ color: "green" }} />
                    ) : (
                      <CopyIcon sx={{ color: colors.accent }} />
                    )}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: isDark ? "#444" : "#ddd",
              },
              "&:hover fieldset": {
                borderColor: colors.accent,
              },
            },
          }}
        />

        <Divider sx={{ my: 2, borderColor: isDark ? "#333" : "#e5e5e5" }} />

        {/* Share Info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          {/* Permission */}
          <Chip
            icon={share.permission === "VIEW" ? <ViewIcon /> : <EditIcon />}
            label={share.permission === "VIEW" ? "View Only" : "Edit Access"}
            sx={{
              backgroundColor:
                share.permission === "VIEW" ? colors.info : colors.warning,
              color: "#fff",
            }}
          />

          {/* Expiry */}
          <Chip
            icon={<TimeIcon />}
            label={formatExpiry(share.expiresAt)}
            sx={{
              backgroundColor: isDark ? "#333" : "#f0f0f0",
              color: isDark ? "#ccc" : "#444",
            }}
          />

          {/* Resource Count */}
          <Chip
            label={`${share.resourceCount || 0} items`}
            sx={{
              backgroundColor: isDark ? "#333" : "#f0f0f0",
              color: isDark ? "#ccc" : "#444",
            }}
          />
        </Box>

        {/* Status */}
        {share.isActive === false && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This share has been revoked and is no longer accessible.
          </Alert>
        )}

        {/* Instructions */}
        <Typography
          variant="body2"
          sx={{ color: colors.secondary_text, mt: 2 }}
        >
          Scan the QR code or share the link with friends to give them access to
          your data.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          borderTop: `1px solid ${colors.border}`,
          justifyContent: "space-between",
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
