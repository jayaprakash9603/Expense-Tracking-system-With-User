import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  Button,
  Stack,
  Popover,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { useTheme } from "../../../hooks/useTheme";

dayjs.extend(isBetween);

const formatDate = (value, format) =>
  value ? dayjs(value).format(format) : "--";

const SHORTCUTS = [
  {
    label: "Yesterday",
    getValue: () => [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
  },
  {
    label: "Last 7 days",
    getValue: () => [dayjs().subtract(6, "day"), dayjs()],
  },
  {
    label: "Last 30 days",
    getValue: () => [dayjs().subtract(29, "day"), dayjs()],
  },
  {
    label: "Last 3 months",
    getValue: () => [dayjs().subtract(3, "month"), dayjs()],
  },
  { label: "Year to date", getValue: () => [dayjs().startOf("year"), dayjs()] },
  {
    label: "Last year",
    getValue: () => [
      dayjs().subtract(1, "year").startOf("year"),
      dayjs().subtract(1, "year").endOf("year"),
    ],
  },
];

function CustomDay(props) {
  const { day, selectedDate, hoveredDate, onHover, range, ...other } = props;
  const { colors } = useTheme();

  const isSelectedStart = range.from && day.isSame(range.from, "day");
  const isSelectedEnd = range.to && day.isSame(range.to, "day");

  // Highlight the potential end date when selecting range
  const isHoveredEnd =
    range.from && !range.to && hoveredDate && day.isSame(hoveredDate, "day");

  const isSelected = isSelectedStart || isSelectedEnd || isHoveredEnd;

  const isWithinHover =
    range.from &&
    !range.to &&
    hoveredDate &&
    day.isAfter(range.from) &&
    day.isBefore(hoveredDate.add(1, "day"), "day");

  const isWithinRange =
    range.from &&
    range.to &&
    day.isAfter(range.from) &&
    day.isBefore(range.to, "day");

  const styles = {
    margin: 0,
    width: 36,
    height: 36,
    // Range middle days
    ...(isWithinRange && {
      backgroundColor: `${colors.primary_accent}15`,
      color: colors.primary_text,
      borderRadius: 0,
    }),

    // Hover preview range middle days
    ...(isWithinHover && {
      backgroundColor: `${colors.primary_accent}15`,
      color: colors.primary_text,
      borderRadius: 0,
      borderTop: `1px dashed ${colors.primary_accent}`,
      borderBottom: `1px dashed ${colors.primary_accent}`,
    }),

    // Start of range (either finalized or hover)
    ...(isSelectedStart && {
      backgroundColor: colors.primary_accent,
      color: "#fff",
      borderRadius: "50% 0 0 50%", // Semi-circle left side for range connector
      position: "relative",
      zIndex: 1,
      // Create the full circle look while keeping range connector
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        backgroundColor: colors.primary_accent,
        zIndex: -1,
      },
      "&:hover": { backgroundColor: colors.primary_accent },
    }),

    // End of range (either finalized or hover)
    ...((isSelectedEnd || isHoveredEnd) && {
      backgroundColor: colors.primary_accent,
      color: "#fff",
      borderRadius: "0 50% 50% 0", // Semi-circle right side for range connector
      position: "relative",
      zIndex: 1,
      // Create the full circle look while keeping range connector
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        backgroundColor: colors.primary_accent,
        zIndex: -1,
      },
      "&:hover": { backgroundColor: colors.primary_accent },
    }),

    // Single day selected (start == end)
    ...(isSelectedStart &&
      (isSelectedEnd || isHoveredEnd) && {
        borderRadius: "50%",
      }),

    // Hover effect for unselected days to show border as requested
    ...(!isSelected &&
      !isWithinRange &&
      !isWithinHover && {
        "&:hover": {
          border: `1px solid ${colors.primary_accent}`,
          backgroundColor: "transparent",
          borderRadius: "50%",
        },
      }),
  };

  return (
    <PickersDay
      {...other}
      day={day}
      selected={false}
      onMouseEnter={() => onHover(day)}
      sx={styles}
    />
  );
}

