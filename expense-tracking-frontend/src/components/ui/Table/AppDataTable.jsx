/**
 * AppDataTable - Theme-aware data table with search, filter, and pagination
 *
 * Usage:
 *   <AppDataTable
 *     columns={[
 *       { field: 'name', label: 'Name', searchable: true },
 *       { field: 'amount', label: 'Amount', align: 'right', sortType: 'number' },
 *       { field: 'category', label: 'Category', filterable: true },
 *     ]}
 *     data={expenses}
 *     searchPlaceholder="Search expenses..."
 *     rowsPerPage={10}
 *     onRowClick={(row) => handleEdit(row)}
 *   />
 *
 * Features:
 * - All AppTable features plus
 * - Search across specified columns
 * - Column filtering with chips
 * - Pagination with rows per page selector
 * - Debounced search
 * - Action buttons column support
 */
import React, {
  forwardRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  Chip,
  FormControl,
  Skeleton,
  Fade,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  FirstPage,
  LastPage,
} from "@mui/icons-material";
import AppTextField from "../TextField/AppTextField";
import AppTable from "./AppTable";
import { useTheme } from "../../../hooks/useTheme";

const AppDataTable = forwardRef(function AppDataTable(
  {
    // Data
    columns = [],
    data = [],

    // Search
    searchable = true,
    searchPlaceholder = "Search...",
    searchFields, // fields to search (defaults to searchable columns)
    debounceMs = 300,

    // Filtering
    filterable = true,
    filterPosition = "top", // 'top' | 'inline'

    // Pagination
    pagination = true,
    rowsPerPage: initialRowsPerPage = 10,
    rowsPerPageOptions = [5, 10, 25, 50],

    // Behavior
    onRowClick,
    sortable = true,
    defaultSort,

    // Styling
    title,
    striped = true,
    hoverable = true,
    stickyHeader = true,
    size = "medium",
    maxHeight,
    emptyMessage = "No data available",
    emptySearchMessage = "No results match your search",

    // Loading
    loading = false,
    loadingRows = 5,

    // Actions column
    actions,
    actionsLabel = "Actions",
    actionsWidth = "100px",

    // MUI pass-through
    sx,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Searchable fields (use explicit or derive from columns)
  const searchableFields = useMemo(() => {
    if (searchFields) return searchFields;
    return columns.filter((c) => c.searchable !== false).map((c) => c.field);
  }, [searchFields, columns]);

  // Filterable columns
  const filterableColumns = useMemo(
    () => columns.filter((c) => c.filterable),
    [columns],
  );

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const options = {};
    filterableColumns.forEach((col) => {
      const values = new Set();
      data.forEach((row) => {
        const val = row[col.field];
        if (val !== null && val !== undefined && val !== "") {
          values.add(val);
        }
      });
      options[col.field] = Array.from(values).sort();
    });
    return options;
  }, [filterableColumns, data]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (debouncedSearch && searchableFields.length > 0) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter((row) =>
        searchableFields.some((field) => {
          const val = row[field];
          return val && String(val).toLowerCase().includes(lowerSearch);
        }),
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([field, value]) => {
      if (value) {
        result = result.filter((row) => row[field] === value);
      }
    });

    return result;
  }, [data, debouncedSearch, searchableFields, activeFilters]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = currentPage * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, pagination, currentPage, rowsPerPage]);

  // Total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Add actions column if provided
  const tableColumns = useMemo(() => {
    if (!actions) return columns;
    return [
      ...columns,
      {
        field: "_actions",
        label: actionsLabel,
        width: actionsWidth,
        align: "center",
        sortable: false,
        render: (row) => actions(row),
      },
    ];
  }, [columns, actions, actionsLabel, actionsWidth]);

  // Handlers
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((field, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: value || null,
    }));
    setCurrentPage(0);
  }, []);

  const clearFilter = useCallback((field) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setCurrentPage(0);
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm("");
    setCurrentPage(0);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(0);
  }, []);

  // Active filter count
  const activeFilterCount =
    Object.values(activeFilters).filter(Boolean).length +
    (debouncedSearch ? 1 : 0);

  // Loading state
  if (loading) {
    return (
      <Box
        ref={ref}
        sx={{
          backgroundColor: colors.primary_bg,
          borderRadius: 2,
          ...sx,
        }}
      >
        {(title || searchable) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            {title && <Skeleton width={150} height={32} />}
            {searchable && <Skeleton width={250} height={40} />}
          </Box>
        )}
        <AppTable
          columns={tableColumns}
          data={[]}
          loading={true}
          loadingRows={loadingRows}
          size={size}
        />
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      sx={{
        backgroundColor: colors.primary_bg,
        borderRadius: 2,
        ...sx,
      }}
      {...rest}
    >
      {/* Header: Title + Search */}
      {(title ||
        searchable ||
        (filterable && filterableColumns.length > 0)) && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          {/* Title */}
          {title && (
            <Typography
              variant="h6"
              sx={{
                color: colors.primary_text,
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
          )}

          {/* Search + Filters */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.5,
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            {/* Inline filters */}
            {filterable &&
              filterPosition === "inline" &&
              filterableColumns.map((col) => (
                <FormControl
                  key={col.field}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <Select
                    value={activeFilters[col.field] || ""}
                    onChange={(e) =>
                      handleFilterChange(col.field, e.target.value)
                    }
                    displayEmpty
                    sx={{
                      backgroundColor: colors.secondary_bg,
                      color: colors.primary_text,
                      fontSize: "0.8rem",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.border_color,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.primary_accent,
                      },
                    }}
                  >
                    <MenuItem value="">
                      <span style={{ color: colors.secondary_text }}>
                        {col.label}
                      </span>
                    </MenuItem>
                    {filterOptions[col.field]?.map((value) => (
                      <MenuItem key={value} value={value}>
                        {col.formatFilter ? col.formatFilter(value) : value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}

            {/* Search */}
            {searchable && (
              <AppTextField
                size="small"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: colors.secondary_text, fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <ClearIcon
                        sx={{
                          color: colors.secondary_text,
                          fontSize: 18,
                          cursor: "pointer",
                          "&:hover": { color: colors.primary_text },
                        }}
                        onClick={() => setSearchTerm("")}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Top-positioned filters */}
      {filterable &&
        filterPosition === "top" &&
        filterableColumns.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <FilterListIcon
              sx={{ color: colors.secondary_text, fontSize: 20 }}
            />
            {filterableColumns.map((col) => (
              <FormControl key={col.field} size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={activeFilters[col.field] || ""}
                  onChange={(e) =>
                    handleFilterChange(col.field, e.target.value)
                  }
                  displayEmpty
                  sx={{
                    backgroundColor: colors.secondary_bg,
                    color: colors.primary_text,
                    fontSize: "0.75rem",
                    height: 32,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.border_color,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.primary_accent,
                    },
                  }}
                >
                  <MenuItem value="">
                    <span style={{ color: colors.secondary_text }}>
                      {col.label}
                    </span>
                  </MenuItem>
                  {filterOptions[col.field]?.map((value) => (
                    <MenuItem key={value} value={value}>
                      {col.formatFilter ? col.formatFilter(value) : value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}

            {activeFilterCount > 0 && (
              <Chip
                label={`Clear all (${activeFilterCount})`}
                size="small"
                onClick={clearAllFilters}
                sx={{
                  backgroundColor: colors.secondary_bg,
                  color: colors.secondary_text,
                  fontSize: "0.7rem",
                  height: 24,
                  "&:hover": {
                    backgroundColor: colors.danger || "#ef4444",
                    color: "#fff",
                  },
                }}
              />
            )}
          </Box>
        )}

      {/* Active filter chips */}
      {Object.entries(activeFilters).some(([, v]) => v) && (
        <Fade in>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.75,
              mb: 2,
            }}
          >
            {Object.entries(activeFilters).map(([field, value]) => {
              if (!value) return null;
              const col = columns.find((c) => c.field === field);
              return (
                <Chip
                  key={field}
                  label={`${col?.label}: ${col?.formatFilter ? col.formatFilter(value) : value}`}
                  size="small"
                  onDelete={() => clearFilter(field)}
                  sx={{
                    backgroundColor: colors.primary_accent,
                    color: "#fff",
                    fontSize: "0.7rem",
                    height: 24,
                    "& .MuiChip-deleteIcon": {
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": { color: "#fff" },
                    },
                  }}
                />
              );
            })}
          </Box>
        </Fade>
      )}

      {/* Table */}
      <AppTable
        columns={tableColumns}
        data={paginatedData}
        onRowClick={onRowClick}
        sortable={sortable}
        defaultSort={defaultSort}
        striped={striped}
        hoverable={hoverable}
        stickyHeader={stickyHeader}
        size={size}
        maxHeight={maxHeight}
        emptyMessage={
          debouncedSearch || activeFilterCount > 0
            ? emptySearchMessage
            : emptyMessage
        }
        loading={false}
      />

      {/* Pagination */}
      {pagination && filteredData.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {/* Results count */}
          <Typography
            sx={{
              fontSize: "0.8rem",
              color: colors.secondary_text,
            }}
          >
            Showing {currentPage * rowsPerPage + 1} -{" "}
            {Math.min((currentPage + 1) * rowsPerPage, filteredData.length)} of{" "}
            {filteredData.length}
            {filteredData.length !== data.length &&
              ` (filtered from ${data.length})`}
          </Typography>

          {/* Page controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Rows per page */}
            <Typography
              sx={{ fontSize: "0.8rem", color: colors.secondary_text }}
            >
              Rows:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              size="small"
              sx={{
                backgroundColor: colors.secondary_bg,
                color: colors.primary_text,
                fontSize: "0.75rem",
                height: 28,
                minWidth: 50,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border_color,
                },
              }}
            >
              {rowsPerPageOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>

            {/* Page navigation */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconBtn
                disabled={currentPage === 0}
                onClick={() => handlePageChange(0)}
                colors={colors}
              >
                <FirstPage sx={{ fontSize: 18 }} />
              </IconBtn>
              <IconBtn
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                colors={colors}
              >
                <KeyboardArrowLeft sx={{ fontSize: 18 }} />
              </IconBtn>

              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: colors.primary_text,
                  mx: 1,
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {currentPage + 1} / {totalPages}
              </Typography>

              <IconBtn
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                colors={colors}
              >
                <KeyboardArrowRight sx={{ fontSize: 18 }} />
              </IconBtn>
              <IconBtn
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(totalPages - 1)}
                colors={colors}
              >
                <LastPage sx={{ fontSize: 18 }} />
              </IconBtn>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
});

// Icon button helper
function IconBtn({ children, disabled, onClick, colors }) {
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        border: "none",
        borderRadius: 1,
        backgroundColor: "transparent",
        color: disabled ? colors.secondary_text : colors.primary_text,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "background-color 0.15s ease",
        "&:hover:not(:disabled)": {
          backgroundColor: colors.secondary_bg,
        },
      }}
    >
      {children}
    </Box>
  );
}

AppDataTable.propTypes = {
  /** Column definitions - extends AppTable columns */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      width: PropTypes.string,
      align: PropTypes.oneOf(["left", "center", "right"]),
      sortable: PropTypes.bool,
      sortType: PropTypes.oneOf(["string", "number", "date"]),
      bold: PropTypes.bool,
      tooltip: PropTypes.bool,
      render: PropTypes.func,
      getColor: PropTypes.func,
      /** Enable search on this column */
      searchable: PropTypes.bool,
      /** Enable filter dropdown for this column */
      filterable: PropTypes.bool,
      /** Format filter value display */
      formatFilter: PropTypes.func,
    }),
  ).isRequired,
  /** Data array */
  data: PropTypes.array.isRequired,

  // Search
  /** Enable search */
  searchable: PropTypes.bool,
  /** Search input placeholder */
  searchPlaceholder: PropTypes.string,
  /** Fields to search (defaults to searchable columns) */
  searchFields: PropTypes.arrayOf(PropTypes.string),
  /** Search debounce delay in ms */
  debounceMs: PropTypes.number,

  // Filtering
  /** Enable column filters */
  filterable: PropTypes.bool,
  /** Filter position */
  filterPosition: PropTypes.oneOf(["top", "inline"]),

  // Pagination
  /** Enable pagination */
  pagination: PropTypes.bool,
  /** Initial rows per page */
  rowsPerPage: PropTypes.number,
  /** Rows per page options */
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),

  // Behavior
  /** Row click handler */
  onRowClick: PropTypes.func,
  /** Enable sorting */
  sortable: PropTypes.bool,
  /** Default sort */
  defaultSort: PropTypes.shape({
    field: PropTypes.string,
    direction: PropTypes.oneOf(["asc", "desc"]),
  }),

  // Styling
  /** Table title */
  title: PropTypes.string,
  /** Striped rows */
  striped: PropTypes.bool,
  /** Hoverable rows */
  hoverable: PropTypes.bool,
  /** Sticky header */
  stickyHeader: PropTypes.bool,
  /** Size preset */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Max height */
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Empty message */
  emptyMessage: PropTypes.string,
  /** Empty search message */
  emptySearchMessage: PropTypes.string,

  // Loading
  /** Loading state */
  loading: PropTypes.bool,
  /** Loading skeleton rows */
  loadingRows: PropTypes.number,

  // Actions
  /** Actions column render function: (row) => ReactNode */
  actions: PropTypes.func,
  /** Actions column label */
  actionsLabel: PropTypes.string,
  /** Actions column width */
  actionsWidth: PropTypes.string,

  /** Custom styles */
  sx: PropTypes.object,
};

export default AppDataTable;
