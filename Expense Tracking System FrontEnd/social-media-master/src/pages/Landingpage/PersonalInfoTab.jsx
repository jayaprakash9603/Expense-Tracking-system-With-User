import React from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  MenuItem,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  Close,
  Person,
  Email,
  Phone,
  PhotoCamera,
  Work,
  Description,
  MonetizationOn,
  Favorite,
  Cake,
  Language,
  LocationOn,
  Save,
  School,
  Business,
  BarChart,
  AccountBalance,
  TrendingUp,
  CreditScore,
} from "@mui/icons-material";

const PersonalInfoTab = ({
  isEditing,
  toggleEdit,
  handleSubmit,
  previewImage,
  getInitials,
  handleFileChange,
  formData,
  handleInputChange,
  selectedFile,
  availableInterests = [],
  handleInterestToggle = () => {},
  uploading = false,
  dummyStats = {
    totalExpenses: 0,
    currentSavings: 0,
    creditScore: 0,
    financialGoals: [],
  },
}) => (
  <div className="w-full max-w-6xl mx-auto space-y-6">
    {/* Header Section with Profile Overview */}
    <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#1f1f1f] to-[#0b0b0b] rounded-2xl p-8 border border-teal-500/20 shadow-2xl overflow-hidden">
      {/* Edit Button */}
      <IconButton
        onClick={toggleEdit}
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          backgroundColor: isEditing ? "#ef4444" : "#14b8a6",
          color: "#0b0b0b",
          width: 48,
          height: 48,
          "&:hover": {
            backgroundColor: isEditing ? "#dc2626" : "#0d9488",
            transform: "scale(1.1) rotate(5deg)",
          },
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10,
          boxShadow: "0 8px 25px rgba(20, 184, 166, 0.3)",
        }}
      >
        {isEditing ? (
          <Close sx={{ fontSize: "1.5rem" }} />
        ) : (
          <Edit sx={{ fontSize: "1.5rem" }} />
        )}
      </IconButton>
      {isEditing ? (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-8 relative z-5">
          {/* Profile Image Upload Section */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-500 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {getInitials()}
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-image-upload"
              />
              <label htmlFor="profile-image-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    backgroundColor: "#14b8a6",
                    color: "#0b0b0b",
                    width: 40,
                    height: 40,
                    "&:hover": {
                      backgroundColor: "#0d9488",
                      transform: "scale(1.1)",
                    },
                    boxShadow: "0 4px 15px rgba(20, 184, 166, 0.4)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <PhotoCamera sx={{ fontSize: "1.2rem" }} />
                </IconButton>
              </label>
            </div>
            {selectedFile && (
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg px-4 py-2">
                <Typography
                  variant="caption"
                  sx={{ color: "#14b8a6", fontWeight: "500" }}
                >
                  📷 New image selected: {selectedFile.name}
                </Typography>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                  <Person sx={{ fontSize: "1.2rem", color: "#0b0b0b" }} />
                </div>
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: "600" }}
                >
                  Basic Information
                </Typography>
              </div>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      style: { color: "white" },
                      startAdornment: (
                        <span className="text-teal-400 mr-2">@</span>
                      ),
                    }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    type="email"
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: "#aaa" }}>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange({
                          target: { name: "gender", value: e.target.value },
                        })
                      }
                      sx={{
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        color: "white",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#14b8a6",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#14b8a6",
                        },
                      }}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                      <MenuItem value="Prefer not to say">
                        Prefer not to say
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    variant="outlined"
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                      style: { color: "#aaa" },
                    }}
                    InputProps={{ style: { color: "white" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                  <Work sx={{ fontSize: "1.2rem", color: "#0b0b0b" }} />
                </div>
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: "600" }}
                >
                  Professional Information
                </Typography>
              </div>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    variant="outlined"
                    type="url"
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "#aaa" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(20, 184, 166, 0.3)",
                        },
                        "&:hover fieldset": { borderColor: "#14b8a6" },
                        "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <Description sx={{ fontSize: "1.2rem", color: "#0b0b0b" }} />
              </div>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "600" }}
              >
                About Me
              </Typography>
            </div>
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              variant="outlined"
              multiline
              rows={4}
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#aaa" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(26, 26, 26, 0.8)",
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "rgba(20, 184, 166, 0.3)" },
                  "&:hover fieldset": { borderColor: "#14b8a6" },
                  "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                },
              }}
            />
          </div>

          {/* Financial Profile Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <MonetizationOn sx={{ fontSize: "1.2rem", color: "#0b0b0b" }} />
              </div>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "600" }}
              >
                Financial Profile
              </Typography>
            </div>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#aaa" }}>Monthly Income</InputLabel>
                  <Select
                    value={formData.financialProfile.monthlyIncome}
                    onChange={(e) =>
                      handleInputChange({
                        target: {
                          name: "financialProfile.monthlyIncome",
                          value: e.target.value,
                        },
                      })
                    }
                    sx={{
                      backgroundColor: "rgba(26, 26, 26, 0.8)",
                      color: "white",
                      borderRadius: "12px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(20, 184, 166, 0.3)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#14b8a6",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#14b8a6",
                      },
                    }}
                  >
                    <MenuItem value={3000}>$3,000 - $4,000</MenuItem>
                    <MenuItem value={5000}>$4,000 - $6,000</MenuItem>
                    <MenuItem value={6500}>$6,000 - $8,000</MenuItem>
                    <MenuItem value={10000}>$8,000+</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Primary Bank"
                  name="financialProfile.primaryBank"
                  value={formData.financialProfile.primaryBank}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(26, 26, 26, 0.8)",
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: "rgba(20, 184, 166, 0.3)",
                      },
                      "&:hover fieldset": { borderColor: "#14b8a6" },
                      "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Credit Score"
                  name="financialProfile.creditScore"
                  value={formData.financialProfile.creditScore}
                  onChange={handleInputChange}
                  variant="outlined"
                  type="number"
                  InputProps={{
                    style: { color: "white" },
                    inputProps: { min: 300, max: 850 },
                  }}
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(26, 26, 26, 0.8)",
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: "rgba(20, 184, 166, 0.3)",
                      },
                      "&:hover fieldset": { borderColor: "#14b8a6" },
                      "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </div>

          {/* Interests Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <Favorite sx={{ fontSize: "1.2rem", color: "#0b0b0b" }} />
              </div>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "600" }}
              >
                Interests
              </Typography>
            </div>
            <div className="flex flex-wrap gap-3">
              {availableInterests.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  onClick={() => handleInterestToggle(interest)}
                  sx={{
                    backgroundColor: formData.interests.includes(interest)
                      ? "#14b8a6"
                      : "rgba(51, 51, 51, 0.8)",
                    color: formData.interests.includes(interest)
                      ? "#0b0b0b"
                      : "white",
                    "&:hover": {
                      backgroundColor: formData.interests.includes(interest)
                        ? "#0d9488"
                        : "rgba(85, 85, 85, 0.8)",
                      transform: "scale(1.05)",
                    },
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    borderRadius: "20px",
                    fontWeight: "500",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Social Links Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <Language sx={{ fontSize: "1.2rem", color: "#0b0b0b" }} />
              </div>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "600" }}
              >
                Social Links
              </Typography>
            </div>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(26, 26, 26, 0.8)",
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: "rgba(20, 184, 166, 0.3)",
                      },
                      "&:hover fieldset": { borderColor: "#14b8a6" },
                      "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Twitter"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(26, 26, 26, 0.8)",
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: "rgba(20, 184, 166, 0.3)",
                      },
                      "&:hover fieldset": { borderColor: "#14b8a6" },
                      "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GitHub"
                  name="socialLinks.github"
                  value={formData.socialLinks.github}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(26, 26, 26, 0.8)",
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: "rgba(20, 184, 166, 0.3)",
                      },
                      "&:hover fieldset": { borderColor: "#14b8a6" },
                      "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Instagram"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(26, 26, 26, 0.8)",
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: "rgba(20, 184, 166, 0.3)",
                      },
                      "&:hover fieldset": { borderColor: "#14b8a6" },
                      "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              variant="contained"
              disabled={uploading}
              startIcon={
                uploading ? (
                  <CircularProgress size={20} sx={{ color: "#0b0b0b" }} />
                ) : (
                  <Save />
                )
              }
              sx={{
                backgroundColor: "#14b8a6",
                color: "#0b0b0b",
                px: 6,
                py: 2,
                borderRadius: "16px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "600",
                "&:hover": {
                  backgroundColor: "#0d9488",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(20, 184, 166, 0.4)",
                },
                "&:disabled": {
                  backgroundColor: "#555",
                  color: "#aaa",
                  transform: "none",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 15px rgba(20, 184, 166, 0.3)",
              }}
            >
              {uploading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      ) : (
        /* Display Mode */
        <div className="relative z-5">
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-500 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {getInitials()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#1a1a1a] flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-3">
              <div>
                <Typography
                  variant="h3"
                  sx={{
                    color: "white",
                    fontWeight: "700",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #14b8a6 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="h6" sx={{ color: "#aaa", mt: 1 }}>
                  @{formData.username}
                </Typography>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                  <Work sx={{ color: "#14b8a6", fontSize: "1rem" }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "#14b8a6", fontWeight: "500" }}
                  >
                    {formData.occupation}
                  </Typography>
                </div>
                <div className="flex items-center gap-2 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                  <Business sx={{ color: "#14b8a6", fontSize: "1rem" }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "#14b8a6", fontWeight: "500" }}
                  >
                    {formData.company}
                  </Typography>
                </div>
                <div className="flex items-center gap-2 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                  <LocationOn sx={{ color: "#14b8a6", fontSize: "1rem" }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "#14b8a6", fontWeight: "500" }}
                  >
                    {formData.location}
                  </Typography>
                </div>
              </div>

              {formData.bio && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "#ccc",
                    lineHeight: 1.6,
                    maxWidth: "600px",
                    fontStyle: "italic",
                  }}
                >
                  "{formData.bio}"
                </Typography>
              )}
            </div>
          </div>

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Personal Information Card */}
            <Card
              sx={{
                backgroundColor: "rgba(26, 26, 26, 0.8)",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 30px rgba(20, 184, 166, 0.2)",
                  borderColor: "rgba(20, 184, 166, 0.5)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                    <Person sx={{ fontSize: "1.3rem", color: "#0b0b0b" }} />
                  </div>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: "600" }}
                  >
                    Personal Info
                  </Typography>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                    <Email sx={{ color: "#14b8a6", fontSize: "1.1rem" }} />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block" }}
                      >
                        Email
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {formData.email}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                    <Phone sx={{ color: "#14b8a6", fontSize: "1.1rem" }} />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block" }}
                      >
                        Phone
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {formData.phoneNumber}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                    <Cake sx={{ color: "#14b8a6", fontSize: "1.1rem" }} />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block" }}
                      >
                        Birthday
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {new Date(formData.dateOfBirth).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information Card */}
            <Card
              sx={{
                backgroundColor: "rgba(26, 26, 26, 0.8)",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 30px rgba(20, 184, 166, 0.2)",
                  borderColor: "rgba(20, 184, 166, 0.5)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Work sx={{ fontSize: "1.3rem", color: "#0b0b0b" }} />
                  </div>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: "600" }}
                  >
                    Professional Info
                  </Typography>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                    <Business sx={{ color: "#14b8a6", fontSize: "1.1rem" }} />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block" }}
                      >
                        Company
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {formData.company}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                    <School sx={{ color: "#14b8a6", fontSize: "1.1rem" }} />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block" }}
                      >
                        Education
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {formData.education}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                    <Language sx={{ color: "#14b8a6", fontSize: "1.1rem" }} />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block" }}
                      >
                        Website
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {formData.website || "Not provided"}
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Profile Card */}
            <Card
              sx={{
                backgroundColor: "rgba(26, 26, 26, 0.8)",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 30px rgba(20, 184, 166, 0.2)",
                  borderColor: "rgba(20, 184, 166, 0.5)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <MonetizationOn
                      sx={{ fontSize: "1.3rem", color: "#0b0b0b" }}
                    />
                  </div>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: "600" }}
                  >
                    Financial Profile
                  </Typography>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                    <TrendingUp sx={{ color: "#14b8a6", fontSize: "1.1rem" }} />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block" }}
                      >
                        Monthly Income
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        $
                        {formData.financialProfile.monthlyIncome?.toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                    <AccountBalance
                      sx={{ color: "#14b8a6", fontSize: "1.1rem" }}
                    />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block" }}
                      >
                        Primary Bank
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {formData.financialProfile.primaryBank}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                    <CreditScore
                      sx={{ color: "#14b8a6", fontSize: "1.1rem" }}
                    />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block" }}
                      >
                        Credit Score
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "white", fontWeight: "500" }}
                      >
                        {formData.financialProfile.creditScore}
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests Card */}
            <Card
              sx={{
                backgroundColor: "rgba(26, 26, 26, 0.8)",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 30px rgba(20, 184, 166, 0.2)",
                  borderColor: "rgba(20, 184, 166, 0.5)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <Favorite sx={{ fontSize: "1.3rem", color: "#0b0b0b" }} />
                  </div>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: "600" }}
                  >
                    Interests
                  </Typography>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <Chip
                      key={index}
                      label={interest}
                      sx={{
                        backgroundColor: "rgba(20, 184, 166, 0.2)",
                        color: "#14b8a6",
                        border: "1px solid rgba(20, 184, 166, 0.3)",
                        "&:hover": {
                          backgroundColor: "rgba(20, 184, 166, 0.3)",
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Links Card */}
            <Card
              sx={{
                backgroundColor: "rgba(26, 26, 26, 0.8)",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 30px rgba(20, 184, 166, 0.2)",
                  borderColor: "rgba(20, 184, 166, 0.5)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <Language sx={{ fontSize: "1.3rem", color: "#0b0b0b" }} />
                  </div>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: "600" }}
                  >
                    Social Links
                  </Typography>
                </div>
                <div className="space-y-3">
                  {Object.entries(formData.socialLinks).map(
                    ([platform, url]) =>
                      url && (
                        <div
                          key={platform}
                          className="flex items-center gap-3 p-2 rounded-lg bg-black/20"
                        >
                          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                            <Language
                              sx={{ color: "#14b8a6", fontSize: "1rem" }}
                            />
                          </div>
                          <div>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#aaa",
                                display: "block",
                                textTransform: "capitalize",
                              }}
                            >
                              {platform}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#14b8a6",
                                fontWeight: "500",
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                              }}
                              onClick={() => window.open(url, "_blank")}
                            >
                              {url}
                            </Typography>
                          </div>
                        </div>
                      )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics Card */}
            <Card
              sx={{
                backgroundColor: "rgba(26, 26, 26, 0.8)",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 30px rgba(20, 184, 166, 0.2)",
                  borderColor: "rgba(20, 184, 166, 0.5)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                    <BarChart sx={{ fontSize: "1.3rem", color: "#0b0b0b" }} />
                  </div>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: "600" }}
                  >
                    Account Statistics
                  </Typography>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-black/20">
                    <Typography
                      variant="h4"
                      sx={{ color: "#14b8a6", fontWeight: "bold" }}
                    >
                      {dummyStats.totalExpenses.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      Total Expenses
                    </Typography>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-black/20">
                    <Typography
                      variant="h4"
                      sx={{ color: "#10b981", fontWeight: "bold" }}
                    >
                      {dummyStats.currentSavings.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      Current Savings
                    </Typography>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-black/20">
                    <Typography
                      variant="h4"
                      sx={{ color: "#f59e0b", fontWeight: "bold" }}
                    >
                      {dummyStats.creditScore}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      Credit Score
                    </Typography>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-black/20">
                    <Typography
                      variant="h4"
                      sx={{ color: "#8b5cf6", fontWeight: "bold" }}
                    >
                      {dummyStats.financialGoals.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      Active Goals
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default PersonalInfoTab;
