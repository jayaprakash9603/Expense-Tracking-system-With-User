/**
 * CreateStory Page
 * Full page component for creating new stories with media upload support
 */
import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  Card,
  CardMedia,
} from "@mui/material";
import {
  Add,
  Delete,
  CloudUpload,
  Image as ImageIcon,
  Videocam,
  Close,
  AutoStories,
  ArrowBack,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { api } from "../../config/api";
import {
  uploadMediaToCloudinary,
  validateMediaFile,
  getMediaType,
} from "../../utils/uploadMediaToCloudinary";
import PageHeader from "../../components/PageHeader";

// Story types and options
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

const CreateStory = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    storyType: "ANNOUNCEMENT",
    severity: "INFO",
    imageUrl: "",
    videoUrl: "",
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

  // Upload state
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Determine media type
    const type = getMediaType(file);
    if (!type) {
      showSnackbar("Please select a valid image or video file", "error");
      return;
    }

    // Validate file
    const validation = await validateMediaFile(file, type);
    if (!validation.valid) {
      showSnackbar(validation.error, "error");
      return;
    }

    setMediaType(type);
    setUploadError(null);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);

    // Upload to Cloudinary
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadMediaToCloudinary(file, type, (progress) => {
        setUploadProgress(progress);
      });

      if (result) {
        if (type === "image") {
          handleFormChange("imageUrl", result.url);
          handleFormChange("videoUrl", "");
        } else {
          handleFormChange("videoUrl", result.url);
          handleFormChange("imageUrl", "");
          // Set duration from video if available
          if (result.duration) {
            handleFormChange(
              "durationSeconds",
              Math.min(Math.ceil(result.duration), 60),
            );
          }
        }
        showSnackbar(
          `${type === "image" ? "Image" : "Video"} uploaded successfully!`,
          "success",
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message);
      showSnackbar(error.message || "Failed to upload media", "error");
      // Clear preview on error
      setMediaPreview(null);
      setMediaType(null);
    } finally {
      setIsUploading(false);
    }

    // Clear input
    event.target.value = "";
  };

  // Remove media
  const handleRemoveMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
    setMediaType(null);
    setUploadProgress(0);
    setUploadError(null);
    handleFormChange("imageUrl", "");
    handleFormChange("videoUrl", "");
  };

  // CTA Button handlers
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

  const removeCtaButton = (index) => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: prev.ctaButtons.filter((_, i) => i !== index),
    }));
  };

  const updateCtaButton = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: prev.ctaButtons.map((cta, i) =>
        i === index ? { ...cta, [field]: value } : cta,
      ),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showSnackbar("Title is required", "error");
      return;
    }

    if (!formData.content.trim()) {
      showSnackbar("Content is required", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/api/admin/stories", formData);
      showSnackbar("Story created successfully!", "success");

      // Navigate back after short delay
      setTimeout(() => {
        navigate("/admin/stories");
      }, 1000);
    } catch (error) {
      console.error("Error creating story:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to create story",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate("/admin/stories");
  };

  return (
    <div style={{ backgroundColor: colors.primary_bg, minHeight: "100vh" }}>
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col sm:w-full"
        style={{
          minHeight: "calc(100vh - 100px)",
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: `1px solid ${colors.border_color}`,
          padding: "24px",
          marginRight: "20px",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <PageHeader
          title="Create New Story"
          onClose={handleClose}
          icon={<AutoStories sx={{ fontSize: 28, color: colors.primary }} />}
        />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Left Column - Form Fields */}
            <Grid item xs={12} md={7}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: colors.card_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 3, fontWeight: 600, color: colors.primary_text }}
                >
                  Story Details
                </Typography>

                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <TextField
                    label="Title"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    fullWidth
                    required
                    InputProps={{
                      style: { color: colors.primary_text },
                    }}
                    InputLabelProps={{
                      style: { color: colors.secondary_text },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: colors.border_color },
                        "&:hover fieldset": { borderColor: colors.primary },
                      },
                    }}
                  />

                  <TextField
                    label="Content"
                    value={formData.content}
                    onChange={(e) =>
                      handleFormChange("content", e.target.value)
                    }
                    fullWidth
                    multiline
                    rows={4}
                    required
                    InputProps={{
                      style: { color: colors.primary_text },
                    }}
                    InputLabelProps={{
                      style: { color: colors.secondary_text },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: colors.border_color },
                        "&:hover fieldset": { borderColor: colors.primary },
                      },
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: colors.secondary_text }}>
                          Story Type
                        </InputLabel>
                        <Select
                          value={formData.storyType}
                          label="Story Type"
                          onChange={(e) =>
                            handleFormChange("storyType", e.target.value)
                          }
                          sx={{ color: colors.primary_text }}
                        >
                          {STORY_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: colors.secondary_text }}>
                          Severity
                        </InputLabel>
                        <Select
                          value={formData.severity}
                          label="Severity"
                          onChange={(e) =>
                            handleFormChange("severity", e.target.value)
                          }
                          sx={{ color: colors.primary_text }}
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

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Background Gradient (CSS)"
                        value={formData.backgroundGradient}
                        onChange={(e) =>
                          handleFormChange("backgroundGradient", e.target.value)
                        }
                        fullWidth
                        placeholder="linear-gradient(135deg, #667eea, #764ba2)"
                        InputProps={{
                          style: { color: colors.primary_text },
                        }}
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
                            parseInt(e.target.value) || 5,
                          )
                        }
                        fullWidth
                        inputProps={{ min: 1, max: 60 }}
                        InputProps={{
                          style: { color: colors.primary_text },
                        }}
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
                            parseInt(e.target.value) || 24,
                          )
                        }
                        fullWidth
                        inputProps={{ min: 1, max: 168 }}
                        InputProps={{
                          style: { color: colors.primary_text },
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Priority"
                        type="number"
                        value={formData.priority}
                        onChange={(e) =>
                          handleFormChange(
                            "priority",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        fullWidth
                        inputProps={{ min: 0, max: 100 }}
                        InputProps={{
                          style: { color: colors.primary_text },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isGlobal}
                          onChange={(e) =>
                            handleFormChange("isGlobal", e.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          sx={{ color: colors.primary_text }}
                        >
                          Global Story (visible to all users)
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.autoActivate}
                          onChange={(e) =>
                            handleFormChange("autoActivate", e.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          sx={{ color: colors.primary_text }}
                        >
                          Auto Activate
                        </Typography>
                      }
                    />
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
                      InputProps={{
                        style: { color: colors.primary_text },
                      }}
                    />
                  )}
                </Box>
              </Paper>

              {/* CTA Buttons Section */}
              <Paper
                sx={{
                  p: 3,
                  mt: 3,
                  backgroundColor: colors.card_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.primary_text }}
                  >
                    CTA Buttons
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={addCtaButton}
                    variant="outlined"
                  >
                    Add Button
                  </Button>
                </Box>

                {formData.ctaButtons.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.secondary_text,
                      textAlign: "center",
                      py: 2,
                    }}
                  >
                    No CTA buttons added. Click "Add Button" to create one.
                  </Typography>
                ) : (
                  formData.ctaButtons.map((cta, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: colors.primary_bg,
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
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
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={cta.ctaType}
                              label="Type"
                              onChange={(e) =>
                                updateCtaButton(
                                  index,
                                  "ctaType",
                                  e.target.value,
                                )
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
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="Route Path"
                            value={cta.routePath}
                            onChange={(e) =>
                              updateCtaButton(
                                index,
                                "routePath",
                                e.target.value,
                              )
                            }
                            fullWidth
                            size="small"
                            placeholder="/budgets/1"
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
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
                        <Grid item xs={6} sm={1}>
                          <IconButton
                            color="error"
                            onClick={() => removeCtaButton(index)}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))
                )}
              </Paper>
            </Grid>

            {/* Right Column - Media Upload & Preview */}
            <Grid item xs={12} md={5}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: colors.card_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 3, fontWeight: 600, color: colors.primary_text }}
                >
                  Media Upload
                </Typography>

                {/* Upload Area */}
                <Box
                  sx={{
                    border: `2px dashed ${uploadError ? "#f44336" : colors.border_color}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: "center",
                    cursor: isUploading ? "not-allowed" : "pointer",
                    backgroundColor: colors.primary_bg,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: isUploading
                        ? colors.border_color
                        : colors.primary,
                      backgroundColor: isUploading
                        ? colors.primary_bg
                        : `${colors.primary}10`,
                    },
                  }}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    disabled={isUploading}
                  />

                  {isUploading ? (
                    <Box>
                      <CloudUpload
                        sx={{ fontSize: 48, color: colors.primary, mb: 2 }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ color: colors.primary_text, mb: 2 }}
                      >
                        Uploading {mediaType}...
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{ mb: 1, borderRadius: 1 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: colors.secondary_text }}
                      >
                        {uploadProgress}%
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <ImageIcon
                          sx={{ fontSize: 36, color: colors.secondary_text }}
                        />
                        <Videocam
                          sx={{ fontSize: 36, color: colors.secondary_text }}
                        />
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{ color: colors.primary_text, mb: 1 }}
                      >
                        Click to upload image or video
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.secondary_text }}
                      >
                        Images: JPEG, PNG, GIF, WebP (max 10MB)
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.secondary_text }}
                      >
                        Videos: MP4, WebM, MOV (max 1 minute, 100MB)
                      </Typography>
                    </Box>
                  )}
                </Box>

                {uploadError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {uploadError}
                  </Alert>
                )}

                {/* Media Preview */}
                {mediaPreview && !isUploading && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Chip
                        label={mediaType === "image" ? "Image" : "Video"}
                        color={mediaType === "image" ? "primary" : "secondary"}
                        size="small"
                        icon={
                          mediaType === "image" ? <ImageIcon /> : <Videocam />
                        }
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleRemoveMedia}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                    <Card
                      sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        backgroundColor: colors.primary_bg,
                      }}
                    >
                      {mediaType === "image" ? (
                        <CardMedia
                          component="img"
                          image={mediaPreview}
                          alt="Preview"
                          sx={{ maxHeight: 300, objectFit: "contain" }}
                        />
                      ) : (
                        <video
                          src={mediaPreview}
                          controls
                          style={{ width: "100%", maxHeight: 300 }}
                        />
                      )}
                    </Card>
                  </Box>
                )}

                {/* Story Preview */}
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, color: colors.secondary_text }}
                  >
                    Story Preview
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height: 400,
                      borderRadius: 3,
                      background:
                        formData.backgroundGradient || formData.backgroundColor,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 3,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Preview Image/Video */}
                    {(formData.imageUrl || formData.videoUrl) && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          "& img, & video": {
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          },
                        }}
                      >
                        {formData.imageUrl ? (
                          <img src={formData.imageUrl} alt="Story" />
                        ) : (
                          <video src={formData.videoUrl} autoPlay muted loop />
                        )}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(transparent 50%, rgba(0,0,0,0.7))",
                          }}
                        />
                      </Box>
                    )}

                    {/* Content Overlay */}
                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        textAlign: "center",
                        color: "#fff",
                        mt: "auto",
                        pb: 2,
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {formData.title || "Story Title"}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {formData.content ||
                          "Story content will appear here..."}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={isSubmitting}
              sx={{ minWidth: 120 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || isUploading}
              sx={{
                minWidth: 150,
                backgroundColor: colors.primary,
                "&:hover": { backgroundColor: colors.primary },
              }}
            >
              {isSubmitting ? "Creating..." : "Create Story"}
            </Button>
          </Box>
        </form>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CreateStory;
