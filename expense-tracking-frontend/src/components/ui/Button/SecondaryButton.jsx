import React from "react";
import PropTypes from "prop-types";
import AppButton from "./AppButton";

/**
 * SecondaryButton - Secondary action button with outlined style
 *
 * Use for secondary actions like "Cancel", "Back", "Skip", "Reset"
 *
 * @example
 * <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
 */
const SecondaryButton = React.forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <AppButton
        ref={ref}
        variant="outlined"
        color="primary"
        {...props}
      >
        {children}
      </AppButton>
    );
  }
);

SecondaryButton.displayName = "SecondaryButton";

SecondaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  sx: PropTypes.object,
};

export default SecondaryButton;
