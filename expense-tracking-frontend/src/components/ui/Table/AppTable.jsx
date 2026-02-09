/**
 * AppTable - Theme-aware simple table component
 *
 * Usage:
 *   <AppTable
 *     columns={[
 *       { field: 'name', label: 'Name', width: '200px' },
 *       { field: 'amount', label: 'Amount', align: 'right' },
 *     ]}
 *     data={items}
 *     onRowClick={(row) => console.log(row)}
 *   />
 *
 * Features:
 * - Theme integration via useTheme hook
 * - Column configuration (width, align, sortable, render)
 * - Row click handling
 * - Striped and hoverable rows
 * - Sticky header support
 * - Empty state
 */
import React, { forwardRef, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Tooltip, Skeleton } from "@mui/material";
import {
  UnfoldMore as UnfoldMoreIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

const AppTable = forwardRef(function AppTable(
  {
    // Data
    columns = [],
    data = [],

    // Behavior
    onRowClick,
    sortable = false,
    defaultSort,

    // Styling
    striped = true,
    hoverable = true,
    stickyHeader = true,
    size = "medium", // 'small' | 'medium' | 'large'
    maxHeight,
    emptyMessage = "No data available",

    // Loading
    loading = false,
    loadingRows = 5,

    // MUI pass-through
    sx,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // Sort state
  const [sort, setSort] = useState(
    defaultSort || { field: null, direction: "asc" },
  );

  // Size configurations
  const sizeConfig = {
    small: {
      headerPadding: "8px 10px",
      cellPadding: "6px 10px",
      headerFontSize: "0.7rem",
      cellFontSize: "0.75rem",
      rowHeight: 36,
    },
    medium: {
      headerPadding: "10px 12px",
      cellPadding: "10px 12px",
      headerFontSize: "0.75rem",
      cellFontSize: "0.85rem",
      rowHeight: 44,
    },
    large: {
      headerPadding: "12px 16px",
      cellPadding: "12px 16px",
      headerFontSize: "0.8rem",
      cellFontSize: "0.9rem",
      rowHeight: 52,
    },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Handle sort
  const handleSort = useCallback(
    (field) => {
      if (!sortable) return;
      setSort((prev) => ({
        field,
        direction:
          prev.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    },
    [sortable],
  );

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sort.field || !sortable) return data;

    const col = columns.find((c) => c.field === sort.field);
    return [...data].sort((a, b) => {
      let aVal = a[sort.field];
      let bVal = b[sort.field];

      // Handle sort type
      if (col?.sortType === "number") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (col?.sortType === "date") {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      } else {
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sort, sortable, columns]);

  // Get sort icon
  const getSortIcon = (field) => {
    if (!sortable) return null;
    if (sort.field !== field) {
      return (
        <UnfoldMoreIcon
          sx={{ fontSize: 14, opacity: 0.4, color: colors.secondary_text }}
        />
      );
    }
    return sort.direction === "asc" ? (
      <ExpandLessIcon sx={{ fontSize: 14, color: colors.primary_accent }} />
    ) : (
      <ExpandMoreIcon sx={{ fontSize: 14, color: colors.primary_accent }} />
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          borderRadius: 2,
          border: `1px solid ${colors.border_color}`,
          overflow: "hidden",
          ...sx,
        }}
      >
        {/* Header skeleton */}
        <Skeleton
          variant="rectangular"
          width="100%"
          height={config.rowHeight}
          sx={{ bgcolor: colors.secondary_bg }}
        />
        {/* Row skeletons */}
        {Array.from({ length: loadingRows }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            width="100%"
            height={config.rowHeight}
            sx={{
              bgcolor:
                idx % 2 === 0 ? colors.primary_bg : `${colors.secondary_bg}40`,
              mt: "1px",
            }}
          />
        ))}
      </Box>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
          backgroundColor: colors.secondary_bg,
          borderRadius: 2,
          color: colors.secondary_text,
          fontSize: config.cellFontSize,
          ...sx,
        }}
      >
        {emptyMessage}
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      sx={{
        borderRadius: 2,
        border: `1px solid ${colors.border_color}`,
        overflow: "auto",
        maxHeight: maxHeight,
        ...sx,
      }}
      {...rest}
    >
      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        {/* Header */}
        <Box component="thead">
          <Box component="tr" sx={{ backgroundColor: colors.secondary_bg }}>
            {columns.map((col) => (
              <Box
                key={col.field}
                component="th"
                onClick={() =>
                  (sortable || col.sortable) && handleSort(col.field)
                }
                sx={{
                  width: col.width,
                  padding: config.headerPadding,
                  textAlign: col.align || "left",
                  fontSize: config.headerFontSize,
                  fontWeight: 600,
                  color: colors.secondary_text,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom: `1px solid ${colors.border_color}`,
                  cursor: sortable || col.sortable ? "pointer" : "default",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  position: stickyHeader ? "sticky" : "static",
                  top: 0,
                  backgroundColor: colors.secondary_bg,
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    justifyContent:
                      col.align === "center"
                        ? "center"
                        : col.align === "right"
                          ? "flex-end"
                          : "flex-start",
                  }}
                >
                  <span>{col.label}</span>
                  {(sortable || col.sortable) && getSortIcon(col.field)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Body */}
        <Box component="tbody">
          {sortedData.map((row, rowIdx) => (
            <Box
              key={row.id || rowIdx}
              component="tr"
              onClick={() => onRowClick?.(row)}
              sx={{
                backgroundColor:
                  striped && rowIdx % 2 !== 0
                    ? `${colors.secondary_bg}40`
                    : colors.primary_bg,
                cursor: onRowClick ? "pointer" : "default",
                transition: "background-color 0.15s ease",
                height: config.rowHeight,
                "&:hover": hoverable
                  ? {
                      backgroundColor: colors.secondary_bg,
                    }
                  : {},
              }}
            >
              {columns.map((col) => (
                <Box
                  key={col.field}
                  component="td"
                  sx={{
                    padding: config.cellPadding,
                    fontSize: config.cellFontSize,
                    color: col.getColor
                      ? col.getColor(row)
                      : colors.primary_text,
                    fontWeight: col.bold ? 600 : "normal",
                    borderBottom: `1px solid ${colors.border_color}`,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: col.align || "left",
                  }}
                >
                  {col.render ? (
                    col.render(row, colors)
                  ) : col.tooltip ? (
                    <Tooltip title={row[col.field] || ""} arrow placement="top">
                      <span>{row[col.field] ?? "-"}</span>
                    </Tooltip>
                  ) : (
                    (row[col.field] ?? "-")
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

AppTable.propTypes = {
  /** Column definitions */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      /** Field key in data object */
      field: PropTypes.string.isRequired,
      /** Column header label */
      label: PropTypes.string.isRequired,
      /** Column width (CSS value) */
      width: PropTypes.string,
      /** Text alignment */
      align: PropTypes.oneOf(["left", "center", "right"]),
      /** Enable sorting for this column */
      sortable: PropTypes.bool,
      /** Sort type for proper comparison */
      sortType: PropTypes.oneOf(["string", "number", "date"]),
      /** Make text bold */
      bold: PropTypes.bool,
      /** Show tooltip on cell */
      tooltip: PropTypes.bool,
      /** Custom render function: (row, colors) => ReactNode */
      render: PropTypes.func,
      /** Dynamic color function: (row) => color string */
      getColor: PropTypes.func,
    }),
  ).isRequired,
  /** Data array */
  data: PropTypes.array.isRequired,
  /** Row click handler */
  onRowClick: PropTypes.func,
  /** Enable sorting on all columns */
  sortable: PropTypes.bool,
  /** Default sort state */
  defaultSort: PropTypes.shape({
    field: PropTypes.string,
    direction: PropTypes.oneOf(["asc", "desc"]),
  }),
  /** Show alternating row colors */
  striped: PropTypes.bool,
  /** Enable row hover effect */
  hoverable: PropTypes.bool,
  /** Make header sticky */
  stickyHeader: PropTypes.bool,
  /** Size preset */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Max height with scroll */
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Empty state message */
  emptyMessage: PropTypes.string,
  /** Show loading skeleton */
  loading: PropTypes.bool,
  /** Number of skeleton rows */
  loadingRows: PropTypes.number,
  /** Custom styles */
  sx: PropTypes.object,
};

export default AppTable;
