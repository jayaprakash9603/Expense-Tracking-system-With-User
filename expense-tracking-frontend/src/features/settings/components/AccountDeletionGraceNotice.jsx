import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Typography } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Modal from "../../../shared/ui/overlays/Modal";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import useAccountDeletionStatus from "../hooks/useAccountDeletionStatus";
import ToastNotification from "../../../shared/ui/feedback/ToastNotification";

const WELCOME_NOTICE_KEY = "deletionWelcomeNoticeSeen";

const formatDeletionDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
};

const AccountDeletionGraceNotice = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { status, isPending, submitting, cancelDeletion, refresh } =
    useAccountDeletionStatus();

  useEffect(() => {
    const handleStatusChange = () => {
      refresh();
    };
    window.addEventListener("account-deletion-status-changed", handleStatusChange);
    return () => {
      window.removeEventListener("account-deletion-status-changed", handleStatusChange);
    };
  }, [refresh]);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const purgeDate = useMemo(
    () => formatDeletionDate(status?.scheduledPurgeAt),
    [status?.scheduledPurgeAt],
  );

  useEffect(() => {
    if (!isPending) {
      setWelcomeOpen(false);
      return;
    }
    if (sessionStorage.getItem(WELCOME_NOTICE_KEY) === "1") {
      return;
    }
    setWelcomeOpen(true);
    sessionStorage.setItem(WELCOME_NOTICE_KEY, "1");
  }, [isPending]);

  const handleCancel = async () => {
    try {
      await cancelDeletion();
      sessionStorage.removeItem(WELCOME_NOTICE_KEY);
      window.dispatchEvent(new Event("account-deletion-status-changed"));
      setWelcomeOpen(false);
      setToast({
        open: true,
        message: t("settings.deletionCancelledSnackbar"),
        severity: "success",
      });
    } catch {
      setToast({
        open: true,
        message: t("settings.deletionCancelFailed"),
        severity: "error",
      });
    }
  };

  const openSettings = () => {
    setWelcomeOpen(false);
    navigate("/settings?highlight=delete-account");
  };

  if (!isPending) {
    return (
      <ToastNotification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    );
  }

  return (
    <>
      <Box sx={{ px: { xs: 1.5, md: 2.5 }, pt: 1.5 }}>
        <Alert
          severity="warning"
          icon={<ScheduleIcon fontSize="inherit" />}
          sx={{
            borderRadius: 2,
            backgroundColor: "rgba(245, 158, 11, 0.12)",
            color: colors.primary_text,
            border: `1px solid rgba(245, 158, 11, 0.35)`,
            "& .MuiAlert-message": { width: "100%" },
          }}
          action={
            <Box sx={{ display: "flex", gap: 1, flexShrink: 0, ml: 1 }}>
              <Button
                size="small"
                color="inherit"
                onClick={openSettings}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {t("settings.deletionBannerManage")}
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={submitting}
                onClick={handleCancel}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: colors.accent || "#14b8a6",
                  "&:hover": { backgroundColor: colors.accent_hover || "#0d9488" },
                }}
              >
                {submitting
                  ? t("settings.cancellingDeletion")
                  : t("settings.cancelDeletion")}
              </Button>
            </Box>
          }
        >
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
            {t("settings.deletionBannerTitle")}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            {t("settings.deletionBannerBody", { date: purgeDate })}
          </Typography>
        </Alert>
      </Box>

      <Modal
        isOpen={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        title={t("settings.deletionWelcomeTitle")}
        confirmationText={t("settings.deletionWelcomeLead", { date: purgeDate })}
        contentAlign="left"
        onDecline={() => setWelcomeOpen(false)}
        onApprove={openSettings}
        declineText={t("settings.deletionWelcomeDismiss")}
        approveText={t("settings.deletionWelcomeManage")}
      >
        <div className="space-y-3 text-sm">
          <p style={{ color: colors.secondary_text }}>
            {t("settings.deletionWelcomeBody")}
          </p>
          <ul className="list-disc pl-5 space-y-1" style={{ color: colors.secondary_text }}>
            <li>{t("settings.deletionWelcomePointAccess")}</li>
            <li>{t("settings.deletionWelcomePointCancel")}</li>
            <li>{t("settings.deletionWelcomePointPurge", { date: purgeDate })}</li>
          </ul>
          <div
            className="rounded-lg px-3 py-2"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.12)",
              color: colors.primary_text,
            }}
          >
            {t("settings.deletionWelcomeFooter")}
          </div>
        </div>
      </Modal>

      <ToastNotification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </>
  );
};

export default AccountDeletionGraceNotice;
