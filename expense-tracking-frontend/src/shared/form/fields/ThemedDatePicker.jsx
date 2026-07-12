import React from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function ThemedDatePicker({
  value,
  onChange,
  colors,
  dateFormat = "DD/MM/YYYY",
  error = false,
  disableFuture = true,
  placeholder,
  width = 300,
  height = 56,
  fontSize = 16,
}) {
  const popperSx = {
    "& .MuiPaper-root": {
      backgroundColor: colors.card_bg,
      color: colors.primary_text,
      border: `1px solid ${colors.border_color}`,
    },
    "& .MuiPickersDay-root": {
      color: colors.primary_text,
      "&:hover": { backgroundColor: colors.hover_bg },
      "&.Mui-selected": {
        backgroundColor: colors.primary_accent,
        color: colors.button_text,
      },
    },
    "& .MuiPickersCalendarHeader-label": {
      color: colors.primary_text,
    },
    "& .MuiPickersCalendarHeader-switchViewButton": {
      color: colors.primary_accent,
    },
    "& .MuiPickersArrowSwitcher-button": {
      color: colors.primary_accent,
    },
    "& .MuiDayCalendar-weekDayLabel": {
      color: colors.icon_muted,
    },
    "& .MuiPickersYear-yearButton": {
      color: colors.primary_text,
      "&:hover": { backgroundColor: colors.hover_bg },
      "&.Mui-selected": {
        backgroundColor: colors.primary_accent,
        color: colors.button_text,
      },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value ? dayjs(value) : null}
        onChange={(newValue) => {
          if (newValue) {
            const formatted = dayjs(newValue).format("YYYY-MM-DD");
            onChange(formatted, newValue);
          }
        }}
        disableFuture={disableFuture}
        format={dateFormat}
        sx={{
          background: colors.primary_bg,
          borderRadius: 2,
          color: colors.primary_text,
          ".MuiInputBase-input": {
            color: colors.primary_text,
            height: height - 36,
            fontSize,
          },
          ".MuiSvgIcon-root": { color: colors.primary_accent },
          width,
          height,
          minHeight: height,
          maxHeight: height,
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: error ? "#ff4d4f" : colors.border_color,
              borderWidth: "1px",
            },
            "&:hover fieldset": {
              borderColor: error ? "#ff4d4f" : colors.border_color,
            },
            "&.Mui-focused fieldset": {
              borderColor: error ? "#ff4d4f" : colors.primary_accent,
              borderWidth: "2px",
            },
          },
        }}
        slotProps={{
          textField: {
            size: "medium",
            variant: "outlined",
            error,
            placeholder,
            sx: {
              color: colors.primary_text,
              height,
              minHeight: height,
              maxHeight: height,
              width,
              fontSize,
              "& .MuiInputBase-root": {
                height,
                minHeight: height,
                maxHeight: height,
              },
              "& input": {
                height: height - 36,
                fontSize,
                color: colors.primary_text,
              },
            },
            inputProps: {
              max: dayjs().format("YYYY-MM-DD"),
            },
          },
          popper: { sx: popperSx },
        }}
      />
    </LocalizationProvider>
  );
}
