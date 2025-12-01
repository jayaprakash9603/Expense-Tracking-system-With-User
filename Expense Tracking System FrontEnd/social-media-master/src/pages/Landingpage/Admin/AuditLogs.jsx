import React, { useState } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  AdminPanelContainer,
  AdminPageHeader,
  SectionCard,
} from "./components";
import { formatRelativeTime, formatDate } from "./utils/adminUtils";

const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("7d");

  // Static audit log data
  const auditLogs = [
    {
      id: 1,
      user: "John Doe",
      action: "Created User",
      details: "Created new user: jane.smith@example.com",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "USER_MANAGEMENT",
      ipAddress: "192.168.1.100",
    },
    {
      id: 2,
      user: "Admin User",
      action: "Updated Role",
      details: "Modified permissions for MODERATOR role",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: "ROLE_MANAGEMENT",
      ipAddress: "192.168.1.101",
    },
    {
      id: 3,
      user: "Jane Smith",
      action: "Deleted Expense",
      details: "Deleted expense #12345",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: "DATA_MODIFICATION",
      ipAddress: "192.168.1.102",
    },
    {
      id: 4,
      user: "Mike Johnson",
      action: "Login",
      details: "Successful login",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: "AUTHENTICATION",
      ipAddress: "192.168.1.103",
    },
    {
      id: 5,
      user: "Sarah Williams",
      action: "Export Report",
      details: "Exported expense report for January 2024",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      type: "REPORT_GENERATION",
      ipAddress: "192.168.1.104",
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case "USER_MANAGEMENT":
        return "#2196f3";
      case "ROLE_MANAGEMENT":
        return "#9c27b0";
      case "DATA_MODIFICATION":
        return "#ff9800";
      case "AUTHENTICATION":
        return "#4caf50";
      case "REPORT_GENERATION":
        return "#00bcd4";
      default:
        return "#757575";
    }
  };

  return (
    <AdminPanelContainer>
      {/* Page Header */}
      <AdminPageHeader
        title="Audit Logs"
        description="Track system activities and user actions"
        actions={
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            style={{
              backgroundColor: "#14b8a6",
              color: "#fff",
            }}
          >
            Export Logs
          </Button>
        }
      />

      {/* Filters Section */}
      <SectionCard title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon className="mr-2" />,
            }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Action Type"
            >
              <MuiMenuItem value="all">All Types</MuiMenuItem>
              <MuiMenuItem value="USER_MANAGEMENT">User Management</MuiMenuItem>
              <MuiMenuItem value="ROLE_MANAGEMENT">Role Management</MuiMenuItem>
              <MuiMenuItem value="DATA_MODIFICATION">Data Modification</MuiMenuItem>
              <MuiMenuItem value="AUTHENTICATION">Authentication</MuiMenuItem>
              <MuiMenuItem value="REPORT_GENERATION">Report Generation</MuiMenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              label="Time Range"
            >
              <MuiMenuItem value="24h">Last 24 Hours</MuiMenuItem>
              <MuiMenuItem value="7d">Last 7 Days</MuiMenuItem>
              <MuiMenuItem value="30d">Last 30 Days</MuiMenuItem>
              <MuiMenuItem value="90d">Last 90 Days</MuiMenuItem>
            </Select>
          </FormControl>
        </div>
      </SectionCard>

      {/* Audit Logs Table */}
      <SectionCard title={`Audit Logs (${filteredLogs.length})`} className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-700">
                  <td className="px-6 py-4 text-sm opacity-70">
                    {formatRelativeTime(log.timestamp)}
                    <br />
                    <span className="text-xs opacity-50">{formatDate(log.timestamp)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{log.user}</td>
                  <td className="px-6 py-4 text-sm font-medium">{log.action}</td>
                  <td className="px-6 py-4 text-sm opacity-70">{log.details}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: getTypeColor(log.type) + "20",
                        color: getTypeColor(log.type),
                      }}
                    >
                      {log.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm opacity-70 font-mono">
                    {log.ipAddress}
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

export default AuditLogs;
