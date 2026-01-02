import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Button, Stack, Typography, Popover, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useTheme } from "../../../hooks/useTheme";

const formatDate = (value, format) =>
  value ? dayjs(value).format(format) : "--";

const DateRangeBadge = ({
  fromDate,
  toDate,
  onApply,
  onReset,
  minDate,
  maxDate,
  dateFormat = "DD MMM YYYY",
  dialogTitle = "Select custom date range",
  helperText = "Tip: Use the timeframe selector if you prefer predefined ranges.",
  buttonProps = {},
  disableReset = false,
  buttonLabels = { from: "From", to: "To" },
}) => {
  const { colors } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [pendingRange, setPendingRange] = useState({ fromDate, toDate });
  const [error, setError] = useState("");

  useEffect(() => {
    setPendingRange({ fromDate, toDate });
    setError("");
  }, [fromDate, toDate]);

  const minDayjs = useMemo(() => (minDate ? dayjs(minDate) : null), [minDate]);
  const maxDayjs = useMemo(() => (maxDate ? dayjs(maxDate) : null), [maxDate]);
  const textFieldStyles = useMemo(
    () => ({
      flex: 1,
      minWidth: 150,
      "& .MuiInputBase-root": {
        background: colors.secondary_bg,
        color: colors.primary_text,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.border_color,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.primary_accent,
      },
      "& .MuiSvgIcon-root": {
        color: colors.primary_accent,
      },
    }),
    [colors]
  );
  const popperSlotProps = useMemo(
    () => ({
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
          },
          "&:hover": {
            background: `${colors.primary_accent}25`,
          },
        },
        "& .MuiPickersCalendarHeader-label": {
          color: colors.primary_text,
        },
        "& .MuiDayCalendar-weekDayLabel": {
          color: colors.secondary_text,
        },
      },
    }),
    [colors]
  );

  const formattedFrom = useMemo(
    () => formatDate(fromDate, dateFormat),
    [fromDate, dateFormat]
  );
  const formattedTo = useMemo(
    () => formatDate(toDate, dateFormat),
    [toDate, dateFormat]
  );

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePendingChange = (field, value) => {
    setPendingRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleDatePickerChange = (field, value) => {
    const formattedValue =
      value && value.isValid() ? value.format("YYYY-MM-DD") : "";
    handlePendingChange(field, formattedValue);
    setError("");
  };

  const validateRange = () => {
    if (!pendingRange?.fromDate || !pendingRange?.toDate) {
      setError("Select both From and To dates.");
      return false;
    }

    if (dayjs(pendingRange.fromDate).isAfter(dayjs(pendingRange.toDate))) {
      setError("From date cannot be after To date.");
      return false;
    }

    if (minDate && dayjs(pendingRange.fromDate).isBefore(dayjs(minDate))) {
      setError(
        `From date cannot be before ${formatDate(minDate, dateFormat)}.`
      );
      return false;
    }

    if (maxDate && dayjs(pendingRange.toDate).isAfter(dayjs(maxDate))) {
      setError(`To date cannot be after ${formatDate(maxDate, dateFormat)}.`);
      return false;
    }

    return true;
  };

  const handleApply = () => {
    if (!validateRange()) {
      return;
    }

    onApply?.({
      fromDate: pendingRange.fromDate,
      toDate: pendingRange.toDate,
    });
    handleClose();
  };

  const handleReset = () => {
    onReset?.();
    handleClose();
  };

  const {
    style: externalStyle,
    onClick: customOnClick,
    ...restButtonProps
  } = buttonProps;

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

  const handleButtonClick = (event) => {
    customOnClick?.(event);
    if (event?.defaultPrevented) {
      return;
    }
    setPendingRange({ fromDate, toDate });
    setError("");
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <button
        type="button"
        {...restButtonProps}
        style={mergedButtonStyle}
        onClick={handleButtonClick}
      >
        <span style={{ color: colors.primary_accent }}>
          {buttonLabels.from}
        </span>
        <span>{formattedFrom}</span>
        <span style={{ opacity: 0.6 }}>→</span>
        <span style={{ color: colors.primary_accent }}>{buttonLabels.to}</span>
        <span>{formattedTo}</span>
      </button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{
          sx: {
            p: 2.5,
            width: 480,
            maxWidth: "calc(100vw - 32px)",
            background: colors.primary_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              {dialogTitle}
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="flex-start"
            >
              <DatePicker
                label={buttonLabels.from}
                value={
                  pendingRange?.fromDate ? dayjs(pendingRange.fromDate) : null
                }
                onChange={(value) => handleDatePickerChange("fromDate", value)}
                format={dateFormat}
                minDate={minDayjs}
                maxDate={
                  pendingRange?.toDate ? dayjs(pendingRange.toDate) : maxDayjs
                }
                slotProps={{
                  textField: {
                    size: "small",
                    sx: textFieldStyles,
                  },
                  popper: popperSlotProps,
                }}
              />
              <DatePicker
                label={buttonLabels.to}
                value={pendingRange?.toDate ? dayjs(pendingRange.toDate) : null}
                onChange={(value) => handleDatePickerChange("toDate", value)}
                format={dateFormat}
                minDate={
                  pendingRange?.fromDate
                    ? dayjs(pendingRange.fromDate)
                    : minDayjs
                }
                maxDate={maxDayjs}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: textFieldStyles,
                  },
                  popper: popperSlotProps,
                }}
              />
            </Stack>
            {error ? (
              <Typography
                color="error"
                variant="caption"
                mt={1}
                display="block"
              >
                {error}
              </Typography>
            ) : null}
            {helperText ? (
              <Typography
                variant="caption"
                color="text.secondary"
                mt={1}
                display="block"
              >
                {helperText}
              </Typography>
            ) : null}
            <Stack
              direction="row"
              justifyContent={disableReset ? "flex-end" : "space-between"}
              alignItems="center"
              mt={2}
            >
              {!disableReset && (
                <Button color="secondary" onClick={handleReset}>
                  Reset
                </Button>
              )}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={handleApply}>
                  Apply
                </Button>
              </Box>
            </Stack>
          </Box>
        </LocalizationProvider>
      </Popover>
    </>
  );
};

export default DateRangeBadge;
