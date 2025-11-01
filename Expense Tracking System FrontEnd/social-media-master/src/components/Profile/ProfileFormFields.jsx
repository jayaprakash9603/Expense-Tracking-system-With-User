import React from "react";
import { Grid, TextField, Typography, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import useUserSettings from "../../hooks/useUserSettings";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Work as WorkIcon,
  Cake as CakeIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

/**
 * ProfileFormFields Component
 * Renders all profile form fields with consistent styling
 *
 * @param {Object} props
 * @param {Object} props.formData - Form data object
 * @param {Function} props.setFormData - Function to update form data
 * @param {Function} props.handleInputChange - Handle input changes
 * @param {boolean} props.isEditMode - Edit mode flag
 * @param {Object} props.colors - Theme colors
 * @param {boolean} props.isSmallScreen - Responsive flag
 */
const ProfileFormFields = ({
  formData,
  setFormData,
  handleInputChange,
  isEditMode,
  colors,
  isSmallScreen,
}) => {
  // Get user settings for date format
  const settings = useUserSettings();
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";

  // Common text field styles
  const getTextFieldStyles = (isDisabled = false, isDashed = false) => ({
    "& .MuiOutlinedInput-root": {
      color: isDisabled ? colors.secondary_text : colors.primary_text,
      backgroundColor: isDisabled ? colors.hover_bg : colors.secondary_bg,
      borderRadius: 2,
      "& fieldset": {
        borderColor: colors.border_color,
        borderWidth: "1.5px",
        borderStyle: isDashed ? "dashed" : "solid",
      },
      "&:hover fieldset": {
        borderColor:
          isEditMode && !isDisabled
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
  });

  const fields = [
    {
      id: "firstName",
      label: "First Name",
      icon: PersonIcon,
      gridSize: { xs: 12, sm: 6 },
      disabled: false,
    },
    {
      id: "lastName",
      label: "Last Name",
      icon: PersonIcon,
      gridSize: { xs: 12, sm: 6 },
      disabled: false,
    },
    {
      id: "email",
      label: "Email Address",
      icon: EmailIcon,
      gridSize: { xs: 12, sm: 6 },
      disabled: true,
      helperText: "Email cannot be modified",
      iconColor: colors.icon_muted,
    },
    {
      id: "mobile",
      label: "Mobile Number",
      icon: PhoneIcon,
      gridSize: { xs: 12, sm: 6 },
      disabled: false,
    },
    {
      id: "occupation",
      label: "Occupation",
      icon: WorkIcon,
      gridSize: { xs: 12, sm: 6 },
      disabled: false,
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {/* Standard Text Fields */}
      {fields.map((field) => (
        <Grid item key={field.id} {...field.gridSize}>
          <Box>
            <TextField
              fullWidth
              label={field.label}
              name={field.id}
              value={formData[field.id]}
              onChange={handleInputChange}
              disabled={field.disabled || !isEditMode}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <field.icon
                    sx={{
                      color: field.iconColor || colors.primary_accent,
                      mr: 1,
                      fontSize: "1.2rem",
                    }}
                  />
                ),
              }}
              sx={getTextFieldStyles(field.disabled, field.disabled)}
            />
            {field.helperText && (
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
                {field.helperText}
              </Typography>
            )}
          </Box>
        </Grid>
      ))}

      {/* Date of Birth Field */}
      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date of Birth"
            value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
            onChange={(newValue) => {
              setFormData((prev) => ({
                ...prev,
                dateOfBirth: newValue ? newValue.format("YYYY-MM-DD") : "",
              }));
            }}
            disabled={!isEditMode}
            maxDate={dayjs()}
            format={dateFormat}
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
                sx: getTextFieldStyles(),
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

      {/* Location Field */}
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
          sx={getTextFieldStyles()}
        />
      </Grid>

      {/* Bio Field */}
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
          sx={getTextFieldStyles()}
        />
      </Grid>
    </Grid>
  );
};

export default ProfileFormFields;
