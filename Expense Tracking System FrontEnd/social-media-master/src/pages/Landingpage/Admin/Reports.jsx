import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { AdminPanelContainer, SectionCard } from "./components";
import ReportHeader from "../../../components/ReportHeader";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import {
  fetchAdminReports,
  generateReport,
  deleteReport,
} from "../../../Redux/Admin/admin.action";

const Reports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminState = useSelector((state) => state.admin) || {};
  const reportsState = adminState.reports || {
    list: [],
    totalCount: 0,
    generating: false,
    loading: false,
    error: null,
  };
  const {
    list: reports,
    totalCount,
    generating,
    loading,
    error,
  } = reportsState;

  const [reportType, setReportType] = useState("user-activity");
  const [dateRange, setDateRange] = useState("30d");
  const [format, setFormat] = useState("pdf");
  const [reportName, setReportName] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    dispatch(fetchAdminReports());
  }, [dispatch]);

  const reportTypes = [
    {
      value: "user-activity",
      label: "User Activity Report",
      description: "Detailed report of user actions and system usage",
    },
    {
      value: "expense-summary",
      label: "Expense Summary Report",
      description: "Comprehensive expense statistics and trends",
    },
    {
      value: "budget-analysis",
      label: "Budget Analysis Report",
      description: "Budget utilization and variance analysis",
    },
    {
      value: "audit-trail",
      label: "Audit Trail Report",
      description: "Complete audit log for compliance",
    },
    {
      value: "category-breakdown",
      label: "Category Breakdown Report",
      description: "Expense distribution across categories",
    },
  ];

  const handleGenerateReport = async () => {
    try {
      const reportConfig = {
        type: reportType,
        dateRange,
        format,
        name:
          reportName ||
          `${reportTypes.find((r) => r.value === reportType)?.label} - ${new Date().toLocaleDateString()}`,
      };
      await dispatch(generateReport(reportConfig));
      setSnackbar({
        open: true,
        message: "Report generated successfully!",
        severity: "success",
      });
      setReportName("");
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to generate report",
        severity: "error",
      });
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await dispatch(deleteReport(reportId));
        setSnackbar({
          open: true,
          message: "Report deleted successfully!",
          severity: "success",
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to delete report",
          severity: "error",
        });
      }
    }
  };

  const handleDownloadReport = (report) => {
    // This would typically call an API to download the report file
    console.log("Downloading report:", report.id);
    setSnackbar({
      open: true,
      message: "Download started...",
      severity: "info",
    });
  };

  // Calculate stats
  const reportsThisMonth = reports.filter((r) => {
    const reportDate = new Date(r.createdAt || r.date);
    const now = new Date();
    return (
      reportDate.getMonth() === now.getMonth() &&
      reportDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const avgSize =
    reports.length > 0
      ? (
          reports.reduce((sum, r) => sum + parseFloat(r.size || 0), 0) /
          reports.length
        ).toFixed(1)
      : "0";

  // Prepare data for SharedOverviewCards
  const overviewData = [
    {
      reportTypes: reportTypes.length,
      generatedThisMonth: reportsThisMonth,
      totalReports: totalCount || reports.length,
      avgSize: avgSize,
    },
  ];

  const [flowType, setFlowType] = useState("all");

  const handleExport = () => {
    console.log("Exporting reports data...");
  };

  return (
    <AdminPanelContainer>
      {/* Report Header */}
      <ReportHeader
        title="Reports"
        subtitle="Generate and manage system reports"
        timeframe="all"
        flowType={flowType}
        onFlowTypeChange={setFlowType}
        onExport={handleExport}
        showFilterButton={false}
        timeframeOptions={[{ value: "all", label: "All Time" }]}
        isLoading={loading}
        showBackButton={false}
        stickyBackground="inherit"
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Stats Cards using SharedOverviewCards */}
      <SharedOverviewCards data={overviewData} mode="admin-reports" />

      {/* Report Configuration */}
      <SectionCard title="Generate New Report">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                {reportTypes.map((type) => (
                  <MuiMenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Date Range"
              >
                <MuiMenuItem value="7d">Last 7 Days</MuiMenuItem>
                <MuiMenuItem value="30d">Last 30 Days</MuiMenuItem>
                <MuiMenuItem value="90d">Last 90 Days</MuiMenuItem>
                <MuiMenuItem value="1y">Last Year</MuiMenuItem>
                <MuiMenuItem value="all">All Time</MuiMenuItem>
                <MuiMenuItem value="custom">Custom Range</MuiMenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                label="Format"
              >
                <MuiMenuItem value="pdf">PDF</MuiMenuItem>
                <MuiMenuItem value="excel">Excel</MuiMenuItem>
                <MuiMenuItem value="csv">CSV</MuiMenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Report Name (Optional)"
              variant="outlined"
              fullWidth
              placeholder="e.g., Q1 2024 Summary"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          {/* Report Description */}
          <div className="p-4 rounded bg-gray-800 border border-gray-700">
            <p className="text-sm font-semibold mb-2">
              {reportTypes.find((r) => r.value === reportType)?.label}
            </p>
            <p className="text-sm opacity-70">
              {reportTypes.find((r) => r.value === reportType)?.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="contained"
              startIcon={
                generating ? (
                  <CircularProgress size={20} />
                ) : (
                  <FileDownloadIcon />
                )
              }
              onClick={handleGenerateReport}
              disabled={generating}
              style={{
                backgroundColor: "#14b8a6",
                color: "#fff",
              }}
              fullWidth
            >
              {generating ? "Generating..." : "Generate Report"}
            </Button>
            <Button variant="outlined" startIcon={<VisibilityIcon />}>
              Preview
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Recent Reports */}
      <SectionCard title="Recent Reports" className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress style={{ color: "#14b8a6" }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Report Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Generated By
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Format
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-700">
                      <td className="px-6 py-4 font-medium">{report.name}</td>
                      <td className="px-6 py-4 text-sm opacity-70">
                        {report.type}
                      </td>
                      <td className="px-6 py-4 text-sm opacity-70">
                        {report.generatedBy || "System"}
                      </td>
                      <td className="px-6 py-4 text-sm opacity-70">
                        {new Date(
                          report.createdAt || report.date,
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm opacity-70">
                        {report.size || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-300">
                          {report.format?.toUpperCase() || "PDF"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          onClick={() => handleDownloadReport(report)}
                        >
                          Download
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center opacity-70"
                    >
                      No reports generated yet. Create your first report above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminPanelContainer>
  );
};

export default Reports;
