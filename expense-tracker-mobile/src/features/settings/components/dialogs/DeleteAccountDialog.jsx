import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/shared/components/overlay/ConfirmDialog";
import { Input } from "@/shared/components/app-shadcn";
import { Label } from "@/shared/components/app-shadcn";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";
import { toast } from "sonner";

const CONFIRMATION_TEXT = "DELETE";
const DELETION_ENDPOINT = "/api/user/me/deletion-request";
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const formatCountdown = (iso) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return "Purge starting shortly…";
  const days = Math.floor(ms / MS_PER_DAY);
  const hours = Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR);
  if (days > 0) return `${days}d ${hours}h remaining`;
  const minutes = Math.floor((ms % MS_PER_HOUR) / (60 * 1000));
  return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
};

export function DeleteAccountDialog({ open, onOpenChange }) {
  const { t } = useLanguage();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const refresh = useCallback(async () => {
    const { data } = await safeApiCall(() => api.get(DELETION_ENDPOINT));
    setStatus(data ?? null);
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const isPending = status?.state === "REQUESTED";
  const countdown = useMemo(() => formatCountdown(status?.scheduledPurgeAt), [status]);
  const purgeDate = useMemo(
    () => (status?.scheduledPurgeAt ? new Date(status.scheduledPurgeAt).toLocaleString() : null),
    [status],
  );

  const handleRequest = async () => {
    if (confirmText !== CONFIRMATION_TEXT) {
      toast.error(t("settings.typeDeleteToConfirm"));
      return;
    }
    setLoading(true);
    const { data, error } = await safeApiCall(() => api.post(DELETION_ENDPOINT));
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStatus(data);
    toast.warning(
      `Account scheduled for deletion — purge on ${new Date(data.scheduledPurgeAt).toLocaleString()}`,
    );
  };

  const handleCancel = async () => {
    setLoading(true);
    const { data, error } = await safeApiCall(() => api.delete(DELETION_ENDPOINT));
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStatus(data);
    toast.success(t("settings.deletionCancelled") || "Deletion cancelled");
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) setConfirmText("");
    onOpenChange(isOpen);
  };

  if (isPending) {
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t("settings.deletionScheduled") || "Deletion scheduled"}
        description={
          t("settings.deletionScheduledDescription") ||
          "Your account is scheduled for permanent deletion. Cancel any time before the grace period ends."
        }
        onConfirm={handleCancel}
        confirmLabel={t("settings.cancelDeletion") || "Cancel deletion"}
        variant="default"
        loading={loading}
      >
        <div className="py-2 space-y-1 text-sm">
          <div className="text-muted-foreground">Purge date</div>
          <div className="font-semibold">{purgeDate}</div>
          {countdown && (
            <div className="text-xs text-amber-600 dark:text-amber-400">{countdown}</div>
          )}
          <p className="pt-2 text-xs text-muted-foreground">
            Normal app access is blocked while a deletion is pending. Audit
            records and shared chat history will be anonymized on purge.
          </p>
        </div>
      </ConfirmDialog>
    );
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t("settings.deleteAccount")}
      description={t("settings.deleteAccountWarning")}
      onConfirm={handleRequest}
      confirmLabel={t("settings.deleteAccount")}
      variant="destructive"
      loading={loading}
    >
      <div className="py-4 space-y-2">
        <p className="text-xs text-muted-foreground">
          {t("settings.gracePeriodNotice") ||
            "After confirmation your account enters a 5-day grace period. You can cancel any time in this window."}
        </p>
        <Label className="text-sm text-muted-foreground">
          {t("settings.typeDeleteToConfirm")}
        </Label>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={CONFIRMATION_TEXT}
          className="font-mono"
        />
      </div>
    </ConfirmDialog>
  );
}

export default DeleteAccountDialog;
