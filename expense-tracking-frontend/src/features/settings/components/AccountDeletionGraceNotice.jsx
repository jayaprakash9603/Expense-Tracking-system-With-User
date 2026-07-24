import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, IconButton } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CloseIcon from "@mui/icons-material/Close";
import Modal from "../../../shared/ui/overlays/Modal";
import ScrollingTextBanner from "../../../shared/ui/feedback/ScrollingTextBanner";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import useAccountDeletionStatus from "../hooks/useAccountDeletionStatus";
import ToastNotification from "../../../shared/ui/feedback/ToastNotification";
import { clearDeletionPendingSession } from "../utils/accountDeletionSession";

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
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const handleStatusChange = () => {
      refresh();
    };
    window.addEventListener("account-deletion-status-changed", handleStatusChange);
    return () => {
      window.removeEventListener("account-deletion-status-changed", handleStatusChange);
    };
  }, [refresh]);

  const purgeDate = useMemo(
    () => formatDeletionDate(status?.scheduledPurgeAt),
    [status?.scheduledPurgeAt],
  );

  const scrollingMessage = useMemo(
    () =>
      t("settings.deletionScrollingBanner", {
        date: purgeDate,
      }),
    [purgeDate, t],
  );

  useEffect(() => {
    if (!isPending) {
      setWelcomeOpen(false);
      setBannerDismissed(false);
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
      clearDeletionPendingSession();
      sessionStorage.removeItem(WELCOME_NOTICE_KEY);
      window.dispatchEvent(new Event("account-deletion-status-changed"));
      setWelcomeOpen(false);
      setBannerDismissed(false);
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
      {!bannerDismissed && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: { xs: 1, md: 2 },
            py: 0.75,
            minHeight: 44,
            borderBottom: "1px solid rgba(245, 158, 11, 0.35)",
            background:
              "linear-gradient(90deg, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0.08) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <ScheduleIcon sx={{ color: "#f59e0b", fontSize: 20, flexShrink: 0 }} />

          <Box sx={{ flex: 1, minWidth: 0, height: 22, mx: 1 }}>
            <ScrollingTextBanner
              text={scrollingMessage}
              color="#fbbf24"
              durationSeconds={20}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            <Button
              size="small"
              color="inherit"
              onClick={openSettings}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: colors.primary_text,
                minWidth: "auto",
                px: 1,
              }}
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
                fontSize: "0.75rem",
                backgroundColor: colors.accent || "#14b8a6",
                "&:hover": { backgroundColor: colors.accent_hover || "#0d9488" },
              }}
            >
              {submitting
                ? t("settings.cancellingDeletion")
                : t("settings.cancelDeletion")}
            </Button>
            <IconButton
              size="small"
              aria-label="Dismiss deletion banner"
              onClick={() => setBannerDismissed(true)}
              sx={{ color: colors.secondary_text }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

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
          <Box
            sx={{
              height: 28,
              borderRadius: 1,
              overflow: "hidden",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              px: 1,
            }}
          >
            <ScrollingTextBanner text={scrollingMessage} color="#f59e0b" durationSeconds={16} />
          </Box>
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
