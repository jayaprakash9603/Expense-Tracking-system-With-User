import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  Button,
  CircularProgress,
  Pagination,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  AdminPanelContainer,
  AdminPageHeader,
  SectionCard,
} from "./components";
import { formatRelativeTime, formatDate } from "./utils/adminUtils";
import {
  fetchAuditLogs,
  fetchAuditStats,
} from "../../../Redux/Admin/admin.action";

const AuditLogs = () => {
  const dispatch = useDispatch();
  const adminState = useSelector((state) => state.admin) || {};
  const auditLogs = adminState.auditLogs || {
    list: [],
    totalCount: 0,
    totalPages: 0,
    page: 0,
    loading: false,
    error: null,
    stats: null,
  };
  const {
    list: logs,
    totalCount,
    totalPages,
    page,
    loading,
    error,
    stats,
  } = auditLogs;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("7d");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch audit logs on mount and when filters change
  useEffect(() => {
    dispatch(
      fetchAuditLogs({
        page: currentPage - 1,
        size: pageSize,
        search: searchQuery,
        actionType: filterType,
        timeRange: filterDate,
      }),
    );
    dispatch(fetchAuditStats(filterDate));
  }, [dispatch, currentPage, filterDate]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== "") {
        dispatch(
          fetchAuditLogs({
            page: 0,
            size: pageSize,
            search: searchQuery,
            actionType: filterType,
            timeRange: filterDate,
          }),
        );
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
    dispatch(
      fetchAuditLogs({
        page: 0,
        size: pageSize,
        search: searchQuery,
        actionType: e.target.value,
        timeRange: filterDate,
      }),
    );
  };

  const handleFilterDateChange = (e) => {
    setFilterDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleRefresh = () => {
    dispatch(
      fetchAuditLogs({
        page: currentPage - 1,
        size: pageSize,
        search: searchQuery,
        actionType: filterType,
        timeRange: filterDate,
      }),
    );
    dispatch(fetchAuditStats(filterDate));
  };

  const handleExport = async () => {
    // Export functionality - can be implemented later
    console.log("Export audit logs");
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "USER_MANAGEMENT":
        return "#2196f3";
      case "ROLE_MANAGEMENT":
        return "#9c27b0";
      case "DATA_MODIFICATION":
      case "CREATE":
      case "UPDATE":
      case "DELETE":
        return "#ff9800";
      case "AUTHENTICATION":
      case "LOGIN":
      case "LOGOUT":
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
          <div className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              style={{
                borderColor: "#14b8a6",
                color: "#14b8a6",
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              style={{
                backgroundColor: "#14b8a6",
                color: "#fff",
              }}
            >
              Export Logs
            </Button>
          </div>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "rgba(20, 184, 166, 0.1)" }}
          >
            <p className="text-sm opacity-70">Total Logs</p>
            <p className="text-2xl font-bold" style={{ color: "#14b8a6" }}>
              {stats.totalLogs || 0}
            </p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "rgba(33, 150, 243, 0.1)" }}
          >
            <p className="text-sm opacity-70">User Management</p>
            <p className="text-2xl font-bold" style={{ color: "#2196f3" }}>
              {stats.userManagement || 0}
            </p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "rgba(255, 152, 0, 0.1)" }}
          >
            <p className="text-sm opacity-70">Data Changes</p>
            <p className="text-2xl font-bold" style={{ color: "#ff9800" }}>
              {stats.dataModification || 0}
            </p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
          >
            <p className="text-sm opacity-70">Authentication</p>
            <p className="text-2xl font-bold" style={{ color: "#4caf50" }}>
              {stats.authentication || 0}
            </p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "rgba(0, 188, 212, 0.1)" }}
          >
            <p className="text-sm opacity-70">Reports</p>
            <p className="text-2xl font-bold" style={{ color: "#00bcd4" }}>
              {stats.reportGeneration || 0}
            </p>
          </div>
        </div>
      )}

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
              onChange={handleFilterTypeChange}
              label="Action Type"
            >
              <MuiMenuItem value="all">All Types</MuiMenuItem>
              <MuiMenuItem value="USER_MANAGEMENT">User Management</MuiMenuItem>
              <MuiMenuItem value="ROLE_MANAGEMENT">Role Management</MuiMenuItem>
              <MuiMenuItem value="CREATE">Create</MuiMenuItem>
              <MuiMenuItem value="UPDATE">Update</MuiMenuItem>
              <MuiMenuItem value="DELETE">Delete</MuiMenuItem>
              <MuiMenuItem value="LOGIN">Login</MuiMenuItem>
              <MuiMenuItem value="LOGOUT">Logout</MuiMenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={filterDate}
              onChange={handleFilterDateChange}
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
      <SectionCard title={`Audit Logs (${totalCount || 0})`} className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress style={{ color: "#14b8a6" }} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-700">
                        <td className="px-6 py-4 text-sm opacity-70">
                          {formatRelativeTime(log.timestamp)}
                          <br />
                          <span className="text-xs opacity-50">
                            {formatDate(log.timestamp)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {log.username || "System"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {log.actionType}
                        </td>
                        <td
                          className="px-6 py-4 text-sm opacity-70 max-w-xs truncate"
                          title={log.details}
                        >
                          {log.details || log.description || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor:
                                getTypeColor(log.actionType || log.entityType) +
                                "20",
                              color: getTypeColor(
                                log.actionType || log.entityType,
                              ),
                            }}
                          >
                            {(log.entityType || log.actionType || "").replace(
                              /_/g,
                              " ",
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm opacity-70 font-mono">
                          {log.ipAddress || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center opacity-70"
                      >
                        No audit logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "#fff",
                    },
                    "& .Mui-selected": {
                      backgroundColor: "#14b8a6 !important",
                    },
                  }}
                />
              </div>
            )}
          </>
        )}
      </SectionCard>
    </AdminPanelContainer>
  );
};

export default AuditLogs;
