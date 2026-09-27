import React from "react";
import { Pagination as MuiPagination, PaginationItem } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";
import { DENSITY, RADIUS } from "@shared/theme/tokens";

/**
 * AppPagination — theme-aware page navigation.
 *
 * @example
 * <AppPagination count={10} page={page} onChange={(_, p) => setPage(p)} />
 */
const AppPagination = React.forwardRef(
  (
    {
      count = 1,
      page = 1,
      onChange,
      size = "medium",
      density = "comfortable",
      shape = "rounded",
      showFirstButton = false,
      showLastButton = false,
      siblingCount = 1,
      boundaryCount = 1,
      disabled = false,
      color = "primary",
      className = "",
      sx = {},
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
    const borderColor = colors.border_color || "rgb(75, 85, 99)";
    const muiSize = isCompact ? "small" : size === "large" ? "large" : "medium";

    const paginationSx = {
      "& .MuiPaginationItem-root": {
        minWidth: current.controlHeight,
        height: current.controlHeight,
        fontSize: current.fontSize,
        color: textColor,
        borderRadius: shape === "rounded" ? RADIUS.sm : RADIUS.xs,
        border: `1px solid ${borderColor}`,
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "var(--color-hover-bg)" || "rgba(255,255,255,0.08)",
          borderColor: accent,
        },
        "&.Mui-selected": {
          backgroundColor: `${accent}22`,
          color: textColor,
          borderColor: accent,
          fontWeight: 600,
          "&:hover": {
            backgroundColor: `${accent}33`,
          },
        },
        "&.Mui-disabled": {
          opacity: 0.45,
        },
      },
      "& .MuiPaginationItem-icon": {
        color: accent,
      },
      ...sx,
    };

    return (
      <MuiPagination
        ref={ref}
        count={count}
        page={page}
        onChange={onChange}
        size={muiSize}
        shape={shape}
        showFirstButton={showFirstButton}
        showLastButton={showLastButton}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        disabled={disabled}
        color={color}
        className={className}
        sx={paginationSx}
        renderItem={(item) => <PaginationItem {...item} />}
        {...restProps}
      />
    );
  },
);

AppPagination.displayName = "AppPagination";

AppPagination.propTypes = {
  count: PropTypes.number,
  page: PropTypes.number,
  onChange: PropTypes.func,
  size: PropTypes.oneOf(["compact", "small", "medium", "large"]),
  density: PropTypes.oneOf(["compact", "comfortable"]),
  shape: PropTypes.oneOf(["circular", "rounded"]),
  showFirstButton: PropTypes.bool,
  showLastButton: PropTypes.bool,
  siblingCount: PropTypes.number,
  boundaryCount: PropTypes.number,
  disabled: PropTypes.bool,
  color: PropTypes.oneOf(["primary", "secondary", "standard"]),
  className: PropTypes.string,
  sx: PropTypes.object,
};

export default AppPagination;
