import React from 'react';
import { Box, IconButton } from '@mui/material';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

const BillDateSelector = ({ 
  selectedDate, 
  onDateChange, 
  onPrevMonth, 
  onNextMonth,
  isSmallScreen 
}) => {
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
            color: "#00dac6",
            backgroundColor: "#1b1b1b",
            "&:hover": { backgroundColor: "#28282a" },
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
              background: "#1b1b1b",
              borderRadius: 2,
              color: "#fff",
              ".MuiInputBase-input": {
                color: "#fff",
                textAlign: "center",
                fontWeight: 600,
                fontSize: "1.1rem",
              },
              ".MuiSvgIcon-root": { color: "#00dac6" },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#14b8a6",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00dac6",
              },
              width: isSmallScreen ? "200px" : "180px",
            }}
            slotProps={{
              textField: {
                size: "small",
                variant: "outlined",
                sx: { color: "#fff" },
              },
            }}
          />
        </LocalizationProvider>

        <IconButton
          onClick={onNextMonth}
          disabled={isNextMonthDisabled()}
          sx={{
            color: isNextMonthDisabled() ? "#666" : "#00dac6",
            backgroundColor: "#1b1b1b",
            "&:hover": {
              backgroundColor: isNextMonthDisabled() ? "#1b1b1b" : "#28282a",
            },
            "&.Mui-disabled": {
              color: "#666",
              backgroundColor: "#1b1b1b",
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