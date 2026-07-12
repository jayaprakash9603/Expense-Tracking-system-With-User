import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  cancelSelfDeletion,
  fetchDeletionStatus,
  requestSelfDeletion,
} from "../services/accountDeletionService";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const formatCountdown = (targetIso) => {
  if (!targetIso) return null;
  const remaining = new Date(targetIso).getTime() - Date.now();
  if (Number.isNaN(remaining) || remaining <= 0) return "Purge starting shortly…";
  const days = Math.floor(remaining / MS_PER_DAY);
  const hours = Math.floor((remaining % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((remaining % MS_PER_HOUR) / (60 * 1000));
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

const DeleteAccountDialog = ({ open, onClose, colors, isSmallScreen, onStatusChange }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeletionStatus();
      setStatus(data);
      onStatusChange?.(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load deletion status");
    } finally {
      setLoading(false);
    }
  }, [onStatusChange]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const purgeDate = useMemo(() => {
    if (!status?.scheduledPurgeAt) return null;
    return new Date(status.scheduledPurgeAt).toLocaleString();
  }, [status]);

  const countdown = useMemo(
    () => formatCountdown(status?.scheduledPurgeAt),
    [status?.scheduledPurgeAt],
  );

  const isPending = status?.state === "REQUESTED";

  const handleRequest = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const data = await requestSelfDeletion();
      setStatus(data);
      onStatusChange?.(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to request deletion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const data = await cancelSelfDeletion();
      setStatus({ ...data, state: "CANCELLED" });
      onStatusChange?.(null);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to cancel deletion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: colors.tertiary_bg,
          border: `1px solid ${colors.border_color}`,
          borderRadius: 3,
          minWidth: isSmallScreen ? "90%" : 460,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: colors.primary_text,
          fontWeight: 700,
          borderBottom: `1px solid ${colors.border_color}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <WarningAmberIcon sx={{ color: "#ef4444" }} />
        {t("settings.deleteAccount")}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : isPending ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Alert severity="warning" icon={<ScheduleIcon />}>
              Your account is scheduled for permanent deletion. You can cancel any
              time before the grace period ends.
            </Alert>
            <Box>
              <Typography sx={{ color: colors.secondary_text, fontSize: "0.85rem" }}>
                Purge date
              </Typography>
              <Typography sx={{ color: colors.primary_text, fontWeight: 600 }}>
                {purgeDate}
              </Typography>
            </Box>
            {countdown && (
              <Chip
                label={countdown}
                color="warning"
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              />
            )}
            <Divider sx={{ borderColor: colors.border_color }} />
            <Typography sx={{ color: colors.secondary_text, fontSize: "0.9rem" }}>
              During this period, normal application access is disabled — only
              this deletion status/cancel dialog and sign-out remain available.
              Audit records and shared chat history will be anonymized rather
              than deleted, in line with our privacy policy.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ color: colors.primary_text }}>
              {t("messages.confirmDelete")}
            </Typography>
            <Typography sx={{ color: colors.secondary_text, fontSize: "0.9rem" }}>
              {t("settings.deleteAccountWarning")}
            </Typography>
            <Alert severity="info">
              After confirmation your account enters a 5-day grace period.
              During this window you can cancel from this dialog and everything
              is restored. Once the period ends, purge is irreversible.
            </Alert>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border_color}` }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ color: colors.secondary_text, textTransform: "none", fontWeight: 600 }}
        >
          {t("common.close")}
        </Button>
        {isPending ? (
          <Button
            onClick={handleCancel}
            disabled={submitting}
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {submitting ? <CircularProgress size={18} /> : "Cancel deletion"}
          </Button>
        ) : (
          <Button
            onClick={handleRequest}
            disabled={submitting}
            sx={{
              backgroundColor: "#ef4444",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#dc2626" },
            }}
          >
            {submitting ? <CircularProgress size={18} /> : t("settings.deleteAccount")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog;
