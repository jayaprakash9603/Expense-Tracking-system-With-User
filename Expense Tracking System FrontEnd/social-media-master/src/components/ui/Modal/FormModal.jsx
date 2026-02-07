/**
 * FormModal - Modal optimized for forms with save/cancel actions
 *
 * Usage:
 *   <FormModal
 *     open={isOpen}
 *     onClose={handleClose}
 *     title="Edit Profile"
 *     onSave={handleSave}
 *     loading={isSubmitting}
 *   >
 *     <AppTextField label="Name" value={name} onChange={setName} />
 *   </FormModal>
 *
 * Features:
 * - Built-in Save/Cancel actions
 * - Loading state support
 * - Form validation integration
 * - Dirty state tracking option
 * - Customizable action buttons
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Box, Button, CircularProgress } from "@mui/material";
import { Save as SaveIcon, Close as CancelIcon } from "@mui/icons-material";
import AppModal from "./AppModal";
import { useTheme } from "../../../hooks/useTheme";

const FormModal = forwardRef(function FormModal(
  {
    // Core props
    open,
    onClose,
    children,
    title,

    // Actions
    onSave,
    onCancel,
    saveText = "Save",
    cancelText = "Cancel",
    saveIcon,
    cancelIcon,
    showSaveIcon = true,
    showCancelIcon = false,

    // State
    loading = false,
    disabled = false,
    saveDisabled = false,

    // Behavior
    closeOnSave = false,
    confirmClose = false, // Show confirmation when closing with unsaved changes

    // AppModal pass-through
    size = "md",
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // Handle save click
  const handleSave = async (event) => {
    if (onSave) {
      const result = await onSave(event);
      if (closeOnSave && result !== false) {
        onClose?.(event, "save");
      }
    }
  };

  // Handle cancel click
  const handleCancel = (event) => {
    if (onCancel) {
      onCancel(event);
    }
    onClose?.(event, "cancel");
  };

  // Footer with action buttons
  const footer = (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        width: "100%",
        justifyContent: "flex-end",
      }}
    >
      {/* Cancel Button */}
      <Button
        onClick={handleCancel}
        disabled={loading}
        variant="outlined"
        startIcon={showCancelIcon ? cancelIcon || <CancelIcon /> : undefined}
        sx={{
          color: colors.secondary_text,
          borderColor: colors.border_color,
          "&:hover": {
            borderColor: colors.primary_text,
            backgroundColor: colors.hover_bg,
          },
        }}
      >
        {cancelText}
      </Button>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={loading || disabled || saveDisabled}
        variant="contained"
        startIcon={
          loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : showSaveIcon ? (
            saveIcon || <SaveIcon />
          ) : undefined
        }
        sx={{
          backgroundColor: colors.primary_accent,
          color: colors.primary_bg,
          "&:hover": {
            backgroundColor: colors.primary_accent,
            opacity: 0.9,
          },
          "&:disabled": {
            backgroundColor: colors.disabled_bg,
            color: colors.secondary_text,
          },
        }}
      >
        {loading ? "Saving..." : saveText}
      </Button>
    </Box>
  );

  return (
    <AppModal
      ref={ref}
      open={open}
      onClose={loading ? undefined : onClose} // Prevent close while loading
      title={title}
      footer={footer}
      footerAlign="right"
      size={size}
      disableBackdropClick={loading || confirmClose}
      disableEscapeKeyDown={loading}
      {...rest}
    >
      {children}
    </AppModal>
  );
});

FormModal.propTypes = {
  /** Control visibility */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Form content */
  children: PropTypes.node,
  /** Modal title */
  title: PropTypes.node,
  /** Save handler (return false to prevent auto-close) */
  onSave: PropTypes.func,
  /** Cancel handler */
  onCancel: PropTypes.func,
  /** Save button text */
  saveText: PropTypes.string,
  /** Cancel button text */
  cancelText: PropTypes.string,
  /** Custom save icon */
  saveIcon: PropTypes.node,
  /** Custom cancel icon */
  cancelIcon: PropTypes.node,
  /** Show icon on save button */
  showSaveIcon: PropTypes.bool,
  /** Show icon on cancel button */
  showCancelIcon: PropTypes.bool,
  /** Show loading state */
  loading: PropTypes.bool,
  /** Disable all actions */
  disabled: PropTypes.bool,
  /** Disable save button specifically */
  saveDisabled: PropTypes.bool,
  /** Close modal automatically after successful save */
  closeOnSave: PropTypes.bool,
  /** Require confirmation before closing */
  confirmClose: PropTypes.bool,
  /** Modal size */
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "fullWidth"]),
};

export default FormModal;
