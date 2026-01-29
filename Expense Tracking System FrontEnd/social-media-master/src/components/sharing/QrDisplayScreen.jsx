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
  const { colors } = useTheme();

  const { revokeLoading } = useSelector((state) => state.shares);

  const [copied, setCopied] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showShareWithFriend, setShowShareWithFriend] = useState(false);

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
    if (share?.qrCodeDataUri) {
      const link = document.createElement("a");
      link.href = share.qrCodeDataUri;
      link.download = `share-qr-${share.token?.substring(0, 8) || "code"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [share]);

  // Regenerate QR code
  const handleRegenerateQr = useCallback(() => {
    if (share?.token) {
      dispatch(regenerateQr(share.token));
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
    onClose();
  };

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
      PaperProps={{
        sx: {
          backgroundColor: colors.modal_bg,
          color: colors.primary_text,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QrCodeIcon sx={{ color: colors.accent }} />
          <Typography variant="h6">
            {share.shareName || "Share QR Code"}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon sx={{ color: colors.secondary_text }} />
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
          {share.qrCodeDataUri ? (
            <img
              src={share.qrCodeDataUri}
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
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Box>

        {/* QR Actions */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
          <Tooltip title="Download QR Code">
            <IconButton
              onClick={handleDownloadQr}
              sx={{ color: colors.accent }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Regenerate QR Code">
            <IconButton
              onClick={handleRegenerateQr}
              sx={{ color: colors.accent }}
            >
              <RefreshIcon />
            </IconButton>
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
            sx: { color: colors.primary_text, fontSize: "0.9rem" },
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
          sx={{ mb: 3 }}
        />

        <Divider sx={{ my: 2, borderColor: colors.border }} />

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
              backgroundColor: colors.card_bg,
              color: colors.primary_text,
            }}
          />

          {/* Resource Count */}
          <Chip
            label={`${share.resourceCount || 0} items`}
            sx={{
              backgroundColor: colors.card_bg,
              color: colors.primary_text,
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
