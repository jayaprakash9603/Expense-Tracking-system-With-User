import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../hooks/useTheme";
import { useMediaQuery } from "@mui/material";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Grid,
  Divider,
  CircularProgress,
  Tooltip,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Work as WorkIcon,
  Cake as CakeIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { uploadToCloudinary } from "../../utils/uploadToCloudniry";
import {
  updateProfileAction,
  getProfileAction,
} from "../../Redux/Auth/auth.action";
import ToastNotification from "./ToastNotification";

const Profile = () => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { user, loading, error } = useSelector((state) => state.auth);
  const isSmallScreen = useMediaQuery("(max-width:900px)");

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    location: "",
    occupation: "",
    bio: "",
    dateOfBirth: "",
    profileImage: "",
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        location: user.location || "",
        occupation: user.occupation || "",
        bio: user.bio || "",
        dateOfBirth: user.dateOfBirth || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  // Load user profile on component mount
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt && !user) {
      dispatch(getProfileAction(jwt));
    }
  }, [dispatch, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSnackbar({
        open: true,
        message: "Please upload a valid image file",
        severity: "error",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "Image size should be less than 5MB",
        severity: "error",
      });
      return;
    }

    try {
      setImageUploading(true);
      const imageUrl = await uploadToCloudinary(file, "image");

      if (imageUrl) {
        setFormData((prev) => ({
          ...prev,
          profileImage: imageUrl,
        }));
        setSnackbar({
          open: true,
          message: "Image uploaded successfully!",
          severity: "success",
        });
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setSnackbar({
        open: true,
        message: "Failed to upload image. Please try again.",
        severity: "error",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Prepare update request - only send changed fields
      const updateRequest = {};

      if (formData.firstName !== user?.firstName)
        updateRequest.firstName = formData.firstName;
      if (formData.lastName !== user?.lastName)
        updateRequest.lastName = formData.lastName;
      if (formData.mobile !== user?.mobile)
        updateRequest.mobile = formData.mobile;
      if (formData.location !== user?.location)
        updateRequest.location = formData.location;
      if (formData.occupation !== user?.occupation)
        updateRequest.occupation = formData.occupation;
      if (formData.bio !== user?.bio) updateRequest.bio = formData.bio;
      if (formData.dateOfBirth !== user?.dateOfBirth)
        updateRequest.dateOfBirth = formData.dateOfBirth;
      if (formData.profileImage !== user?.profileImage)
        updateRequest.profileImage = formData.profileImage;

      if (Object.keys(updateRequest).length === 0) {
        // No changes made - just exit edit mode without any notification
        setIsEditMode(false);
        return;
      }

      await dispatch(updateProfileAction(updateRequest));

      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
      setIsEditMode(false);

      // Refresh profile data
      const jwt = localStorage.getItem("jwt");
      if (jwt) {
        dispatch(getProfileAction(jwt));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "Failed to update profile. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        location: user.location || "",
        occupation: user.occupation || "",
        bio: user.bio || "",
        dateOfBirth: user.dateOfBirth || "",
        profileImage: user.profileImage || "",
      });
    }
    setIsEditMode(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  if (loading && !user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 100px)",
          width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
          backgroundColor: colors.secondary_bg,
          borderRadius: isSmallScreen ? 0 : "8px",
          border: isSmallScreen ? "none" : `1px solid ${colors.border_color}`,
          marginRight: isSmallScreen ? 0 : "20px",
        }}
      >
        <CircularProgress sx={{ color: colors.primary_accent }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: colors.primary_bg,
        width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        borderRadius: isSmallScreen ? 0 : "8px",
        border: isSmallScreen ? "none" : `1px solid ${colors.border_color}`,
        mr: isSmallScreen ? 0 : "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Hero Section with Profile Image */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.primary_accent}15 0%, ${colors.primary_accent}05 100%)`,
          borderBottom: `1px solid ${colors.border_color}`,
          p: isSmallScreen ? 3 : 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `${colors.primary_accent}08`,
            filter: "blur(40px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: `${colors.primary_accent}10`,
            filter: "blur(30px)",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            alignItems: isSmallScreen ? "center" : "flex-start",
            gap: 3,
          }}
        >
          {/* Profile Image Section */}
          <Box sx={{ position: "relative", textAlign: "center" }}>
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
              }}
            >
              <Avatar
                src={formData.profileImage}
                sx={{
                  width: isSmallScreen ? 120 : 140,
                  height: isSmallScreen ? 120 : 140,
                  fontSize: "2.5rem",
                  backgroundColor: colors.primary_accent,
                  color: colors.button_text,
                  border: `4px solid ${colors.secondary_bg}`,
                  boxShadow: `0 8px 24px ${colors.primary_accent}40`,
                }}
              >
                {!formData.profileImage &&
                  getInitials(formData.firstName, formData.lastName)}
              </Avatar>
              {isEditMode && (
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    backgroundColor: colors.primary_accent,
                    color: colors.button_text,
                    width: 36,
                    height: 36,
                    boxShadow: `0 4px 12px ${colors.primary_accent}60`,
                    "&:hover": {
                      backgroundColor: colors.button_hover,
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s",
                  }}
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <CircularProgress
                      size={20}
                      sx={{ color: colors.button_text }}
                    />
                  ) : (
                    <PhotoCameraIcon fontSize="small" />
                  )}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </IconButton>
              )}
            </Box>
            {/* <Chip
              label="Active"
              size="small"
              sx={{
                mt: 1.5,
                backgroundColor: `${colors.primary_accent}33`,
                color: colors.primary_accent,
                fontWeight: 600,
                fontSize: "0.7rem",
                border: `1px solid ${colors.primary_accent}50`,
              }}
            /> */}
          </Box>

          {/* Profile Info Section */}
          <Box sx={{ flex: 1, textAlign: isSmallScreen ? "center" : "left" }}>
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              sx={{
                color: colors.primary_text,
                fontWeight: 700,
                mb: 0.5,
                letterSpacing: "-0.5px",
              }}
            >
              {formData.firstName} {formData.lastName}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.secondary_text,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                justifyContent: isSmallScreen ? "center" : "flex-start",
              }}
            >
              <EmailIcon sx={{ fontSize: "1.1rem" }} />
              {formData.email}
            </Typography>

            {/* Profile Stats */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: isSmallScreen ? "center" : "flex-start",
              }}
            >
              {formData.occupation && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    backgroundColor: colors.secondary_bg,
                    border: `1px solid ${colors.border_color}`,
                  }}
                >
                  <WorkIcon
                    sx={{ fontSize: "1rem", color: colors.primary_accent }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.primary_text, fontWeight: 500 }}
                  >
                    {formData.occupation}
                  </Typography>
                </Box>
              )}
              {formData.location && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    backgroundColor: colors.secondary_bg,
                    border: `1px solid ${colors.border_color}`,
                  }}
                >
                  <LocationOnIcon
                    sx={{ fontSize: "1rem", color: colors.primary_accent }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.primary_text, fontWeight: 500 }}
                  >
                    {formData.location}
                  </Typography>
                </Box>
              )}
              {user?.createdAt && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    backgroundColor: colors.secondary_bg,
                    border: `1px solid ${colors.border_color}`,
                  }}
                >
                  <CakeIcon
                    sx={{ fontSize: "1rem", color: colors.primary_accent }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: colors.primary_text, fontWeight: 500 }}
                  >
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
              )}
            </Box>

            {formData.bio && (
              <Typography
                variant="body2"
                sx={{
                  color: colors.secondary_text,
                  mt: 2,
                  fontStyle: "italic",
                  maxWidth: 500,
                }}
              >
                "{formData.bio}"
              </Typography>
            )}
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isSmallScreen ? "row" : "column",
              gap: 1,
            }}
          >
            {!isEditMode ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditMode(true)}
                size={isSmallScreen ? "small" : "medium"}
                sx={{
                  backgroundColor: colors.primary_accent,
                  color: colors.button_text,
                  fontWeight: 600,
                  px: 3,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${colors.primary_accent}40`,
                  "&:hover": {
                    backgroundColor: colors.button_hover,
                    transform: "translateY(-2px)",
                    boxShadow: `0 6px 16px ${colors.primary_accent}60`,
                  },
                  transition: "all 0.2s",
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                  size={isSmallScreen ? "small" : "medium"}
                  sx={{
                    backgroundColor: colors.primary_accent,
                    color: colors.button_text,
                    fontWeight: 600,
                    px: 3,
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: colors.button_hover,
                    },
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  size={isSmallScreen ? "small" : "medium"}
                  sx={{
                    borderColor: colors.border_color,
                    color: colors.secondary_text,
                    fontWeight: 600,
                    px: 3,
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: colors.primary_accent,
                      backgroundColor: `${colors.primary_accent}15`,
                    },
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Content Section */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: isSmallScreen ? 2 : 3,
          backgroundColor: colors.secondary_bg,
        }}
      >
        <Grid container spacing={isSmallScreen ? 2 : 3}>
          {/* Personal Information Card */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: isSmallScreen ? 2 : 3,
                backgroundColor: colors.tertiary_bg,
                border: `1px solid ${colors.border_color}`,
                borderRadius: 3,
                boxShadow: "none",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: `${colors.primary_accent}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon
                    sx={{ color: colors.primary_accent, fontSize: "1.5rem" }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: colors.primary_text,
                    fontWeight: 700,
                    letterSpacing: "-0.3px",
                  }}
                >
                  Personal Information
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {/* First Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <PersonIcon
                          sx={{
                            color: colors.primary_accent,
                            mr: 1,
                            fontSize: "1.2rem",
                          }}
                        />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: colors.primary_text,
                        backgroundColor: colors.secondary_bg,
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: colors.border_color,
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: isEditMode
                            ? colors.primary_accent
                            : colors.border_color,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary_accent,
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: colors.secondary_text,
                        fontWeight: 500,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: colors.primary_accent,
                        fontWeight: 600,
                      },
                    }}
                  />
                </Grid>

                {/* Last Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <PersonIcon
                          sx={{
                            color: colors.primary_accent,
                            mr: 1,
                            fontSize: "1.2rem",
                          }}
                        />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: colors.primary_text,
                        backgroundColor: colors.secondary_bg,
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: colors.border_color,
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: isEditMode
                            ? colors.primary_accent
                            : colors.border_color,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary_accent,
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: colors.secondary_text,
                        fontWeight: 500,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: colors.primary_accent,
                        fontWeight: 600,
                      },
                    }}
                  />
                </Grid>

                {/* Email (Read-only) */}
                <Grid item xs={12} sm={6}>
                  <Box>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      disabled
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <EmailIcon
                            sx={{
                              color: colors.icon_muted,
                              mr: 1,
                              fontSize: "1.2rem",
                            }}
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: colors.secondary_text,
                          backgroundColor: colors.hover_bg,
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: colors.border_color,
                            borderWidth: "1.5px",
                            borderStyle: "dashed",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: colors.secondary_text,
                          fontWeight: 500,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.icon_muted,
                        mt: 0.5,
                        ml: 1,
                        display: "block",
                        fontSize: "0.7rem",
                      }}
                    >
                      Email cannot be modified
                    </Typography>
                  </Box>
                </Grid>

                {/* Mobile */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon
                          sx={{
                            color: colors.primary_accent,
                            mr: 1,
                            fontSize: "1.2rem",
                          }}
                        />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: colors.primary_text,
                        backgroundColor: colors.secondary_bg,
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: colors.border_color,
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: isEditMode
                            ? colors.primary_accent
                            : colors.border_color,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary_accent,
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: colors.secondary_text,
                        fontWeight: 500,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: colors.primary_accent,
                        fontWeight: 600,
                      },
                    }}
                  />
                </Grid>

                {/* Date of Birth */}
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={
                        formData.dateOfBirth
                          ? dayjs(formData.dateOfBirth)
                          : null
                      }
                      onChange={(newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          dateOfBirth: newValue
                            ? newValue.format("YYYY-MM-DD")
                            : "",
                        }));
                      }}
                      disabled={!isEditMode}
                      maxDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputProps: {
                            startAdornment: (
                              <CakeIcon
                                sx={{
                                  color: colors.primary_accent,
                                  mr: 1,
                                  fontSize: "1.2rem",
                                }}
                              />
                            ),
                          },
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              color: colors.primary_text,
                              backgroundColor: colors.secondary_bg,
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: colors.border_color,
                                borderWidth: "1.5px",
                              },
                              "&:hover fieldset": {
                                borderColor: isEditMode
                                  ? colors.primary_accent
                                  : colors.border_color,
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: colors.primary_accent,
                                borderWidth: "2px",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: colors.secondary_text,
                              fontWeight: 500,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: colors.primary_accent,
                              fontWeight: 600,
                            },
                          },
                        },
                        openPickerButton: {
                          sx: {
                            color: colors.primary_accent,
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                {/* Occupation */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <WorkIcon
                          sx={{
                            color: colors.primary_accent,
                            mr: 1,
                            fontSize: "1.2rem",
                          }}
                        />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: colors.primary_text,
                        backgroundColor: colors.secondary_bg,
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: colors.border_color,
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: isEditMode
                            ? colors.primary_accent
                            : colors.border_color,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary_accent,
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: colors.secondary_text,
                        fontWeight: 500,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: colors.primary_accent,
                        fontWeight: 600,
                      },
                    }}
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <LocationOnIcon
                          sx={{
                            color: colors.primary_accent,
                            mr: 1,
                            fontSize: "1.2rem",
                          }}
                        />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: colors.primary_text,
                        backgroundColor: colors.secondary_bg,
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: colors.border_color,
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: isEditMode
                            ? colors.primary_accent
                            : colors.border_color,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary_accent,
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: colors.secondary_text,
                        fontWeight: 500,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: colors.primary_accent,
                        fontWeight: 600,
                      },
                    }}
                  />
                </Grid>

                {/* Bio */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Tell us about yourself..."
                    InputProps={{
                      startAdornment: (
                        <InfoIcon
                          sx={{
                            color: colors.primary_accent,
                            mr: 1,
                            alignSelf: "flex-start",
                            mt: 1.5,
                            fontSize: "1.2rem",
                          }}
                        />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: colors.primary_text,
                        backgroundColor: colors.secondary_bg,
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: colors.border_color,
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: isEditMode
                            ? colors.primary_accent
                            : colors.border_color,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary_accent,
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: colors.secondary_text,
                        fontWeight: 500,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: colors.primary_accent,
                        fontWeight: 600,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Toast Notification */}
      <ToastNotification
        open={snackbar.open}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </Box>
  );
};

export default Profile;
