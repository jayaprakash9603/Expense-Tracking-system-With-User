import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

const Modal = ({
  isOpen,
  onClose,
  title,
  confirmationText,
  onApprove,
  onDecline,
  approveText = "Confirm",
  declineText = "Cancel",
  approveColor = "error",
  declineColor = "inherit",
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1b1b1b",
          border: "1px solid #333",
          borderRadius: 2,
          color: "#fff",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#0b0b0b",
          color: "#fff",
          borderBottom: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WarningIcon sx={{ color: "#f44336", mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#b0b0b0",
            "&:hover": {
              backgroundColor: "#28282a",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Typography
          variant="body1"
          sx={{
            color: "#b0b0b0",
            lineHeight: 1.6,
          }}
        >
          {confirmationText}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: "#0b0b0b",
          borderTop: "1px solid #333",
          px: 3,
          py: 2,
          gap: 2,
        }}
      >
        <Button
          onClick={onDecline}
          variant="outlined"
          sx={{
            color: "#b0b0b0",
            borderColor: "#333",
            "&:hover": {
              backgroundColor: "#28282a",
              borderColor: "#555",
            },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {declineText}
        </Button>
        <Button
          onClick={onApprove}
          variant="contained"
          color={approveColor}
          sx={{
            backgroundColor: approveColor === "error" ? "#f44336" : "#14b8a6",
            "&:hover": {
              backgroundColor: approveColor === "error" ? "#d32f2f" : "#0d9488",
            },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {approveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Modal;