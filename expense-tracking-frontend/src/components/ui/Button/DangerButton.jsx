import React from "react";
import PropTypes from "prop-types";
import AppButton from "./AppButton";

/**
 * DangerButton - Danger/destructive action button
 *
 * Use for destructive actions like "Delete", "Remove", "Revoke"
 *
 * @example
 * <DangerButton onClick={handleDelete}>Delete</DangerButton>
 */
const DangerButton = React.forwardRef(
  ({ children, variant = "contained", ...props }, ref) => {
    return (
      <AppButton ref={ref} variant={variant} color="error" {...props}>
        {children}
      </AppButton>
    );
  },
);

DangerButton.displayName = "DangerButton";

DangerButton.propTypes = {
  children: PropTypes.node.isRequired,
  /** Use "outlined" for less emphasized danger actions */
  variant: PropTypes.oneOf(["contained", "outlined"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  sx: PropTypes.object,
};

export default DangerButton;
