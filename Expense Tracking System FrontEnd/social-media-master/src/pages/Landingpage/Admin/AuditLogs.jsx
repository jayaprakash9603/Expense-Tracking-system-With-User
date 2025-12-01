import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  TextField,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import { getThemeColors } from "../../../config/themeConfig";
import "./AdminPanel.css";

const AuditLogs = () => {
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Static audit logs data
  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-12-01 14:30:25",
      type: "info",
      severity: "info",
      user: "admin@example.com",
      action: "User Login",
      description: "User logged in successfully from IP 192.168.1.100",
      module: "Authentication",
    },
    {
      id: 2,
      timestamp: "2024-12-01 14:25:18",
      type: "success",
      severity: "info",
      user: "john.doe@example.com",
      action: "Expense Created",
      description: "Created new expense: $125.50 for Food & Dining",
      module: "Expenses",
    },
    {
      id: 3,
      timestamp: "2024-12-01 14:20:45",
      type: "warning",
      severity: "warning",
      user: "jane.smith@example.com",
      action: "Failed Login Attempt",
      description: "Multiple failed login attempts detected (3 attempts)",
      module: "Security",
    },
    {
      id: 4,
      timestamp: "2024-12-01 14:15:30",
      type: "error",
      severity: "error",
      user: "System",
      action: "Database Connection Error",
      description: "Temporary database connection issue - automatically resolved",
      module: "System",
    },
    {
      id: 5,
      timestamp: "2024-12-01 14:10:12",
      type: "info",
      severity: "info",
      user: "admin@example.com",
      action: "Role Updated",
      description: "Updated role permissions for MODERATOR role",
      module: "Role Management",
    },
    {
      id: 6,
      timestamp: "2024-12-01 14:05:55",
      type: "success",
      severity: "info",
      user: "mike.johnson@example.com",
      action: "Budget Created",
      description: "Created new budget: Monthly Groceries - $500.00",
      module: "Budgets",
    },
    {
      id: 7,
      timestamp: "2024-12-01 14:00:33",
      type: "warning",
      severity: "warning",
      user: "sarah.williams@example.com",
      action: "Budget Exceeded",
      description: "Budget threshold exceeded: Transportation budget at 95%",
      module: "Budgets",
    },
    {
      id: 8,
      timestamp: "2024-12-01 13:55:20",
      type: "info",
      severity: "info",
      user: "admin@example.com",
      action: "User Created",
      description: "New user registered: david.brown@example.com",
      module: "User Management",
    },
    {
      id: 9,
      timestamp: "2024-12-01 13:50:15",
      type: "error",
      severity: "error",
      user: "System",
      action: "API Rate Limit",
      description: "API rate limit exceeded for IP 203.0.113.45",
      module: "Security",
    },
    {
      id: 10,
      timestamp: "2024-12-01 13:45:08",
      type: "success",
      severity: "info",
      user: "john.doe@example.com",
      action: "Category Created",
      description: "Created new category: Online Shopping",
      module: "Categories",
    },
  ];

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "info":
        return <InfoIcon fontSize="small" />;
      case "warning":
        return <WarningIcon fontSize="small" />;
      case "error":
        return <ErrorIcon fontSize="small" />;
      case "success":
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "info":
        return "#2196f3";
      case "warning":
        return "#ff9800";
      case "error":
        return "#f44336";
      case "success":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSeverity =
      filterSeverity === "all" || log.severity === filterSeverity;
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  // Stats
  const stats = {
    total: auditLogs.length,
    info: auditLogs.filter((l) => l.severity === "info").length,
    warning: auditLogs.filter((l) => l.severity === "warning").length,
    error: auditLogs.filter((l) => l.severity === "error").length,
  };

  return (
    <div
      className="admin-panel-container"
      style={{
        backgroundColor: themeColors.secondary_bg,
        color: themeColors.primary_text,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: themeColors.primary_text }}
        >
          Audit Logs
        </h1>
        <p style={{ color: themeColors.secondary_text }}>
          Track and monitor system activities and security events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: themeColors.secondary_text }}
          >
            Total Logs
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: themeColors.primary_text }}
          >
            {stats.total}
          </p>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: themeColors.secondary_text }}
          >
            Info
          </p>
          <p className="text-2xl font-bold" style={{ color: "#2196f3" }}>
            {stats.info}
          </p>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: themeColors.secondary_text }}
          >
            Warnings
          </p>
          <p className="text-2xl font-bold" style={{ color: "#ff9800" }}>
            {stats.warning}
          </p>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: themeColors.secondary_text }}
          >
            Errors
          </p>
          <p className="text-2xl font-bold" style={{ color: "#f44336" }}>
            {stats.error}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="p-4 rounded-lg mb-6"
        style={{ backgroundColor: themeColors.card_bg }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <TextField
            placeholder="Search logs by action, user, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            className="flex-1"
            InputProps={{
              startAdornment: <SearchIcon className="mr-2" />,
              style: {
                color: themeColors.primary_text,
                backgroundColor: themeColors.primary_bg,
              },
            }}
          />
          <FormControl size="small" style={{ minWidth: 150 }}>
            <InputLabel style={{ color: themeColors.secondary_text }}>
              Severity
            </InputLabel>
            <Select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              label="Severity"
              style={{
                color: themeColors.primary_text,
                backgroundColor: themeColors.primary_bg,
              }}
            >
              <MuiMenuItem value="all">All Severity</MuiMenuItem>
              <MuiMenuItem value="info">Info</MuiMenuItem>
              <MuiMenuItem value="warning">Warning</MuiMenuItem>
              <MuiMenuItem value="error">Error</MuiMenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: themeColors.card_bg,
              borderLeftColor: getSeverityColor(log.severity),
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div style={{ color: getSeverityColor(log.severity) }}>
                  {getSeverityIcon(log.severity)}
                </div>
                <div>
                  <h4
                    className="font-semibold"
                    style={{ color: themeColors.primary_text }}
                  >
                    {log.action}
                  </h4>
                  <p
                    className="text-sm mt-1"
                    style={{ color: themeColors.secondary_text }}
                  >
                    {log.description}
                  </p>
                </div>
              </div>
              <Chip
                label={log.severity.toUpperCase()}
                size="small"
                style={{
                  backgroundColor: getSeverityColor(log.severity),
                  color: "#fff",
                }}
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span style={{ color: themeColors.secondary_text }}>
                <strong>Timestamp:</strong> {log.timestamp}
              </span>
              <span style={{ color: themeColors.secondary_text }}>
                <strong>User:</strong> {log.user}
              </span>
              <span style={{ color: themeColors.secondary_text }}>
                <strong>Module:</strong> {log.module}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogs;
