import React from "react";
import { Box, IconButton } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import { useTheme } from "../../../hooks/useTheme";

const BillDateSelector = ({
  selectedDate,
  onDateChange,
  onPrevMonth,
  onNextMonth,
  isSmallScreen,
}) => {
  const { colors } = useTheme();

  const isNextMonthDisabled = () => {
    const currentMonth = dayjs();
    const nextMonth = selectedDate.add(1, "month");
    return nextMonth.isAfter(currentMonth, "month");
  };

  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isSmallScreen ? 1 : 2,
        flexDirection: isSmallScreen ? "column" : "row",
        mt: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={onPrevMonth}
          sx={{
            color: colors.secondary_accent,
            backgroundColor: "var(--color-primary-bg)",
            "&:hover": { backgroundColor: "var(--color-hover-bg)" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["year", "month"]}
            value={selectedDate}
            onChange={onDateChange}
            maxDate={dayjs()}
            sx={{
              background: colors.primary_bg,
              borderRadius: 2,
              color: "var(--color-primary-text)",
              ".MuiInputBase-input": {
                color: "var(--color-primary-text)",
                textAlign: "center",
                fontWeight: 600,
                fontSize: "1.1rem",
              },
              ".MuiSvgIcon-root": { color: colors.secondary_accent },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: colors.primary_accent,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.secondary_accent,
              },
              width: isSmallScreen ? "200px" : "180px",
            }}
            slotProps={{
              textField: {
                size: "small",
                variant: "outlined",
                sx: { color: "var(--color-primary-text)" },
              },
            }}
          />
        </LocalizationProvider>

        <IconButton
          onClick={onNextMonth}
          disabled={isNextMonthDisabled()}
          sx={{
            color: isNextMonthDisabled()
              ? colors.icon_muted
              : colors.secondary_accent,
            backgroundColor: "var(--color-primary-bg)",
            "&:hover": {
              backgroundColor: isNextMonthDisabled()
                ? colors.primary_bg
                : colors.hover_bg,
            },
            "&.Mui-disabled": {
              color: colors.icon_muted,
              backgroundColor: "var(--color-primary-bg)",
            },
          }}
        >
          <ArrowBackIcon style={{ transform: "scaleX(-1)" }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default BillDateSelector;
