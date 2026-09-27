import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Box, ButtonBase, Typography } from "@mui/material";
import { useTranslation } from "../../hooks/useTranslation";

const MODE_KEYS = ["loss", "gain", "both"];

function getIndex(value) {
  const idx = MODE_KEYS.indexOf(value);
  return idx === -1 ? 2 : idx;
}

export default function HeatmapModeToggle({
  value,
  onChange,
  lossColor,
  gainColor,
  bothColor,
  background,
  borderColor,
  textColor,
  mutedTextColor,
}) {
  const { t } = useTranslation();
  const selectedIndex = getIndex(value);

  const labelFallback = {
    loss: "Spending",
    gain: "Income",
    both: "Both",
  };

  const modes = MODE_KEYS.map((key) => ({
    key,
    label: t(`calendarPage.heatmapMode.${key}`, labelFallback[key]),
  }));

  const indicatorBg =
    value === "loss"
      ? lossColor
      : value === "gain"
        ? gainColor
        : bothColor;

  const selectedLabelColor = "#ffffff";

  const focusRing = {
    outline: "none",
    "&:focus-visible": {
      boxShadow: `0 0 0 3px ${bothColor}55`,
    },
  };

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex =
        (selectedIndex + delta + MODE_KEYS.length) % MODE_KEYS.length;
      onChange?.(MODE_KEYS[nextIndex]);
    },
    [onChange, selectedIndex],
  );

  return (
    <Box
      role="radiogroup"
      aria-label={t(
        "calendarPage.heatmapMode.groupLabel",
        "Calendar display mode",
      )}
      onKeyDown={handleKeyDown}
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "stretch",
        background,
        border: `1px solid ${borderColor}`,
        borderRadius: "12px",
        overflow: "hidden",
        minHeight: 44,
        p: "3px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.12)",
        "@media (prefers-reduced-motion: reduce)": {
          "& *": { transition: "none !important" },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 3,
          bottom: 3,
          left: 3,
          width: "calc((100% - 6px) / 3)",
          borderRadius: "10px",
          background: indicatorBg,
          transform: `translateX(${selectedIndex * 100}%)`,
          transition: "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          boxShadow:
            value === "both"
              ? "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.2)"
              : "0 2px 8px rgba(0,0,0,0.18)",
        }}
      />

      {modes.map((m) => {
        const selected = m.key === value;
        return (
          <ButtonBase
            key={m.key}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange?.(m.key)}
            sx={{
              position: "relative",
              zIndex: 1,
              flex: 1,
              minHeight: 38,
              minWidth: { xs: 72, sm: 80 },
              borderRadius: "10px",
              px: { xs: 1, sm: 1.5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "opacity 180ms ease",
              opacity: selected ? 1 : 0.92,
              ...focusRing,
              "&:hover": {
                opacity: 1,
              },
              "@media (hover: hover)": {
                "&:not([aria-checked='true']):hover .heatmap-mode-label": {
                  color: textColor,
                },
              },
            }}
          >
            <Typography
              className="heatmap-mode-label"
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem",
                letterSpacing: 0.15,
                lineHeight: 1.2,
                color: selected ? selectedLabelColor : mutedTextColor,
                transition: "color 180ms ease",
                userSelect: "none",
                textShadow: selected
                  ? "0 1px 2px rgba(0,0,0,0.35)"
                  : "none",
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
  bothColor: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  mutedTextColor: PropTypes.string.isRequired,
};
