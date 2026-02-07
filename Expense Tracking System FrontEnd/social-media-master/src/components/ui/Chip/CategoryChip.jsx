import React from "react";
import PropTypes from "prop-types";
import AppChip from "./AppChip";
import { useTheme } from "../../../hooks/useTheme";

/**
 * CategoryChip - Semantic chip for displaying categories
 *
 * Styled for category tags with optional custom color.
 *
 * @example
 * <CategoryChip label="Food" />
 * <CategoryChip label="Transport" color="#3b82f6" />
 */
const CategoryChip = ({
  label,
  categoryColor,
  size = "small",
  variant = "outlined",
  onClick,
  onDelete,
  ...props
}) => {
  const { colors } = useTheme();

  // Custom styles when categoryColor is provided
  const customSx = categoryColor
    ? {
        borderColor: categoryColor,
        color: categoryColor,
        backgroundColor: variant === "filled" ? categoryColor : "transparent",
        ...(variant === "filled" && {
          color: "#fff",
        }),
      }
    : {};

  return (
    <AppChip
      label={label}
      color="default"
      size={size}
      variant={variant}
      onClick={onClick}
      onDelete={onDelete}
      sx={{
        borderRadius: "16px",
        ...customSx,
      }}
      {...props}
    />
  );
};

CategoryChip.propTypes = {
  /** Category label */
  label: PropTypes.node.isRequired,
  /** Custom category color (hex) */
  categoryColor: PropTypes.string,
  /** Chip size */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Chip variant */
  variant: PropTypes.oneOf(["filled", "outlined"]),
  /** Click handler */
  onClick: PropTypes.func,
  /** Delete handler */
  onDelete: PropTypes.func,
};

export default CategoryChip;
