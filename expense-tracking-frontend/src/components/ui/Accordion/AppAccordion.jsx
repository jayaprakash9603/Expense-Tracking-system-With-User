/**
 * AppAccordion - Theme-aware base MUI Accordion wrapper
 *
 * Usage:
 *   <AppAccordion
 *     expanded={isExpanded}
 *     onChange={handleChange}
 *     summary="Click to expand"
 *     expandIcon={<ExpandMoreIcon />}
 *   >
 *     Accordion content here
 *   </AppAccordion>
 *
 * Features:
 * - Full theme integration via useTheme hook
 * - Customizable summary and expand icon
 * - Square/rounded variants
 * - Disabled state support
 * - Controlled and uncontrolled modes
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

const AppAccordion = forwardRef(function AppAccordion(
  {
    // Content
    summary,
    summaryComponent,
    children,
    expandIcon,

    // Control
    expanded,
    defaultExpanded = false,
    onChange,
    disabled = false,

    // Styling
    variant = "rounded", // 'rounded' | 'square' | 'outlined'
    elevation = 0,
    disableGutters = false,
    summaryProps = {},
    detailsProps = {},

    // MUI pass-through
    sx,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // Variant-based styles
  const getVariantStyles = () => {
    const baseStyles = {
      backgroundColor: colors.secondary_bg,
      color: colors.primary_text,
      "&:before": {
        display: "none", // Remove default MUI divider
      },
      "&.Mui-expanded": {
        margin: 0,
      },
    };

    switch (variant) {
      case "square":
        return {
          ...baseStyles,
          borderRadius: 0,
        };
      case "outlined":
        return {
          ...baseStyles,
          borderRadius: 2,
          border: `1px solid ${colors.border_color}`,
          boxShadow: "none",
        };
      case "rounded":
      default:
        return {
          ...baseStyles,
          borderRadius: 2,
          boxShadow:
            elevation > 0
              ? `0 ${elevation * 2}px ${elevation * 4}px rgba(0,0,0,0.1)`
              : "none",
        };
    }
  };

  // Summary styles
  const getSummaryStyles = () => ({
    backgroundColor: colors.tertiary_bg,
    color: colors.primary_text,
    minHeight: 56,
    "&.Mui-expanded": {
      minHeight: 56,
    },
    "&:hover": {
      backgroundColor: colors.hover_bg,
    },
    "& .MuiAccordionSummary-content": {
      margin: "12px 0",
      "&.Mui-expanded": {
        margin: "12px 0",
      },
    },
    "& .MuiAccordionSummary-expandIconWrapper": {
      color: colors.primary_accent,
    },
    ...summaryProps.sx,
  });

  // Details styles
  const getDetailsStyles = () => ({
    backgroundColor: colors.secondary_bg,
    color: colors.primary_text,
    padding: 2,
    borderTop: `1px solid ${colors.border_color}`,
    ...detailsProps.sx,
  });

  // Render summary content
  const renderSummary = () => {
    if (summaryComponent) {
      return summaryComponent;
    }
    if (typeof summary === "string") {
      return (
        <Typography sx={{ color: colors.primary_text, fontWeight: 500 }}>
          {summary}
        </Typography>
      );
    }
    return summary;
  };

  return (
    <Accordion
      ref={ref}
      expanded={expanded}
      defaultExpanded={defaultExpanded}
      onChange={onChange}
      disabled={disabled}
      disableGutters={disableGutters}
      elevation={elevation}
      sx={{
        ...getVariantStyles(),
        ...sx,
      }}
      {...rest}
    >
      <AccordionSummary
        expandIcon={expandIcon || <ExpandMoreIcon />}
        {...summaryProps}
        sx={getSummaryStyles()}
      >
        {renderSummary()}
      </AccordionSummary>
      <AccordionDetails {...detailsProps} sx={getDetailsStyles()}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
});

AppAccordion.propTypes = {
  /** Summary text or component displayed in header */
  summary: PropTypes.node,
  /** Custom summary component (overrides summary prop) */
  summaryComponent: PropTypes.node,
  /** Accordion content */
  children: PropTypes.node.isRequired,
  /** Custom expand icon */
  expandIcon: PropTypes.node,
  /** Controlled expansion state */
  expanded: PropTypes.bool,
  /** Default expansion state (uncontrolled) */
  defaultExpanded: PropTypes.bool,
  /** Expansion change handler */
  onChange: PropTypes.func,
  /** Disable the accordion */
  disabled: PropTypes.bool,
  /** Visual variant */
  variant: PropTypes.oneOf(["rounded", "square", "outlined"]),
  /** Elevation shadow level */
  elevation: PropTypes.number,
  /** Remove gutters */
  disableGutters: PropTypes.bool,
  /** Props for AccordionSummary */
  summaryProps: PropTypes.object,
  /** Props for AccordionDetails */
  detailsProps: PropTypes.object,
  /** Custom styles */
  sx: PropTypes.object,
};

export default AppAccordion;
