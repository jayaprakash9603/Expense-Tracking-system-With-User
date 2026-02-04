import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  IconButton,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "../../../hooks/useTheme";

/**
 * CustomDataTable - A reusable, customizable data table component
 *
 * @param {Object} props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Column definitions with field, label, width, sortable, render options
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {Array} props.searchFields - Fields to search in (e.g., ['name', 'description'])
 * @param {Object} props.filterConfig - Filter configuration { field, options: [{value, label}] }
 * @param {number} props.rowsPerPage - Number of rows per page (default: 5)
 * @param {string} props.emptyMessage - Message when no data
 * @param {string} props.noMatchMessage - Message when no filter matches
 * @param {boolean} props.loading - Show skeleton loading state
 * @param {number} props.skeletonRows - Number of skeleton rows to show
 * @param {Object} props.fontSize - Font size configuration { header, cell, search, filter, chip }
 * @param {Object} props.padding - Padding configuration { header, cell }
 * @param {number} props.rowHeight - Height of each row
 * @param {Function} props.onRowClick - Callback when row is clicked
 * @param {string} props.accentColor - Accent color for interactive elements
 */
const CustomDataTable = ({
  data = [],
  columns = [],
  searchPlaceholder = "Search...",
  searchFields = [],
  filterConfig = null,
  rowsPerPage = 5,
  emptyMessage = "No data available",
  noMatchMessage = "No items match your filters",
  loading = false,
  skeletonRows = 3,
  fontSize = {},
  padding = {},
  rowHeight,
  onRowClick,
  accentColor = "#00dac6",
}) => {
  const { colors } = useTheme();

  // State - must be called before any conditional returns
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [sort, setSort] = useState({
    field: columns[0]?.field || "",
    direction: "asc",
  });
  const [page, setPage] = useState(0);

  // Handle sort
  const handleSort = useCallback((field) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Get sort icon
  const getSortIcon = useCallback(
    (field) => {
      if (sort.field !== field) {
        return <UnfoldMoreIcon sx={{ fontSize: 14, opacity: 0.4 }} />;
      }
      return sort.direction === "asc" ? (
        <ExpandLessIcon sx={{ fontSize: 14, color: accentColor }} />
      ) : (
        <ExpandMoreIcon sx={{ fontSize: 14, color: accentColor }} />
      );
    },
    [sort, accentColor],
  );

  // Filtered and sorted data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = [...data];

    // Apply search filter
    if (search.trim() && searchFields.length > 0) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((item) =>
        searchFields.some((field) =>
          String(item[field] || "")
            .toLowerCase()
            .includes(searchLower),
        ),
      );
    }

    // Apply dropdown filter
    if (filterConfig && filterValue !== "all") {
      filtered = filtered.filter(
        (item) => item[filterConfig.field] === filterValue,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const col = columns.find((c) => c.field === sort.field);
      let aVal = a[sort.field];
      let bVal = b[sort.field];

      // Handle different types based on column sortType
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

    return filtered;
  }, [data, search, searchFields, filterConfig, filterValue, sort, columns]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, page, rowsPerPage]);

  // Total pages
  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, filterValue]);

  // Guard against undefined colors - AFTER all hooks
  if (!colors) {
    return null;
  }

  // Handle fontSize presets or custom object
  const fontSizePresets = {
    small: {
      header: "0.65rem",
      cell: "0.7rem",
      search: "0.7rem",
      filter: "0.7rem",
      chip: "0.55rem",
      count: "0.65rem",
    },
    medium: {
      header: "0.75rem",
      cell: "0.8rem",
      search: "0.8rem",
      filter: "0.8rem",
      chip: "0.65rem",
      count: "0.75rem",
    },
    large: {
      header: "0.85rem",
      cell: "0.9rem",
      search: "0.9rem",
      filter: "0.9rem",
      chip: "0.75rem",
      count: "0.85rem",
    },
  };
  const resolvedFontSize =
    typeof fontSize === "string"
      ? fontSizePresets[fontSize] || fontSizePresets.medium
      : fontSize;
  const fontSizes = {
    header: resolvedFontSize?.header || "0.75rem",
    cell: resolvedFontSize?.cell || "0.8rem",
    search: resolvedFontSize?.search || "0.8rem",
    filter: resolvedFontSize?.filter || "0.8rem",
    chip: resolvedFontSize?.chip || "0.65rem",
    count: resolvedFontSize?.count || "0.75rem",
  };

  // Handle padding presets or custom object
  const paddingPresets = {
    compact: { header: "8px 10px", cell: "8px 10px" },
    normal: { header: "10px 12px", cell: "10px 12px" },
    spacious: { header: "12px 16px", cell: "12px 16px" },
  };
  const resolvedPadding =
    typeof padding === "string"
      ? paddingPresets[padding] || paddingPresets.normal
      : padding;
  const cellPadding = {
    header: resolvedPadding?.header || "10px 12px",
    cell: resolvedPadding?.cell || "10px 12px",
  };

  // Loading skeleton
  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Search/Filter skeleton */}
        <div className="flex items-center gap-3 mb-3">
          <Skeleton
            variant="rounded"
            width={200}
            height={36}
            sx={{ bgcolor: colors.secondary_bg }}
          />
          <Skeleton
            variant="rounded"
            width={120}
            height={36}
            sx={{ bgcolor: colors.secondary_bg }}
          />
          <Skeleton
            variant="text"
            width={80}
            height={24}
            sx={{ bgcolor: colors.secondary_bg, marginLeft: "auto" }}
          />
        </div>
        {/* Table skeleton */}
        <div
          style={{
            flex: 1,
            borderRadius: "6px",
            border: `1px solid ${colors.border_color}`,
            overflow: "hidden",
          }}
        >
          {/* Header skeleton */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={40}
            sx={{ bgcolor: colors.secondary_bg }}
          />
          {/* Row skeletons */}
          {Array.from({ length: skeletonRows }).map((_, idx) => (
            <Skeleton
              key={idx}
              variant="rectangular"
              width="100%"
              height={rowHeight || 44}
              sx={{
                bgcolor:
                  idx % 2 === 0
                    ? colors.primary_bg
                    : colors.secondary_bg + "40",
                mt: "1px",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: colors.secondary_bg,
          borderRadius: "6px",
          color: colors.secondary_text,
          fontSize: fontSizes.cell,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search and Filter Row */}
      <div className="flex items-center gap-3 mb-3">
        {/* Search Input */}
        {searchFields.length > 0 && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ fontSize: 18, color: colors.secondary_text }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              maxWidth: "220px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: colors.secondary_bg,
                fontSize: fontSizes.search,
                height: "36px",
                "& fieldset": { borderColor: colors.border_color },
                "&:hover fieldset": { borderColor: accentColor },
                "&.Mui-focused fieldset": { borderColor: accentColor },
              },
              "& .MuiInputBase-input": {
                color: colors.primary_text,
                padding: "8px 10px",
                "&::placeholder": {
                  color: colors.secondary_text,
                  opacity: 0.7,
                },
              },
            }}
          />
        )}

        {/* Dropdown Filter */}
        {filterConfig && (
          <div className="flex items-center gap-1">
            <FilterListIcon
              sx={{ fontSize: 16, color: colors.secondary_text }}
            />
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: colors.secondary_bg,
                  fontSize: fontSizes.filter,
                  height: "36px",
                  color: colors.primary_text,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.border_color,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: accentColor,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: accentColor,
                  },
                  "& .MuiSelect-icon": { color: colors.secondary_text },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: colors.secondary_bg,
                      border: `1px solid ${colors.border_color}`,
                      "& .MuiMenuItem-root": {
                        fontSize: fontSizes.filter,
                        color: colors.primary_text,
                        "&:hover": { backgroundColor: colors.primary_bg },
                        "&.Mui-selected": {
                          backgroundColor: `${accentColor}20`,
                        },
                      },
                    },
                  },
                }}
              >
                {filterConfig.options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Results count */}
        <span
          style={{
            fontSize: fontSizes.count,
            color: colors.secondary_text,
            marginLeft: "auto",
          }}
        >
          {processedData.length} of {data.length} item
          {data.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Custom Table */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          borderRadius: "6px",
          border: `1px solid ${colors.border_color}`,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          {/* Table Header */}
          <thead>
            <tr style={{ backgroundColor: colors.secondary_bg }}>
              {columns.map((col) => (
                <th
                  key={col.field}
                  onClick={() => col.sortable && handleSort(col.field)}
                  style={{
                    width: col.width,
                    padding: cellPadding.header,
                    textAlign: col.align || "left",
                    fontSize: fontSizes.header,
                    fontWeight: "600",
                    color: colors.secondary_text,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    borderBottom: `1px solid ${colors.border_color}`,
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    position: "sticky",
                    top: 0,
                    backgroundColor: colors.secondary_bg,
                    zIndex: 1,
                  }}
                >
                  <div
                    className="flex items-center gap-1"
                    style={{
                      justifyContent:
                        col.align === "center" ? "center" : "flex-start",
                    }}
                  >
                    <span>{col.label}</span>
                    {col.sortable && getSortIcon(col.field)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    backgroundColor:
                      idx % 2 === 0
                        ? colors.primary_bg
                        : colors.secondary_bg + "40",
                    transition: "background-color 0.15s ease",
                    cursor: onRowClick ? "pointer" : "default",
                    height: rowHeight,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary_bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      idx % 2 === 0
                        ? colors.primary_bg
                        : colors.secondary_bg + "40";
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.field}
                      style={{
                        padding: cellPadding.cell,
                        fontSize: fontSizes.cell,
                        color: col.getColor
                          ? col.getColor(row)
                          : colors.primary_text,
                        fontWeight: col.bold ? "600" : "normal",
                        borderBottom: `1px solid ${colors.border_color}`,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: col.align || "left",
                      }}
                    >
                      {col.render ? (
                        col.render(row, colors, fontSizes)
                      ) : col.tooltip ? (
                        <Tooltip
                          title={row[col.field] || ""}
                          arrow
                          placement="top"
                        >
                          <span
                            style={{
                              cursor: row[col.field] ? "default" : "text",
                            }}
                          >
                            {row[col.field] || "-"}
                          </span>
                        </Tooltip>
                      ) : (
                        row[col.field] || "-"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    color: colors.secondary_text,
                    fontSize: fontSizes.cell,
                  }}
                >
                  {noMatchMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between"
          style={{ padding: "10px 0 0 0" }}
        >
          <span
            style={{ fontSize: fontSizes.count, color: colors.secondary_text }}
          >
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              sx={{
                width: 28,
                height: 28,
                color: page === 0 ? colors.secondary_text : accentColor,
                "&:hover": { backgroundColor: `${accentColor}20` },
                "&.Mui-disabled": { color: colors.secondary_text + "50" },
              }}
            >
              <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              sx={{
                width: 28,
                height: 28,
                color:
                  page >= totalPages - 1 ? colors.secondary_text : accentColor,
                "&:hover": { backgroundColor: `${accentColor}20` },
                "&.Mui-disabled": { color: colors.secondary_text + "50" },
              }}
            >
              <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDataTable;
