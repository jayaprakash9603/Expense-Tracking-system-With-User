import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
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
  const [open, setOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState({ fromDate, toDate });
  const [error, setError] = useState("");

  useEffect(() => {
    setPendingRange({ fromDate, toDate });
    setError("");
  }, [fromDate, toDate]);

  const formattedFrom = useMemo(
    () => formatDate(fromDate, dateFormat),
    [fromDate, dateFormat]
  );
  const formattedTo = useMemo(
    () => formatDate(toDate, dateFormat),
    [toDate, dateFormat]
  );

  const handleOpen = () => {
    setPendingRange({ fromDate, toDate });
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePendingChange = (field, value) => {
    setPendingRange((prev) => ({ ...prev, [field]: value }));
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
    setOpen(false);
  };

  const handleReset = () => {
    onReset?.();
    setOpen(false);
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
    handleOpen();
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label={buttonLabels.from}
              type="date"
              value={pendingRange?.fromDate || ""}
              onChange={(e) => handlePendingChange("fromDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{ min: minDate, max: maxDate }}
            />
            <TextField
              label={buttonLabels.to}
              type="date"
              value={pendingRange?.toDate || ""}
              onChange={(e) => handlePendingChange("toDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{ min: minDate, max: maxDate }}
            />
          </Stack>
          {error ? (
            <Typography color="error" variant="caption" mt={1} display="block">
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
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
          {!disableReset && (
            <Button color="secondary" onClick={handleReset}>
              Reset
            </Button>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DateRangeBadge;
