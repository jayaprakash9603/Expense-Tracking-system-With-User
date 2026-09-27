import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * Hero summary card for category / payment-method analytics.
 * Emphasizes total amount, flow type, and share of portfolio.
 */
const AnalyticsHeroCard = ({
  amountLabel,
  flowType = "DEBIT",
  sharePercent = 0,
  shareCaption = "of all expenses",
  footerLabel,
  accentColor,
}) => {
  const { colors, mode } = useTheme();
  const isCredit = String(flowType).toUpperCase() === "CREDIT";
  const tone = accentColor || (isCredit ? "#22c55e" : "#ef4444");
  const clampedShare = Math.min(Math.max(Number(sharePercent) || 0, 0), 100);
  const barColor =
    clampedShare >= 80 ? "#f59e0b" : clampedShare >= 50 ? "#eab308" : "#22c55e";

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        borderRadius: "14px",
        border: `1px solid ${colors.border_color}`,
        background:
          mode === "dark"
            ? `linear-gradient(145deg, ${colors.primary_bg} 0%, ${colors.secondary_bg} 100%)`
            : colors.primary_bg,
        padding: "18px 16px 16px",
        boxShadow:
          mode === "dark"
            ? `0 0 0 1px ${tone}22, 0 12px 28px rgba(0,0,0,0.35)`
            : `0 8px 20px rgba(15,23,42,0.06)`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "0 auto auto 0",
          width: "100%",
          height: 3,
          background: `linear-gradient(90deg, ${tone}, ${tone}66)`,
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: colors.secondary_text,
              mb: 0.75,
            }}
          >
            Total spent
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "1.55rem", md: "1.75rem" },
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
              color: tone,
              wordBreak: "break-word",
            }}
          >
            {amountLabel}
          </Typography>
        </Box>

        <Chip
          label={isCredit ? "CREDIT" : "DEBIT"}
          size="small"
          sx={{
            flexShrink: 0,
            height: 26,
            fontWeight: 700,
            fontSize: "0.65rem",
            letterSpacing: "0.06em",
            color: "#fff",
            backgroundColor: tone,
            borderRadius: "999px",
          }}
        />
      </Box>

      <Box sx={{ mb: 1.75 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 1,
            mb: 0.75,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: colors.secondary_text,
              fontWeight: 500,
            }}
          >
            {shareCaption}
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: colors.primary_text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {clampedShare.toFixed(0)}%
          </Typography>
        </Box>
        <Box
          sx={{
            height: 8,
            borderRadius: 999,
            overflow: "hidden",
            backgroundColor:
              mode === "dark" ? "rgba(255,255,255,0.06)" : `${colors.border_color}80`,
          }}
          role="progressbar"
          aria-valuenow={clampedShare}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={shareCaption}
        >
          <Box
            sx={{
              width: `${clampedShare}%`,
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
              transition: "width 220ms ease",
            }}
          />
        </Box>
      </Box>

      {footerLabel && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.25,
            py: 1,
            borderRadius: "10px",
            border: `1px solid ${colors.border_color}`,
            borderLeft: `3px solid ${tone}`,
            backgroundColor:
              mode === "dark" ? "rgba(0,0,0,0.25)" : colors.secondary_bg,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.primary_text,
              lineHeight: 1.35,
            }}
          >
            {footerLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AnalyticsHeroCard;
