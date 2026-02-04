import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, useTheme as useMuiTheme } from "@mui/material";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import { keyframes } from "@mui/system";

const popIn = keyframes`
  0% { opacity: 0; transform: translateY(2px); }
  100% { opacity: 1; transform: translateY(0); }
`;

function getIcon(icon) {
  switch (icon) {
    case "up":
      return <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} />;
    case "down":
      return <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />;
    case "line":
      return <RemoveRoundedIcon sx={{ fontSize: 18 }} />;
    case "dot":
    default:
      return <FiberManualRecordRoundedIcon sx={{ fontSize: 10 }} />;
  }
}

export default function SpendingMomentumInsight({
  insight,
  colors,
  spendingColor,
  incomeColor,
}) {
  const muiTheme = useMuiTheme();
  const [animateKey, setAnimateKey] = useState(insight?.key ?? "");

  useEffect(() => {
    if (insight?.key && insight.key !== animateKey) {
      setAnimateKey(insight.key);
    }
  }, [insight?.key, animateKey]);

  const toneColor = useMemo(() => {
    if (!insight) return colors?.placeholder_text;
    if (insight.tone === "bad") return spendingColor;
    if (insight.tone === "good") return incomeColor;
    if (insight.tone === "warn") return muiTheme.palette.warning.main;
    return colors?.placeholder_text;
  }, [
    insight,
    colors,
    spendingColor,
    incomeColor,
    muiTheme.palette.warning.main,
  ]);

  if (!insight?.message) return null;

  return (
    <Box
      key={animateKey}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.8,
        px: 1.25,
        py: 0.6,
        borderRadius: 999,
        backgroundColor: colors?.primary_bg,
        border: `1px solid ${colors?.border}`,
        color: toneColor,
        maxWidth: "100%",
        animation: `${popIn} 220ms ease-out`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", color: toneColor }}>
        {getIcon(insight.icon)}
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: toneColor,
          fontWeight: 800,
          letterSpacing: 0.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: { xs: "72vw", sm: "46vw", md: "34vw" },
        }}
        title={insight.message}
      >
        {insight.message}
      </Typography>
    </Box>
  );
}