const DateRangeBadge = ({
  fromDate,
  toDate,
  onApply,
  onReset,
  minDate,
  maxDate,
  dateFormat = "DD MMM YYYY",
  buttonLabels = { from: "From", to: "To" },
  buttonProps = {},
}) => {
  const { colors } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [range, setRange] = useState({ from: null, to: null });
  const [hoveredDate, setHoveredDate] = useState(null);

  // Base month for the left calendar. Right calendar is base + 1 month.
  const [baseMonth, setBaseMonth] = useState(dayjs());

  useEffect(() => {
    const start = fromDate ? dayjs(fromDate) : null;
    const end = toDate ? dayjs(toDate) : null;
    setRange({ from: start, to: end });
    if (start) setBaseMonth(start);
  }, [fromDate, toDate]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleDayClick = (day) => {
    if (!range.from || (range.from && range.to)) {
      setRange({ from: day, to: null });
    } else {
      let newFrom = range.from;
      let newTo = day;
      if (day.isBefore(newFrom)) {
        newTo = newFrom;
        newFrom = day;
      }
      setRange({ from: newFrom, to: newTo });
    }
  };

  const handleShortcut = (shortcut) => {
    const [start, end] = shortcut.getValue();
    setRange({ from: start, to: end });
    setBaseMonth(start); // Show the range starting from From date
  };

  const formattedFrom = range.from ? range.from.format(dateFormat) : "--";
  const formattedTo = range.to ? range.to.format(dateFormat) : "--";

  const { style: externalStyle, ...restButtonProps } = buttonProps;

  const mergedButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: "999px",
    border: `1px solid ${colors.primary_accent}40`,
    background: `${colors.primary_accent}15`,
    padding: "8px 18px",
    cursor: "pointer",
    color: colors.primary_text,
    fontWeight: 600,
    minWidth: 260,
    boxShadow: `0 4px 14px ${colors.primary_accent}12`,
    transition: "all 0.2s ease",
    ...(externalStyle || {}),
  };

  return (
    <>
      <button
        type="button"
        {...restButtonProps}
        style={mergedButtonStyle}
        onClick={handleOpen}
      >
        <span style={{ color: colors.primary_accent }}>
          {buttonLabels.from}
        </span>
        <span>{fromDate ? dayjs(fromDate).format(dateFormat) : "--"}</span>
        <span style={{ opacity: 0.6 }}>→</span>
        <span style={{ color: colors.primary_accent }}>{buttonLabels.to}</span>
        <span>{toDate ? dayjs(toDate).format(dateFormat) : "--"}</span>
      </button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{
          sx: {
            background: colors.primary_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            mt: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            maxWidth: "900px",
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box
            sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
          >
            {/* Calendars Section */}
            <Box sx={{ display: "flex", p: 2, gap: 2 }}>
              <DateCalendar
                value={null} // Controlled by custom rendering
                referenceDate={baseMonth}
                onMonthChange={(newMonth) => setBaseMonth(newMonth)}
                onChange={handleDayClick}
                slots={{ day: CustomDay }}
                slotProps={{
                  day: {
                    range,
                    hoveredDate,
                    onHover: setHoveredDate,
                  },
                }}
                views={["day"]}
                disableHighlightToday
                showDaysOutsideCurrentMonth={false}
                sx={{
                  width: 300,
                  m: 0,
                  "& .MuiPickersCalendarHeader-root": {
                    pl: 2,
                    pr: 2,
                  },
                }}
              />
              <Box
                sx={{
                  display: { xs: "none", sm: "block" },
                  width: "1px",
                  bgcolor: colors.border_color,
                }}
              />
              <DateCalendar
                value={null}
                referenceDate={baseMonth.add(1, "month")}
                onMonthChange={(newMonth) =>
                  setBaseMonth(newMonth.subtract(1, "month"))
                }
                onChange={handleDayClick}
                slots={{ day: CustomDay }}
                slotProps={{
                  day: {
                    range,
                    hoveredDate,
                    onHover: setHoveredDate,
                  },
                }}
                views={["day"]}
                disableHighlightToday
                showDaysOutsideCurrentMonth={false}
                sx={{
                  width: 300,
                  m: 0,
                  "& .MuiPickersCalendarHeader-root": {
                    pl: 2,
                    pr: 2,
                  },
                }}
              />
            </Box>

            {/* Shortcuts Section */}
            <Box
              sx={{
                borderLeft: { xs: 0, md: `1px solid ${colors.border_color}` },
                borderTop: { xs: `1px solid ${colors.border_color}`, md: 0 },
                p: 2,
                minWidth: 160,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {SHORTCUTS.map((shortcut) => (
                <Button
                  key={shortcut.label}
                  variant="text"
                  color="inherit"
                  onClick={() => handleShortcut(shortcut)}
                  sx={{
                    justifyContent: "flex-start",
                    color: colors.primary_text,
                    "&:hover": {
                      bgcolor: colors.hover_bg,
                      color: colors.primary_accent,
                    },
                  }}
                >
                  {shortcut.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: colors.border_color }} />

          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color={colors.secondary_text}>
              {formattedFrom} - {formattedTo}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                onClick={handleClose}
                sx={{ color: colors.secondary_text }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  onApply({
                    fromDate: range.from.format("YYYY-MM-DD"),
                    toDate: range.to.format("YYYY-MM-DD"),
                  });
                  handleClose();
                }}
                disabled={!range.from || !range.to}
                sx={{
                  bgcolor: colors.primary_accent,
                  "&:hover": { bgcolor: colors.primary_accent },
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>
      </Popover>
    </>
  );
};

export default DateRangeBadge;
