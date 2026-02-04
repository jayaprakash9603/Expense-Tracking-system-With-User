import React from "react";
import { Box, Chip } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { getChipStyles } from "./customizationStyles";

/**
 * StatisticsChips - Displays active/available section counts
 * Follows Single Responsibility: Only renders statistics
 */
const StatisticsChips = ({
  activeCount,
  availableCount,
  isDark,
  isMobile = false,
  labels = { active: "Active", available: "Available" },
}) => {
  return (
    <Box
      sx={{
        pt: isMobile ? 2 : 3,
        pb: isMobile ? 1.5 : 2,
        display: "flex",
        gap: isMobile ? 1.5 : 3,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Chip
        icon={<CheckCircleIcon sx={{ fontSize: isMobile ? 14 : 16 }} />}
        label={`${activeCount} ${labels.active}`}
        size="small"
        sx={{
          ...getChipStyles(isDark, "active"),
          fontSize: isMobile ? '0.7rem' : '0.75rem',
          height: isMobile ? 24 : 28,
        }}
      />
      <Chip
        icon={<VisibilityOffIcon sx={{ fontSize: isMobile ? 14 : 16 }} />}
        label={`${availableCount} ${labels.available}`}
        size="small"
        sx={{
          ...getChipStyles(isDark, "available"),
          fontSize: isMobile ? '0.7rem' : '0.75rem',
          height: isMobile ? 24 : 28,
        }}
      />
    </Box>
  );
};

export default React.memo(StatisticsChips);
