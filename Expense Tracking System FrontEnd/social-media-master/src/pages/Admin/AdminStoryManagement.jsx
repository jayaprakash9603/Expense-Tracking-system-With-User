/**
 * Admin Story Management Page
 * Allows admins to create, edit, delete, and manage system stories
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Archive,
  PlayArrow,
  Pause,
  Refresh,
  AutoStories,
  TrendingUp,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { api } from "../../config/api";
import AdminPanelContainer from "../Landingpage/Admin/components/AdminPanelContainer";
import ToastNotification from "../Landingpage/ToastNotification";

// Story types and severity options
const STORY_TYPES = [
  { value: "BUDGET_THRESHOLD_80", label: "Budget 80% Alert" },
  { value: "BUDGET_THRESHOLD_90", label: "Budget 90% Alert" },
  { value: "BUDGET_THRESHOLD_100", label: "Budget Exceeded" },
  { value: "BILL_REMINDER", label: "Bill Reminder" },
  { value: "BILL_OVERDUE", label: "Bill Overdue" },
  { value: "EXPENSE_SPIKE", label: "Expense Spike" },
  { value: "WEEKLY_SUMMARY", label: "Weekly Summary" },
  { value: "MONTHLY_SUMMARY", label: "Monthly Summary" },
  { value: "ACHIEVEMENT", label: "Achievement" },
  { value: "SAVINGS_GOAL", label: "Savings Goal" },
  { value: "TIP", label: "Financial Tip" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "SYSTEM_UPDATE", label: "System Update" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "CUSTOM", label: "Custom" },
];

const SEVERITY_OPTIONS = [
  { value: "INFO", label: "Info", color: "#2196f3" },
  { value: "SUCCESS", label: "Success", color: "#4caf50" },
  { value: "WARNING", label: "Warning", color: "#ff9800" },
  { value: "CRITICAL", label: "Critical", color: "#f44336" },
];

const STATUS_OPTIONS = [
  { value: "CREATED", label: "Created", color: "default" },
  { value: "ACTIVE", label: "Active", color: "success" },
  { value: "EXPIRED", label: "Expired", color: "warning" },
  { value: "ARCHIVED", label: "Archived", color: "error" },
];

const CTA_TYPES = [
  { value: "VIEW_REPORT", label: "View Report" },
  { value: "GO_TO_BUDGET", label: "Go to Budget" },
  { value: "VIEW_EXPENSE", label: "View Expense" },
  { value: "VIEW_BILL", label: "View Bill" },
  { value: "VIEW_CATEGORY", label: "View Category" },
  { value: "MANAGE_BUDGETS", label: "Manage Budgets" },
  { value: "ADD_EXPENSE", label: "Add Expense" },
  { value: "PAY_BILL", label: "Pay Bill" },
  { value: "LEARN_MORE", label: "Learn More" },
  { value: "DISMISS", label: "Dismiss" },
  { value: "CUSTOM", label: "Custom" },
];

const AdminStoryManagement = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    storyType: "ANNOUNCEMENT",
    severity: "INFO",
    imageUrl: "",
    backgroundColor: "#1a1a2e",
    backgroundGradient: "",
    durationSeconds: 5,
    expirationHours: 24,
    priority: 0,
    isGlobal: true,
    targetUserId: "",
    autoActivate: true,
    ctaButtons: [],
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    archived: 0,
  });

  // Fetch stories
  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/stories?page=${page}&size=${rowsPerPage}`;
      if (selectedStatus) {
        url = `/api/admin/stories/status/${selectedStatus}?page=${page}&size=${rowsPerPage}`;
      }

      const { data } = await api.get(url);
      setStories(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching stories:", error);
      showSnackbar("Failed to fetch stories", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedStatus]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const [active, expired, archived] = await Promise.all([
        api.get("/api/admin/stories/status/ACTIVE?page=0&size=1"),
        api.get("/api/admin/stories/status/EXPIRED?page=0&size=1"),
        api.get("/api/admin/stories/status/ARCHIVED?page=0&size=1"),
      ]);

      setStats({
        total:
          (active.data.totalElements || 0) +
          (expired.data.totalElements || 0) +
          (archived.data.totalElements || 0),
        active: active.data.totalElements || 0,
        expired: expired.data.totalElements || 0,
        archived: archived.data.totalElements || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStories();
    fetchStats();
  }, [fetchStories]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (story = null) => {
    if (story) {
      setEditingStory(story);
      setFormData({
        title: story.title || "",
        content: story.content || "",
        storyType: story.storyType || "ANNOUNCEMENT",
        severity: story.severity || "INFO",
        imageUrl: story.imageUrl || "",
        backgroundColor: story.backgroundColor || "#1a1a2e",
        backgroundGradient: story.backgroundGradient || "",
        durationSeconds: story.durationSeconds || 5,
        expirationHours: 24,
        priority: story.priority || 0,
        isGlobal: story.isGlobal ?? true,
        targetUserId: story.targetUserId || "",
        autoActivate: false,
        ctaButtons: story.ctaButtons || [],
      });
    } else {
      setEditingStory(null);
      setFormData({
        title: "",
        content: "",
        storyType: "ANNOUNCEMENT",
        severity: "INFO",
        imageUrl: "",
        backgroundColor: "#1a1a2e",
        backgroundGradient: "",
        durationSeconds: 5,
        expirationHours: 24,
        priority: 0,
        isGlobal: true,
        targetUserId: "",
        autoActivate: true,
        ctaButtons: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStory(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editingStory) {
        await api.put(`/api/admin/stories/${editingStory.id}`, formData);
        showSnackbar("Story updated successfully");
      } else {
        await api.post("/api/admin/stories", formData);
        showSnackbar("Story created successfully");
      }
      handleCloseDialog();
      fetchStories();
      fetchStats();
    } catch (error) {
      console.error("Error saving story:", error);
      showSnackbar("Failed to save story", "error");
    }
  };

  const handleDelete = async () => {
    if (!storyToDelete) return;

    try {
      await api.delete(`/api/admin/stories/${storyToDelete.id}`);
      showSnackbar("Story deleted successfully");
      setDeleteConfirmOpen(false);
      setStoryToDelete(null);
      fetchStories();
      fetchStats();
    } catch (error) {
      console.error("Error deleting story:", error);
      showSnackbar("Failed to delete story", "error");
    }
  };

  const handleActivate = async (storyId) => {
    try {
      await api.post(`/api/admin/stories/${storyId}/activate`);
      showSnackbar("Story activated successfully");
      fetchStories();
      fetchStats();
    } catch (error) {
      console.error("Error activating story:", error);
      showSnackbar("Failed to activate story", "error");
    }
  };

  const handleDeactivate = async (storyId) => {
    try {
      await api.post(`/api/admin/stories/${storyId}/deactivate`);
      showSnackbar("Story deactivated successfully");
      fetchStories();
      fetchStats();
    } catch (error) {
      console.error("Error deactivating story:", error);
      showSnackbar("Failed to deactivate story", "error");
    }
  };

  const handleArchive = async (storyId) => {
    try {
      await api.post(`/api/admin/stories/${storyId}/archive`);
      showSnackbar("Story archived successfully");
      fetchStories();
      fetchStats();
    } catch (error) {
      console.error("Error archiving story:", error);
      showSnackbar("Failed to archive story", "error");
    }
  };

  const handleUnarchive = async (storyId) => {
    try {
      await api.post(`/api/admin/stories/${storyId}/unarchive`);
      showSnackbar("Story unarchived successfully");
      fetchStories();
      fetchStats();
    } catch (error) {
      console.error("Error unarchiving story:", error);
      showSnackbar("Failed to unarchive story", "error");
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    const statuses = ["", "ACTIVE", "EXPIRED", "ARCHIVED"];
    setSelectedStatus(statuses[newValue]);
  };

  const getSeverityColor = (severity) => {
    const option = SEVERITY_OPTIONS.find((s) => s.value === severity);
    return option?.color || "#2196f3";
  };

  const getStatusChip = (status) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <Chip label={status} color={option?.color || "default"} size="small" />
    );
  };

  // Add CTA button
  const addCtaButton = () => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: [
        ...prev.ctaButtons,
        {
          label: "",
          ctaType: "CUSTOM",
          routePath: "",
          isPrimary: false,
          displayOrder: prev.ctaButtons.length,
        },
      ],
    }));
  };

  // Remove CTA button
  const removeCtaButton = (index) => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: prev.ctaButtons.filter((_, i) => i !== index),
    }));
  };

  // Update CTA button
  const updateCtaButton = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: prev.ctaButtons.map((cta, i) =>
        i === index ? { ...cta, [field]: value } : cta,
      ),
    }));
  };

  return (
    <AdminPanelContainer>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AutoStories sx={{ fontSize: 32, color: colors.primary }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: colors.primary_text }}
          >
            Story Management
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchStories();
              fetchStats();
            }}
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              "&:hover": {
                borderColor: colors.primary,
                backgroundColor: `${colors.primary}10`,
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/admin/stories/create")}
            sx={{
              backgroundColor: colors.primary,
              "&:hover": { backgroundColor: colors.primary },
            }}
          >
            Create Story
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              backgroundColor: colors.card_bg,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: colors.primary_text }}
              >
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                Total Stories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              backgroundColor: colors.card_bg,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#4caf50" }}
              >
                {stats.active}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              backgroundColor: colors.card_bg,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#ff9800" }}
              >
                {stats.expired}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                Expired
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              backgroundColor: colors.card_bg,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#9e9e9e" }}
              >
                {stats.archived}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                Archived
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper
        sx={{
          mb: 2,
          backgroundColor: colors.card_bg,
          border: `1px solid ${colors.border_color}`,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": { color: colors.secondary_text },
            "& .Mui-selected": { color: colors.primary },
            "& .MuiTabs-indicator": { backgroundColor: colors.primary },
          }}
        >
          <Tab label="All Stories" />
          <Tab label="Active" />
          <Tab label="Expired" />
          <Tab label="Archived" />
        </Tabs>
      </Paper>

      {/* Stories Table */}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: colors.card_bg,
          border: `1px solid ${colors.border_color}`,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stories.map((story) => (
              <TableRow key={story.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: getSeverityColor(story.severity),
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {story.title}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={story.storyType?.replace(/_/g, " ")}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={story.severity}
                    size="small"
                    sx={{
                      backgroundColor: getSeverityColor(story.severity),
                      color: "#fff",
                    }}
                  />
                </TableCell>
                <TableCell>{getStatusChip(story.status)}</TableCell>
                <TableCell>
                  {story.isGlobal ? (
                    <Chip label="Global" size="small" color="info" />
                  ) : (
                    <Chip label={`User: ${story.targetUserId}`} size="small" />
                  )}
                </TableCell>
                <TableCell>
                  {new Date(story.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {story.expiresAt
                    ? new Date(story.expiresAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(`/admin/stories/edit/${story.id}`)
                      }
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {story.status === "CREATED" && (
                    <Tooltip title="Activate">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleActivate(story.id)}
                      >
                        <PlayArrow fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {story.status === "ACTIVE" && (
                    <Tooltip title="Deactivate">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleDeactivate(story.id)}
                      >
                        <Pause fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {story.status !== "ARCHIVED" && (
                    <Tooltip title="Archive">
                      <IconButton
                        size="small"
                        onClick={() => handleArchive(story.id)}
                      >
                        <Archive fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {story.status === "ARCHIVED" && (
                    <Tooltip title="Unarchive">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleUnarchive(story.id)}
                      >
                        <PlayArrow fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setStoryToDelete(story);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {stories.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No stories found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStory ? "Edit Story" : "Create New Story"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Content"
              value={formData.content}
              onChange={(e) => handleFormChange("content", e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Story Type</InputLabel>
                  <Select
                    value={formData.storyType}
                    label="Story Type"
                    onChange={(e) =>
                      handleFormChange("storyType", e.target.value)
                    }
                  >
                    {STORY_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={formData.severity}
                    label="Severity"
                    onChange={(e) =>
                      handleFormChange("severity", e.target.value)
                    }
                  >
                    {SEVERITY_OPTIONS.map((sev) => (
                      <MenuItem key={sev.value} value={sev.value}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: sev.color,
                            }}
                          />
                          {sev.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Image URL (optional)"
              value={formData.imageUrl}
              onChange={(e) => handleFormChange("imageUrl", e.target.value)}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Background Color"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) =>
                    handleFormChange("backgroundColor", e.target.value)
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Background Gradient (CSS)"
                  value={formData.backgroundGradient}
                  onChange={(e) =>
                    handleFormChange("backgroundGradient", e.target.value)
                  }
                  fullWidth
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Duration (seconds)"
                  type="number"
                  value={formData.durationSeconds}
                  onChange={(e) =>
                    handleFormChange(
                      "durationSeconds",
                      parseInt(e.target.value),
                    )
                  }
                  fullWidth
                  inputProps={{ min: 1, max: 30 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Expiration (hours)"
                  type="number"
                  value={formData.expirationHours}
                  onChange={(e) =>
                    handleFormChange(
                      "expirationHours",
                      parseInt(e.target.value),
                    )
                  }
                  fullWidth
                  inputProps={{ min: 1, max: 168 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    handleFormChange("priority", parseInt(e.target.value))
                  }
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isGlobal}
                    onChange={(e) =>
                      handleFormChange("isGlobal", e.target.checked)
                    }
                  />
                }
                label="Global Story (visible to all users)"
              />
              {!editingStory && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.autoActivate}
                      onChange={(e) =>
                        handleFormChange("autoActivate", e.target.checked)
                      }
                    />
                  }
                  label="Auto Activate"
                />
              )}
            </Box>
            {!formData.isGlobal && (
              <TextField
                label="Target User ID"
                type="number"
                value={formData.targetUserId}
                onChange={(e) =>
                  handleFormChange("targetUserId", e.target.value)
                }
                fullWidth
              />
            )}

            {/* CTA Buttons Section */}
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  CTA Buttons
                </Typography>
                <Button size="small" startIcon={<Add />} onClick={addCtaButton}>
                  Add Button
                </Button>
              </Box>
              {formData.ctaButtons.map((cta, index) => (
                <Paper
                  key={index}
                  sx={{ p: 2, mb: 1, backgroundColor: colors.background }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <TextField
                        label="Label"
                        value={cta.label}
                        onChange={(e) =>
                          updateCtaButton(index, "label", e.target.value)
                        }
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={cta.ctaType}
                          label="Type"
                          onChange={(e) =>
                            updateCtaButton(index, "ctaType", e.target.value)
                          }
                        >
                          {CTA_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label="Route Path"
                        value={cta.routePath}
                        onChange={(e) =>
                          updateCtaButton(index, "routePath", e.target.value)
                        }
                        fullWidth
                        size="small"
                        placeholder="/budgets/1"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cta.isPrimary}
                            onChange={(e) =>
                              updateCtaButton(
                                index,
                                "isPrimary",
                                e.target.checked,
                              )
                            }
                            size="small"
                          />
                        }
                        label="Primary"
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton
                        color="error"
                        onClick={() => removeCtaButton(index)}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingStory ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the story "{storyToDelete?.title}
            "?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <ToastNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </AdminPanelContainer>
  );
};

export default AdminStoryManagement;
