import React from "react";
import { Box, Typography, Switch, Chip } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

/**
 * Notification Service Card Component
 * Displays a service with master toggle and collapsible notification list
 *
 * @param {Object} service - Service configuration
 * @param {boolean} serviceEnabled - Whether service notifications are enabled
 * @param {Function} onServiceToggle - Callback when service toggle changes
 * @param {boolean} expanded - Whether the card is expanded
 * @param {Function} onToggleExpand - Callback to toggle expansion
 * @param {Object} colors - Theme colors
 * @param {ReactNode} children - Child notification items
 */
const NotificationServiceCard = ({
  service,
  serviceEnabled,
  onServiceToggle,
  expanded,
  onToggleExpand,
  colors,
  children,
  notificationCount,
  enabledCount,
}) => {
  const ServiceIcon = service.icon;

  return (
    <Box
      sx={{
        backgroundColor: colors.card_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "12px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: `0 4px 12px ${colors.primary_accent}20`,
          borderColor: colors.primary_accent,
        },
      }}
    >
      {/* Service Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
          backgroundColor: expanded
            ? `${service.color}10`
            : colors.secondary_bg,
          borderBottom: expanded ? `1px solid ${colors.border_color}` : "none",
          transition: "all 0.3s ease",
        }}
        onClick={onToggleExpand}
      >
        {/* Service Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${service.color}20, ${service.color}40)`,
            color: service.color,
            flexShrink: 0,
          }}
        >
          <ServiceIcon sx={{ fontSize: 28 }} />
        </Box>

        {/* Service Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.text_primary,
                fontSize: "16px",
              }}
            >
              {service.name}
            </Typography>
            <Chip
              size="small"
              label={`${enabledCount}/${notificationCount}`}
              sx={{
                height: 20,
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: serviceEnabled
                  ? `${service.color}20`
                  : `${colors.text_muted}20`,
                color: serviceEnabled ? service.color : colors.text_muted,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: colors.text_muted,
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            {service.description}
          </Typography>
        </Box>

        {/* Master Toggle */}
        <Switch
          checked={serviceEnabled}
          onChange={(e) => {
            e.stopPropagation();
            onServiceToggle(e.target.checked);
          }}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: service.color,
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: service.color,
            },
          }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Expand Icon */}
        <ExpandMoreIcon
          sx={{
            color: colors.text_muted,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </Box>

      {/* Notification Items (Collapsible) */}
      {expanded && (
        <Box
          sx={{
            p: 2,
            pt: 1,
            backgroundColor: colors.secondary_bg,
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

export default NotificationServiceCard;
