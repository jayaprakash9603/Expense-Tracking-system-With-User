import React, { useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  TextField,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  AdminPanelContainer,
  AdminPageHeader,
  StatCard,
  SectionCard,
} from "./components";

const Reports = () => {
  const [reportType, setReportType] = useState("user-activity");
  const [dateRange, setDateRange] = useState("30d");
  const [format, setFormat] = useState("pdf");

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

  // Recent reports data
  const recentReports = [
    {
      id: 1,
      name: "Monthly User Activity - January 2024",
      type: "User Activity",
      generatedBy: "Admin User",
      date: "2024-01-31",
      size: "2.4 MB",
      format: "PDF",
    },
    {
      id: 2,
      name: "Q4 2023 Expense Summary",
      type: "Expense Summary",
      generatedBy: "System",
      date: "2024-01-01",
      size: "5.8 MB",
      format: "Excel",
    },
    {
      id: 3,
      name: "Annual Audit Trail 2023",
      type: "Audit Trail",
      generatedBy: "Admin User",
      date: "2023-12-31",
      size: "12.3 MB",
      format: "PDF",
    },
  ];

  return (
    <AdminPanelContainer>
      {/* Page Header */}
      <AdminPageHeader
        title="Reports"
        description="Generate and manage system reports"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Report Types" value={reportTypes.length.toString()} />
        <StatCard label="Generated This Month" value="12" color="#4caf50" />
        <StatCard label="Total Reports" value="87" color="#2196f3" />
        <StatCard label="Avg Size" value="4.2 MB" color="#9c27b0" />
      </div>

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
              startIcon={<FileDownloadIcon />}
              style={{
                backgroundColor: "#14b8a6",
                color: "#fff",
              }}
              fullWidth
            >
              Generate Report
            </Button>
            <Button variant="outlined" startIcon={<VisibilityIcon />}>
              Preview
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Recent Reports */}
      <SectionCard title="Recent Reports" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold">Report Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Generated By</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Size</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Format</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id} className="border-b border-gray-700">
                  <td className="px-6 py-4 font-medium">{report.name}</td>
                  <td className="px-6 py-4 text-sm opacity-70">{report.type}</td>
                  <td className="px-6 py-4 text-sm opacity-70">{report.generatedBy}</td>
                  <td className="px-6 py-4 text-sm opacity-70">{report.date}</td>
                  <td className="px-6 py-4 text-sm opacity-70">{report.size}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-300">
                      {report.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="small" startIcon={<FileDownloadIcon />}>
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AdminPanelContainer>
  );
};

export default Reports;
