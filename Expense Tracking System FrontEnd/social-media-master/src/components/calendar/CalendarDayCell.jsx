import React, { useMemo } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { keyframes } from "@mui/system";
import { formatAmount } from "../../utils/formatAmount";
import DateIndicator from "../DateIndicator";
import { hexToRgba } from "../../utils/calendar/calendarHeatmap";

const gentlePulse = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1px); }
`;

const waveFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export default function CalendarDayCell({
  dayNumber,
  date,
  dayData,
  isToday,
  isSalaryDay,
  isActive = false,
  paydayDistanceText,
  onClick,
  disabled = false,
  isSmallScreen,
  colors,
  currencySymbol,
  spendingKey,
  incomeKey,
  spendingColor,
  incomeColor,
  heatmapBackground,
  avgDailySpend,
  iconsKey,
  renderIcon,
  maxIcons = 4,
}) {
  const spending = safeNumber(dayData?.[spendingKey]);
  const income = safeNumber(dayData?.[incomeKey]);
  const hasMixedAmounts = spending !== 0 && income !== 0;

  const iconItemsRaw = iconsKey ? dayData?.[iconsKey] : null;
  const iconItems = Array.isArray(iconItemsRaw) ? iconItemsRaw : [];
  const showIcons = typeof renderIcon === "function" && iconItems.length > 0;

  const canClick = !disabled && typeof onClick === "function";

  const tooltipContent = useMemo(() => {
    // Keep tooltips lightweight + helpful, shown only on hover.
    if (disabled) {
      return (
        <Typography variant="caption" sx={{ color: colors.primary_text }}>
          No transactions
        </Typography>
      );
    }

    const showAmountInsights = !showIcons;

    const avg = showAmountInsights ? safeNumber(avgDailySpend) : 0;
    const spentToday = showAmountInsights ? spending : 0;

    const avgLine = showAmountInsights
      ? avg > 0
        ? `Daily avg spend this month: ${formatAmount(avg, {
            currencySymbol,
            maximumFractionDigits: 0,
          })}`
        : "Daily avg spend this month: —"
      : null;

    let comparisonLine = "";
    if (showAmountInsights) {
      if (avg > 0) {
        const ratio = spentToday / avg;
        if (spentToday === 0) {
          comparisonLine = "Nice — no spending recorded today.";
        } else if (ratio >= 1) {
          comparisonLine = `You spent ${ratio.toFixed(1)}× more than average`;
        } else {
          comparisonLine = `Good job — ${ratio.toFixed(1)}× of average`;
        }
      } else if (spentToday > 0) {
        comparisonLine = "No monthly average yet.";
      } else {
        comparisonLine = "";
      }
    }

    const iconsLine = showIcons
      ? (() => {
          const labels = iconItems.map((it) => it?.label).filter(Boolean);
          if (!labels.length) return null;
          const shown = labels.slice(0, 3);
          const remaining = labels.length - shown.length;
          return `${shown.join(", ")}${remaining > 0 ? ` (+${remaining})` : ""}`;
        })()
      : null;

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {iconsLine && (
          <Typography variant="caption" sx={{ color: colors.primary_text }}>
            {iconsLine}
          </Typography>
        )}

        {avgLine && (
          <Typography variant="caption" sx={{ color: colors.primary_text }}>
            {avgLine}
          </Typography>
        )}

        {!!paydayDistanceText && paydayDistanceText !== "Salary day" && (
          <Typography variant="caption" sx={{ color: colors.placeholder_text }}>
            {paydayDistanceText}
          </Typography>
        )}

        {!!comparisonLine && (
          <Typography variant="caption" sx={{ color: colors.secondary_text }}>
            {comparisonLine}
          </Typography>
        )}
        {isSalaryDay && (
          <Typography variant="caption" sx={{ color: colors.brand_text }}>
            Monthly Salary credited (locked)
          </Typography>
        )}
      </Box>
    );
  }, [
    avgDailySpend,
    disabled,
    colors,
    currencySymbol,
    iconItems,
    isSalaryDay,
    paydayDistanceText,
    showIcons,
    spending,
  ]);

  return (
    <Tooltip
      arrow
      placement="top"
      title={tooltipContent}
      enterDelay={350}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: colors.secondary_bg,
            color: colors.primary_text,
            border: `1px solid ${colors.border}`,
            boxShadow: 3,
            fontSize: "0.75rem",
            "& .MuiTooltip-arrow": {
              color: colors.secondary_bg,
              "&::before": {
                border: `1px solid ${colors.border}`,
              },
            },
          },
        },
      }}
    >
      <Box
        onClick={canClick ? () => onClick(dayNumber) : undefined}
        sx={{
          borderRadius: 2,
          cursor: canClick ? "pointer" : "not-allowed",
          p: 1,
          minHeight: isSmallScreen ? 74 : 86,
          height: isSmallScreen ? 74 : "100%",
          flex: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          zIndex: 3,
          background: heatmapBackground || colors.secondary_bg,
          border: isActive
            ? `1px solid ${colors.primary_accent || colors.secondary_accent}`
            : "1px solid transparent",
          boxShadow: 1,
          transition: "transform 120ms ease, box-shadow 120ms ease",
          willChange: "transform",
          ...(canClick
            ? {
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 6,
                },
              }
            : null),
          ...(disabled
            ? {
                opacity: 0.45,
                filter: "grayscale(0.25)",
              }
            : null),
          ...(isToday
            ? {
                animation: `${gentlePulse} 2.8s ease-in-out infinite`,
              }
            : null),
          "& .amountPill": {
            opacity: 0.88,
            transition: "opacity 180ms ease",
          },
          "&:hover .amountPill": {
            opacity: 1,
          },
          overflow: "hidden",
        }}
      >
        {!showIcons && hasMixedAmounts && (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: 2,
              zIndex: 0,
              pointerEvents: "none",
              background: `linear-gradient(135deg, ${hexToRgba(
                spendingColor,
                0.12,
              )} 0%, ${hexToRgba(incomeColor, 0.12)} 50%, ${hexToRgba(
                spendingColor,
                0.12,
              )} 100%)`,
              backgroundSize: "200% 200%",
              animation: `${waveFlow} 6s ease-in-out infinite`,
            }}
          />
        )}

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Salary Day Indicator */}
          {isSalaryDay && (
            <DateIndicator
              type="salary"
              position="top-right"
              showAnimation={true}
              showCornerAccent={false}
              showBadge={true}
            />
          )}

          {/* Today Indicator */}
          {isToday && (
            <DateIndicator
              type="today"
              position="top-left"
              showAnimation={true}
              showCornerAccent={false}
              showBadge={true}
            />
          )}

          {/* Salary lock marker (visual only; avoids adding edit UX in calendar) */}
          {isSalaryDay && (
            <Box
              sx={{
                position: "absolute",
                top: 6,
                right: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: colors.primary_bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <LockRoundedIcon
                sx={{ fontSize: 12, color: colors.brand_text, lineHeight: 1 }}
              />
            </Box>
          )}

          {/* Day number */}
          <Typography
            variant="body1"
            fontWeight={700}
            color={colors.primary_text}
          >
            {dayNumber}
          </Typography>

          {/* Amounts */}
          {!showIcons && (spending !== 0 || income !== 0) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 1,
                width: "100%",
                mt: 1.6,
              }}
            >
              {spending !== 0 && (
                <Typography
                  className="amountPill"
                  variant="caption"
                  sx={{
                    color: colors.primary_text,
                    background: hexToRgba(spendingColor, 0.22),
                    display: "inline-block",
                    fontWeight: 800,
                    borderRadius: 1,
                    px: 1.2,
                    minWidth: 32,
                    textAlign: "center",
                  }}
                >
                  {formatAmount(Math.abs(spending), {
                    currencySymbol,
                    maximumFractionDigits: 0,
                  })}
                </Typography>
              )}
              {income !== 0 && (
                <Typography
                  className="amountPill"
                  variant="caption"
                  sx={{
                    color: colors.primary_text,
                    background: hexToRgba(incomeColor, 0.18),
                    display: "inline-block",
                    fontWeight: 800,
                    borderRadius: 1,
                    px: 1.2,
                    minWidth: 32,
                    textAlign: "center",
                  }}
                >
                  {formatAmount(income, {
                    currencySymbol,
                    maximumFractionDigits: 0,
                  })}
                </Typography>
              )}
            </Box>
          )}

          {/* Icon mode (categories/payment methods) */}
          {showIcons && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 0.8,
                width: "100%",
                mt: 1.4,
                px: 0.4,
              }}
            >
              {iconItems.slice(0, maxIcons).map((it, idx) => (
                <Box
                  key={`${it?.key || it?.label || "icon"}-${idx}`}
                  className="amountPill"
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: colors.primary_bg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {renderIcon(it?.key || it?.label || "", {
                    sx: {
                      fontSize: 16,
                      color: it?.color || it?.iconColor || colors.primary_text,
                    },
                  })}
                </Box>
              ))}
              {iconItems.length > maxIcons && (
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.placeholder_text,
                    fontWeight: 800,
                    lineHeight: 1,
                    px: 0.6,
                  }}
                >
                  +{iconItems.length - maxIcons}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
}
