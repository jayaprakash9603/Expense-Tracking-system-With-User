import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Divider,
  Grid,
} from "@mui/material";
import {
  ExpandMore as ExpandIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Description as ReportIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Schedule as TimeIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import dayjs from "dayjs";
import PropTypes from "prop-types";

/**
 * ReportAccordionItem - Accordion-style report item with expandable details
 *
 * Features:
 * - Collapsible accordion layout
 * - Comprehensive report details
 * - Color-coded report types
 * - Action buttons
 * - Theme-aware styling
 * - Smooth expand/collapse animations
 */
const ReportAccordionItem = ({ report, onView, onDownload, onDelete }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getReportTypeColor = (type) => {
    const typeMap = {
      audit: colors.primary_accent,
      financial: "#4ade80",
      compliance: "#fb923c",
      operational: "#60a5fa",
      security: "#f87171",
      today: colors.primary_accent,
      yesterday: "#60a5fa",
      all: "#4ade80",
      "current-month": "#fb923c",
      "last-month": "#f87171",
      range: "#a78bfa",
    };
    return typeMap[type?.toLowerCase()] || colors.primary_accent;
  };

  const getStatusColor = (status) => {
    const statusMap = {
      success: "#4ade80",
      failed: "#f87171",
      completed: colors.primary_accent,
    };
    return statusMap[status?.toLowerCase()] || colors.primary_accent;
  };

  const formatDate = (date) => {
    return dayjs(date).format("MMM DD, YYYY");
  };

  const formatTime = (date) => {
    return dayjs(date).format("hh:mm A");
  };

  const handleExpandChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleExpandChange}
      sx={{
        mb: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        borderRadius: "12px !important",
        "&:before": { display: "none" },
        overflow: "hidden",
        backgroundColor: colors.primary_bg,
        border: "none",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
        },
        "&.Mui-expanded": {
          margin: "0 0 16px 0",
          boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
        },
      }}
    >
      {/* Accordion Summary - Always Visible */}
      <AccordionSummary
        expandIcon={
          <ExpandIcon
            sx={{
              color: colors.primary_accent,
              fontSize: 28,
            }}
          />
        }
        sx={{
          bgcolor: colors.secondary_bg,
          minHeight: "64px",
          height: "64px",
          px: 3,
          py: 0,
          "&.Mui-expanded": {
            minHeight: "64px",
          },
          "& .MuiAccordionSummary-content": {
            margin: "16px 0",
            alignItems: "center",
            "&.Mui-expanded": {
              margin: "16px 0",
            },
          },
          "&:hover": {
            bgcolor: colors.primary_bg,
          },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, pr: 2 }}
        >
          {/* Report Icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${getReportTypeColor(report.reportType)}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ReportIcon
              sx={{
                color: getReportTypeColor(report.reportType),
                fontSize: 24,
              }}
            />
          </Box>

          {/* Report Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ mb: 0.5 }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: colors.secondary_text,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Report #{report.id}
              </Typography>
              <Chip
                label={report.status || "Completed"}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor(report.status)}15`,
                  color: getStatusColor(report.status),
                  fontWeight: 600,
                  fontSize: 10,
                  height: 20,
                  borderRadius: 1,
                }}
              />
              {report.reportType && (
                <Chip
                  label={report.reportType}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: getReportTypeColor(report.reportType),
                    color: getReportTypeColor(report.reportType),
                    fontSize: 10,
                    height: 20,
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>
            <Typography
              variant="h6"
              sx={{
                color: colors.primary_text,
                fontWeight: 600,
                fontSize: 16,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {report.reportName}
            </Typography>
          </Box>

          {/* Date */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.75,
              px: 2,
              py: 1,
              bgcolor: colors.primary_bg,
              borderRadius: 1.5,
              flexShrink: 0,
            }}
          >
            <CalendarIcon sx={{ color: colors.secondary_text, fontSize: 16 }} />
            <Typography
              variant="body2"
              sx={{
                color: colors.secondary_text,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {formatDate(report.date || report.createdAt)}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      {/* Accordion Details - Expandable Content */}
      <AccordionDetails
        sx={{
          bgcolor: colors.primary_bg,
          p: 3,
          borderTop: `1px solid ${colors.border_color}`,
        }}
      >
        <Stack spacing={3}>
          {/* Description */}
          {report.description && (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <InfoIcon sx={{ color: colors.primary_accent, fontSize: 18 }} />
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: colors.primary_text,
                    fontWeight: 600,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Description
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: colors.secondary_text,
                  fontSize: 14,
                  lineHeight: 1.7,
                  pl: 3.5,
                }}
              >
                {report.description}
              </Typography>
            </Box>
          )}

          <Divider sx={{ borderColor: colors.border_color }} />

          {/* Detailed Information Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.secondary_text,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Created Date
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <CalendarIcon
                    sx={{ color: colors.primary_accent, fontSize: 16 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.primary_text,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(report.createdAt || report.date)}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.secondary_text,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Created Time
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <TimeIcon
                    sx={{ color: colors.primary_accent, fontSize: 16 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.primary_text,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {formatTime(report.createdAt || report.date)}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.secondary_text,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Report Type
                </Typography>
                <Chip
                  label={report.reportType || "N/A"}
                  size="small"
                  sx={{
                    bgcolor: `${getReportTypeColor(report.reportType)}15`,
                    color: getReportTypeColor(report.reportType),
                    fontWeight: 600,
                    fontSize: 12,
                    height: 26,
                    width: "fit-content",
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.secondary_text,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Status
                </Typography>
                <Chip
                  label={report.status || "Completed"}
                  size="small"
                  sx={{
                    bgcolor: `${getStatusColor(report.status)}15`,
                    color: getStatusColor(report.status),
                    fontWeight: 600,
                    fontSize: 12,
                    height: 26,
                    width: "fit-content",
                  }}
                />
              </Stack>
            </Grid>

            {/* Additional backend fields */}
            {report.recipientEmail && (
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={0.5}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.secondary_text,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Sent To
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.primary_text,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {report.recipientEmail}
                  </Typography>
                </Stack>
              </Grid>
            )}

            {report.expenseCount !== undefined && (
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={0.5}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.secondary_text,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Expenses
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.primary_text,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {report.expenseCount} items
                  </Typography>
                </Stack>
              </Grid>
            )}

            {report.fileName && (
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={0.5}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.secondary_text,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    File Name
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.primary_text,
                      fontSize: 13,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {report.fileName}
                  </Typography>
                </Stack>
              </Grid>
            )}

            {report.errorMessage && (
              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#f87171",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Error Details
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#f87171",
                      fontSize: 13,
                      fontWeight: 500,
                      bgcolor: "#f8717110",
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    {report.errorMessage}
                  </Typography>
                </Stack>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ borderColor: colors.border_color }} />

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="View Report Details" arrow>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(report);
                }}
                sx={{
                  flex: 1,
                  color: colors.primary_accent,
                  bgcolor: `${colors.primary_accent}10`,
                  borderRadius: 2,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: `${colors.primary_accent}20`,
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${colors.primary_accent}30`,
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ViewIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    View
                  </Typography>
                </Stack>
              </IconButton>
            </Tooltip>

            <Tooltip title="Download Report" arrow>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload?.(report);
                }}
                sx={{
                  flex: 1,
                  color: "#4ade80",
                  bgcolor: "#4ade8010",
                  borderRadius: 2,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "#4ade8020",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px #4ade8030",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DownloadIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    Download
                  </Typography>
                </Stack>
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Report" arrow>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(report);
                }}
                sx={{
                  flex: 1,
                  color: "#f87171",
                  bgcolor: "#f8717110",
                  borderRadius: 2,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "#f8717120",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px #f8717130",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    Delete
                  </Typography>
                </Stack>
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

ReportAccordionItem.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    reportName: PropTypes.string.isRequired,
    date: PropTypes.string,
    createdAt: PropTypes.string,
    reportType: PropTypes.string,
    status: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ReportAccordionItem;
