import React from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  LocationOn as LocationOnIcon,
  Cake as CakeIcon,
} from "@mui/icons-material";

/**
 * ProfileHeader Component
 * Displays the user's profile header with cover image, avatar, and basic information
 *
 * @param {Object} props
 * @param {Object} props.formData - User profile data
 * @param {Object} props.user - Original user data
 * @param {Object} props.colors - Theme colors
 * @param {boolean} props.isSmallScreen - Responsive flag
 * @param {boolean} props.isEditMode - Edit mode flag
 * @param {boolean} props.imageUploading - Profile image uploading status
 * @param {boolean} props.coverImageUploading - Cover image uploading status
 * @param {boolean} props.isSaving - Saving status
 * @param {Function} props.onEditToggle - Toggle edit mode
 * @param {Function} props.onSave - Save changes
 * @param {Function} props.onCancel - Cancel editing
 * @param {Function} props.onImageUpload - Handle profile image upload
 * @param {Function} props.onCoverImageUpload - Handle cover image upload
 * @param {Function} props.getInitials - Get user initials
 */
const ProfileHeader = ({
  formData,
  user,
  colors,
  isSmallScreen,
  isEditMode,
  imageUploading,
  coverImageUploading,
  isSaving,
  onEditToggle,
  onSave,
  onCancel,
  onImageUpload,
  onCoverImageUpload,
  getInitials,
}) => {
  return (
    <Box
      sx={{
        background: formData.coverImage
          ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${formData.coverImage})`
          : `linear-gradient(135deg, ${colors.primary_accent}15 0%, ${colors.primary_accent}05 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        borderBottom: `1px solid ${colors.border_color}`,
        p: isSmallScreen ? 2 : 4,
        position: "relative",
        overflow: "hidden",
        minHeight: isSmallScreen ? "auto" : "250px",
      }}
    >
      {/* Decorative Background Elements */}
      {!formData.coverImage && (
        <>
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
        </>
      )}

      {/* Cover Image Upload Button */}
      {isEditMode && (
        <Tooltip title="Upload Cover Image" arrow>
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              backgroundColor: `${colors.secondary_bg}cc`,
              backdropFilter: "blur(10px)",
              color: colors.primary_accent,
              width: 44,
              height: 44,
              boxShadow: `0 4px 12px ${colors.primary_accent}40`,
              "&:hover": {
                backgroundColor: colors.secondary_bg,
                transform: "scale(1.1)",
              },
              transition: "all 0.2s",
              zIndex: 2,
            }}
            disabled={coverImageUploading}
          >
            {coverImageUploading ? (
              <CircularProgress
                size={24}
                sx={{ color: colors.primary_accent }}
              />
            ) : (
              <PhotoCameraIcon />
            )}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={onCoverImageUpload}
            />
          </IconButton>
        </Tooltip>
      )}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: isSmallScreen ? "center" : "flex-start",
          gap: isSmallScreen ? 2 : 3,
        }}
      >
        {/* Profile Avatar Section */}
        <ProfileAvatar
          formData={formData}
          colors={colors}
          isSmallScreen={isSmallScreen}
          isEditMode={isEditMode}
          imageUploading={imageUploading}
          onImageUpload={onImageUpload}
          getInitials={getInitials}
        />

        {/* Profile Info Section */}
        <ProfileInfo
          formData={formData}
          user={user}
          colors={colors}
          isSmallScreen={isSmallScreen}
        />

        {/* Action Buttons */}
        <ActionButtons
          isEditMode={isEditMode}
          isSaving={isSaving}
          colors={colors}
          isSmallScreen={isSmallScreen}
          onEditToggle={onEditToggle}
          onSave={onSave}
          onCancel={onCancel}
        />
      </Box>
    </Box>
  );
};

/**
 * ProfileAvatar Component
 * Displays the user's profile avatar with upload functionality
 */
const ProfileAvatar = ({
  formData,
  colors,
  isSmallScreen,
  isEditMode,
  imageUploading,
  onImageUpload,
  getInitials,
}) => {
  return (
    <Box sx={{ position: "relative", textAlign: "center" }}>
      <Box sx={{ position: "relative", display: "inline-block" }}>
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
              <CircularProgress size={20} sx={{ color: colors.button_text }} />
            ) : (
              <PhotoCameraIcon fontSize="small" />
            )}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={onImageUpload}
            />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

/**
 * ProfileInfo Component
 * Displays user's basic information and stats
 */
