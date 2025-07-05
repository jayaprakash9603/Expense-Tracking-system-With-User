import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const PercentageIndicator = ({ percentage }) => {
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
        sx={{ color: "#14b8a6" }}
      />
      <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
        {percentage}%
      </Typography>
    </Box>
  );
};

export default PercentageIndicator;
