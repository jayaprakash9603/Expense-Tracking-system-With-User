import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal from "../../../shared/ui/overlays/Modal";
import { useTranslation } from "../../../hooks/useTranslation";
import { useTheme } from "../../../hooks/useTheme";
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

const DeleteAccountDialog = ({
  open,
  onClose,
  onDeletionScheduled,
  onDeletionCancelled,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const onDeletionScheduledRef = useRef(onDeletionScheduled);
  const onDeletionCancelledRef = useRef(onDeletionCancelled);

  useEffect(() => {
    onDeletionScheduledRef.current = onDeletionScheduled;
    onDeletionCancelledRef.current = onDeletionCancelled;
  }, [onDeletionScheduled, onDeletionCancelled]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeletionStatus();
      setStatus(data);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load deletion status",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      refresh();
      return;
    }
    setStatus(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
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

  const handleClose = () => {
    if (!submitting) onClose();
  };

  const handleRequest = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const data = await requestSelfDeletion();
      onDeletionScheduledRef.current?.(data);
      onClose();
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to request deletion",
      );
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
      onDeletionCancelledRef.current?.(data);
      onClose();
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to cancel deletion",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const approveLabel = isPending
    ? t("settings.cancelDeletion")
    : t("settings.deleteAccount");

  const approveContent = submitting ? (
    <span className="flex items-center gap-2">
      <span
        className="inline-block w-4 h-4 rounded-full animate-spin"
        style={{
          border: "2px solid #fff",
          borderTopColor: "#99f6e4",
        }}
      />
      {isPending ? t("settings.cancellingDeletion") : approveLabel}
    </span>
  ) : (
    approveLabel
  );

  return (
    <Modal
      isOpen={open}
      onClose={submitting ? undefined : handleClose}
      title={t("settings.deleteAccount")}
      confirmationText={
        loading
          ? null
          : isPending
            ? t("settings.deletionScheduledPrompt")
            : t("settings.confirmDeleteAccount")
      }
      loading={loading}
      disableActions={submitting}
      error={error}
      contentAlign="left"
      onDecline={submitting ? undefined : handleClose}
      onApprove={
        loading || submitting ? undefined : isPending ? handleCancel : handleRequest
      }
      declineText={t("common.no")}
      approveText={approveContent}
    >
      {!loading && isPending && (
        <div className="space-y-3 text-sm">
          <div
            className="rounded-lg px-3 py-2"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              color: colors.primary_text,
            }}
          >
            {t("settings.deletionScheduledInfo")}
          </div>
          <div>
            <p style={{ color: colors.secondary_text }}>{t("settings.purgeDate")}</p>
            <p className="font-semibold">{purgeDate}</p>
          </div>
          {countdown && (
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-medium"
              style={{
                border: "1px solid rgba(245, 158, 11, 0.5)",
                color: "#f59e0b",
              }}
            >
              {countdown}
            </span>
          )}
          <p style={{ color: colors.secondary_text }}>
            {t("settings.deletionGraceAccessInfo")}
          </p>
        </div>
      )}
      {!loading && !isPending && (
        <div className="space-y-3 text-sm">
          <p style={{ color: colors.secondary_text }}>
            {t("settings.deleteAccountWarning")}
          </p>
          <div
            className="rounded-lg px-3 py-2"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.12)",
              color: colors.primary_text,
            }}
          >
            {t("settings.deleteAccountGraceInfo")}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DeleteAccountDialog;
