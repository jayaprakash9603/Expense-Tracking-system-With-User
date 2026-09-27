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
    color: "var(--color-primary-accent)",
    width: 44,
    height: 44,
    border: "1px solid var(--color-border-color)",
    borderRadius: "12px",
    backgroundColor: "var(--color-secondary-bg)",
    transition:
      "background-color 200ms ease, transform 200ms ease, border-color 200ms ease",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
    "&:hover": {
      backgroundColor: "var(--color-hover-bg)",
      transform: "scale(1.03)",
      borderColor: `${colors.primary_accent}55`,
    },
  };

  const pickerPopperSx = {
    "& .MuiPaper-root": {
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary-text)",
      border: "1px solid var(--color-border-color)",
    },
    "& .MuiPickersDay-root": {
      color: "var(--color-primary-text)",
      "&:hover": { backgroundColor: "var(--color-hover-bg)" },
      "&.Mui-selected": {
        backgroundColor: colors.primary_accent,
        color: colors.button_text,
      },
    },
    "& .MuiPickersCalendarHeader-label": { color: "var(--color-primary-text)" },
    "& .MuiPickersCalendarHeader-switchViewButton": {
      color: "var(--color-primary-accent)",
    },
    "& .MuiPickersArrowSwitcher-button": { color: "var(--color-primary-accent)" },
    "& .MuiDayCalendar-weekDayLabel": { color: colors.icon_muted },
    "& .MuiPickersYear-yearButton": {
      color: "var(--color-primary-text)",
      "&:hover": { backgroundColor: "var(--color-hover-bg)" },
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
        border: "1px solid var(--color-border-color)",
        backgroundColor: "var(--color-secondary-bg)",
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
            color: "var(--color-primary-text)",
            ".MuiInputBase-input": {
              color: "var(--color-primary-text)",
              fontWeight: 600,
              textAlign: "center",
            },
            ".MuiSvgIcon-root": { color: "var(--color-primary-accent)" },
            width: isSmallScreen ? "100%" : 168,
          }}
          slotProps={{
            textField: {
              size: "small",
              variant: "outlined",
              sx: {
                color: "var(--color-primary-text)",
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
