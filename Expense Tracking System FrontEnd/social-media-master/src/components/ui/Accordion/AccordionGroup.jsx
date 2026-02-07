/**
 * AccordionGroup - Manages a group of accordions with controlled expansion
 *
 * Usage:
 *   <AccordionGroup
 *     items={[
 *       { id: '1', summary: 'Panel 1', content: <div>Content 1</div> },
 *       { id: '2', summary: 'Panel 2', content: <div>Content 2</div> },
 *     ]}
 *     exclusive={true}
 *     defaultExpanded="1"
 *   />
 *
 * Features:
 * - Exclusive mode (only one open at a time)
 * - Multi-select mode (multiple can be open)
 * - Controlled and uncontrolled modes
 * - Full AppAccordion feature support
 */
import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import AppAccordion from "./AppAccordion";
import { useTheme } from "../../../hooks/useTheme";

const AccordionGroup = ({
  // Items configuration
  items = [],

  // Control
  expanded, // Controlled: string (exclusive) or array (multi)
  defaultExpanded, // Uncontrolled default
  onChange,
  exclusive = true, // Only one panel open at a time

  // Styling
  variant = "rounded",
  spacing = 1,
  dividers = false,

  // Container props
  sx,
  ...rest
}) => {
  const { colors } = useTheme();

  // Internal state for uncontrolled mode
  const [internalExpanded, setInternalExpanded] = useState(() => {
    if (defaultExpanded === undefined) {
      return exclusive ? null : [];
    }
    return exclusive
      ? defaultExpanded
      : Array.isArray(defaultExpanded)
        ? defaultExpanded
        : [defaultExpanded];
  });

  // Determine if controlled
  const isControlled = expanded !== undefined;
  const currentExpanded = isControlled ? expanded : internalExpanded;

  // Check if panel is expanded
  const isPanelExpanded = useCallback(
    (panelId) => {
      if (exclusive) {
        return currentExpanded === panelId;
      }
      return (
        Array.isArray(currentExpanded) && currentExpanded.includes(panelId)
      );
    },
    [currentExpanded, exclusive],
  );

  // Handle panel change
  const handlePanelChange = useCallback(
    (panelId) => (event, isExpanded) => {
      let newExpanded;

      if (exclusive) {
        newExpanded = isExpanded ? panelId : null;
      } else {
        const currentArray = Array.isArray(currentExpanded)
          ? currentExpanded
          : [];
        newExpanded = isExpanded
          ? [...currentArray, panelId]
          : currentArray.filter((id) => id !== panelId);
      }

      if (!isControlled) {
        setInternalExpanded(newExpanded);
      }

      if (onChange) {
        onChange(panelId, isExpanded, newExpanded);
      }
    },
    [currentExpanded, exclusive, isControlled, onChange],
  );

  // Container styles
  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    gap: dividers ? 0 : spacing,
    ...sx,
  };

  return (
    <Box sx={containerStyles} {...rest}>
      {items.map((item, index) => {
        const {
          id,
          summary,
          summaryComponent,
          content,
          disabled,
          expandIcon,
          ...itemRest
        } = item;

        const panelId = id || `panel-${index}`;
        const isExpanded = isPanelExpanded(panelId);
        const isLast = index === items.length - 1;

        return (
          <AppAccordion
            key={panelId}
            expanded={isExpanded}
            onChange={handlePanelChange(panelId)}
            summary={summary}
            summaryComponent={summaryComponent}
            expandIcon={expandIcon}
            disabled={disabled}
            variant={variant}
            sx={{
              ...(dividers &&
                !isLast && {
                  borderBottom: `1px solid ${colors.border_color}`,
                  borderRadius:
                    index === 0 ? "8px 8px 0 0" : isLast ? "0 0 8px 8px" : 0,
                }),
              ...itemRest.sx,
            }}
            {...itemRest}
          >
            {content}
          </AppAccordion>
        );
      })}
    </Box>
  );
};

AccordionGroup.propTypes = {
  /** Array of accordion items */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      /** Unique identifier for the panel */
      id: PropTypes.string,
      /** Summary text or node */
      summary: PropTypes.node,
      /** Custom summary component */
      summaryComponent: PropTypes.node,
      /** Panel content */
      content: PropTypes.node.isRequired,
      /** Disable this panel */
      disabled: PropTypes.bool,
      /** Custom expand icon */
      expandIcon: PropTypes.node,
    }),
  ).isRequired,
  /** Controlled expansion state */
  expanded: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  /** Default expansion (uncontrolled) */
  defaultExpanded: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  /** Change handler: (panelId, isExpanded, allExpanded) => void */
  onChange: PropTypes.func,
  /** Only allow one panel open at a time */
  exclusive: PropTypes.bool,
  /** Visual variant passed to AppAccordion */
  variant: PropTypes.oneOf(["rounded", "square", "outlined"]),
  /** Spacing between accordions (theme units) */
  spacing: PropTypes.number,
  /** Show dividers between items instead of spacing */
  dividers: PropTypes.bool,
  /** Container styles */
  sx: PropTypes.object,
};

export default AccordionGroup;
