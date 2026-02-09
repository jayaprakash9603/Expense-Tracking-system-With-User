import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  FileDownload as FileDownloadIcon,
  PieChart as PieChartIcon,
  Functions as FunctionsIcon,
  FormatColorFill as FormatColorFillIcon,
  TableChart as TableChartIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { API_BASE_URL } from "../../config/api";

const excelReportTypes = [
  {
    value: "comprehensive",
    label: "Comprehensive Report",
    icon: <TableChartIcon fontSize="small" />,
    description:
      "Full expense report with all charts, trends, and budget analysis",
  },
  {
    value: "summary",
    label: "Summary Report",
    icon: <AssessmentIcon fontSize="small" />,
    description: "Quick overview with key metrics and category breakdown",
  },
  {
    value: "trends",
    label: "Trends Analysis",
    icon: <TrendingUpIcon fontSize="small" />,
    description: "Monthly and daily spending patterns with forecasts",
  },
];

const dateRangeOptions = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" },
  { value: "monthly", label: "Specific Month" },
  { value: "custom", label: "Custom Range" },
];

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const ExcelDownload = () => {
  const { colors } = useTheme();

  const [reportType, setReportType] = useState("comprehensive");
  const [dateRange, setDateRange] = useState("30d");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeFormulas, setIncludeFormulas] = useState(true);
  const [includeConditionalFormatting, setIncludeConditionalFormatting] =
    useState(true);

  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const getDateParams = () => {
    const now = new Date();
    let startDate, endDate;
    endDate = now.toISOString().split("T")[0];

    switch (dateRange) {
      case "7d":
        startDate = new Date(now.setDate(now.getDate() - 7))
          .toISOString()
          .split("T")[0];
        break;
      case "30d":
        startDate = new Date(now.setDate(now.getDate() - 30))
          .toISOString()
          .split("T")[0];
        break;
      case "90d":
        startDate = new Date(now.setDate(now.getDate() - 90))
          .toISOString()
          .split("T")[0];
        break;
      case "1y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          .toISOString()
          .split("T")[0];
        break;
      case "all":
        return { allTime: true };
      case "monthly":
        const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
        const monthEnd = new Date(selectedYear, selectedMonth, 0);
        startDate = monthStart.toISOString().split("T")[0];
        endDate = monthEnd.toISOString().split("T")[0];
        break;
      case "custom":
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30))
          .toISOString()
          .split("T")[0];
    }
    return { startDate, endDate };
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("jwt");
      const dateParams = getDateParams();

      let url = `${API_BASE_URL}/api/analytics/report/excel?reportType=${reportType.toUpperCase()}&includeCharts=${includeCharts}&includeFormulas=${includeFormulas}&includeConditionalFormatting=${includeConditionalFormatting}`;

      if (dateParams.allTime) {
        url += `&allTime=true`;
      } else if (dateParams.startDate && dateParams.endDate) {
        url += `&startDate=${dateParams.startDate}&endDate=${dateParams.endDate}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to download report (${response.status})`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `expense_report_${dateRange}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) filename = match[1];
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Download error:", err);
      setError(err.message || "Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  const selectedReportType = excelReportTypes.find(
    (r) => r.value === reportType,
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {/* Header */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            color: colors.primary_text,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 0.5,
          }}
        >
          <FileDownloadIcon
            sx={{ color: colors.primary_accent, fontSize: 28 }}
          />
          Download Excel Report
        </Typography>
        <Typography variant="body2" sx={{ color: colors.secondary_text }}>
          Generate beautiful Excel reports with charts, formulas, and
          conditional formatting
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Report downloaded successfully!
        </Alert>
      )}

      {/* Main Content - Two Column Layout */}
      <Box sx={{ display: "flex", gap: 3, flex: 1 }}>
        {/* Left Column - Configuration */}
        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* Report Type Selection */}
          <Paper
            sx={{
              p: 2.5,
              bgcolor: colors.secondary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: colors.primary_accent,
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AssessmentIcon fontSize="small" />
              Report Type
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {excelReportTypes.map((type) => (
                <Paper
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    bgcolor:
                      reportType === type.value
                        ? `${colors.primary_accent}15`
                        : colors.primary_bg,
                    border: `2px solid ${reportType === type.value ? colors.primary_accent : "transparent"}`,
                    borderRadius: 1.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: `${colors.primary_accent}10`,
                      borderColor: colors.primary_accent,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        color:
                          reportType === type.value
                            ? colors.primary_accent
                            : colors.secondary_text,
                        display: "flex",
                      }}
                    >
                      {type.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            reportType === type.value
                              ? colors.primary_text
                              : colors.secondary_text,
                        }}
                      >
                        {type.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.secondary_text }}
                      >
                        {type.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>

          {/* Date Range Selection */}
          <Paper
            sx={{
              p: 2.5,
              bgcolor: colors.secondary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: colors.primary_accent,
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CalendarIcon fontSize="small" />
              Date Range
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Select Period</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Select Period"
              >
                {dateRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {dateRange === "monthly" && (
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    label="Year"
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    label="Month"
                  >
                    {months.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {dateRange === "custom" && (
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  size="small"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  size="small"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Box>
            )}
          </Paper>
        </Box>

        {/* Right Column - Options & Preview */}
        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* Excel Options */}
          <Paper
            sx={{
              p: 2.5,
              bgcolor: colors.secondary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: colors.primary_accent,
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <InfoIcon fontSize="small" />
              Excel Options
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <OptionToggle
                checked={includeCharts}
                onChange={setIncludeCharts}
                icon={<PieChartIcon />}
                label="Include Charts"
                description="Pie, Bar & Line charts for visual analysis"
                colors={colors}
              />
              <OptionToggle
                checked={includeFormulas}
                onChange={setIncludeFormulas}
                icon={<FunctionsIcon />}
                label="Include Formulas"
                description="SUM, AVERAGE & dynamic calculations"
                colors={colors}
              />
              <OptionToggle
                checked={includeConditionalFormatting}
                onChange={setIncludeConditionalFormatting}
                icon={<FormatColorFillIcon />}
                label="Conditional Formatting"
                description="Traffic lights, data bars & highlights"
                colors={colors}
              />
            </Box>
          </Paper>

          {/* Report Preview */}
          <Paper
            sx={{
              p: 2.5,
              bgcolor: colors.primary_bg,
              border: `2px solid ${colors.primary_accent}`,
              borderRadius: 2,
              flex: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: colors.primary_accent, fontWeight: 600, mb: 2 }}
            >
              Report Preview
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}
            >
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: `${colors.primary_accent}15`,
                  borderRadius: 1.5,
                  color: colors.primary_accent,
                }}
              >
                {selectedReportType?.icon}
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: colors.primary_text }}
                >
                  {selectedReportType?.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: colors.secondary_text }}
                >
                  {selectedReportType?.description}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Chip
                size="small"
                label={
                  dateRangeOptions.find((d) => d.value === dateRange)?.label
                }
                color="primary"
                variant="filled"
              />
              {includeCharts && (
                <Chip
                  size="small"
                  icon={<PieChartIcon />}
                  label="Charts"
                  variant="outlined"
                />
              )}
              {includeFormulas && (
                <Chip
                  size="small"
                  icon={<FunctionsIcon />}
                  label="Formulas"
                  variant="outlined"
                />
              )}
              {includeConditionalFormatting && (
                <Chip
                  size="small"
                  icon={<FormatColorFillIcon />}
                  label="Formatting"
                  variant="outlined"
                />
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, display: "block" }}
            >
              Your report will include multiple sheets with detailed expense
              data, category breakdowns, monthly trends, budget analysis, and
              insights.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Download Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={
          downloading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <FileDownloadIcon />
          )
        }
        onClick={handleDownload}
        disabled={
          downloading ||
          (dateRange === "custom" && (!customStartDate || !customEndDate))
        }
        sx={{
          bgcolor: colors.primary_accent,
          py: 1.5,
          fontSize: "1rem",
          fontWeight: 600,
          "&:hover": {
            bgcolor: colors.primary_accent,
            filter: "brightness(1.1)",
          },
        }}
      >
        {downloading ? "Generating Report..." : "Download Excel Report"}
      </Button>
    </Box>
  );
};

const OptionToggle = ({
  checked,
  onChange,
  icon,
  label,
  description,
  colors,
}) => (
  <Paper
    onClick={() => onChange(!checked)}
    sx={{
      p: 1.5,
      display: "flex",
      alignItems: "center",
      gap: 2,
      cursor: "pointer",
      bgcolor: checked ? `${colors.primary_accent}10` : colors.primary_bg,
      border: `1px solid ${checked ? colors.primary_accent : colors.border_color}`,
      borderRadius: 1.5,
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: colors.primary_accent,
      },
    }}
  >
    <Box
      sx={{ color: checked ? colors.primary_accent : colors.secondary_text }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 500, color: colors.primary_text }}
      >
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: colors.secondary_text }}>
        {description}
      </Typography>
    </Box>
    <Switch
      size="small"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  </Paper>
);

export default ExcelDownload;
