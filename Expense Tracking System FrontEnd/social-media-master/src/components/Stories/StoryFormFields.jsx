/**
 * StoryFormFields Component
 * Shared form fields component for Create and Edit Story pages
 */
import React from "react";
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
  LinearProgress,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Delete,
  CloudUpload,
  Image as ImageIcon,
  Videocam,
  Close,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import {
  STORY_TYPES,
  SEVERITY_OPTIONS,
  CTA_TYPES,
} from "../../hooks/useStoryForm";

const StoryFormFields = ({
  formData,
  handleFormChange,
  // Media props
  mediaType,
  mediaPreview,
  uploadProgress,
  isUploading,
  uploadError,
  fileInputRef,
  handleFileSelect,
  handleRemoveMedia,
  // CTA props
  addCtaButton,
  removeCtaButton,
  updateCtaButton,
  // Submit props
  handleSubmit,
  handleClose,
  isSubmitting,
  isLoading,
  // Mode
  isEditMode = false,
}) => {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2} sx={{ mt: 0 }}>
        {/* Left Column - Form Fields */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: colors.card_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 600, color: colors.primary_text }}
            >
              Story Details
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                onChange={(e) => handleFormChange("content", e.target.value)}
                fullWidth
                multiline
                rows={3}
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
              p: 2,
              mt: 2,
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
                mb: 1.5,
              }}
            >
              <Typography
                variant="subtitle1"
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

            {!formData.ctaButtons || formData.ctaButtons.length === 0 ? (
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
                    <Grid item xs={12} sm={3}>
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
              p: 2,
              backgroundColor: colors.card_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 600, color: colors.primary_text }}
            >
              Media Upload
            </Typography>

            {/* Upload Area with Preview */}
            <Box
              sx={{
                border: `2px dashed ${uploadError ? "#f44336" : colors.border_color}`,
                borderRadius: 2,
                textAlign: "center",
                cursor: isUploading ? "not-allowed" : "pointer",
                backgroundColor: colors.primary_bg,
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                height: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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

              {/* Media Preview Background */}
              {mediaPreview && !isUploading && (
                <>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#000",
                    }}
                  >
                    {mediaType === "image" ? (
                      <Box
                        component="img"
                        src={mediaPreview}
                        alt="Preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </Box>
                  {/* Overlay for upload icon */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                      "&:hover": {
                        opacity: 1,
                      },
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: "#fff", mb: 1 }} />
                    <Typography variant="body2" sx={{ color: "#fff" }}>
                      Click to replace
                    </Typography>
                  </Box>
                  {/* Media type badge and remove button */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      right: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      zIndex: 2,
                    }}
                  >
                    <Chip
                      label={mediaType === "image" ? "Image" : "Video"}
                      color={mediaType === "image" ? "primary" : "secondary"}
                      size="small"
                      icon={
                        mediaType === "image" ? <ImageIcon /> : <Videocam />
                      }
                      sx={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMedia();
                      }}
                      sx={{
                        backgroundColor: "rgba(244,67,54,0.8)",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "#f44336",
                        },
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </>
              )}

              {/* Uploading State */}
              {isUploading && (
                <Box sx={{ p: 2 }}>
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
                    sx={{ mb: 1, borderRadius: 1, width: 200, mx: "auto" }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.secondary_text }}
                  >
                    {uploadProgress}%
                  </Typography>
                </Box>
              )}

              {/* Empty State */}
              {!mediaPreview && !isUploading && (
                <Box sx={{ p: 2 }}>
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

            {/* Story Preview */}
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: colors.secondary_text }}
              >
                Story Preview
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 220,
                  borderRadius: 2,
                  background:
                    formData.backgroundGradient || formData.backgroundColor,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
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
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {formData.title || "Story Title"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {formData.content || "Story content will appear here..."}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
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
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Story"
              : "Create Story"}
        </Button>
      </Box>
    </form>
  );
};

export default StoryFormFields;
