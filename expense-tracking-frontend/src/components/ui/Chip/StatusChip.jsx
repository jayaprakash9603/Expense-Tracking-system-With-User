import React from "react";
import PropTypes from "prop-types";
import AppChip from "./AppChip";

/**
 * StatusChip - Semantic chip for displaying status
 *
 * Automatically selects appropriate colors based on status.
 *
 * @example
 * <StatusChip status="success" label="Completed" />
 * <StatusChip status="pending" label="In Progress" />
 * <StatusChip status="error" label="Failed" />
 */
const StatusChip = ({
  status = "default",
  label,
  size = "small",
  variant = "filled",
  ...props
}) => {
  // Map status to color
  const statusColorMap = {
    success: "success",
    completed: "success",
    active: "success",
    approved: "success",
    paid: "success",
    warning: "warning",
    pending: "warning",
    inProgress: "warning",
    "in-progress": "warning",
    partial: "warning",
    error: "error",
    failed: "error",
    rejected: "error",
    overdue: "error",
    exceeded: "error",
    cancelled: "error",
    info: "info",
    new: "info",
    draft: "info",
    default: "default",
    inactive: "default",
  };

  const color = statusColorMap[status] || statusColorMap.default;

  return (
    <AppChip
      label={label}
      color={color}
      size={size}
      variant={variant}
      {...props}
    />
  );
};

StatusChip.propTypes = {
  /** Status type (determines color) */
  status: PropTypes.oneOf([
    "success",
    "completed",
    "active",
    "approved",
    "paid",
    "warning",
    "pending",
    "inProgress",
    "in-progress",
    "partial",
    "error",
    "failed",
    "rejected",
    "overdue",
    "exceeded",
    "cancelled",
    "info",
    "new",
    "draft",
    "default",
    "inactive",
  ]),
  /** Chip label text */
  label: PropTypes.node.isRequired,
  /** Chip size */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Chip variant */
  variant: PropTypes.oneOf(["filled", "outlined"]),
};

export default StatusChip;
