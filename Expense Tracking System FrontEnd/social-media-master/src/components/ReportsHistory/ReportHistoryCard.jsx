import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Description as ReportIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import dayjs from "dayjs";
import PropTypes from "prop-types";

/**
 * ReportHistoryCard - Individual report card component
 * 
 * Features:
 * - Modern card design with hover effects
 * - Action buttons (View, Download, Delete)
 * - Status indicator chip
 * - Date formatting with icons
 * - Theme-aware styling
 * - Responsive layout
 * 
 * @param {object} report - Report data object
 * @param {function} onView - View handler
 * @param {function} onDownload - Download handler
 * @param {function} onDelete - Delete handler
 */
const ReportHistoryCard = ({ report, onView, onDownload, onDelete }) => {
  const { colors } = useTheme();

  const getReportTypeColor = (type) => {
    const typeMap = {
      audit: colors.primary_accent,
      financial: "#4ade80",
      compliance: "#fb923c",
      operational: "#60a5fa",
      security: "#f87171",
    };
    return typeMap[type?.toLowerCase()] || colors.primary_accent;
  };

  const formatDate = (date) => {
    return dayjs(date).format("MMM DD, YYYY");
  };

  return (
    <Card
      sx={{
        bgcolor: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${colors.primary_accent}20`,
          borderColor: colors.primary_accent,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Header with Icon and Status */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: `${getReportTypeColor(report.reportType)}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ReportIcon
                  sx={{
                    color: getReportTypeColor(report.reportType),
                    fontSize: 22,
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.secondary_text,
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Report #{report.id}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={report.status || "Completed"}
              size="small"
              sx={{
                bgcolor: `${colors.primary_accent}15`,
                color: colors.primary_accent,
                fontWeight: 600,
                fontSize: 11,
                height: 24,
                borderRadius: 1.5,
              }}
            />
          </Box>

          {/* Report Name */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: colors.primary_text,
                fontWeight: 600,
                fontSize: 16,
                mb: 0.5,
                lineHeight: 1.4,
              }}
            >
              {report.reportName}
            </Typography>
            {report.description && (
              <Typography
                variant="body2"
                sx={{
                  color: colors.secondary_text,
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {report.description}
              </Typography>
            )}
          </Box>

          {/* Date and Type Info */}
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <CalendarIcon
                sx={{ color: colors.secondary_text, fontSize: 16 }}
              />
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
            {report.reportType && (
              <Chip
                label={report.reportType}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: colors.border_color,
                  color: colors.secondary_text,
                  fontSize: 11,
                  height: 22,
                  fontWeight: 500,
                }}
              />
            )}
          </Stack>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              pt: 1,
              borderTop: `1px solid ${colors.border_color}`,
            }}
          >
            <Tooltip title="View Report" arrow>
              <IconButton
                size="small"
                onClick={() => onView?.(report)}
                sx={{
                  flex: 1,
                  color: colors.primary_accent,
                  bgcolor: `${colors.primary_accent}10`,
                  borderRadius: 1.5,
                  py: 1,
                  "&:hover": {
                    bgcolor: `${colors.primary_accent}20`,
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ViewIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Download" arrow>
              <IconButton
                size="small"
                onClick={() => onDownload?.(report)}
                sx={{
                  flex: 1,
                  color: "#4ade80",
                  bgcolor: "#4ade8015",
                  borderRadius: 1.5,
                  py: 1,
                  "&:hover": {
                    bgcolor: "#4ade8025",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <DownloadIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete" arrow>
              <IconButton
                size="small"
                onClick={() => onDelete?.(report)}
                sx={{
                  flex: 1,
                  color: "#f87171",
                  bgcolor: "#f8717115",
                  borderRadius: 1.5,
                  py: 1,
                  "&:hover": {
                    bgcolor: "#f8717125",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

ReportHistoryCard.propTypes = {
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

export default ReportHistoryCard;
