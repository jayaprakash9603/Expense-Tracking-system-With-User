import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "../../../../hooks/useTranslation";

/**
 * DeleteAccountDialog Component
 * Follows Single Responsibility Principle - handles only delete account confirmation
 * Reusable dialog component following Interface Segregation Principle
 */
const DeleteAccountDialog = ({
  open,
  onClose,
  onConfirm,
  colors,
  isSmallScreen,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: colors.tertiary_bg,
          border: `1px solid ${colors.border_color}`,
          borderRadius: 3,
          minWidth: isSmallScreen ? "90%" : 400,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: colors.primary_text,
          fontWeight: 700,
          borderBottom: `1px solid ${colors.border_color}`,
        }}
      >
        {t("settings.deleteAccount")}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography sx={{ color: colors.primary_text, mb: 2 }}>
          {t("messages.confirmDelete")}
        </Typography>
        <Typography sx={{ color: colors.secondary_text, fontSize: "0.9rem" }}>
          {t("settings.deleteAccountWarning")}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{ p: 2, borderTop: `1px solid ${colors.border_color}` }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: colors.secondary_text,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            backgroundColor: "#ef4444",
            color: "white",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#dc2626",
            },
          }}
        >
          {t("settings.deleteAccount")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog;
