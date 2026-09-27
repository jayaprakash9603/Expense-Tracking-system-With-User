import React from "react";
import { Tabs as MuiTabs, Tab as MuiTab } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";
import { DENSITY, RADIUS } from "@shared/theme/tokens";

/**
 * AppTabs — theme-aware MUI Tabs for Expensio.
 *
 * Supports density sizing and token-driven indicator/selection colors.
 *
 * @example
 * <AppTabs value={tab} onChange={(_, v) => setTab(v)} tabs={[
 *   { value: "all", label: "All" },
 *   { value: "pending", label: "Pending" },
 * ]} />
 */
const AppTabs = React.forwardRef(
  (
    {
      value,
      onChange,
      tabs = [],
      children,
      size = "medium",
      density = "comfortable",
      variant = "standard",
      centered = false,
      scrollable = false,
      className = "",
      sx = {},
      TabProps = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const isCompact = density === "compact" || size === "compact";
    const densityKey = isCompact ? "compact" : size === "large" ? "large" : "medium";
    const current = DENSITY[densityKey] || DENSITY.medium;

    const accent = colors.primary_accent || "#00dac6";
    const textColor = colors.primary_text || "#fff";
    const mutedColor = colors.secondary_text || "#9ca3af";
    const borderColor = colors.border_color || "rgb(75, 85, 99)";

    const tabsSx = {
      minHeight: current.controlHeight,
      "& .MuiTabs-indicator": {
        backgroundColor: accent,
        height: variant === "fullWidth" ? 3 : 2,
        borderRadius: RADIUS.full,
      },
      "& .MuiTabs-flexContainer": {
        gap: isCompact ? 0.5 : 1,
      },
      ...(scrollable
        ? {
            "& .MuiTabs-scrollButtons": {
              color: accent,
            },
          }
        : {}),
      ...(variant === "standard"
        ? {
            borderBottom: `1px solid ${borderColor}`,
          }
        : {}),
      ...sx,
    };

    const tabSx = {
      minHeight: current.controlHeight,
      fontSize: current.fontSize,
      fontWeight: 500,
      textTransform: "none",
      color: mutedColor,
      px: current.paddingX,
      borderRadius: variant === "fullWidth" ? `${RADIUS.sm} ${RADIUS.sm} 0 0` : RADIUS.sm,
      transition: "color 0.2s ease, background-color 0.2s ease",
      "&.Mui-selected": {
        color: textColor,
        fontWeight: 600,
      },
      "&:hover": {
        color: textColor,
        backgroundColor: "var(--color-hover-bg)" || "rgba(255,255,255,0.05)",
      },
      "&.Mui-focusVisible": {
        outline: `2px solid ${accent}`,
        outlineOffset: 2,
      },
    };

    return (
      <MuiTabs
        ref={ref}
        value={value}
        onChange={onChange}
        variant={scrollable ? "scrollable" : variant}
        scrollButtons={scrollable ? "auto" : false}
        centered={centered}
        className={className}
        sx={tabsSx}
        {...restProps}
      >
        {children ||
          tabs.map((tab) => (
            <MuiTab
              key={String(tab.value)}
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition={tab.iconPosition || "start"}
              disabled={tab.disabled}
              sx={tabSx}
              {...TabProps}
              {...(tab.TabProps || {})}
            />
          ))}
      </MuiTabs>
    );
  },
);

AppTabs.displayName = "AppTabs";

const tabShape = PropTypes.shape({
  value: PropTypes.any.isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["top", "bottom", "start", "end"]),
  disabled: PropTypes.bool,
  TabProps: PropTypes.object,
});

AppTabs.propTypes = {
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(tabShape),
  children: PropTypes.node,
  size: PropTypes.oneOf(["compact", "small", "medium", "large"]),
  density: PropTypes.oneOf(["compact", "comfortable"]),
  variant: PropTypes.oneOf(["standard", "fullWidth", "scrollable"]),
  centered: PropTypes.bool,
  scrollable: PropTypes.bool,
  className: PropTypes.string,
  sx: PropTypes.object,
  TabProps: PropTypes.object,
};

export default AppTabs;
