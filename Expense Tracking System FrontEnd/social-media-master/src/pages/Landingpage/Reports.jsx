import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
  Fade,
  Zoom,
  Paper,
  Stack,
  Divider,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  InputLabel,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TableChartIcon from "@mui/icons-material/TableChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import FunctionsIcon from "@mui/icons-material/Functions";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useTheme } from "../../hooks/useTheme";
import ExpenseEmail from "./ExpenseEmail";
import ExpenseTableParent from "../ExpenseTableParent";
import ReportsGeneration from "../ReportsGeneration";
import SearchExpenses from "../SearchExpenses/SearchExpenses";
import SearchAudits from "../SearchAudits/SearchAudits";
import { ReportsHistoryContainer } from "../../components/ReportsHistory";
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportHistory } from "../../Redux/ReportHistory/reportHistory.action";
import { API_BASE_URL } from "../../config/api";

const expenseReportData = [
  { id: 1, reportName: "Expense Report Q1 2025", date: "2025-03-15" },
  { id: 2, reportName: "Expense Report Q2 2025", date: "2025-06-20" },
  { id: 3, reportName: "Annual Expense Summary", date: "2025-01-10" },
  { id: 4, reportName: "Compliance Expense Report", date: "2025-02-28" },
  { id: 5, reportName: "Travel Expense Report", date: "2025-04-15" },
  { id: 6, reportName: "Project Expense Report", date: "2025-05-10" },
];

const searchAuditsData = [
  {
    id: 1,
    reportName: "Financial Audit Q1 2025",
    date: "2025-03-20",
    reportType: "Financial",
    status: "Completed",
    description: "Quarterly financial audit covering all expense categories",
    createdAt: "2025-03-20",
  },
  {
    id: 2,
    reportName: "Compliance Audit 2025",
    date: "2025-04-10",
    reportType: "Compliance",
    status: "Completed",
    description: "Annual compliance audit report for regulatory requirements",
    createdAt: "2025-04-10",
  },
  {
    id: 3,
    reportName: "Operational Audit Q2",
    date: "2025-06-25",
    reportType: "Operational",
    status: "Completed",
    description: "Operational efficiency and process audit",
    createdAt: "2025-06-25",
  },
  {
    id: 4,
    reportName: "Security Audit Annual",
    date: "2025-01-15",
    reportType: "Security",
    status: "Completed",
    description: "Security protocols and access control audit",
    createdAt: "2025-01-15",
  },
  {
    id: 5,
    reportName: "Quarterly Audit Review",
    date: "2025-05-15",
    reportType: "Audit",
    status: "Completed",
    description: "Comprehensive quarterly review of all audits",
    createdAt: "2025-05-15",
  },
  {
    id: 6,
    reportName: "Internal Audit Report",
    date: "2025-02-10",
    reportType: "Audit",
    status: "Completed",
    description: "Internal controls and procedures audit",
    createdAt: "2025-02-10",
  },
  {
    id: 7,
    reportName: "Vendor Expense Audit",
    date: "2025-07-05",
    reportType: "Financial",
    status: "Completed",
    description: "Audit of all vendor-related expenses and contracts",
    createdAt: "2025-07-05",
  },
  {
    id: 8,
    reportName: "Travel Policy Compliance Audit",
    date: "2025-08-12",
    reportType: "Compliance",
    status: "Completed",
    description: "Review of travel expenses against updated policy rules",
    createdAt: "2025-08-12",
  },
  {
    id: 9,
    reportName: "Operational Cost Optimization Audit",
    date: "2025-09-18",
    reportType: "Operational",
    status: "Completed",
    description:
      "Deep-dive into operational costs and optimization opportunities",
    createdAt: "2025-09-18",
  },
  {
    id: 10,
    reportName: "Security Incident Post-Mortem Report",
    date: "2025-10-03",
    reportType: "Security",
    status: "Completed",
    description:
      "Post-incident analysis and recommendations for security improvements",
    createdAt: "2025-10-03",
  },
];

