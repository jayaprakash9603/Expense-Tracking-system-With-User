import React from "react";
import PropTypes from "prop-types";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const DayNavigator = ({
  selectedDate,
  onPrevDay,
  onNextDay,
  onDateChange,
  isSmallScreen,
  colors,
  dateFormat = "DD/MM/YYYY",
  disableFuture = true,
  disableNext = false,
}) => {
  const navButtonSx = {
    color: colors.primary_accent,
    width: 44,
    height: 44,
    border: `1px solid ${colors.border_color}`,
    borderRadius: "12px",
    backgroundColor: colors.secondary_bg,
    transition:
      "background-color 200ms ease, transform 200ms ease, border-color 200ms ease",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
    "&:hover": {
      backgroundColor: colors.hover_bg,
      transform: "scale(1.03)",
      borderColor: `${colors.primary_accent}55`,
    },
  };

  const pickerPopperSx = {
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
    "& .MuiPickersCalendarHeader-label": { color: colors.primary_text },
    "& .MuiPickersCalendarHeader-switchViewButton": {
      color: colors.primary_accent,
    },
    "& .MuiPickersArrowSwitcher-button": { color: colors.primary_accent },
    "& .MuiDayCalendar-weekDayLabel": { color: colors.icon_muted },
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
    <Box
      sx={{
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        alignItems: "center",
        gap: 1,
        px: 1,
        py: 0.75,
        borderRadius: "14px",
        border: `1px solid ${colors.border_color}`,
        backgroundColor: colors.secondary_bg,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        width: isSmallScreen ? "100%" : "auto",
      }}
    >
      <IconButton onClick={onPrevDay} aria-label="Previous day" sx={navButtonSx}>
        <ArrowBackIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={selectedDate}
          onChange={onDateChange}
          disableFuture={disableFuture}
          format={dateFormat}
          sx={{
            background: "transparent",
            borderRadius: 2,
            color: colors.primary_text,
            ".MuiInputBase-input": {
              color: colors.primary_text,
              fontWeight: 600,
              textAlign: "center",
            },
            ".MuiSvgIcon-root": { color: colors.primary_accent },
            width: isSmallScreen ? "100%" : 168,
          }}
          slotProps={{
            textField: {
              size: "small",
              variant: "outlined",
              sx: {
                color: colors.primary_text,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& fieldset": { borderColor: `${colors.border_color}80` },
                  "&:hover fieldset": { borderColor: colors.primary_accent },
                  "&.Mui-focused fieldset": { borderColor: colors.primary_accent },
                },
              },
            },
            popper: { sx: pickerPopperSx },
          }}
        />
      </LocalizationProvider>

      <IconButton
        onClick={onNextDay}
        aria-label="Next day"
        disabled={disableNext}
        sx={{
          ...navButtonSx,
          ...(disableNext
            ? {
                opacity: 0.38,
                pointerEvents: "none",
              }
            : null),
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 20, transform: "scaleX(-1)" }} />
      </IconButton>
    </Box>
  );
};

DayNavigator.propTypes = {
  selectedDate: PropTypes.object.isRequired,
  onPrevDay: PropTypes.func.isRequired,
  onNextDay: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  isSmallScreen: PropTypes.bool,
  colors: PropTypes.object.isRequired,
  dateFormat: PropTypes.string,
  disableFuture: PropTypes.bool,
  disableNext: PropTypes.bool,
};

export default DayNavigator;
