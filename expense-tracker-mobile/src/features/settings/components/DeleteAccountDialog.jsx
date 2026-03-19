import React, { useState } from "react";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";
import { toast } from "sonner";

const CONFIRMATION_TEXT = "DELETE";

export function DeleteAccountDialog({ open, onOpenChange }) {
  const { t } = useLanguage();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (confirmText !== CONFIRMATION_TEXT) {
      toast.error(t("settings.typeDeleteToConfirm"));
      return;
    }

    setLoading(true);
    const { error } = await safeApiCall(() => api.delete("/api/user/account"));
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t("settings.accountDeleted"));
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) setConfirmText("");
    onOpenChange(isOpen);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t("settings.deleteAccount")}
      description={t("settings.deleteAccountWarning")}
      onConfirm={handleConfirm}
      confirmLabel={t("settings.deleteAccount")}
      variant="destructive"
      loading={loading}
    >
      <div className="py-4 space-y-2">
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
