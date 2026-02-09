/**
 * FilterDrawer - Theme-aware left-side filter drawer
 *
 * Usage:
 *   <FilterDrawer
 *     open={isOpen}
 *     onClose={handleClose}
 *     title="Filters"
 *     onApply={handleApply}
 *     onReset={handleReset}
 *   >
 *     <FilterSection label="Categories">
 *       <CheckboxGroup ... />
 *     </FilterSection>
 *   </FilterDrawer>
 *
 * Features:
 * - Left anchor by default (filter panel pattern)
 * - Apply/Reset buttons in footer
 * - Active filters count badge
 * - Section components for organization
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Button, Badge, Divider } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AppDrawer from "./AppDrawer";
import { useTheme } from "../../../hooks/useTheme";

const FilterDrawer = forwardRef(function FilterDrawer(
  {
    // Core
    open = false,
    onClose,
    children,

    // Header
    title = "Filters",
    subtitle = "Refine your results",
    activeFilterCount = 0,

    // Actions
    onApply,
    onReset,
    applyLabel = "Apply Filters",
    resetLabel = "Reset",
    showApply = true,
    showReset = true,
    applyDisabled = false,

    // Styling
    width = 360,

    // Pass-through
    ...rest
  },
  ref,
) {
  const { colors, mode } = useTheme();

  const brandBg = colors.secondary_accent || colors.primary_accent || "#00DAC6";
  const brandText = mode === "dark" ? "#0f0f0f" : "#ffffff";

  // Header with filter icon and badge
  const headerContent = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
      <Badge
        badgeContent={activeFilterCount}
        color="primary"
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: brandBg,
            color: brandText,
            fontWeight: 600,
            fontSize: "0.7rem",
          },
        }}
      >
        <FilterListIcon sx={{ color: colors.primary_text, fontSize: 24 }} />
      </Badge>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: "1rem",
            color: colors.primary_text,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              opacity: 0.75,
              fontSize: "0.75rem",
              color: colors.secondary_text,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );

  // Footer with Apply/Reset buttons
  const footer = (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        justifyContent: "flex-end",
      }}
    >
      {showReset && (
        <Button
          variant="outlined"
          onClick={onReset}
          startIcon={<RestartAltIcon />}
          sx={{
            color: colors.secondary_text,
            borderColor: colors.border_color,
            "&:hover": {
              borderColor: colors.primary_text,
              color: colors.primary_text,
              backgroundColor: "transparent",
            },
          }}
        >
          {resetLabel}
        </Button>
      )}
      {showApply && (
        <Button
          variant="contained"
          onClick={onApply}
          disabled={applyDisabled}
          sx={{
            backgroundColor: brandBg,
            color: brandText,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: brandBg,
              filter: "brightness(0.9)",
            },
            "&:disabled": {
              backgroundColor: colors.border_color,
              color: colors.secondary_text,
            },
          }}
        >
          {applyLabel}
        </Button>
      )}
    </Box>
  );

  return (
    <AppDrawer
      ref={ref}
      open={open}
      onClose={onClose}
      anchor="left"
      width={width}
      headerContent={headerContent}
      footer={footer}
      showFooter={showApply || showReset}
      {...rest}
    >
      <Box sx={{ p: 2 }}>{children}</Box>
    </AppDrawer>
  );
});

/**
 * FilterSection - Section component for organizing filter groups
 */
export const FilterSection = ({
  label,
  helperText,
  children,
  first = false,
  divider = true,
}) => {
  const { colors } = useTheme();

  return (
    <Box sx={{ mt: first ? 0 : 2.5 }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: colors.primary_text,
            fontSize: "0.85rem",
          }}
        >
          {label}
        </Typography>
        {helperText && (
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
              color: colors.secondary_text,
              fontSize: "0.7rem",
            }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
      {children}
      {divider && (
        <Divider sx={{ mt: 2.5, borderColor: colors.border_color }} />
      )}
    </Box>
  );
};

FilterSection.propTypes = {
  /** Section label */
  label: PropTypes.string.isRequired,
  /** Helper text below label */
  helperText: PropTypes.string,
  /** Section content */
  children: PropTypes.node,
  /** Is first section (no top margin) */
  first: PropTypes.bool,
  /** Show divider after section */
  divider: PropTypes.bool,
};

FilterDrawer.propTypes = {
  /** Whether drawer is open */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Filter content */
  children: PropTypes.node,

  // Header
  /** Header title */
  title: PropTypes.string,
  /** Header subtitle */
  subtitle: PropTypes.string,
  /** Active filters count for badge */
  activeFilterCount: PropTypes.number,

  // Actions
  /** Apply filters handler */
  onApply: PropTypes.func,
  /** Reset filters handler */
  onReset: PropTypes.func,
  /** Apply button label */
  applyLabel: PropTypes.string,
  /** Reset button label */
  resetLabel: PropTypes.string,
  /** Show apply button */
  showApply: PropTypes.bool,
  /** Show reset button */
  showReset: PropTypes.bool,
  /** Disable apply button */
  applyDisabled: PropTypes.bool,

  // Styling
  /** Width on desktop */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default FilterDrawer;
