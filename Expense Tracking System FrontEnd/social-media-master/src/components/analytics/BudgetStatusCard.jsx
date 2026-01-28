import React from "react";
import { Typography, LinearProgress, Tooltip, Box } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

/**
 * Budget Status Card showing allocated vs used amounts with progress bar.
 * Used for displaying budget analytics in Category Analytics view.
 *
 * @param {number} allocated - Total allocated amount
 * @param {number} used - Total used amount
 * @param {number} remaining - Remaining amount
 * @param {number} percentage - Usage percentage
 * @param {string} title - Card title
 * @param {string} accentColor - Primary accent color
 */
const BudgetStatusCard = ({
  allocated = 0,
  used = 0,
  remaining = 0,
  percentage = 0,
  title = "Budget Status",
  accentColor = "#00DAC6",
  currencySymbol = "₹",
  projected = null,
}) => {
  const { colors, mode } = useTheme();

  const getStatusColor = (pct) => {
    if (pct >= 90) return "#ff4d4f";
    if (pct >= 70) return "#faad14";
    return "#52c41a";
  };

  const statusColor = getStatusColor(percentage);

  const formatCurrency = (amount) => {
    if (amount == null) return `${currencySymbol}0`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(Math.abs(amount))
      .replace("₹", currencySymbol);
  };

  const cardStyle = {
    background:
      mode === "dark"
        ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: `1px solid ${colors.border_color}`,
    borderRadius: "12px",
    padding: "16px 20px",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={cardStyle}>
      {/* Accent stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${accentColor}, ${statusColor})`,
        }}
      />

      {/* Title */}
      <Typography
        variant="subtitle2"
        sx={{
          color: colors.primary_text,
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        {title}
      </Typography>

      {/* Main amounts display */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: statusColor,
          }}
        >
          {formatCurrency(used)}
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            color: colors.secondary_text,
          }}
        >
          / {formatCurrency(allocated)}
        </Typography>
      </div>

      {/* Progress bar */}
      <Box sx={{ marginBottom: "12px" }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(percentage, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: `${statusColor}20`,
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              backgroundColor: statusColor,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: colors.secondary_text,
            fontSize: "0.7rem",
            marginTop: "4px",
            display: "block",
            textAlign: "right",
          }}
        >
          {percentage.toFixed(0)}% of Budget
        </Typography>
      </Box>

      {/* Bottom stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Typography
            variant="caption"
            sx={{
              color: colors.secondary_text,
              display: "block",
              fontSize: "0.65rem",
              textTransform: "uppercase",
            }}
          >
            Remaining
          </Typography>
          <Typography
            sx={{
              color: remaining >= 0 ? "#52c41a" : "#ff4d4f",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {formatCurrency(remaining)}
          </Typography>
        </div>

        {projected !== null && (
          <Tooltip title="Projected spending at current rate" arrow>
            <div style={{ textAlign: "right" }}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.secondary_text,
                  display: "block",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                }}
              >
                Projected
              </Typography>
              <Typography
                sx={{
                  color: projected > allocated ? "#ff4d4f" : "#faad14",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {formatCurrency(projected)}
              </Typography>
            </div>
          </Tooltip>
        )}
      </div>

      {/* Over budget warning */}
      {percentage > 100 && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            backgroundColor: "#ff4d4f15",
            borderRadius: "6px",
            borderLeft: "3px solid #ff4d4f",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#ff4d4f",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            ⚠️ Over Budget by {formatCurrency(Math.abs(remaining))}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default BudgetStatusCard;
