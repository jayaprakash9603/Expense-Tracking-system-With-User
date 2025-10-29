import React from "react";
import { useTheme } from "../../hooks/useTheme";
import { useMediaQuery, Box, CircularProgress } from "@mui/material";
import {
  ProfileHeader,
  ProfileContent,
  useProfileForm,
} from "../../components/Profile";
import ToastNotification from "./ToastNotification";

/**
 * Profile Component
 * Main profile page component that displays and manages user profile information
 *
 * Features:
 * - View and edit profile information
 * - Upload profile and cover images
 * - Responsive design for mobile and desktop
 * - Form validation and error handling
 */
const Profile = () => {
  const { colors } = useTheme();
  const isSmallScreen = useMediaQuery("(max-width:900px)");

  // Use custom hook for profile form logic
  const {
    user,
    loading,
    formData,
    isEditMode,
    imageUploading,
    coverImageUploading,
    isSaving,
    snackbar,
    setFormData,
    setIsEditMode,
    handleInputChange,
    handleImageUpload,
    handleCoverImageUpload,
    handleSave,
    handleCancel,
    handleCloseSnackbar,
    getInitials,
  } = useProfileForm();

  // Loading state
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
      {/* Profile Header */}
      <ProfileHeader
        formData={formData}
        user={user}
        colors={colors}
        isSmallScreen={isSmallScreen}
        isEditMode={isEditMode}
        imageUploading={imageUploading}
        coverImageUploading={coverImageUploading}
        isSaving={isSaving}
        onEditToggle={() => setIsEditMode(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onImageUpload={handleImageUpload}
        onCoverImageUpload={handleCoverImageUpload}
        getInitials={getInitials}
      />

      {/* Profile Content */}
      <ProfileContent
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        isEditMode={isEditMode}
        colors={colors}
        isSmallScreen={isSmallScreen}
      />

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
