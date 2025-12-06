import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Description as EmptyIcon } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

/**
 * EmptyReportsState - Component shown when no reports exist
 * 
 * Features:
 * - Centered empty state
 * - Icon and message
 * - Theme-aware styling
 * - Helpful guidance text
 */
const EmptyReportsState = () => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          bgcolor: `${colors.primary_accent}10`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%, 100%": {
              opacity: 1,
            },
            "50%": {
              opacity: 0.6,
            },
          },
        }}
      >
        <EmptyIcon
          sx={{
            fontSize: 56,
            color: colors.primary_accent,
          }}
        />
      </Box>

      <Stack spacing={1} alignItems="center" textAlign="center">
        <Typography
          variant="h6"
          sx={{
            color: colors.primary_text,
            fontWeight: 600,
          }}
        >
          No Reports Found
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: colors.secondary_text,
            maxWidth: 400,
          }}
        >
          You haven't generated any reports yet. Create your first report to see it here.
        </Typography>
      </Stack>
    </Box>
  );
};

export default EmptyReportsState;
