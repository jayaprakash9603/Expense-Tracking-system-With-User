import React from "react";
import { Box, Typography } from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";

/**
 * JumpToTodayButton Component
 *
 * A flexible, reusable button that allows users to quickly navigate to today's date
 *
 * @param {function} onClick - Callback function when button is clicked
 * @param {boolean} isToday - Whether the current view is already showing today
 * @param {boolean} visible - Control visibility of the button (default: true)
 * @param {string} position - Position style: 'fixed' | 'absolute' | 'relative' (default: 'absolute')
 * @param {object} customPosition - Custom positioning { top, right, bottom, left } (default: { top: 16, right: 70 })
 * @param {string} buttonText - Custom button text (default: "Today" for month view, "Jump to Today" for day view)
 * @param {string} viewType - Type of view: 'month' | 'day' (default: 'month')
 * @param {object} customStyles - Additional custom styles for the button
 * @param {number} zIndex - Custom z-index (default: 20)
 */
const JumpToTodayButton = ({
  onClick,
  isToday = false,
  visible = true,
  position = "absolute",
  customPosition = { top: 16, right: 70 },
  buttonText = null,
  viewType = "month",
  customStyles = {},
  zIndex = 20,
}) => {
  const defaultText = viewType === "month" ? "Current Month" : "Today";
  const displayText = buttonText || defaultText;

  // Don't render if not visible or if already viewing today
  if (!visible || isToday) return null;

  const baseStyles = {
    position: position,
    background: "#00dac6",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "24px",
    boxShadow: 3,
    transition: "all 0.3s ease",
    zIndex: zIndex,
    display: "flex",
    alignItems: "center",
    gap: 1,
    cursor: "pointer",
    "&:hover": {
      background: "#00b8a3",
      transform: "scale(1.05)",
      boxShadow: 4,
    },
    ...customPosition,
    ...customStyles,
  };

  return (
    <Box onClick={onClick} sx={baseStyles}>
      <TodayIcon sx={{ fontSize: 20 }} />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: "0.875rem",
          whiteSpace: "nowrap",
        }}
      >
        {displayText}
      </Typography>
    </Box>
  );
};

export default JumpToTodayButton;
