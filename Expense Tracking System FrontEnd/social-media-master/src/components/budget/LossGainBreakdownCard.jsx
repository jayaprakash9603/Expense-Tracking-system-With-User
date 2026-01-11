import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { formatAmount as fmt } from "../../utils/formatAmount";

const clampPercent = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
};

const formatSignedAmount = (value, opts) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) {
    return fmt(0, opts);
  }
  if (num > 0) {
    return fmt(num, opts);
  }
  return `-${fmt(Math.abs(num), opts)}`;
};

// Match existing repo usage (e.g., card-change.positive/negative)
const LOSS_COLOR = "#ef4444";
const GAIN_COLOR = "#10b981";

export default function LossGainBreakdownCard({
  budgets,
  title,
  subtitle,
  layout,
}) {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  const { totalLoss, totalGain, net } = useMemo(() => {
    const list = Array.isArray(budgets) ? budgets : [];

    const loss = list.reduce(
      (sum, b) => sum + Math.abs(Number(b?.totalLoss ?? 0) || 0),
      0
    );
    const gain = list.reduce(
      (sum, b) => sum + Math.abs(Number(b?.totalGain ?? 0) || 0),
      0
    );

    return {
      totalLoss: loss,
      totalGain: gain,
      net: gain - loss,
    };
  }, [budgets]);

  const netAccentColor = net >= 0 ? GAIN_COLOR : LOSS_COLOR;

  const total = totalLoss + totalGain;
  const lossPct = total > 0 ? clampPercent((totalLoss / total) * 100) : 0;
  const gainPct = total > 0 ? clampPercent((totalGain / total) * 100) : 0;

  const chartData = useMemo(
    () => [
      { label: "Loss", amount: totalLoss, kind: "loss" },
      { label: "Gain", amount: totalGain, kind: "gain" },
    ],
    [totalLoss, totalGain]
  );

  const tooltipFormatter = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return fmt(0, { currencySymbol });
    return formatSignedAmount(num, {
      currencySymbol,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const content = (
    <div
      className="chart-container"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div className="chart-header" style={{ marginBottom: "14px" }}>
        <h3 style={{ color: colors.primary_text, margin: "0 0 4px 0" }}>
          {title}
        </h3>
        <div
          className="chart-subtitle"
          style={{ color: colors.secondary_text }}
        >
          {subtitle}
        </div>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        <div>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  stroke={colors.border_color}
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: colors.secondary_text, fontSize: 12 }}
                  axisLine={{ stroke: colors.border_color }}
                  tickLine={{ stroke: colors.border_color }}
                />
                <YAxis
                  tick={{ fill: colors.secondary_text, fontSize: 12 }}
                  axisLine={{ stroke: colors.border_color }}
                  tickLine={{ stroke: colors.border_color }}
                  width={48}
                />
                <ReferenceLine y={0} stroke={colors.border_color} />
                <Tooltip
                  formatter={tooltipFormatter}
                  contentStyle={{
                    background: colors.primary_bg,
                    border: `1px solid ${colors.border_color}`,
                    borderRadius: 10,
                    color: colors.primary_text,
                  }}
                  labelStyle={{ color: colors.primary_text, fontWeight: 700 }}
                  itemStyle={{ color: colors.secondary_text }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.label}
                      fill={entry.kind === "gain" ? GAIN_COLOR : LOSS_COLOR}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              color: colors.secondary_text,
              fontSize: "12px",
            }}
            aria-label="Loss and gain legend"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: LOSS_COLOR,
                  display: "inline-block",
                }}
              />
              <span>Loss {Math.round(lossPct)}%</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: GAIN_COLOR,
                  display: "inline-block",
                }}
              />
              <span>Gain {Math.round(gainPct)}%</span>
            </div>
          </div>
        </div>

        {/* Summary row below the chart (single row) */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "nowrap",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "2px",
          }}
          aria-label="Loss gain net summary"
        >
          <div
            style={{
              flex: "1 0 220px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "12px",
              border: `1px solid ${colors.border_color}`,
              background: colors.secondary_bg,
              borderLeft: `4px solid ${LOSS_COLOR}`,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: colors.secondary_text,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: LOSS_COLOR,
                  display: "inline-block",
                  flex: "0 0 auto",
                }}
              />
              <span>Total Loss</span>
            </div>
            <div
              style={{
                color: colors.primary_text,
                fontWeight: 800,
                fontSize: 14,
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmt(totalLoss, {
                currencySymbol,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div
            style={{
              flex: "1 0 220px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "12px",
              border: `1px solid ${colors.border_color}`,
              background: colors.secondary_bg,
              borderLeft: `4px solid ${GAIN_COLOR}`,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: colors.secondary_text,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: GAIN_COLOR,
                  display: "inline-block",
                  flex: "0 0 auto",
                }}
              />
              <span>Total Gain</span>
            </div>
            <div
              style={{
                color: colors.primary_text,
                fontWeight: 800,
                fontSize: 14,
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmt(totalGain, {
                currencySymbol,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div
            style={{
              flex: "1 0 220px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "12px",
              border: `1px solid ${colors.border_color}`,
              background: colors.active_bg,
              borderLeft: `4px solid ${netAccentColor}`,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: colors.secondary_text,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: netAccentColor,
                  display: "inline-block",
                  flex: "0 0 auto",
                }}
              />
              <span>Net</span>
            </div>
            <div
              style={{
                color: colors.primary_text,
                fontWeight: 900,
                fontSize: 14,
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatSignedAmount(net, {
                currencySymbol,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {(!budgets || budgets.length === 0) && (
          <div style={{ color: colors.secondary_text, paddingTop: "2px" }}>
            No budgets available for this selection.
          </div>
        )}
      </div>
    </div>
  );

  if (layout === "gridItem") {
    return content;
  }

  return <div className="chart-row full-width">{content}</div>;
}

LossGainBreakdownCard.propTypes = {
  budgets: PropTypes.arrayOf(
    PropTypes.shape({
      totalLoss: PropTypes.number,
      totalGain: PropTypes.number,
    })
  ),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  layout: PropTypes.oneOf(["fullWidth", "gridItem"]),
};

LossGainBreakdownCard.defaultProps = {
  budgets: [],
  title: "📊 Loss vs Gain",
  subtitle: "Totals across the selected budgets",
  layout: "fullWidth",
};
