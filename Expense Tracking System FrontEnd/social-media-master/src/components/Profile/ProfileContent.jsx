import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import ProfileFormFields from "./ProfileFormFields";

/**
 * ProfileContent Component
 * Renders the main content section with personal information form
 *
 * @param {Object} props
 * @param {Object} props.formData - Form data object
 * @param {Function} props.setFormData - Function to update form data
 * @param {Function} props.handleInputChange - Handle input changes
 * @param {boolean} props.isEditMode - Edit mode flag
 * @param {Object} props.colors - Theme colors
 * @param {boolean} props.isSmallScreen - Responsive flag
 */
const ProfileContent = ({
  formData,
  setFormData,
  handleInputChange,
  isEditMode,
  colors,
  isSmallScreen,
}) => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: "auto",
        overflowX: "hidden",
        p: isSmallScreen ? 2 : 3,
        backgroundColor: colors.secondary_bg,
        minHeight: 0,
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: colors.tertiary_bg,
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: colors.border_color,
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: colors.primary_accent,
          },
        },
      }}
    >
      <Grid container spacing={isSmallScreen ? 2 : 3}>
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
            {/* Section Header */}
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

            {/* Form Fields */}
            <ProfileFormFields
              formData={formData}
              setFormData={setFormData}
              handleInputChange={handleInputChange}
              isEditMode={isEditMode}
              colors={colors}
              isSmallScreen={isSmallScreen}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileContent;
