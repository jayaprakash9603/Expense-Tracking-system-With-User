import React from "react";
import { Select, MenuItem, FormControl } from "@mui/material";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { ACCESS_LEVEL_OPTIONS } from "../../constants/friendsConstants";

const AccessLevelPicker = ({ value, onChange, disabled = false }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <FormControl size="small" fullWidth disabled={disabled}>
      <Select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        sx={{
          bgcolor: colors.card_bg,
          color: colors.primary_text,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border_color,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary_accent,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary_accent,
          },
        }}
      >
        {ACCESS_LEVEL_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {t(opt.labelKey)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AccessLevelPicker;
