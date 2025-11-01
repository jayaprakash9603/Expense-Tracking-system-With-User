import React, { useState } from "react";
import {
  Box,
  Typography,
  Switch,
  Chip,
  IconButton,
  Collapse,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  PhoneAndroid as PhoneIcon,
  Sms as SmsIcon,
} from "@mui/icons-material";
import {
  NOTIFICATION_METHODS,
  NOTIFICATION_FREQUENCY_OPTIONS,
} from "../constants/notificationConfig";

/**
 * Individual Notification Item Component
 * Displays a single notification type with toggle, frequency, and delivery methods
 *
 * @param {Object} notification - Notification configuration
 * @param {Object} preferences - Current notification preferences
 * @param {Function} onToggle - Callback when toggle changes
 * @param {Function} onFrequencyChange - Callback when frequency changes
 * @param {Function} onMethodToggle - Callback when delivery method changes
 * @param {Object} colors - Theme colors
 * @param {boolean} serviceEnabled - Whether parent service is enabled
 */
const NotificationItem = ({
  notification,
  preferences,
  onToggle,
  onFrequencyChange,
  onMethodToggle,
  colors,
  serviceEnabled,
  serviceColor,
}) => {
  const [expanded, setExpanded] = useState(false);
  const NotificationIcon = notification.icon;

  const isEnabled = preferences?.enabled ?? notification.defaultEnabled;
  const frequency = preferences?.frequency ?? "instant";
  const methods = preferences?.methods ?? notification.methods;

  const methodIcons = {
    [NOTIFICATION_METHODS.IN_APP]: NotificationsIcon,
    [NOTIFICATION_METHODS.EMAIL]: EmailIcon,
    [NOTIFICATION_METHODS.PUSH]: PhoneIcon,
    [NOTIFICATION_METHODS.SMS]: SmsIcon,
  };

  const priorityColors = {
    low: "#64748b",
    medium: "#3b82f6",
    high: "#f59e0b",
    critical: "#ef4444",
  };

  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.card_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "8px",
        overflow: "hidden",
        opacity: serviceEnabled && isEnabled ? 1 : 0.6,
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: serviceEnabled ? serviceColor : colors.border_color,
        },
      }}
    >
      {/* Main Notification Row */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${priorityColors[notification.priority]}20`,
            color: priorityColors[notification.priority],
            flexShrink: 0,
          }}
        >
          <NotificationIcon sx={{ fontSize: 20 }} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: colors.text_primary,
                fontSize: "14px",
              }}
            >
              {notification.title}
            </Typography>
            <Chip
              size="small"
              label={priorityLabels[notification.priority]}
              sx={{
                height: 18,
                fontSize: "10px",
                fontWeight: 600,
                backgroundColor: `${priorityColors[notification.priority]}15`,
                color: priorityColors[notification.priority],
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: colors.text_muted,
              fontSize: "12px",
              lineHeight: 1.3,
              display: "block",
            }}
          >
            {notification.description}
          </Typography>
        </Box>

        {/* Toggle */}
        <Switch
          checked={isEnabled}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={!serviceEnabled}
          size="small"
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: serviceColor,
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: serviceColor,
            },
          }}
        />

        {/* Expand Button */}
        {isEnabled && serviceEnabled && (
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: colors.text_muted,
              padding: "4px",
            }}
          >
            <ExpandMoreIcon
              sx={{
                fontSize: 20,
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
        )}
      </Box>

      {/* Expanded Details */}
      <Collapse in={expanded && isEnabled && serviceEnabled}>
        <Box
          sx={{
            px: 2,
            pb: 2,
            pt: 0,
            backgroundColor: colors.secondary_bg,
            borderTop: `1px solid ${colors.border_color}`,
          }}
        >
          {/* Frequency Selector */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.text_muted,
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                mb: 1,
                display: "block",
              }}
            >
              Notification Frequency
            </Typography>
            <Select
              value={frequency}
              onChange={(e) => onFrequencyChange(e.target.value)}
              size="small"
              fullWidth
              sx={{
                fontSize: "13px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border_color,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: serviceColor,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: serviceColor,
                },
              }}
            >
              {NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Delivery Methods */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: colors.text_muted,
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                mb: 1,
                display: "block",
              }}
            >
              Delivery Methods
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {Object.entries(notification.methods).map(([method, _]) => {
                const MethodIcon = methodIcons[method];
                const methodLabels = {
                  [NOTIFICATION_METHODS.IN_APP]: "In-App",
                  [NOTIFICATION_METHODS.EMAIL]: "Email",
                  [NOTIFICATION_METHODS.PUSH]: "Push",
                  [NOTIFICATION_METHODS.SMS]: "SMS",
                };

                return (
                  <FormControlLabel
                    key={method}
                    control={
                      <Checkbox
                        checked={methods[method] ?? false}
                        onChange={(e) =>
                          onMethodToggle(method, e.target.checked)
                        }
                        size="small"
                        sx={{
                          color: colors.text_muted,
                          "&.Mui-checked": {
                            color: serviceColor,
                          },
                        }}
                      />
                    }
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <MethodIcon
                          sx={{ fontSize: 16, color: colors.text_muted }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "13px", color: colors.text_primary }}
                        >
                          {methodLabels[method]}
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default NotificationItem;
