import React, { useState, useMemo } from "react";
import { Box, Pagination, Stack, CircularProgress, Fade } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import ReportsHistoryHeader from "./ReportsHistoryHeader";
import ReportAccordionItem from "./ReportAccordionItem";
import EmptyReportsState from "./EmptyReportsState";
import PropTypes from "prop-types";

/**
 * ReportsHistoryContainer - Main container for Reports History with Accordion Layout
 * 
 * Features:
 * - Accordion layout for expandable details
 * - Sticky header with search
 * - Smooth scrolling with custom scrollbar
 * - Search functionality
 * - Pagination
 * - Loading states
 * - Empty state handling
 * - Theme-aware styling
 * 
 * @param {Array} reports - Array of report objects
 * @param {boolean} loading - Loading state
 * @param {function} onView - View report handler
 * @param {function} onDownload - Download report handler
 * @param {function} onDelete - Delete report handler
 * @param {function} onRefresh - Refresh handler
 * @param {number} itemsPerPage - Items per page (default: 8)
 */
const ReportsHistoryContainer = ({
  reports = [],
  loading = false,
  onView,
  onDownload,
  onDelete,
  onRefresh,
  itemsPerPage = 4,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter reports based on search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;

    const query = searchQuery.toLowerCase();
    return reports.filter(
      (report) =>
        report.reportName?.toLowerCase().includes(query) ||
        report.reportType?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query) ||
        report.date?.includes(query) ||
        report.createdAt?.includes(query)
    );
  }, [reports, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReports.slice(startIndex, endIndex);
  }, [filteredReports, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Smooth scroll to top of container
    const container = document.getElementById("reports-scroll-container");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle refresh
  const handleRefresh = () => {
    setSearchQuery("");
    setCurrentPage(1);
    onRefresh?.();
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Sticky Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: colors.primary_bg,
          pb: 1,
        }}
      >
        <ReportsHistoryHeader
          totalCount={filteredReports.length}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onFilter={() => console.log("Filter clicked")}
          onSort={() => console.log("Sort clicked")}
          onRefresh={handleRefresh}
        />
      </Box>

      {/* Scrollable Content */}
      <Box
        id="reports-scroll-container"
        sx={{
          flex: 1,
          overflowY: filteredReports.length > 5 ? "auto" : "visible",
          overflowX: "hidden",
          pr: 1,
          // Custom Scrollbar Styling
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: colors.secondary_bg,
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: colors.primary_accent,
            borderRadius: "10px",
            "&:hover": {
              bgcolor: colors.primary_accent,
              opacity: 0.8,
            },
          },
          // Firefox scrollbar
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.primary_accent} ${colors.secondary_bg}`,
        }}
      >
        {loading ? (
          // Loading State
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 12,
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress
                size={48}
                sx={{ color: colors.primary_accent }}
              />
              <Box
                sx={{
                  color: colors.secondary_text,
                  fontSize: 14,
                }}
              >
                Loading reports...
              </Box>
            </Stack>
          </Box>
        ) : filteredReports.length === 0 ? (
          // Empty State
          <Fade in timeout={400}>
            <Box>
              <EmptyReportsState />
            </Box>
          </Fade>
        ) : (
          // Reports Accordion List
          <Fade in timeout={400}>
            <Box sx={{ pb: 0 }}>
              {paginatedReports.map((report, index) => (
                <Box
                  key={report.id || index}
                  sx={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                    "@keyframes fadeInUp": {
                      from: {
                        opacity: 0,
                        transform: "translateY(10px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  <ReportAccordionItem
                    report={report}
                    onView={onView}
                    onDownload={onDownload}
                    onDelete={onDelete}
                  />
                </Box>
              ))}
            </Box>
          </Fade>
        )}
      </Box>
      {/* Pagination pinned below the list, using the gap under last accordion */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 1.5,
            pb: 2,
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                color: colors.primary_text,
                borderColor: colors.border_color,
                bgcolor: colors.secondary_bg,
                "&:hover": {
                  bgcolor: colors.hover_bg,
                },
                "&.Mui-selected": {
                  bgcolor: colors.primary_accent,
                  color: "#000",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: colors.primary_accent,
                    opacity: 0.9,
                  },
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

ReportsHistoryContainer.propTypes = {
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      reportName: PropTypes.string.isRequired,
      date: PropTypes.string,
      createdAt: PropTypes.string,
      reportType: PropTypes.string,
      status: PropTypes.string,
      description: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  onView: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  onRefresh: PropTypes.func,
  itemsPerPage: PropTypes.number,
};

export default ReportsHistoryContainer;
