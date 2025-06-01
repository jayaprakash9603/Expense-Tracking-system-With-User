import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Avatar,
  Button,
  TextField,
  IconButton,
  Typography,
  Grid,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  updateProfileAction,
  getProfileAction,
  resetCloudinaryState,
  uploadToCloudinary,
} from "../../Redux/Auth/auth.action";

const Profile = () => {
  const {
    user,
    error: authError,
    imageUrl,
    loading: uploading,
    error: cloudinaryError,
  } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    gender: "",
    bio: "",
    website: "",
    phoneNumber: "",
    location: "",
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token && !user) {
      dispatch(getProfileAction(token));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      const emailUsername = user.email ? user.email.split("@")[0] : "";
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || emailUsername,
        gender: user.gender
          ? user.gender.charAt(0).toUpperCase() +
            user.gender.slice(1).toLowerCase()
          : "",
        bio: user.bio || "",
        website: user.website || "",
        phoneNumber: user.phoneNumber || "",
        location: user.location || "",
        image: user.image || "",
      });
      setPreviewImage(user.image || "");
    }
  }, [user]);

  useEffect(() => {
    if (imageUrl) {
      const updatedFormData = { ...formData, image: imageUrl };
      setFormData(updatedFormData);
      dispatch(updateProfileAction(updatedFormData));
      dispatch(resetCloudinaryState());
      setIsEditing(false);
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
    }
    if (cloudinaryError) {
      toast.error(cloudinaryError);
      dispatch(resetCloudinaryState());
    }
    if (authError) {
      toast.error(authError);
    }
  }, [imageUrl, cloudinaryError, authError, dispatch, formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      dispatch(uploadToCloudinary(selectedFile));
    } else {
      dispatch(updateProfileAction(formData));
      setIsEditing(false);
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      const emailUsername = user?.email ? user.email.split("@")[0] : "";
      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        username: user?.username || emailUsername,
        gender: user?.gender || "",
        bio: user?.bio || "",
        website: user?.website || "",
        phoneEdit: true,
        phoneNumber: user?.phoneNumber || "",
        location: user?.location || "",
        image: user?.image || "",
      });
      setPreviewImage(user?.image || "");
      setSelectedFile(null);
      dispatch(resetCloudinaryState());
    }
  };

  const getInitials = () => {
    const firstInitial = user?.firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user?.lastName?.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <div className="bg-[#1b1b1b] min-h-screen flex flex-col font-sans">
      {/* Top Spacer */}
      <div className="w-full h-12 bg-[#1b1b1b]"></div>

      {/* Main Content */}
      <div
        className="flex flex-col items-center  flex-grow mx-auto p-4 sm:p-6 md:p-8 w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl"
        style={{
          backgroundColor: "#333333",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="w-full">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8">
            <div className="relative mr-0 sm:mr-6 mb-4 sm:mb-0">
              <Avatar
                src={previewImage}
                sx={{
                  width: { xs: 100, sm: 120 },
                  height: { xs: 100, sm: 120 },
                  bgcolor: "#14b8a6",
                  fontSize: !previewImage
                    ? { xs: "2rem", sm: "2.5rem" }
                    : undefined,
                  fontWeight: "bold",
                }}
              >
                {!previewImage && getInitials()}
              </Avatar>
              {isEditing && (
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "white",
                    borderRadius: "50%",
                    p: 1,
                    "&:hover": { bgcolor: "#e0e0e0" },
                  }}
                >
                  <PhotoCamera />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </IconButton>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              {/* Username and button in one row */}
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <Typography
                  variant="h5"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "1.75rem" },
                  }}
                >
                  @{formData.username || "username"}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={toggleEdit}
                  sx={{
                    color: "white",
                    borderColor: "#aaa",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    mt: { xs: 2, sm: 0 },
                    "&:hover": {
                      borderColor: "#14b8a6",
                      bgcolor: "rgba(20, 184, 166, 0.1)",
                    },
                  }}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              {/* Name and bio below username */}
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  mt: 1,
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                }}
              >
                {formData.firstName} {formData.lastName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#aaa",
                  mt: 1,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {formData.bio || "Add a bio"}
              </Typography>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-[#1b1b1b] p-4 sm:p-6 rounded-xl shadow-lg">
            {isEditing ? (
              <div onSubmit={handleSubmit} className="space-y-4">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        style: { color: "white", fontSize: "1rem" },
                      }}
                      InputLabelProps={{ style: { color: "#aaa" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#14b8a6", // set default color
                          },
                          "&:hover fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        style: { color: "white", fontSize: "1rem" },
                      }}
                      InputLabelProps={{ style: { color: "#aaa" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#14b8a6", // set default color
                          },
                          "&:hover fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        style: { color: "white", fontSize: "1rem" },
                      }}
                      InputLabelProps={{ style: { color: "#aaa" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#14b8a6", // set default color
                          },
                          "&:hover fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      //   disabled
                      variant="outlined"
                      InputProps={{
                        style: { color: "#aaa", fontSize: "1rem" },
                      }}
                      InputLabelProps={{ style: { color: "#aaa" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#14b8a6", // set default color
                          },
                          "&:hover fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      variant="outlined"
                      multiline
                      rows={3}
                      InputProps={{
                        style: { color: "white", fontSize: "1rem" },
                      }}
                      InputLabelProps={{ style: { color: "#aaa" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#14b8a6", // set default color
                          },
                          "&:hover fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl component="fieldset" sx={{ color: "white" }}>
                      <FormLabel
                        component="legend"
                        sx={{
                          color: "#aaa",
                          fontSize: "1rem",
                          mb: 1,
                          "&.Mui-focused": { color: "#aaa" },
                        }}
                      >
                        Gender
                      </FormLabel>
                      <RadioGroup
                        row
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <FormControlLabel
                          value="Male"
                          control={
                            <Radio
                              sx={{
                                color: "#14b8a6",
                                "&.Mui-checked": { color: "#14b8a6" },
                              }}
                            />
                          }
                          label="Male"
                          sx={{ color: "white" }}
                        />
                        <FormControlLabel
                          value="Female"
                          control={
                            <Radio
                              sx={{
                                color: "#14b8a6",
                                "&.Mui-checked": { color: "#14b8a6" },
                              }}
                            />
                          }
                          label="Female"
                          sx={{ color: "white" }}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        style: { color: "white", fontSize: "1rem" },
                      }}
                      InputLabelProps={{ style: { color: "#aaa" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#14b8a6", // set default color
                          },
                          "&:hover fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        style: { color: "white", fontSize: "1rem" },
                      }}
                      InputLabelProps={{ style: { color: "#aaa" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#14b8a6", // set default color
                          },
                          "&:hover fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        style: { color: "white", fontSize: "1rem" },
                      }}
                      InputLabelProps={{ style: { color: "#aaa" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#14b8a6", // set default color
                          },
                          "&:hover fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#14b8a6", // same as default
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                s
                <div className="flex justify-end mt-4">
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={uploading}
                    sx={{
                      backgroundColor: "#00dac6",
                      color: "#1b1b1b",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      px: 4,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      boxShadow: "0 2px 10px rgba(0, 218, 198, 0.3)",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#00c2b3",
                      },
                      "&:disabled": {
                        backgroundColor: "#333333",
                        color: "#aaa",
                        cursor: "not-allowed",
                      },
                    }}
                  >
                    {uploading && (
                      <CircularProgress
                        size={18}
                        thickness={5}
                        sx={{ color: "white" }}
                      />
                    )}
                    {uploading ? "Uploading..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#aaa",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                    }}
                  >
                    {formData.email}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#aaa",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Bio
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                    }}
                  >
                    {formData.bio || "No bio yet"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#aaa",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Gender
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                    }}
                  >
                    {formData.gender || "Not specified"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#aaa",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Website
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                    }}
                  >
                    {formData.website ? (
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-500 hover:text-teal-400 transition-colors"
                      >
                        {formData.website}
                      </a>
                    ) : (
                      "No website"
                    )}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#aaa",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Phone Number
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                    }}
                  >
                    {formData.phoneNumber || "Not specified"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#aaa",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Location
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                    }}
                  >
                    {formData.location || "Not specified"}
                  </Typography>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="w-full h-12 bg-[#1b1b1b]"></div>
    </div>
  );
};

export default Profile;
