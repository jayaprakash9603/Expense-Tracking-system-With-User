import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "../hooks/useTheme";

const PercentageIndicator = ({ percentage }) => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      <CircularProgress
        variant="determinate"
        value={percentage}
        sx={{ color: colors.primary_accent }}
      />
      <Typography variant="body2" sx={{ color: colors.primary_text, fontWeight: 600 }}>
        {percentage}%
      </Typography>
    </Box>
  );
};

export default PercentageIndicator;
