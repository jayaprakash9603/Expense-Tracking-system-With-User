import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { APP_INFO } from "../constants/settingsConfig";
import SettingSection from "./SettingSection";
import { Info as InfoIcon } from "@mui/icons-material";

/**
 * AppInfoSection Component
 * Displays application version and build information
 * Follows Single Responsibility Principle
 */
const AppInfoSection = ({ colors }) => {
  const infoItems = [
    { label: "App Version", value: APP_INFO.version, isChip: true },
    { label: "Last Updated", value: APP_INFO.lastUpdated, isChip: false },
    { label: "Build Number", value: APP_INFO.buildNumber, isChip: false },
  ];

  return (
    <SettingSection icon={InfoIcon} title="About" colors={colors}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {infoItems.map((item, index) => (
          <Box
            key={index}
            sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
          >
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              {item.label}
            </Typography>
            {item.isChip ? (
              <Chip
                label={item.value}
                size="small"
                sx={{
                  backgroundColor: `${colors.primary_accent}20`,
                  color: colors.primary_accent,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ color: colors.primary_text, fontWeight: 600 }}
              >
                {item.value}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </SettingSection>
  );
};

export default AppInfoSection;
