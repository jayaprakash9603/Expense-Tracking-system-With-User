import React from "react";
import PropTypes from "prop-types";
import AppButton from "./AppButton";

/**
 * GhostButton - Text-only button for tertiary actions
 *
 * Use for less prominent actions like "Learn more", "View details", links
 *
 * @example
 * <GhostButton onClick={handleViewMore}>View Details</GhostButton>
 */
const GhostButton = React.forwardRef(({ children, ...props }, ref) => {
  return (
    <AppButton ref={ref} variant="text" color="primary" {...props}>
      {children}
    </AppButton>
  );
});

GhostButton.displayName = "GhostButton";

GhostButton.propTypes = {
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

export default GhostButton;
