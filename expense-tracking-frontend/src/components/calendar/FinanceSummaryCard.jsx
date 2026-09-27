import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import { AppSkeleton } from "../ui";
import { formatCompactNumber } from "../../utils/formatting/numberFormatters";

const FinanceSummaryCard = ({
  label,
  amount,
  accentColor,
  textColor,
  iconType = "down",
  isSmallScreen,
  currencySymbol = "₹",
  colors,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      px: 1.5,
      py: 1.25,
      flex: isSmallScreen ? "1 1 100%" : "0 1 180px",
      minWidth: isSmallScreen ? "100%" : 160,
      maxWidth: isSmallScreen ? "100%" : 200,
      borderRadius: "14px",
      background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}0d 100%)`,
      border: `1px solid ${accentColor}40`,
      transition:
        "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
      boxShadow: `0 2px 12px ${accentColor}16`,
      "@media (prefers-reduced-motion: reduce)": {
        transition: "none",
      },
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 4px 16px ${accentColor}24`,
        borderColor: `${accentColor}60`,
      },
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        minWidth: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        background: `linear-gradient(145deg, ${accentColor}, ${accentColor}cc)`,
        boxShadow: `0 2px 8px ${accentColor}40`,
      }}
    >
      {iconType === "down" ? (
        <ArrowDownwardRoundedIcon sx={{ color: "#ffffff", fontSize: 22 }} />
      ) : (
        <ArrowUpwardRoundedIcon sx={{ color: "#ffffff", fontSize: 22 }} />
      )}
    </Box>

    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: textColor,
          fontWeight: 600,
          fontSize: "0.72rem",
          letterSpacing: 0.4,
          textTransform: "uppercase",
          lineHeight: 1.2,
          opacity: 0.92,
        }}
      >
        {label}
      </Typography>
      {amount === "loading" ? (
        <AppSkeleton variant="text" width="72%" height={24} sx={{ mt: 0.25 }} />
      ) : (
        <Typography
          variant="body1"
          sx={{
            color: "var(--color-primary-text)",
            fontWeight: 700,
            fontSize: "1.05rem",
            lineHeight: 1.25,
            mt: 0.25,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {currencySymbol}
          {formatCompactNumber(amount)}
        </Typography>
      )}
    </Box>
  </Box>
);

FinanceSummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  accentColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  iconType: PropTypes.oneOf(["up", "down"]),
  isSmallScreen: PropTypes.bool,
  currencySymbol: PropTypes.string,
  colors: PropTypes.object.isRequired,
};

export default FinanceSummaryCard;
