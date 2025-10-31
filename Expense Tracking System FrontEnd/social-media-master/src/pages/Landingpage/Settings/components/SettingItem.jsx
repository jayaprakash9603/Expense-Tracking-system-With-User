import React from "react";
import {
  Box,
  Typography,
  Switch,
  Button,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  Check as CheckIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

/**
 * SettingItem Component
 * Reusable component for individual setting items
 * Follows Single Responsibility Principle - handles only the rendering of a single setting item
 */
const SettingItem = ({
  icon: Icon,
  title,
  description,
  action,
  isSwitch = false,
  switchChecked = false,
  onSwitchChange,
  isButton = false,
  buttonText = "",
  onButtonClick,
  isSelect = false,
  selectValue = "",
  selectOptions = [],
  onSelectChange,
  isNavigation = false,
  onNavigationClick,
  isDanger = false,
  colors,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2.5,
        px: 0,
        transition: "all 0.2s",
        "&:hover": {
          backgroundColor: colors.hover_bg,
          mx: -2,
          px: 2,
          borderRadius: 2,
        },
      }}
    >
      {/* Left Side - Icon and Text */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: isDanger
              ? "rgba(239, 68, 68, 0.1)"
              : `${colors.primary_accent}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            sx={{
              fontSize: "1.3rem",
              color: isDanger ? "#ef4444" : colors.primary_accent,
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body1"
            sx={{
              color: isDanger ? "#ef4444" : colors.primary_text,
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.secondary_text,
              fontSize: "0.85rem",
              lineHeight: 1.4,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Action Component */}
      <Box sx={{ ml: 2, flexShrink: 0 }}>
        {isSwitch && (
          <Switch
            checked={switchChecked}
            onChange={onSwitchChange}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: colors.primary_accent,
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: colors.primary_accent,
              },
            }}
          />
        )}

        {isButton && (
          <Button
            variant="outlined"
            size="small"
            onClick={onButtonClick}
            sx={{
              borderColor: isDanger ? "#ef4444" : colors.primary_accent,
              color: isDanger ? "#ef4444" : colors.primary_accent,
              textTransform: "none",
              fontWeight: 600,
              minWidth: 80,
              "&:hover": {
                borderColor: isDanger ? "#dc2626" : colors.button_hover,
                backgroundColor: isDanger
                  ? "rgba(239, 68, 68, 0.1)"
                  : `${colors.primary_accent}15`,
              },
            }}
          >
            {buttonText}
          </Button>
        )}

        {isSelect && (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={selectValue}
              onChange={onSelectChange}
              sx={{
                color: colors.primary_text,
                backgroundColor: colors.secondary_bg,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.9rem",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border_color,
                  borderWidth: "1.5px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                  borderWidth: "2px",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                  borderWidth: "2px",
                },
                "& .MuiSvgIcon-root": {
                  color: colors.primary_accent,
                },
                "& .MuiSelect-select": {
                  py: 1.2,
                  px: 1.5,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: colors.tertiary_bg,
                    border: `1px solid ${colors.border_color}`,
                    borderRadius: 2,
                    mt: 1,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    maxHeight: 320,
                    "& .MuiMenuItem-root": {
                      color: colors.primary_text,
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      py: 1.5,
                      px: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: colors.hover_bg,
                        transform: "translateX(4px)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: `${colors.primary_accent}20`,
                        color: colors.primary_accent,
                        fontWeight: 600,
                        borderLeft: `3px solid ${colors.primary_accent}`,
                        "&:hover": {
                          backgroundColor: `${colors.primary_accent}30`,
                        },
                      },
                    },
                  },
                },
              }}
            >
              {selectOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <ListItemText
                      primary={option.label}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "0.9rem",
                          fontWeight: selectValue === option.value ? 600 : 500,
                        },
                      }}
                    />
                    {selectValue === option.value && (
                      <CheckIcon
                        sx={{
                          fontSize: "1.2rem",
                          color: colors.primary_accent,
                          ml: 1,
                        }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {isNavigation && (
          <IconButton
            size="small"
            sx={{ color: colors.secondary_text }}
            onClick={onNavigationClick}
          >
            <ChevronRightIcon />
          </IconButton>
        )}

        {action && action}
      </Box>
    </Box>
  );
};

export default SettingItem;
