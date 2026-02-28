import React from "react";
import PropTypes from "prop-types";
import AppButton from "./AppButton";

/**
 * PrimaryButton - Primary action button with contained style
 *
 * Use for main actions like "Save", "Submit", "Create", "Confirm"
 *
 * @example
 * <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
 */
const PrimaryButton = React.forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <AppButton
        ref={ref}
        variant="contained"
        color="primary"
        {...props}
      >
        {children}
      </AppButton>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

PrimaryButton.propTypes = {
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

export default PrimaryButton;