const defaultColumns = [
  { field: "id", headerName: "S.No", flex: 0.5, minWidth: 80 },
  { field: "reportName", headerName: "Report Name", flex: 2, minWidth: 200 },
  { field: "date", headerName: "Date", flex: 1, minWidth: 120 },
];

const Reports = ({ defaultTab = 0 }) => {
  const [selectedReport, setSelectedReport] = useState("select");
  const muiTheme = useMuiTheme();
  const { colors } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { friendId } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const hideBackButton = location?.state?.fromSidebar === true;

  // Redux
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector(
    (state) => state.reportHistory,
  );

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [Url, setUrl] = useState(null);

  // Excel Report States
  const [excelReportType, setExcelReportType] = useState("COMPREHENSIVE");
  const [excelDateRange, setExcelDateRange] = useState("30d");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeFormulas, setIncludeFormulas] = useState(true);
  const [includeConditionalFormatting, setIncludeConditionalFormatting] =
    useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const excelReportTypes = [
    {
      value: "COMPREHENSIVE",
      label: "Comprehensive Report",
      description:
        "Full expense report with all charts, trends, and budget analysis",
      icon: <TableChartIcon />,
    },
    {
      value: "EXPENSE",
      label: "Expense Report",
      description: "Detailed expense transactions with category breakdown",
      icon: <PieChartIcon />,
    },
    {
      value: "BUDGET",
      label: "Budget Analysis",
      description:
        "Budget utilization and variance with traffic light indicators",
      icon: <BarChartIcon />,
    },
    {
      value: "CATEGORY",
      label: "Category Breakdown",
      description: "Expense distribution across categories with pie charts",
      icon: <PieChartIcon />,
    },
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

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  const downloadExcelReport = async () => {
    setDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);
    try {
      const token = localStorage.getItem("jwt");
      let url = `${API_BASE_URL}/api/analytics/report/excel?reportType=${excelReportType}&includeCharts=${includeCharts}&includeFormulas=${includeFormulas}&includeConditionalFormatting=${includeConditionalFormatting}`;

      if (friendId) url += `&targetId=${friendId}`;

      if (excelDateRange === "monthly") {
        url += `&year=${selectedYear}&month=${selectedMonth}`;
      } else if (
        excelDateRange === "custom" &&
        customStartDate &&
        customEndDate
      ) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      } else if (excelDateRange === "all") {
        // All time - don't add date params, backend will use earliest to now
        url += `&allTime=true`;
      } else {
        const endDate = new Date();
        let startDate = new Date();
        if (excelDateRange === "7d") startDate.setDate(endDate.getDate() - 7);
        else if (excelDateRange === "30d")
          startDate.setDate(endDate.getDate() - 30);
        else if (excelDateRange === "90d")
          startDate.setDate(endDate.getDate() - 90);
        else if (excelDateRange === "1y")
          startDate.setFullYear(endDate.getFullYear() - 1);
        url += `&startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok)
        throw new Error(`Failed to download report (${response.status})`);

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "expense_report.xlsx";
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
      setDownloadSuccess(true);
    } catch (err) {
      console.error("Download error:", err);
      setDownloadError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  // Sync activeTab with URL parameter - runs on mount AND when searchParams change
  // This is the source of truth approach - URL drives the state
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 4) {
        setActiveTab(tabIndex);
      }
    }
  }, [searchParams]);

  // Fetch report history when Reports History tab is active
  useEffect(() => {
    if (activeTab === 2) {
      dispatch(fetchReportHistory());
    }
  }, [activeTab, dispatch]);

  const handleDropdownChange = (event) => {
    setSelectedReport(event.target.value);
    setUrl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getReportData = () => {
    switch (selectedReport) {
      case "expenseReport":
        return expenseReportData;
      case "searchAudits":
        return searchAuditsData;
      default:
        return [];
    }
  };

  // Adjust columns for mobile by removing the "id" column and adjusting flex
  const mobileColumns = defaultColumns
    .filter((col) => col.field !== "id")
    .map((col) => {
      if (col.field === "reportName") {
        return { ...col, flex: 2, minWidth: 150 };
      } else if (col.field === "date") {
        return { ...col, flex: 1, minWidth: 100 };
      }
      return col;
    });

  const columnsToUse = isMobile ? mobileColumns : defaultColumns;

  return (
    <Box
      className="reports-container"
      sx={{
        width: { xs: "100%", lg: "calc(100vw - 370px)" },
        height: { xs: "auto", lg: "calc(100vh - 100px)" },
        backgroundColor: colors.secondary_bg,
        borderRadius: "8px",
        marginRight: "20px",
        border: `1px solid ${colors.border_color}`,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Section */}
      <Fade in timeout={500}>
        <Box sx={{ width: "100%", px: 2.5, pt: 0.5, pb: 1, mb: 1.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ mb: 0.75 }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}
            >
              {!hideBackButton && (
                <IconButton
                  sx={{
                    color: colors.primary_accent,
                    backgroundColor: colors.primary_bg,
                    border: `1px solid ${colors.border_color}`,
                    "&:hover": {
                      backgroundColor: colors.hover_bg,
                      borderColor: colors.primary_accent,
                    },
                    width: 36,
                    height: 36,
                  }}
                  onClick={() =>
                    friendId && friendId !== "undefined"
                      ? navigate(`/friends/expenses/${friendId}`)
                      : navigate("/expenses")
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke={colors.primary_accent}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
              )}

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    color: colors.primary_text,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: isMobile ? 28 : 32 }} />
                  Reports & Analytics
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.secondary_text,
                    mt: 0.5,
                  }}
                >
                  Generate, view, and download comprehensive expense reports
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Fade>

      {/* Main Content Card with Tabs */}
      <Card
        sx={{
          bgcolor: colors.primary_bg,
          border: `1px solid ${colors.border_color}`,
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: 0,
        }}
      >
        {/* Tabs Header */}
        <Box
          sx={{
            borderBottom: `2px solid ${colors.border_color}`,
            bgcolor: colors.primary_bg,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 56,
              "& .MuiTab-root": {
                color: colors.secondary_text,
                textTransform: "none",
                fontSize: 15,
                fontWeight: 600,
                minHeight: 56,
                px: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  color: colors.primary_accent,
                  bgcolor: `${colors.primary_accent}10`,
                },
                "&.Mui-selected": {
                  color: colors.primary_accent,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                bgcolor: colors.primary_accent,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              icon={<DescriptionIcon />}
              iconPosition="start"
              label="Generate Reports"
            />
            <Tab
              icon={<FileDownloadIcon />}
              iconPosition="start"
              label="Excel Download"
            />
            <Tab
              icon={<HistoryIcon />}
              iconPosition="start"
              label="Reports History"
            />
            <Tab
              icon={<AssessmentIcon />}
              iconPosition="start"
              label="Analytics"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            pt: activeTab === 2 ? 0 : 3,
            px: 3,
            pb: activeTab === 2 ? 0 : 3,
          }}
        >
          {/* Tab Panel 0: Generate Reports (ExpenseEmail Full Width) */}
          {activeTab === 0 && (
            <Fade in timeout={400}>
              <Box sx={{ height: "100%" }}>
                <Card
                  sx={{
                    bgcolor: colors.primary_bg,
                    border: `1px solid ${colors.border_color}`,
                    borderRadius: 2,
                    height: "100%",
                    overflow: "auto",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: colors.primary_text,
                            fontWeight: 600,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <DescriptionIcon
                            sx={{ color: colors.primary_accent }}
                          />
                          Generate Expense Report
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.secondary_text,
                          }}
                        >
                          Configure report parameters and generate detailed
                          expense reports via email
                        </Typography>
                      </Box>

                      {/* ExpenseEmail Component - Full Width */}
                      <Box>
                        <ExpenseEmail />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}

          {/* Tab Panel 1: Excel Download */}
          {activeTab === 1 && (
            <Fade in timeout={400}>
              <Box sx={{ height: "100%" }}>
                <Card
                  sx={{
                    bgcolor: colors.primary_bg,
                    border: `1px solid ${colors.border_color}`,
                    borderRadius: 2,
                    overflow: "auto",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: colors.primary_text,
                            fontWeight: 600,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <FileDownloadIcon
                            sx={{ color: colors.primary_accent }}
                          />
                          Download Excel Report
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: colors.secondary_text }}
                        >
                          Generate beautiful Excel reports with charts,
                          formulas, and conditional formatting
                        </Typography>
                      </Box>

                      {downloadError && (
                        <Alert
                          severity="error"
                          onClose={() => setDownloadError(null)}
                        >
                          {downloadError}
                        </Alert>
                      )}
                      {downloadSuccess && (
                        <Alert
                          severity="success"
                          onClose={() => setDownloadSuccess(false)}
                        >
                          Report downloaded successfully!
                        </Alert>
                      )}

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Report Type</InputLabel>
                            <Select
                              value={excelReportType}
                              onChange={(e) =>
                                setExcelReportType(e.target.value)
                              }
                              label="Report Type"
                            >
                              {excelReportTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    {type.icon}
                                    {type.label}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Date Range</InputLabel>
                            <Select
                              value={excelDateRange}
                              onChange={(e) =>
                                setExcelDateRange(e.target.value)
                              }
                              label="Date Range"
                            >
                              <MenuItem value="7d">Last 7 Days</MenuItem>
                              <MenuItem value="30d">Last 30 Days</MenuItem>
                              <MenuItem value="90d">Last 90 Days</MenuItem>
                              <MenuItem value="1y">Last Year</MenuItem>
                              <MenuItem value="all">All Time</MenuItem>
                              <MenuItem value="monthly">
                                Specific Month
                              </MenuItem>
                              <MenuItem value="custom">Custom Range</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {excelDateRange === "monthly" && (
                          <>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                                <InputLabel>Year</InputLabel>
                                <Select
                                  value={selectedYear}
                                  onChange={(e) =>
                                    setSelectedYear(e.target.value)
                                  }
                                  label="Year"
                                >
                                  {years.map((year) => (
                                    <MenuItem key={year} value={year}>
                                      {year}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                                <InputLabel>Month</InputLabel>
                                <Select
                                  value={selectedMonth}
                                  onChange={(e) =>
                                    setSelectedMonth(e.target.value)
                                  }
                                  label="Month"
                                >
                                  {months.map((month) => (
                                    <MenuItem
                                      key={month.value}
                                      value={month.value}
                                    >
                                      {month.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </>
                        )}

                        {excelDateRange === "custom" && (
                          <>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="Start Date"
                                type="date"
                                value={customStartDate}
                                onChange={(e) =>
                                  setCustomStartDate(e.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="End Date"
                                type="date"
                                value={customEndDate}
                                onChange={(e) =>
                                  setCustomEndDate(e.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>

                      <Divider />

                      <Typography
                        variant="subtitle2"
                        sx={{ color: colors.primary_accent, fontWeight: 600 }}
                      >
                        Excel Report Options
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: includeCharts
                                ? `${colors.primary_accent}15`
                                : colors.secondary_bg,
                              border: `1px solid ${includeCharts ? colors.primary_accent : colors.border_color}`,
                              borderRadius: 2,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onClick={() => setIncludeCharts(!includeCharts)}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={includeCharts}
                                  onChange={(e) =>
                                    setIncludeCharts(e.target.checked)
                                  }
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <PieChartIcon fontSize="small" />
                                  <span>Include Charts</span>
                                </Box>
                              }
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mt: 1,
                                color: colors.secondary_text,
                              }}
                            >
                              Pie, Bar & Line charts for visual analysis
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: includeFormulas
                                ? `${colors.primary_accent}15`
                                : colors.secondary_bg,
                              border: `1px solid ${includeFormulas ? colors.primary_accent : colors.border_color}`,
                              borderRadius: 2,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onClick={() => setIncludeFormulas(!includeFormulas)}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={includeFormulas}
                                  onChange={(e) =>
                                    setIncludeFormulas(e.target.checked)
                                  }
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <FunctionsIcon fontSize="small" />
                                  <span>Include Formulas</span>
                                </Box>
                              }
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mt: 1,
                                color: colors.secondary_text,
                              }}
                            >
                              SUM, AVERAGE & dynamic calculations
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: includeConditionalFormatting
                                ? `${colors.primary_accent}15`
                                : colors.secondary_bg,
                              border: `1px solid ${includeConditionalFormatting ? colors.primary_accent : colors.border_color}`,
                              borderRadius: 2,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onClick={() =>
                              setIncludeConditionalFormatting(
                                !includeConditionalFormatting,
                              )
                            }
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={includeConditionalFormatting}
                                  onChange={(e) =>
                                    setIncludeConditionalFormatting(
                                      e.target.checked,
                                    )
                                  }
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <FormatColorFillIcon fontSize="small" />
                                  <span>Conditional Formatting</span>
                                </Box>
                              }
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mt: 1,
                                color: colors.secondary_text,
                              }}
                            >
                              Traffic lights, data bars & highlights
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: colors.secondary_bg,
                          border: `1px solid ${colors.border_color}`,
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          {
                            excelReportTypes.find(
                              (r) => r.value === excelReportType,
                            )?.icon
                          }
                          <Typography
                            variant="subtitle1"
                            sx={{ color: colors.primary_text, fontWeight: 600 }}
                          >
                            {
                              excelReportTypes.find(
                                (r) => r.value === excelReportType,
                              )?.label
                            }
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ color: colors.secondary_text }}
                        >
                          {
                            excelReportTypes.find(
                              (r) => r.value === excelReportType,
                            )?.description
                          }
                        </Typography>
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          {includeCharts && (
                            <Chip
                              size="small"
                              icon={<PieChartIcon />}
                              label="Charts"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {includeFormulas && (
                            <Chip
                              size="small"
                              icon={<FunctionsIcon />}
                              label="Formulas"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {includeConditionalFormatting && (
                            <Chip
                              size="small"
                              icon={<FormatColorFillIcon />}
                              label="Formatting"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Paper>

                      <Button
                        variant="contained"
                        size="large"
                        startIcon={
                          downloading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <FileDownloadIcon />
                          )
                        }
                        onClick={downloadExcelReport}
                        disabled={downloading}
                        sx={{
                          bgcolor: colors.primary_accent,
                          "&:hover": {
                            bgcolor:
                              colors.primary_accent_dark ||
                              colors.primary_accent,
                          },
                        }}
                      >
                        {downloading
                          ? "Generating Report..."
                          : "Download Excel Report"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}

          {/* Tab Panel 2: Reports History */}
          {activeTab === 2 && (
            <Fade in timeout={400}>
              <Box sx={{ height: "100%" }}>
                <ReportsHistoryContainer
                  reports={reports}
                  loading={loading}
                  onView={(report) => {
                    console.log("View report:", report);
                    alert(`Viewing: ${report.reportName}`);
                  }}
                  onDownload={(report) => {
                    console.log("Download report:", report);
                    alert(`Downloading: ${report.reportName}`);
                  }}
                  onDelete={(report) => {
                    console.log("Delete report:", report);
                    if (window.confirm(`Delete "${report.reportName}"?`)) {
                      alert("Report deleted successfully!");
                    }
                  }}
                  onRefresh={() => {
                    console.log("Refresh reports");
                    dispatch(fetchReportHistory());
                  }}
                  itemsPerPage={5}
                />
              </Box>
            </Fade>
          )}

          {/* Tab Panel 3: Analytics */}
          {activeTab === 3 && (
            <Fade in timeout={400}>
              <Box sx={{ height: "100%" }}>
                <Card
                  sx={{
                    bgcolor: colors.primary_bg,
                    border: `1px solid ${colors.border_color}`,
                    borderRadius: 2,
                    p: 6,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      bgcolor: `${colors.primary_accent}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                    }}
                  >
                    <AssessmentIcon
                      sx={{
                        fontSize: 60,
                        color: colors.primary_accent,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: colors.primary_text,
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Advanced Analytics
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.secondary_text,
                      maxWidth: 400,
                    }}
                  >
                    View detailed charts, trends, and insights from your expense
                    data
                  </Typography>
                </Card>
              </Box>
            </Fade>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default Reports;
