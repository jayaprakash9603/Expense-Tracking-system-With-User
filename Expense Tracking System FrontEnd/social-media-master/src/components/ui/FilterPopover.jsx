import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  Popover,
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { useTheme } from "../../hooks/useTheme";

dayjs.extend(isBetween);

// --- Custom Day Component for Range Selection (Borrowed from DateRangeBadge) ---
function CustomRangeDay(props) {
  const {
    day,
    selectedDate,
    hoveredDate,
    onHover,
    range,
    outsideCurrentMonth,
    ...other
  } = props;
  const { colors } = useTheme();

  if (outsideCurrentMonth) {
    return (
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{ opacity: 0, pointerEvents: "none" }}
      />
    );
  }

  const isSelectedStart = range.from && day.isSame(range.from, "day");
  const isSelectedEnd = range.to && day.isSame(range.to, "day");
  const isHoveredEnd =
    range.from && !range.to && hoveredDate && day.isSame(hoveredDate, "day");

  const isSelected = isSelectedStart || isSelectedEnd || isHoveredEnd;
  const isWithinHover =
    range.from &&
    !range.to &&
    hoveredDate &&
    day.isAfter(range.from, "day") &&
    day.isBefore(hoveredDate, "day");
  const isWithinRange =
    range.from &&
    range.to &&
    day.isAfter(range.from, "day") &&
    day.isBefore(range.to, "day");

  const styles = {
    borderRadius: "50%",
    ...((isWithinRange || isWithinHover) && {
      borderRadius: 0,
      backgroundColor: `${colors.primary_accent}15`,
      color: colors.primary_text,
    }),
    ...(isSelectedStart && {
      backgroundColor: colors.primary_accent,
      color: "#fff",
      borderRadius: "50% 0 0 50%",
      "&:hover": { backgroundColor: colors.primary_accent },
    }),
    ...((isSelectedEnd || isHoveredEnd) && {
      backgroundColor: colors.primary_accent,
      color: "#fff",
      borderRadius: "0 50% 50% 0",
      "&:hover": { backgroundColor: colors.primary_accent },
    }),
    ...(isSelectedStart &&
      (isSelectedEnd || isHoveredEnd) && {
        borderRadius: "50%",
      }),
  };

  return (
    <PickersDay
      {...other}
      day={day}
      selected={false}
      onMouseEnter={() => onHover && onHover(day)}
      sx={styles}
    />
  );
}

// --- Custom Day Component for Multiple Selection ---
function CustomMultiDay(props) {
  const { day, selectedDates = [], ...other } = props;
  const { colors } = useTheme();

  const isSelected = selectedDates.some((d) => day.isSame(d, "day"));

  return (
    <PickersDay
      {...other}
      day={day}
      selected={isSelected}
      sx={{
        ...(isSelected && {
          backgroundColor: colors.primary_accent,
          color: "#fff",
          "&:hover": { backgroundColor: colors.primary_accent },
        }),
      }}
    />
  );
}

const OPERATORS_BY_TYPE = {
  text: [
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Not Contains" },
    { value: "equals", label: "Equals" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "neq", label: "Not equal" },
  ],
  number: [
    { value: "equals", label: "Equals (=)" },
    { value: "gt", label: "Greater than (>)" },
    { value: "lt", label: "Less than (<)" },
    { value: "gte", label: "Greater/Equal (>=)" },
    { value: "lte", label: "Less/Equal (<=)" },
    { value: "neq", label: "Not equal (!=)" },
  ],
  date: [
    { value: "equals", label: "Is On" },
    { value: "range", label: "Range" },
    { value: "oneOf", label: "Multiple Dates" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "neq", label: "Not On" },
  ],
};

