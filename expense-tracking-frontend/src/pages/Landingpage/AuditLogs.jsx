import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../hooks/useTheme";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import {
  Email as EmailIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  getAllAuditLogs,
  getAuditLogsByFilter,
  sendAuditLogsByEmail,
} from "../../Redux/Audits/auditLogs.action";

const AuditLogs = () => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { auditLogs, loading, error } = useSelector(
    (state) => state.auditLogs || {},
  );

  // State for filters
  const [filters, setFilters] = useState({
    logType: "all",
    actionType: "",
    expenseId: "",
    startDate: "",
    endDate: "",
    specificDate: "",
    timeRange: "",
    customValue: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  // State for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Log type options
  const logTypeOptions = [
    { value: "all", label: "All Audit Logs" },
    { value: "today", label: "Today Logs" },
    { value: "yesterday", label: "Yesterday Logs" },
    { value: "current-week", label: "Current Week Logs" },
    { value: "last-week", label: "Last Week Logs" },
    { value: "current-month", label: "Current Month Logs" },
    { value: "last-month", label: "Last Month Logs" },
    { value: "current-year", label: "Current Year Logs" },
    { value: "last-year", label: "Last Year Logs" },
    { value: "specific-date", label: "Logs for Specific Day" },
    { value: "specific-year", label: "Logs for Specific Year" },
    { value: "specific-month", label: "Logs for Specific Month" },
    { value: "action-type", label: "Logs by Action Type" },
    { value: "expense-id", label: "Logs by Expense ID" },
    { value: "time-range", label: "Logs by Time Range" },
    { value: "last-5-minutes", label: "Logs from Last 5 Minutes" },
  ];

  const actionTypes = ["create", "update", "delete", "read", "report"];
  const timeRangeOptions = [
    { value: "minutes", label: "Last N Minutes" },
    { value: "hours", label: "Last N Hours" },
    { value: "days", label: "Last N Days" },
    { value: "seconds", label: "Last N Seconds" },
  ];

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = () => {
    dispatch(getAllAuditLogs());
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    const filterParams = { ...filters };
    dispatch(getAuditLogsByFilter(filterParams));
  };

  const clearFilters = () => {
    setFilters({
      logType: "all",
      actionType: "",
      expenseId: "",
      startDate: "",
      endDate: "",
      specificDate: "",
      timeRange: "",
      customValue: "",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });
    setSearchTerm("");
    loadAuditLogs();
  };

  const handleEmailSend = async () => {
    if (!emailAddress) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      await dispatch(sendAuditLogsByEmail(emailAddress, filters));
      toast.success("Audit logs sent successfully!");
      setEmailDialog(false);
      setEmailAddress("");
    } catch (error) {
      toast.error("Failed to send email");
    }
  };

  const filteredLogs =
    auditLogs?.filter((log) => {
      if (!searchTerm) return true;
      return (
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.expenseId?.toString().includes(searchTerm)
      );
    }) || [];

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionTypeColor = (actionType) => {
    const colors = {
      create: "success",
      update: "warning",
      delete: "error",
      read: "info",
      report: "primary",
    };
    return colors[actionType] || "default";
  };

  const renderFilterInputs = () => {
    switch (filters.logType) {
      case "specific-date":
        return (
          <TextField
            label="Select Date"
            type="date"
            value={filters.specificDate}
            onChange={(e) => handleFilterChange("specificDate", e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        );

      case "specific-year":
        return (
          <TextField
            label="Year"
            type="number"
            value={filters.year}
            onChange={(e) =>
              handleFilterChange("year", parseInt(e.target.value))
            }
            size="small"
            fullWidth
          />
        );

      case "specific-month":
        return (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Year"
                type="number"
                value={filters.year}
                onChange={(e) =>
                  handleFilterChange("year", parseInt(e.target.value))
                }
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl size="small" fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={filters.month}
                  onChange={(e) => handleFilterChange("month", e.target.value)}
                  label="Month"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case "action-type":
        return (
          <FormControl size="small" fullWidth>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={filters.actionType}
              onChange={(e) => handleFilterChange("actionType", e.target.value)}
              label="Action Type"
            >
              {actionTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "expense-id":
        return (
          <TextField
            label="Expense ID"
            type="number"
            value={filters.expenseId}
            onChange={(e) => handleFilterChange("expenseId", e.target.value)}
            size="small"
            fullWidth
          />
        );

      case "time-range":
        return (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl size="small" fullWidth>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={filters.timeRange}
                  onChange={(e) =>
                    handleFilterChange("timeRange", e.target.value)
                  }
                  label="Time Range"
                >
                  {timeRangeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Value"
                type="number"
                value={filters.customValue}
                onChange={(e) =>
                  handleFilterChange("customValue", e.target.value)
                }
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const renderStatsCards = () => {
    if (!auditLogs || auditLogs.length === 0) return null;

    const stats = {
      total: auditLogs.length,
      create: auditLogs.filter((log) => log.actionType === "create").length,
      update: auditLogs.filter((log) => log.actionType === "update").length,
      delete: auditLogs.filter((log) => log.actionType === "delete").length,
      read: auditLogs.filter((log) => log.actionType === "read").length,
      report: auditLogs.filter((log) => log.actionType === "report").length,
    };

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Logs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="success.main">
                {stats.create}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Create
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="warning.main">
                {stats.update}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Update
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="error.main">
                {stats.delete}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Delete
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="info.main">
                {stats.read}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Read
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="secondary.main">
                {stats.report}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Report
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <AssignmentIcon color="primary" />
          Audit Logs
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh Logs">
            <IconButton onClick={loadAuditLogs} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send via Email">
            <IconButton onClick={() => setEmailDialog(true)} color="primary">
              <EmailIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            backgroundColor: "rgba(244, 67, 54, 0.12)",
            border: "1px solid rgba(244, 67, 54, 0.3)",
            color: "#fff",
            "& .MuiAlert-icon": {
              color: "#f44336",
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters Section */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <FilterIcon />
            Filter Options
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Log Type</InputLabel>
                <Select
                  value={filters.logType}
                  onChange={(e) =>
                    handleFilterChange("logType", e.target.value)
                  }
                  label="Log Type"
                >
                  {logTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              {renderFilterInputs()}
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  height: "100%",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="contained"
                  onClick={applyFilters}
                  sx={{ minHeight: "40px" }}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  sx={{ minHeight: "40px" }}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Search Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: colors.primary_bg,
          color: colors.primary_text,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search logs by details, action type, or expense ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
        />
      </Paper>

      {/* Audit Logs Table */}
      <Paper
        sx={{ backgroundColor: colors.primary_bg, color: colors.primary_text }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Expense ID</TableCell>
                    <TableCell>Action Type</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User Index</TableCell>
                    <TableCell>Expense Index</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>
                          {log.expenseId ? (
                            <Chip
                              label={log.expenseId}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.actionType}
                            size="small"
                            color={getActionTypeColor(log.actionType)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300 }}>
                            {log.details}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TimeIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatTimestamp(log.timestamp)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <PersonIcon fontSize="small" color="action" />
                            {log.userAuditIndex}
                          </Box>
                        </TableCell>
                        <TableCell>{log.expenseAuditIndex}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography
                          variant="body1"
                          color="textSecondary"
                          sx={{ py: 4 }}
                        >
                          No audit logs found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredLogs.length}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                backgroundColor: colors.primary_bg,
                color: colors.primary_text,
                "& .MuiTablePagination-toolbar": {
                  color: colors.primary_text,
                },
                "& .MuiTablePagination-selectLabel": {
                  color: colors.primary_text,
                },
                "& .MuiTablePagination-displayedRows": {
                  color: colors.primary_text,
                },
                "& .MuiSvgIcon-root": {
                  color: colors.primary_text,
                },
              }}
            />
          </>
        )}
      </Paper>

      {/* Email Dialog */}
      <Dialog
        open={emailDialog}
        onClose={() => setEmailDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EmailIcon />
            Send Audit Logs via Email
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="Enter recipient email address"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Current filters will be applied to the exported logs.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEmailSend}
            variant="contained"
            startIcon={<EmailIcon />}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogs;
