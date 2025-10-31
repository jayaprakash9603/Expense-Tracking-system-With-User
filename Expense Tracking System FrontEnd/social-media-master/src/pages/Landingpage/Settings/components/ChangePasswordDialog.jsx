import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

/**
 * ChangePasswordDialog Component
 * Follows Single Responsibility Principle - handles only password change
 * Reusable dialog component following Interface Segregation Principle
 */
const ChangePasswordDialog = ({
  open,
  onClose,
  onConfirm,
  colors,
  isSmallScreen,
}) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (field) => (event) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = () => {
    // Add validation logic here
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Handle error
      return;
    }
    onConfirm(passwordData);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleClose = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
  };

  const textFieldStyle = {
    color: colors.primary_text,
    backgroundColor: colors.secondary_bg,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.border_color,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.primary_accent,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.primary_accent,
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        Change Password
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Current Password"
          type="password"
          variant="outlined"
          value={passwordData.currentPassword}
          onChange={handleChange("currentPassword")}
          sx={{ mb: 2 }}
          InputProps={{ sx: textFieldStyle }}
          InputLabelProps={{
            sx: { color: colors.secondary_text },
          }}
        />
        <TextField
          fullWidth
          label="New Password"
          type="password"
          variant="outlined"
          value={passwordData.newPassword}
          onChange={handleChange("newPassword")}
          sx={{ mb: 2 }}
          InputProps={{ sx: textFieldStyle }}
          InputLabelProps={{
            sx: { color: colors.secondary_text },
          }}
        />
        <TextField
          fullWidth
          label="Confirm New Password"
          type="password"
          variant="outlined"
          value={passwordData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          InputProps={{ sx: textFieldStyle }}
          InputLabelProps={{
            sx: { color: colors.secondary_text },
          }}
        />
      </DialogContent>
      <DialogActions
        sx={{ p: 2, borderTop: `1px solid ${colors.border_color}` }}
      >
        <Button
          onClick={handleClose}
          sx={{
            color: colors.secondary_text,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            backgroundColor: colors.primary_accent,
            color: colors.button_text,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: colors.button_hover,
            },
          }}
        >
          Change Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
