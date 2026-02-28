import React from "react";
import { Menu, MenuItem } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * MonthPickerDropdown - A dropdown component to select months with expenses
 * @param {Object} anchorEl - The anchor element for the dropdown
 * @param {Boolean} open - Whether the dropdown is open
 * @param {Function} onClose - Callback to close the dropdown
 * @param {Array} availableMonths - Array of {year, month, monthOnly} objects
 * @param {String} currentMonth - Currently selected month
 * @param {Function} onMonthSelect - Callback when a month is selected (year, month)
 */
const MonthPickerDropdown = ({
  anchorEl,
  open,
  onClose,
  availableMonths = [],
  currentMonth,
  onMonthSelect,
}) => {
  const { colors } = useTheme();

  return (
    <>
      <style>
        {`
          .month-picker-menu .MuiPaper-root::-webkit-scrollbar {
            width: 8px;
          }
          
          .month-picker-menu .MuiPaper-root::-webkit-scrollbar-track {
            background: ${
              colors.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.05)"
            };
            border-radius: 10px;
            margin: 8px 0;
          }
          
          .month-picker-menu .MuiPaper-root::-webkit-scrollbar-thumb {
            background: ${colors.primary_accent}40;
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }
          
          .month-picker-menu .MuiPaper-root::-webkit-scrollbar-thumb:hover {
            background: ${colors.primary_accent}60;
            background-clip: padding-box;
          }
          
          /* Firefox scrollbar */
          .month-picker-menu .MuiPaper-root {
            scrollbar-width: thin;
            scrollbar-color: ${colors.primary_accent}40 ${
          colors.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)"
        };
          }
        `}
      </style>
      <Menu
        className="month-picker-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          style: {
            maxHeight: 320,
            width: "200px",
            background: colors.primary_bg,
            border: `1px solid ${colors.border_color}`,
            boxShadow:
              colors.mode === "dark"
                ? "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                : "0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            borderRadius: "12px",
            marginTop: "8px",
            overflowY: "auto",
            overflowX: "hidden",
          },
        }}
        MenuListProps={{
          style: {
            padding: "8px 0",
          },
        }}
      >
        {availableMonths.length > 0 ? (
          availableMonths.map((item) => (
            <MenuItem
              key={`${item.year}-${item.month}`}
              onClick={() => {
                onMonthSelect(item.year, item.month);
                onClose();
              }}
              selected={currentMonth === item.month}
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                padding: "12px 20px",
                color: colors.primary_text,
                margin: "0 8px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: `${colors.primary_accent}15`,
                },
                "&.Mui-selected": {
                  background: `${colors.primary_accent}20`,
                  color: colors.primary_accent,
                  fontWeight: "600",
                  "&:hover": {
                    background: `${colors.primary_accent}28`,
                  },
                },
              }}
            >
              {item.monthOnly}
            </MenuItem>
          ))
        ) : (
          <MenuItem
            disabled
            sx={{
              fontSize: "13px",
              color: colors.secondary_text,
              padding: "12px 20px",
              justifyContent: "center",
            }}
          >
            No months available
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default MonthPickerDropdown;
