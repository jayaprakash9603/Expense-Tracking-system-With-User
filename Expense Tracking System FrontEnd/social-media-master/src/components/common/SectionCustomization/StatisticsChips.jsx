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
  labels = { active: "Active", available: "Available" },
}) => {
  return (
    <Box
      sx={{
        pt: 3,
        pb: 2,
        display: "flex",
        gap: 3,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Chip
        icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
        label={`${activeCount} ${labels.active}`}
        size="small"
        sx={getChipStyles(isDark, "active")}
      />
      <Chip
        icon={<VisibilityOffIcon sx={{ fontSize: 16 }} />}
        label={`${availableCount} ${labels.available}`}
        size="small"
        sx={getChipStyles(isDark, "available")}
      />
    </Box>
  );
};

export default React.memo(StatisticsChips);
