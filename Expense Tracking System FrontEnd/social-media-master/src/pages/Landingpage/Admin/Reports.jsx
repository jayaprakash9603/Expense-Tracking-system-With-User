import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  Chip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getThemeColors } from "../../../config/themeConfig";

const Reports = () => {
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);
  const [selectedReport, setSelectedReport] = useState("user-activity");
  const [timeRange, setTimeRange] = useState("30d");

  // Static report types
  const reportTypes = [
    {
      id: "user-activity",
      name: "User Activity Report",
      description: "Detailed user engagement and activity metrics",
      icon: PeopleIcon,
      color: "#2196f3",
    },
    {
      id: "expense-summary",
      name: "Expense Summary Report",
      description: "Overview of all expenses by category and user",
      icon: BarChartIcon,
      color: "#4caf50",
    },
    {
      id: "revenue-report",
      name: "Revenue Report",
      description: "Financial performance and revenue analytics",
      icon: AttachMoneyIcon,
      color: "#ff9800",
    },
    {
      id: "growth-metrics",
      name: "Growth Metrics Report",
      description: "User growth, retention, and expansion metrics",
      icon: TrendingUpIcon,
      color: "#9c27b0",
    },
  ];

  // Static report data
  const reportData = {
    "user-activity": {
      summary: {
        totalUsers: 12847,
        activeUsers: 9234,
        newUsers: 1543,
        avgSessionTime: "18m 32s",
      },
      details: [
        {
          date: "2024-12-01",
          logins: 1245,
          newUsers: 52,
          avgSession: "19m",
        },
        {
          date: "2024-11-30",
          logins: 1198,
          newUsers: 48,
          avgSession: "18m",
        },
        {
          date: "2024-11-29",
          logins: 1302,
          newUsers: 61,
          avgSession: "20m",
        },
        {
          date: "2024-11-28",
          logins: 1156,
          newUsers: 45,
          avgSession: "17m",
        },
        {
          date: "2024-11-27",
          logins: 1089,
          newUsers: 38,
          avgSession: "16m",
        },
      ],
    },
    "expense-summary": {
      summary: {
        totalExpenses: 45623,
        totalAmount: "$1,234,567",
        avgExpense: "$27.05",
        topCategory: "Food & Dining",
      },
      details: [
        { category: "Food & Dining", count: 8440, amount: "$228,456" },
        { category: "Transportation", count: 6480, amount: "$175,328" },
        { category: "Shopping", count: 5886, amount: "$159,271" },
        { category: "Bills & Utilities", count: 4334, amount: "$117,268" },
        { category: "Entertainment", count: 3970, amount: "$107,445" },
      ],
    },
    "revenue-report": {
      summary: {
        totalRevenue: "$234,567",
        monthlyGrowth: "+8.7%",
        avgRevenuePerUser: "$18.26",
        projectedAnnual: "$2,814,804",
      },
      details: [
        { month: "December 2024", revenue: "$23,456", growth: "+12.3%" },
        { month: "November 2024", revenue: "$21,890", growth: "+8.7%" },
        { month: "October 2024", revenue: "$20,123", growth: "+5.4%" },
        { month: "September 2024", revenue: "$19,087", growth: "+3.2%" },
        { month: "August 2024", revenue: "$18,495", growth: "+2.1%" },
      ],
    },
    "growth-metrics": {
      summary: {
        userGrowthRate: "+12.5%",
        retentionRate: "78.4%",
        churnRate: "4.2%",
        expansionRate: "+15.3%",
      },
      details: [
        {
          metric: "Monthly Active Users",
          current: 9234,
          previous: 8012,
          change: "+15.3%",
        },
        {
          metric: "User Retention (30d)",
          current: "78.4%",
          previous: "74.2%",
          change: "+4.2%",
        },
        {
          metric: "Average Revenue Per User",
          current: "$18.26",
          previous: "$16.83",
          change: "+8.5%",
        },
        {
          metric: "Customer Lifetime Value",
          current: "$328.50",
          previous: "$301.20",
          change: "+9.1%",
        },
      ],
    },
  };

  const currentReportType = reportTypes.find((r) => r.id === selectedReport);
  const currentReportData = reportData[selectedReport];

  const handleExportReport = () => {
    alert(
      `Exporting ${currentReportType.name} for ${timeRange} time range...`
    );
  };

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: themeColors.primary_bg,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: themeColors.primary_text }}
        >
          Reports & Analytics
        </h1>
        <p style={{ color: themeColors.secondary_text }}>
          Generate and export detailed system reports
        </p>
      </div>

      {/* Report Selection */}
      <div
        className="p-6 rounded-lg mb-6"
        style={{ backgroundColor: themeColors.card_bg }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <FormControl className="flex-1" size="small">
            <InputLabel style={{ color: themeColors.secondary_text }}>
              Report Type
            </InputLabel>
            <Select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              label="Report Type"
              style={{
                color: themeColors.primary_text,
                backgroundColor: themeColors.primary_bg,
              }}
            >
              {reportTypes.map((report) => (
                <MuiMenuItem key={report.id} value={report.id}>
                  {report.name}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl style={{ minWidth: 150 }} size="small">
            <InputLabel style={{ color: themeColors.secondary_text }}>
              Time Range
            </InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
              style={{
                color: themeColors.primary_text,
                backgroundColor: themeColors.primary_bg,
              }}
            >
              <MuiMenuItem value="7d">Last 7 Days</MuiMenuItem>
              <MuiMenuItem value="30d">Last 30 Days</MuiMenuItem>
              <MuiMenuItem value="90d">Last 90 Days</MuiMenuItem>
              <MuiMenuItem value="1y">Last Year</MuiMenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
            style={{
              backgroundColor: currentReportType.color,
              color: "#fff",
            }}
          >
            Export
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {React.createElement(currentReportType.icon, {
            style: { color: currentReportType.color, fontSize: 28 },
          })}
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: themeColors.primary_text }}
            >
              {currentReportType.name}
            </h3>
            <p
              className="text-sm"
              style={{ color: themeColors.secondary_text }}
            >
              {currentReportType.description}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(currentReportData.summary).map(([key, value]) => (
          <div
            key={key}
            className="p-4 rounded-lg"
            style={{ backgroundColor: themeColors.card_bg }}
          >
            <p
              className="text-sm mb-1 capitalize"
              style={{ color: themeColors.secondary_text }}
            >
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: themeColors.primary_text }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Report Details Table */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: themeColors.card_bg }}
      >
        <h3
          className="text-xl font-semibold mb-4"
          style={{ color: themeColors.primary_text }}
        >
          Detailed Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `2px solid ${themeColors.border}` }}>
                {Object.keys(currentReportData.details[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left capitalize"
                    style={{ color: themeColors.secondary_text }}
                  >
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentReportData.details.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: `1px solid ${themeColors.border}`,
                  }}
                >
                  {Object.entries(row).map(([key, value]) => (
                    <td
                      key={key}
                      className="px-4 py-3"
                      style={{ color: themeColors.primary_text }}
                    >
                      {typeof value === "string" &&
                      value.startsWith("+") ? (
                        <Chip
                          label={value}
                          size="small"
                          style={{
                            backgroundColor: "#4caf50",
                            color: "#fff",
                          }}
                        />
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
