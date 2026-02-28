import React from "react";
import PropTypes from "prop-types";
import { Box, ButtonBase, Typography } from "@mui/material";

const modes = [
  { key: "loss", label: "Loss" },
  { key: "gain", label: "Gain" },
  { key: "both", label: "Both" },
];

function getIndex(value) {
  const idx = modes.findIndex((m) => m.key === value);
  return idx === -1 ? 2 : idx;
}

export default function HeatmapModeToggle({
  value,
  onChange,
  lossColor,
  gainColor,
  background,
  borderColor,
  textColor,
}) {
  const selectedIndex = getIndex(value);

  const indicatorBg =
    value === "loss"
      ? lossColor
      : value === "gain"
        ? gainColor
        : `linear-gradient(90deg, ${lossColor} 0%, ${gainColor} 100%)`;

  return (
    <Box
      role="group"
      aria-label="Heatmap mode"
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        background,
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        overflow: "hidden",
        height: 34,
        px: 0.5,
        boxShadow: 1,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 3,
          bottom: 3,
          left: 3,
          width: `calc((100% - 6px) / 3)`,
          borderRadius: 1.5,
          background: indicatorBg,
          transform: `translateX(${selectedIndex * 100}%)`,
          transition: "transform 220ms ease, background 220ms ease",
          opacity: 0.95,
          filter: "saturate(1.15)",
        }}
      />

      {modes.map((m) => {
        const selected = m.key === value;
        return (
          <ButtonBase
            key={m.key}
            onClick={() => onChange?.(m.key)}
            aria-pressed={selected}
            sx={{
              position: "relative",
              zIndex: 1,
              flex: 1,
              height: 28,
              borderRadius: 1.5,
              px: 1.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 200ms ease, transform 200ms ease",
              ...(selected
                ? {
                    transform: "translateY(-0.5px)",
                  }
                : null),
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.2,
                color: selected ? "#0b1220" : textColor,
                transition: "color 200ms ease",
                textShadow: selected ? "none" : "0 1px 0 rgba(0,0,0,0.35)",
                userSelect: "none",
              }}
            >
              {m.label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

HeatmapModeToggle.propTypes = {
  value: PropTypes.oneOf(["loss", "gain", "both"]).isRequired,
  onChange: PropTypes.func,
  lossColor: PropTypes.string.isRequired,
  gainColor: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
};
