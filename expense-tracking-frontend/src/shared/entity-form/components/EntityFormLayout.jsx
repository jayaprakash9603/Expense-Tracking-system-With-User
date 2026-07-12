import React from "react";
import { Box, TextField, Grid } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ColorPicker from "./ColorPicker";
import EmojiIconPicker from "./EmojiIconPicker";

export default function EntityFormLayout({
  formData,
  onChange,
  onTypeChange,
  onColorChange,
  onIconSelect,
  errors,
  colors,
  typeOptions,
  colorOptions,
  iconCategories,
  defaultEmoji,
  namePlaceholder = "Enter name",
  descriptionPlaceholder = "Enter description",
  typePlaceholder = "Select type",
  nameAdornment,
  additionalFields = [],
  children,
}) {
  const accentColor = formData.color || colors.primary_accent;

  const textFieldSx = (focusColor = accentColor) => ({
    flex: 1,
    "& .MuiOutlinedInput-root": {
      backgroundColor: colors.secondary_bg,
      "& fieldset": { borderColor: colors.border_color },
      "&:hover fieldset": { borderColor: colors.border_color },
      "&.Mui-focused fieldset": { borderColor: focusColor },
      color: colors.primary_text,
    },
    "& .MuiInputBase-input::placeholder": {
      color: colors.icon_muted,
      opacity: 1,
    },
    "& .MuiFormHelperText-root": { color: focusColor },
  });

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          required
          id="name"
          name="name"
          placeholder={namePlaceholder}
          value={formData.name}
          onChange={onChange}
          error={!!errors.name}
          helperText={errors.name}
          InputProps={{
            startAdornment: nameAdornment ?? (
              <span style={{ marginRight: 8, fontSize: "1.5rem" }}>
                {formData.selectedIconKey || defaultEmoji}
              </span>
            ),
            style: { color: colors.primary_text },
          }}
          sx={textFieldSx(errors.name ? "red" : accentColor)}
        />

        <TextField
          multiline
          rows={1}
          id="description"
          name="description"
          placeholder={descriptionPlaceholder}
          value={formData.description}
          onChange={onChange}
          error={!!errors.description}
          helperText={errors.description}
          InputProps={{
            startAdornment: (
              <DescriptionIcon sx={{ mr: 1, color: accentColor }} />
            ),
            style: { color: colors.primary_text },
          }}
          sx={textFieldSx(errors.description ? "red" : accentColor)}
        />

        {additionalFields.map((field) => (
          <TextField
            key={field.name}
            required={field.required}
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={field.onChange || onChange}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
            InputProps={{
              startAdornment: field.icon ? (
                React.cloneElement(field.icon, { sx: { mr: 1, color: accentColor } })
              ) : undefined,
              style: { color: colors.primary_text },
            }}
            sx={textFieldSx(errors[field.name] ? "red" : accentColor)}
          />
        ))}

        {typeOptions && (
          <Autocomplete
            options={typeOptions}
            value={formData.type}
            onChange={onTypeChange}
            componentsProps={{
              paper: {
                sx: {
                  backgroundColor: colors.secondary_bg,
                  color: colors.primary_text,
                  "& .MuiAutocomplete-option": {
                    "&:hover": { backgroundColor: colors.hover_bg },
                    "&[aria-selected='true']": {
                      backgroundColor: colors.hover_bg,
                    },
                  },
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={typePlaceholder}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <AttachMoneyIcon sx={{ mr: 1, color: accentColor }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.secondary_bg,
                    "& fieldset": { borderColor: colors.border_color },
                    "&:hover fieldset": { borderColor: colors.border_color },
                    "&.Mui-focused fieldset": { borderColor: accentColor },
                    color: colors.primary_text,
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: colors.icon_muted,
                    opacity: 1,
                  },
                }}
              />
            )}
            sx={{
              flex: 1,
              "& .MuiAutocomplete-popupIndicator": {
                color: colors.icon_muted,
              },
              "& .MuiAutocomplete-clearIndicator": {
                color: colors.icon_muted,
              },
            }}
          />
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb: 1, mt: -1 }}>
        <Grid item xs={12} md={6}>
          <ColorPicker
            colorOptions={colorOptions}
            selectedColor={formData.color}
            onColorChange={onColorChange}
            colors={colors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <EmojiIconPicker
            iconCategories={iconCategories}
            selectedIcon={formData.selectedIconKey}
            onIconSelect={onIconSelect}
            accentColor={accentColor}
            colors={colors}
          />
        </Grid>
      </Grid>

      {children}
    </>
  );
}
