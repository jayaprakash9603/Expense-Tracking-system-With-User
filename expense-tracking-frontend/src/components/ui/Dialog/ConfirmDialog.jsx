import React from "react";
import PropTypes from "prop-types";
import AppDialog from "./AppDialog";
import { PrimaryButton, SecondaryButton } from "../Button";

/**
 * ConfirmDialog - Semantic dialog for confirmation actions
 *
 * Use for "Are you sure?" type confirmations.
 *
 * @example
 * <ConfirmDialog
 *   open={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleConfirm}
 *   title="Confirm Action"
 *   message="Are you sure you want to proceed?"
 * />
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmLoading = false,
  confirmDisabled = false,
  maxWidth = "xs",
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      actions={
        <>
          <SecondaryButton onClick={onClose} disabled={confirmLoading}>
            {cancelText}
          </SecondaryButton>
          <PrimaryButton
            onClick={handleConfirm}
            disabled={confirmDisabled || confirmLoading}
          >
            {confirmLoading ? "Loading..." : confirmText}
          </PrimaryButton>
        </>
      }
      {...props}
    >
      {message && (
        <span style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{message}</span>
      )}
      {children}
    </AppDialog>
  );
};

ConfirmDialog.propTypes = {
  /** Whether the dialog is open */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Confirm handler */
  onConfirm: PropTypes.func.isRequired,
  /** Dialog title */
  title: PropTypes.string,
  /** Confirmation message */
  message: PropTypes.node,
  /** Additional content */
  children: PropTypes.node,
  /** Text for confirm button */
  confirmText: PropTypes.string,
  /** Text for cancel button */
  cancelText: PropTypes.string,
  /** Loading state for confirm button */
  confirmLoading: PropTypes.bool,
  /** Disabled state for confirm button */
  confirmDisabled: PropTypes.bool,
  /** Max width of dialog */
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),
};

export default ConfirmDialog;