const ProfileInfo = ({ formData, user, colors, isSmallScreen }) => {
  return (
    <Box sx={{ flex: 1, textAlign: isSmallScreen ? "center" : "left" }}>
      <Typography
        variant={isSmallScreen ? "h6" : "h4"}
        sx={{
          color: colors.primary_text,
          fontWeight: 700,
          mb: 0.5,
          letterSpacing: "-0.5px",
          fontSize: isSmallScreen ? "1.1rem" : undefined,
        }}
      >
        {formData.firstName} {formData.lastName}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: colors.secondary_text,
          mb: isSmallScreen ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          justifyContent: isSmallScreen ? "center" : "flex-start",
          fontSize: isSmallScreen ? "0.85rem" : undefined,
          flexWrap: "wrap",
        }}
      >
        <EmailIcon sx={{ fontSize: isSmallScreen ? "0.9rem" : "1.1rem" }} />
        {formData.email}
      </Typography>

      {/* Profile Stats */}
      <ProfileStats
        formData={formData}
        user={user}
        colors={colors}
        isSmallScreen={isSmallScreen}
      />

      {formData.bio && (
        <Typography
          variant="body2"
          sx={{
            color: colors.secondary_text,
            mt: isSmallScreen ? 1.5 : 2,
            fontStyle: "italic",
            maxWidth: 500,
            fontSize: isSmallScreen ? "0.8rem" : undefined,
          }}
        >
          "{formData.bio}"
        </Typography>
      )}
    </Box>
  );
};

/**
 * ProfileStats Component
 * Displays user's profile statistics chips
 */
const ProfileStats = ({ formData, user, colors, isSmallScreen }) => {
  const stats = [
    { icon: WorkIcon, value: formData.occupation, show: !!formData.occupation },
    {
      icon: LocationOnIcon,
      value: formData.location,
      show: !!formData.location,
    },
    {
      icon: CakeIcon,
      value: user?.createdAt
        ? `Joined ${new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}`
        : null,
      show: !!user?.createdAt,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: isSmallScreen ? 1 : 2,
        justifyContent: isSmallScreen ? "center" : "flex-start",
      }}
    >
      {stats.map(
        ({ icon: Icon, value, show }, index) =>
          show && (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: isSmallScreen ? 1 : 1.5,
                py: 0.4,
                borderRadius: 2,
                backgroundColor: colors.secondary_bg,
                border: `1px solid ${colors.border_color}`,
              }}
            >
              <Icon
                sx={{
                  fontSize: isSmallScreen ? "0.85rem" : "1rem",
                  color: colors.primary_accent,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 500,
                  fontSize: isSmallScreen ? "0.7rem" : undefined,
                }}
              >
                {value}
              </Typography>
            </Box>
          )
      )}
    </Box>
  );
};

/**
 * ActionButtons Component
 * Edit, Save, and Cancel buttons
 */
const ActionButtons = ({
  isEditMode,
  isSaving,
  colors,
  isSmallScreen,
  onEditToggle,
  onSave,
  onCancel,
}) => {
  const buttonStyles = {
    base: {
      fontWeight: 600,
      px: isSmallScreen ? 2 : 3,
      py: isSmallScreen ? 0.75 : 1,
      borderRadius: 2,
      fontSize: isSmallScreen ? "0.8rem" : undefined,
      flex: isSmallScreen && isEditMode ? 1 : "none",
    },
    primary: {
      backgroundColor: colors.primary_accent,
      color: colors.button_text,
      boxShadow: `0 4px 12px ${colors.primary_accent}40`,
      "&:hover": {
        backgroundColor: colors.button_hover,
        transform: isEditMode ? "none" : "translateY(-2px)",
        boxShadow: isEditMode
          ? undefined
          : `0 6px 16px ${colors.primary_accent}60`,
      },
      transition: "all 0.2s",
    },
    secondary: {
      borderColor: colors.border_color,
      color: colors.secondary_text,
      "&:hover": {
        borderColor: colors.primary_accent,
        backgroundColor: `${colors.primary_accent}15`,
      },
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isSmallScreen ? "row" : "column",
        gap: 1,
        width: isSmallScreen ? "100%" : "auto",
        justifyContent: isSmallScreen ? "center" : "flex-start",
      }}
    >
      {!isEditMode ? (
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={onEditToggle}
          size="small"
          sx={{ ...buttonStyles.base, ...buttonStyles.primary }}
        >
          Edit Profile
        </Button>
      ) : (
        <>
          <Button
            variant="contained"
            startIcon={
              isSaving ? (
                <CircularProgress
                  size={16}
                  sx={{ color: colors.button_text }}
                />
              ) : (
                <SaveIcon
                  sx={{ fontSize: isSmallScreen ? "1rem" : undefined }}
                />
              )
            }
            onClick={onSave}
            disabled={isSaving}
            size="small"
            sx={{
              ...buttonStyles.base,
              ...buttonStyles.primary,
              opacity: isSaving ? 0.7 : 1,
              "&.Mui-disabled": {
                backgroundColor: colors.primary_accent,
                color: colors.button_text,
                opacity: 0.7,
              },
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outlined"
            startIcon={
              <CancelIcon
                sx={{ fontSize: isSmallScreen ? "1rem" : undefined }}
              />
            }
            onClick={onCancel}
            disabled={isSaving}
            size="small"
            sx={{
              ...buttonStyles.base,
              ...buttonStyles.secondary,
              opacity: isSaving ? 0.5 : 1,
              "&.Mui-disabled": {
                borderColor: colors.border_color,
                color: colors.secondary_text,
                opacity: 0.5,
              },
            }}
          >
            Cancel
          </Button>
        </>
      )}
    </Box>
  );
};

export default ProfileHeader;
