import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AppDialog from "./AppDialog";
import { DangerButton, SecondaryButton } from "../Button";
import { useTheme } from "../../../hooks/useTheme";

/**
 * DeleteDialog - Semantic dialog for delete confirmations
 *
 * Use for destructive actions that require user confirmation.
 *
 * @example
 * <DeleteDialog
 *   open={showDelete}
 *   onClose={() => setShowDelete(false)}
 *   onDelete={handleDelete}
 *   itemName="Monthly Budget"
 *   itemType="budget"
 * />
 */
const DeleteDialog = ({
  open,
  onClose,
  onDelete,
  title = "Delete Item",
  message,
  itemName,
  itemType = "item",
  deleteText = "Delete",
  cancelText = "Cancel",
  deleteLoading = false,
  deleteDisabled = false,
  showWarningIcon = true,
  maxWidth = "xs",
  ...props
}) => {
  const { colors } = useTheme();

  const handleDelete = () => {
    onDelete?.();
  };

  // Generate default message if not provided
  const defaultMessage = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      actions={
        <>
          <SecondaryButton onClick={onClose} disabled={deleteLoading}>
            {cancelText}
          </SecondaryButton>
          <DangerButton
            onClick={handleDelete}
            disabled={deleteDisabled || deleteLoading}
          >
            {deleteLoading ? "Deleting..." : deleteText}
          </DangerButton>
        </>
      }
      {...props}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {showWarningIcon && (
          <Box
            sx={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              borderRadius: "50%",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WarningAmberIcon
              sx={{
                color: colors.error || "#ef4444",
                fontSize: "24px",
              }}
            />
          </Box>
        )}
        <Typography
          sx={{
            fontSize: "0.95rem",
            lineHeight: 1.6,
            color: colors.primary_text || "#fff",
          }}
        >
          {message || defaultMessage}
        </Typography>
      </Box>
    </AppDialog>
  );
};

DeleteDialog.propTypes = {
  /** Whether the dialog is open */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Delete handler */
  onDelete: PropTypes.func.isRequired,
  /** Dialog title */
  title: PropTypes.string,
  /** Custom message (overrides default) */
  message: PropTypes.node,
  /** Name of item being deleted (for default message) */
  itemName: PropTypes.string,
  /** Type of item being deleted (for default message) */
  itemType: PropTypes.string,
  /** Text for delete button */
  deleteText: PropTypes.string,
  /** Text for cancel button */
  cancelText: PropTypes.string,
  /** Loading state for delete button */
  deleteLoading: PropTypes.bool,
  /** Disabled state for delete button */
  deleteDisabled: PropTypes.bool,
  /** Show warning icon */
  showWarningIcon: PropTypes.bool,
  /** Max width of dialog */
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),
};

export default DeleteDialog;