export default function FilterPopover({
  open,
  anchorEl,
  column,
  type = "text",
  initialOperator,
  initialValue = "",
  onClose,
  onApply,
  onClear,
}) {
  const { colors, mode } = useTheme();

  // Decide default operator based on type
  const getDefaultOperator = (t) => {
    if (t === "number") return "equals";
    if (t === "date") return "range"; // Default to range for dates
    return "contains";
  };

  const [operator, setOperator] = useState(
    initialOperator || getDefaultOperator(type),
  );
  const [value, setValue] = useState(initialValue);

  // Date Range State
  const [range, setRange] = useState({ from: null, to: null });
  const [hoveredDate, setHoveredDate] = useState(null);

  // Multiple Date State
  const [selectedDates, setSelectedDates] = useState([]);
  // Multiple String State
  const [selectedStrings, setSelectedStrings] = useState([]);

  const currentOperators = OPERATORS_BY_TYPE[type] || OPERATORS_BY_TYPE.text;

  // Reset state when popover opens with new props
  useEffect(() => {
    if (open) {
      const op = initialOperator || getDefaultOperator(type);
      setOperator(op);

      if (type === "date") {
        if (
          op === "range" &&
          initialValue &&
          typeof initialValue === "object"
        ) {
          setRange({
            from: initialValue.from ? dayjs(initialValue.from) : null,
            to: initialValue.to ? dayjs(initialValue.to) : null,
          });
        } else if (op === "oneOf" && Array.isArray(initialValue)) {
          setSelectedDates(initialValue.map((d) => dayjs(d)));
        } else {
          setValue(initialValue || "");
          // Reset complex states
          setRange({ from: null, to: null });
          setSelectedDates([]);
        }
      } else if (type === "text") {
        if (Array.isArray(initialValue)) {
          setSelectedStrings(initialValue);
          setValue("");
        } else if (initialValue) {
          setSelectedStrings([initialValue]);
          setValue("");
        } else {
          setSelectedStrings([]);
          setValue("");
        }
      } else {
        setValue(initialValue || "");
      }
    }
  }, [open, initialOperator, initialValue, type]);

  const handleApply = () => {
    let finalValue = value;
    if (type === "date") {
      if (operator === "range") {
        finalValue = {
          from: range.from ? range.from.format("YYYY-MM-DD") : null,
          to: range.to ? range.to.format("YYYY-MM-DD") : null,
        };
      } else if (operator === "oneOf") {
        finalValue = selectedDates.map((d) => d.format("YYYY-MM-DD"));
      }
    } else if (type === "text") {
      const currentInput = value.trim();
      if (currentInput && !selectedStrings.includes(currentInput)) {
        finalValue = [...selectedStrings, currentInput];
      } else {
        // If no input buffer, use existing collection.
        // If collection is empty, finalValue is empty array (or whatever selectedStrings is).
        finalValue = selectedStrings;
      }
    }

    onApply({ operator, value: finalValue });
    onClose();
  };

  const handleClear = () => {
    setValue("");
    setRange({ from: null, to: null });
    setSelectedDates([]);
    setSelectedStrings([]);
    setOperator(getDefaultOperator(type));
    onClear();
    onClose();
  };

  // Range Handler
  const handleDayClickRange = (day) => {
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

  // Multiple Handler
  const handleDayClickMultiple = (day) => {
    const exists = selectedDates.some((d) => d.isSame(day, "day"));
    if (exists) {
      setSelectedDates((prev) => prev.filter((d) => !d.isSame(day, "day")));
    } else {
      setSelectedDates((prev) => [...prev, day]);
    }
  };

  // Multiple String Handler
  const handleStringAdd = (e) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      if (!selectedStrings.includes(value.trim())) {
        setSelectedStrings((prev) => [...prev, value.trim()]);
      }
      setValue("");
    }
  };

  const handleStringDelete = (str) => {
    setSelectedStrings((prev) => prev.filter((s) => s !== str));
  };

  const isWide =
    type === "date" && (operator === "range" || operator === "oneOf");

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          p: 2,
          width: isWide ? (operator === "range" ? 360 : 340) : 320,
          backgroundColor: colors.secondary_bg,
          color: colors.primary_text,
          border: `1px solid ${colors.border_color}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Filter by {column?.label}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: colors.icon_muted }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel sx={{ color: colors.secondary_text }}>Operator</InputLabel>
        <Select
          value={operator}
          label="Operator"
          onChange={(e) => setOperator(e.target.value)}
          sx={{
            color: colors.primary_text,
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: colors.border_color,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.primary_accent,
            },
            ".MuiSvgIcon-root": { color: colors.icon_muted },
          }}
        >
          {currentOperators.map((op) => (
            <MenuItem key={op.value} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Conditional Rendering based on Type and Operator */}
      {type === "date" && operator === "range" ? (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color={colors.secondary_text}
            sx={{ mb: 1, display: "block" }}
          >
            Select Range: {range.from ? range.from.format("DD MMM") : "--"} -{" "}
            {range.to ? range.to.format("DD MMM") : "--"}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={range.from}
              onChange={handleDayClickRange}
              slots={{ day: CustomRangeDay }}
              slotProps={{
                day: {
                  range,
                  hoveredDate,
                  onHover: setHoveredDate,
                },
              }}
              views={["day"]}
              showDaysOutsideCurrentMonth
              disableHighlightToday
              sx={{
                width: "100%",
                margin: 0,
                "& .MuiPickersCalendarHeader-root": { pl: 0, pr: 0 },
                "& .MuiDayCalendar-weekContainer": { justifyContent: "center" },
                "& .MuiPickersDay-root": { color: colors.primary_text },
                "& .MuiPickersCalendarHeader-label": {
                  color: colors.primary_text,
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: colors.secondary_text,
                },
                "& .MuiIconButton-root": { color: colors.primary_text },
              }}
            />
          </LocalizationProvider>
        </Box>
      ) : type === "date" && operator === "oneOf" ? (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color={colors.secondary_text}
            sx={{ mb: 1, display: "block" }}
          >
            Selected Dates: {selectedDates.length}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              mb: 1,
              maxHeight: 60,
              overflowY: "auto",
            }}
          >
            {selectedDates.map((d) => (
              <Chip
                key={d.toString()}
                label={d.format("DD MMM")}
                size="small"
                onDelete={() => handleDayClickMultiple(d)}
              />
            ))}
          </Box>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              onChange={handleDayClickMultiple}
              slots={{ day: CustomMultiDay }}
              slotProps={{
                day: { selectedDates },
              }}
              views={["day"]}
              sx={{
                width: "100%",
                margin: 0,
                "& .MuiPickersCalendarHeader-root": { pl: 0, pr: 0 },
                "& .MuiPickersDay-root": { color: colors.primary_text },
                "& .MuiPickersCalendarHeader-label": {
                  color: colors.primary_text,
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: colors.secondary_text,
                },
                "& .MuiIconButton-root": { color: colors.primary_text },
              }}
            />
          </LocalizationProvider>
        </Box>
      ) : type === "text" ? (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              mb: 1,
              maxHeight: 60,
              overflowY: "auto",
            }}
          >
            {selectedStrings.map((str) => (
              <Chip
                key={str}
                label={str}
                size="small"
                onDelete={() => handleStringDelete(str)}
              />
            ))}
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Type and press Enter..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleStringAdd}
            sx={{
              mb: 1,
              input: { color: colors.primary_text },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: colors.border_color,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.primary_accent,
              },
            }}
          />
          <Typography variant="caption" color={colors.secondary_text}>
            Press Enter to add multiple values
          </Typography>
        </Box>
      ) : (
        <TextField
          fullWidth
          size="small"
          placeholder="Filter value..."
          value={value}
          type={type === "number" ? "number" : "text"}
          onChange={(e) => setValue(e.target.value)}
          sx={{
            mb: 2,
            input: { color: colors.primary_text },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: colors.border_color,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.primary_accent,
            },
          }}
        />
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleClear}
          sx={{
            color: colors.primary_text,
            borderColor: colors.border_color,
            "&:hover": { borderColor: colors.primary_text },
          }}
        >
          Clear
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleApply}
          sx={{
            backgroundColor: colors.primary_accent,
            color: "#fff",
            "&:hover": {
              backgroundColor: colors.secondary_accent || colors.primary_accent,
            },
          }}
        >
          Apply
        </Button>
      </Box>
    </Popover>
  );
}
