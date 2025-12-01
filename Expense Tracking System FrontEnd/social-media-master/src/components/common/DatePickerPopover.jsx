import React from "react";
import { Popover } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTheme } from "../../hooks/useTheme";

/**
 * Reusable DatePicker Popover Component
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the popover is open
 * @param {HTMLElement} props.anchorEl - Element to anchor the popover to
 * @param {Function} props.onClose - Callback when popover closes
 * @param {dayjs.Dayjs} props.value - Current selected date (dayjs object)
 * @param {Function} props.onChange - Callback when date is selected
 * @param {string} props.format - Date format string (e.g., "DD/MM/YYYY")
 * @param {Array<string>} props.availableDates - Array of available dates in YYYY-MM-DD format (optional)
 * @param {dayjs.Dayjs} props.minDate - Minimum selectable date (optional)
 * @param {dayjs.Dayjs} props.maxDate - Maximum selectable date (optional)
 * @param {Object} props.anchorOrigin - Popover anchor origin (optional)
 * @param {Object} props.transformOrigin - Popover transform origin (optional)
 */
const DatePickerPopover = ({
  open,
  anchorEl,
  onClose,
  value,
  onChange,
  format = "DD/MM/YYYY",
  availableDates = null,
  minDate = null,
  maxDate = null,
  anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
  },
  transformOrigin = {
    vertical: "top",
    horizontal: "center",
  },
}) => {
  const { colors } = useTheme();

  // Function to check if a date should be disabled
  const shouldDisableDate = (date) => {
    if (!availableDates || availableDates.length === 0) return false;
    const dateString = date.format("YYYY-MM-DD");
    return !availableDates.includes(dateString);
  };

  // Function to check if a month should be disabled for navigation
  const shouldDisableMonth = (month) => {
    if (!availableDates || availableDates.length === 0) return false;

    // Check if any date in this month exists in availableDates
    const startOfMonth = month.startOf("month");
    const endOfMonth = month.endOf("month");

    return !availableDates.some((dateStr) => {
      const date = new Date(dateStr);
      const dateMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const checkMonth = new Date(startOfMonth.year(), startOfMonth.month(), 1);
      return dateMonth.getTime() === checkMonth.getTime();
    });
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      sx={{
        "& .MuiPopover-paper": {
          padding: "16px",
          background: colors.primary_bg,
          border: `1px solid ${colors.border_color}`,
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value}
          onChange={onChange}
          format={format}
          shouldDisableDate={shouldDisableDate}
          shouldDisableMonth={shouldDisableMonth}
          minDate={minDate}
          maxDate={maxDate}
          slotProps={{
            textField: {
              size: "small",
              sx: {
                "& .MuiInputBase-root": {
                  color: colors.primary_text,
                  background: colors.secondary_bg,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border_color,
                },
                "& .MuiInputBase-input": {
                  padding: "8px 12px",
                },
                "& .MuiSvgIcon-root": {
                  color: colors.primary_accent,
                },
              },
            },
            popper: {
              sx: {
                "& .MuiPaper-root": {
                  background: colors.primary_bg,
                  border: `1px solid ${colors.border_color}`,
                },
                "& .MuiPickersDay-root": {
                  color: colors.primary_text,
                  "&.Mui-selected": {
                    background: colors.primary_accent,
                    color: "#fff",
                    "&:hover": {
                      background: colors.primary_accent,
                    },
                  },
                  "&:hover": {
                    background: `${colors.primary_accent}30`,
                  },
                  "&.Mui-disabled": {
                    color: `${colors.secondary_text}60`,
                    textDecoration: "line-through",
                    opacity: 0.4,
                  },
                },
                "& .MuiPickersCalendarHeader-label": {
                  color: colors.primary_text,
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: colors.secondary_text,
                },
                "& .MuiIconButton-root": {
                  color: colors.primary_text,
                  "&:hover": {
                    background: `${colors.primary_accent}20`,
                  },
                  "&.Mui-disabled": {
                    color: `${colors.secondary_text}40`,
                    opacity: 0.3,
                  },
                },
                "& .MuiPickersYear-yearButton": {
                  color: colors.primary_text,
                  "&.Mui-selected": {
                    background: colors.primary_accent,
                    color: "#fff",
                  },
                  "&:hover": {
                    background: `${colors.primary_accent}30`,
                  },
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    </Popover>
  );
};

export default DatePickerPopover;
