import React from "react";
import { Box, Typography, Paper, Divider, Chip } from "@mui/material";

/**
 * SettingSection Component
 * Reusable component for grouping related settings
 * Follows Open/Closed Principle - can be extended without modification
 */
const SettingSection = ({
  icon: Icon,
  title,
  children,
  colors,
  showChip = false,
  chipLabel = "",
  chipColor = "",
}) => {
  return (
    <Paper
      sx={{
        backgroundColor: colors.tertiary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: 3,
        p: 3,
        mb: 3,
        boxShadow: "none",
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: `${colors.primary_accent}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: colors.primary_accent, fontSize: "1.3rem" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: colors.primary_text,
              fontWeight: 700,
              letterSpacing: "-0.3px",
            }}
          >
            {title}
          </Typography>
        </Box>
        {showChip && chipLabel && (
          <Chip
            label={chipLabel}
            size="small"
            sx={{
              backgroundColor: chipColor || `${colors.primary_accent}20`,
              color: colors.primary_accent,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        )}
      </Box>

      {/* Section Content */}
      <Box>
        {React.Children.map(children, (child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < React.Children.count(children) - 1 && (
              <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );
};

export default SettingSection;
