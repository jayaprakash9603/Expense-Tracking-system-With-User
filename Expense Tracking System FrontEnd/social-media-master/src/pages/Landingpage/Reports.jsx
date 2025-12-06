import React, { useState } from "react";
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useTheme } from "../../hooks/useTheme";
import ExpenseEmail from "./ExpenseEmail";
import ExpenseTableParent from "../ExpenseTableParent";
import ReportsGeneration from "../ReportsGeneration";
import SearchExpenses from "../SearchExpenses/SearchExpenses";
import SearchAudits from "../SearchAudits/SearchAudits";
import { ReportsHistoryContainer } from "../../components/ReportsHistory";
import { useNavigate, useParams, useLocation } from "react-router";

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
    createdAt: "2025-03-20"
  },
  { 
    id: 2, 
    reportName: "Compliance Audit 2025", 
    date: "2025-04-10",
    reportType: "Compliance",
    status: "Completed",
    description: "Annual compliance audit report for regulatory requirements",
    createdAt: "2025-04-10"
  },
  { 
    id: 3, 
    reportName: "Operational Audit Q2", 
    date: "2025-06-25",
    reportType: "Operational",
    status: "Completed",
    description: "Operational efficiency and process audit",
    createdAt: "2025-06-25"
  },
  { 
    id: 4, 
    reportName: "Security Audit Annual", 
    date: "2025-01-15",
    reportType: "Security",
    status: "Completed",
    description: "Security protocols and access control audit",
    createdAt: "2025-01-15"
  },
  { 
    id: 5, 
    reportName: "Quarterly Audit Review", 
    date: "2025-05-15",
    reportType: "Audit",
    status: "Completed",
    description: "Comprehensive quarterly review of all audits",
    createdAt: "2025-05-15"
  },
  { 
    id: 6, 
    reportName: "Internal Audit Report", 
    date: "2025-02-10",
    reportType: "Audit",
    status: "Completed",
    description: "Internal controls and procedures audit",
    createdAt: "2025-02-10"
  },
  { 
    id: 7, 
    reportName: "Vendor Expense Audit", 
    date: "2025-07-05",
    reportType: "Financial",
    status: "Completed",
    description: "Audit of all vendor-related expenses and contracts",
    createdAt: "2025-07-05"
  },
  { 
    id: 8, 
    reportName: "Travel Policy Compliance Audit", 
    date: "2025-08-12",
    reportType: "Compliance",
    status: "Completed",
    description: "Review of travel expenses against updated policy rules",
    createdAt: "2025-08-12"
  },
  { 
    id: 9, 
    reportName: "Operational Cost Optimization Audit", 
    date: "2025-09-18",
    reportType: "Operational",
    status: "Completed",
    description: "Deep-dive into operational costs and optimization opportunities",
    createdAt: "2025-09-18"
  },
  { 
    id: 10, 
    reportName: "Security Incident Post-Mortem Report", 
    date: "2025-10-03",
    reportType: "Security",
    status: "Completed",
    description: "Post-incident analysis and recommendations for security improvements",
    createdAt: "2025-10-03"
  },
];

const defaultColumns = [
  { field: "id", headerName: "S.No", flex: 0.5, minWidth: 80 },
  { field: "reportName", headerName: "Report Name", flex: 2, minWidth: 200 },
  { field: "date", headerName: "Date", flex: 1, minWidth: 120 },
];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("select");
  const [activeTab, setActiveTab] = useState(0);
  const [Url, setUrl] = useState(null);
  const muiTheme = useMuiTheme();
  const { colors } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { friendId } = useParams();
  const location = useLocation();
  const hideBackButton = location?.state?.fromSidebar === true;

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
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 0.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
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
            p: 3,
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
                          <DescriptionIcon sx={{ color: colors.primary_accent }} />
                          Generate Expense Report
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: colors.secondary_text,
                          }}
                        >
                          Configure report parameters and generate detailed expense reports via email
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

          {/* Tab Panel 1: Reports History */}
          {activeTab === 1 && (
            <Fade in timeout={400}>
              <Box sx={{ height: "100%" }}>
                <ReportsHistoryContainer
                  reports={searchAuditsData}
                  loading={false}
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
                    alert("Refreshing reports...");
                  }}
                  itemsPerPage={6}
                />
              </Box>
            </Fade>
          )}


          {/* Tab Panel 2: Analytics */}
          {activeTab === 2 && (
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
                    View detailed charts, trends, and insights from your expense data
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
