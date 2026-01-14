/**
 * ============================================================================
 * DailySpendingChart Component
 * ============================================================================
 *
 * A highly modular and configurable chart component for visualizing daily spending patterns.
 *
 * USAGE EXAMPLES:
 * ---------------
 *
 * 1. Basic usage (with default options):
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * 2. Hide type toggle (Loss/Gain buttons):
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      typeOptions={[]}  // Pass empty array to hide type toggle
 *    />
 *
 * 3. Custom timeframe options:
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_week"
 *      onTimeframeChange={setTimeframe}
 *      timeframeOptions={[
 *        { value: "this_week", label: "This Week" },
 *        { value: "this_month", label: "This Month" },
 *        { value: "this_year", label: "This Year" },
 *      ]}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * 4. Custom title and height:
 *    <DailySpendingChart
 *      data={spendingData}
 *      title="💰 My Custom Title"
 *      height={400}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * 5. Custom tooltip configuration:
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      tooltipConfig={{
 *        maxExpensesToShow: 10,
 *        minWidth: 250,
 *        maxWidth: 350,
 *        borderRadius: 16,
 *        amountFontSize: 20
 *      }}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * 6. Using tooltip style presets:
 *    import { TOOLTIP_STYLE_PRESETS } from "../../config/chartConfig";
 *
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      tooltipConfig={{ ...TOOLTIP_CONFIG, ...TOOLTIP_STYLE_PRESETS.comfortable }}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * EXTENDING THE COMPONENT:
 * ------------------------
 *
 * A. Add new timeframe options:
 *    - Update DEFAULT_TIMEFRAME_OPTIONS constant (line ~20)
 *    - Update the hook's buildDateRange function to handle new timeframes
 *
 * B. Add new type options (e.g., "all", "pending"):
 *    - Update DEFAULT_TYPE_OPTIONS constant (line ~28)
 *    - Add corresponding colors in CHART_THEME constant (line ~37)
 *
 * C. Customize tooltip behavior:
 *    - Modify TOOLTIP_CONFIG constant (line ~32)
 *    - Update TooltipContent component (line ~87)
 *
 * D. Change chart styling:
 *    - Update CHART_THEME constant for colors
 *    - Modify chart height breakpoints in component (line ~187)
 *
 * E. Disable type filtering in API:
 *    - In the hook, set includeTypeInRequest: false
 *    - This will fetch all types but still filter in the UI
 */

import React from "react";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useTranslation } from "../../hooks/useTranslation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useMediaQuery } from "@mui/material";

// Import separate components
import ChartTimeframeSelector from "../../components/charts/ChartTimeframeSelector";
import ChartTypeToggle from "../../components/charts/ChartTypeToggle";
import SpendingChartTooltip from "../../components/charts/SpendingChartTooltip";
import EmptyStateCard from "../../components/EmptyStateCard";

// Import configuration and utilities
import {
  DEFAULT_TIMEFRAME_OPTIONS,
  DEFAULT_TYPE_OPTIONS,
  TOOLTIP_CONFIG,
  CHART_THEME,
  CHART_HEIGHTS,
  CHART_BREAKPOINTS,
} from "../../config/chartConfig";

import {
  getThemeColors,
  filterDataByType,
  transformChartData,
} from "../../utils/chartHelpers";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DailySpendingChart - Modular and configurable daily spending visualization
 *
 * @param {Array} data - Chart data array
 * @param {string} timeframe - Selected timeframe value
 * @param {function} onTimeframeChange - Callback for timeframe changes
 * @param {Array} timeframeOptions - Custom timeframe options (optional)
 * @param {string} selectedType - Selected type (loss/gain)
 * @param {function} onTypeToggle - Callback for type changes
 * @param {Array} typeOptions - Custom type options (optional, pass [] to hide)
 * @param {string} title - Chart title (optional)
 * @param {string} icon - Chart icon (optional)
 * @param {number} height - Chart height (optional)
 * @param {object} tooltipConfig - Tooltip configuration (optional)
 * @param {boolean} loading - Loading state (optional, shows loading message when skeleton is disabled)
 */
const DailySpendingChart = ({
  data,
  timeframe,
  onTimeframeChange,
  timeframeOptions,
  selectedType,
  onTypeToggle,
  typeOptions,
  title = "📊 Daily Spending Pattern",
  icon,
  height,
  tooltipConfig,
  loading = false,
  hideControls = false,
  showBothTypesWhenAll = false,
  showBudgetTotalsInTooltip = false,
  showAllBudgetsInTooltip = false,
  showExpensesInTooltip = false,
  showBudgetsInTooltip = false,
}) => {
  const { mode, colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const currencySymbol = settings.getCurrency().symbol;
  const locale = settings.language || "en";

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");

  const isYearView = timeframe === "this_year" || timeframe === "last_year";
  const isAllTimeView = timeframe === "all_time";

  // Chart configuration
  const chartHeight = height || (isMobile ? 220 : isTablet ? 260 : 300);
  const hideXAxis =
    !isYearView &&
    !isAllTimeView &&
    (timeframe === "last_3_months" || isMobile);
  const safeData = Array.isArray(data) ? data : [];
  const activeType = selectedType || "loss";

  const isOverlayAllMode =
    showBothTypesWhenAll && String(activeType).toLowerCase() === "all";

  const buildNormalizedSeries = (type) => {
    const typed = filterDataByType(safeData, type);
    return transformChartData(typed, {
      timeframe,
      locale,
    }).map((point, index) => {
      const source = typed[index] || {};
      return {
        ...point,
        type,
        budgetTotals: source.budgetTotals,
      };
    });
  };

  const filteredData = isOverlayAllMode
    ? []
    : filterDataByType(safeData, String(activeType).toLowerCase());

  const normalizedData = isOverlayAllMode
    ? []
    : transformChartData(filteredData, {
        timeframe,
        locale,
      }).map((point, index) => {
        const source = filteredData[index] || {};
        return {
          ...point,
          budgetTotals: source.budgetTotals,
        };
      });

  const formatMoney = (value) => {
    const numeric = Number(value);
    const safe = Number.isFinite(numeric) ? numeric : 0;
    return `${currencySymbol}${safe.toLocaleString(locale || undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const normalizeBudgetTotals = (budgetTotalsRaw) => {
    if (Array.isArray(budgetTotalsRaw)) {
      return budgetTotalsRaw
        .filter((x) => x && (x.budgetName || x.name))
        .map((x) => ({
          budgetName: String(x.budgetName ?? x.name ?? "").trim(),
          total: Number(x.total ?? x.amount ?? 0) || 0,
        }))
        .filter((x) => x.budgetName);
    }

    if (budgetTotalsRaw && typeof budgetTotalsRaw === "object") {
      return Object.entries(budgetTotalsRaw)
        .map(([budgetName, total]) => ({
          budgetName: String(budgetName).trim(),
          total: Number(total) || 0,
        }))
        .filter((x) => x.budgetName);
    }

    return [];
  };

  const hexToRgba = (hex, alpha) => {
    if (typeof hex !== "string") return null;
    const value = hex.trim();
    if (!value.startsWith("#") || (value.length !== 7 && value.length !== 4)) {
      return null;
    }

    const normalized =
      value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value;

    const r = parseInt(normalized.slice(1, 3), 16);
    const g = parseInt(normalized.slice(3, 5), 16);
    const b = parseInt(normalized.slice(5, 7), 16);

    if (![r, g, b].every((n) => Number.isFinite(n))) return null;
    const a = Math.min(1, Math.max(0, Number(alpha) || 0));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const BudgetTotalsTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload?.[0]?.payload;
    if (!point) return null;

    const dateLabel = point?.dateObj
      ? point.dateObj.toLocaleDateString(locale || undefined, {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : point?.date || point?.xLabel || "";

    const budgetTotals = normalizeBudgetTotals(point?.budgetTotals)
      .filter((x) => Number.isFinite(x.total))
      .filter((x) => (showAllBudgetsInTooltip ? true : x.total !== 0))
      .sort((a, b) => {
        const diff = Math.abs(b.total) - Math.abs(a.total);
        if (diff !== 0) return diff;
        return a.budgetName.localeCompare(b.budgetName);
      });

    const tooltipBg = colors.primary_bg;
    const border = colors.border_color;
    const titleColor = colors.primary_text;
    const muted = colors.placeholder_text || colors.secondary_text;

    const typeLabel = (() => {
      const t = String(point?.type || activeType).toLowerCase();
      if (t === "gain") return "Total gain";
      if (t === "loss") return "Total spending";
      return "Total";
    })();

    const typeKey = String(point?.type || activeType).toLowerCase();
    const fixedAccent = typeKey === "gain" ? "#00d4c0" : "#ff5252";
    const accent = fixedAccent;
    const accentSoft = hexToRgba(accent, mode === "dark" ? 0.22 : 0.16);
    const accentBorder = hexToRgba(accent, mode === "dark" ? 0.45 : 0.35);
    const accentText = accent || titleColor;

    return (
      <div
        style={{
          background: tooltipBg,
          border: `1px solid ${accentBorder || border}`,
          borderRadius: 14,
          padding: 12,
          minWidth: 260,
          maxWidth: 340,
          boxShadow:
            mode === "dark"
              ? "0 12px 30px rgba(0,0,0,0.45)"
              : "0 12px 30px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            margin: -12,
            padding: "12px 12px 10px",
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            backgroundColor: accentSoft || "transparent",
            borderBottom: `1px solid ${colors.border_color}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ color: accentText, fontWeight: 900, fontSize: 13 }}>
              {dateLabel}
            </div>
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ color: muted, fontSize: 12, fontWeight: 800 }}>
              {typeLabel}
            </div>
            <div
              style={{
                color: accentText,
                fontWeight: 900,
                fontSize: 14,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {formatMoney(point?.spending ?? 0)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }} />

        {showBudgetsInTooltip ? (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${colors.border_color}`,
                  background: colors.secondary_bg,
                  color: titleColor,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Budgets
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 22,
                    height: 18,
                    padding: "0 8px",
                    borderRadius: 999,
                    background: colors.active_bg,
                    border: `1px solid ${colors.border_color}`,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {budgetTotals.length}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                maxHeight: 280,
                overflowY: "auto",
                paddingRight: 2,
                display: "grid",
                gap: 10,
              }}
            >
              {budgetTotals.map((item) => (
                <div
                  key={item.budgetName}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: colors.secondary_bg,
                    border: `1px solid ${colors.border_color}`,
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        color: titleColor,
                        fontSize: 13,
                        fontWeight: 800,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.budgetName}
                    >
                      {item.budgetName}
                    </div>
                    <div
                      style={{
                        color: accentText,
                        fontSize: 13,
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatMoney(Math.abs(item.total))}
                    </div>
                  </div>
                </div>
              ))}

              {budgetTotals.length === 0 ? (
                <div style={{ color: muted, fontSize: 12 }}>
                  No budget breakdown available.
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {!showBudgetsInTooltip ? (
          <>
            <div
              style={{
                height: 1,
                background: colors.border_color,
                marginTop: 10,
                opacity: 0.7,
              }}
            />

            <div
              style={{
                marginTop: 10,
                color: muted,
                fontSize: 12,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span>Budget totals</span>
              <span style={{ whiteSpace: "nowrap" }}>
                {budgetTotals.length} budget
                {budgetTotals.length === 1 ? "" : "s"}
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                display: "grid",
                gap: 8,
                maxHeight: showExpensesInTooltip ? 180 : 260,
                overflowY: "auto",
                paddingRight: 2,
              }}
            >
              {budgetTotals.length > 0 ? (
                budgetTotals.map((b, idx) => (
                  <div
                    key={b.budgetName}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        color: titleColor,
                        fontSize: 12,
                        fontWeight: 700,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={b.budgetName}
                    >
                      {idx + 1}. {b.budgetName}
                    </div>
                    <div
                      style={{
                        color: titleColor,
                        fontSize: 12,
                        fontWeight: 800,
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatMoney(Math.abs(b.total))}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: muted, fontSize: 12 }}>
                  No budget breakdown available.
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const trimLeadingZeroSpending = (points) => {
    let seenValue = false;
    return points.filter((p) => {
      const hasValue = (p.spending ?? 0) > 0 || (p.expenses?.length ?? 0) > 0;
      if (hasValue) {
        seenValue = true;
      }
      return seenValue;
    });
  };

  const fillMissingDaysToToday = (points, typeForFill = activeType) => {
    if (timeframe !== "this_month" && timeframe !== "this_year") {
      return points;
    }

    const formatIso = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const today = new Date();
    const startDate =
      timeframe === "this_month"
        ? new Date(today.getFullYear(), today.getMonth(), 1)
        : new Date(today.getFullYear(), 0, 1);

    const map = new Map();
    points.forEach((p) => {
      if (!p.date) return;
      map.set(p.date, p);
    });

    const filled = [];
    for (
      let cursor = new Date(startDate);
      cursor <= today;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const iso = formatIso(cursor);
      if (map.has(iso)) {
        filled.push(map.get(iso));
      } else {
        filled.push({
          xLabel: cursor.getDate(),
          spending: 0,
          date: iso,
          dateObj: new Date(cursor),
          type: typeForFill,
          expenses: [],
          budgetTotals: [],
        });
      }
    }

    return filled;
  };

  const trimmedData =
    !isOverlayAllMode && timeframe === "all_time"
      ? trimLeadingZeroSpending(normalizedData)
      : normalizedData;

  const normalizedWithFill = !isOverlayAllMode
    ? fillMissingDaysToToday(trimmedData)
    : [];

  const buildMonthlyBuckets = (points, labelWithYear = false) => {
    const monthFormatter = new Intl.DateTimeFormat(locale || undefined, {
      month: "short",
    });
    const map = {};

    points.forEach((point) => {
      if (!point.dateObj) return;
      const monthIndex = point.dateObj.getMonth();
      const year = point.dateObj.getFullYear();
      const key = `${year}-${monthIndex}`;

      if (!map[key]) {
        map[key] = {
          xLabel: labelWithYear
            ? `${monthFormatter.format(point.dateObj)} ${year}`
            : monthFormatter.format(point.dateObj),
          monthIndex,
          year,
          spending: 0,
          expenses: [],
          type: point.type,
          budgetTotalsAgg: {},
        };
      }

      map[key].spending += point.spending ?? 0;
      if (Array.isArray(point.expenses)) {
        map[key].expenses.push(...point.expenses);
      }

      const normalizedBudgetTotals = normalizeBudgetTotals(point.budgetTotals);
      normalizedBudgetTotals.forEach((b) => {
        if (!b?.budgetName) return;
        const current =
          Number(map[key].budgetTotalsAgg[b.budgetName] ?? 0) || 0;
        map[key].budgetTotalsAgg[b.budgetName] =
          current + (Number(b.total) || 0);
      });
    });

    return Object.values(map)
      .map((bucket) => ({
        ...bucket,
        date: bucket.xLabel,
        budgetTotals: Object.entries(bucket.budgetTotalsAgg || {}).map(
          ([budgetName, total]) => ({
            budgetName: String(budgetName).trim(),
            total: Number(total) || 0,
          })
        ),
      }))
      .sort((a, b) =>
        a.year === b.year ? a.monthIndex - b.monthIndex : a.year - b.year
      );
  };

  const buildOverlayAllDaily = (lossPoints, gainPoints) => {
    const map = new Map();

    lossPoints.forEach((p) => {
      if (!p?.date) return;
      map.set(p.date, {
        xLabel: p.xLabel,
        date: p.date,
        dateObj: p.dateObj,
        spendingLoss: p.spending ?? 0,
        spendingGain: 0,
        budgetTotalsLoss: p.budgetTotals,
        budgetTotalsGain: [],
      });
    });

    gainPoints.forEach((p) => {
      if (!p?.date) return;
      const existing = map.get(p.date);
      if (existing) {
        existing.spendingGain = p.spending ?? 0;
        existing.budgetTotalsGain = p.budgetTotals;
        if (!existing.dateObj) existing.dateObj = p.dateObj;
      } else {
        map.set(p.date, {
          xLabel: p.xLabel,
          date: p.date,
          dateObj: p.dateObj,
          spendingLoss: 0,
          spendingGain: p.spending ?? 0,
          budgetTotalsLoss: [],
          budgetTotalsGain: p.budgetTotals,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.dateObj && b.dateObj) return a.dateObj - b.dateObj;
      return String(a.date).localeCompare(String(b.date));
    });
  };

  const buildOverlayAllMonthlyBuckets = (
    lossPoints,
    gainPoints,
    labelWithYear
  ) => {
    const monthFormatter = new Intl.DateTimeFormat(locale || undefined, {
      month: "short",
    });
    const map = {};

    const upsert = (point, key, isLoss) => {
      if (!map[key]) {
        const monthIndex = point.dateObj.getMonth();
        const year = point.dateObj.getFullYear();
        map[key] = {
          xLabel: labelWithYear
            ? `${monthFormatter.format(point.dateObj)} ${year}`
            : monthFormatter.format(point.dateObj),
          monthIndex,
          year,
          spendingLoss: 0,
          spendingGain: 0,
          budgetTotalsLossAgg: {},
          budgetTotalsGainAgg: {},
        };
      }

      if (isLoss) {
        map[key].spendingLoss += point.spending ?? 0;
      } else {
        map[key].spendingGain += point.spending ?? 0;
      }

      const normalizedBudgetTotals = normalizeBudgetTotals(point.budgetTotals);
      normalizedBudgetTotals.forEach((b) => {
        if (!b?.budgetName) return;
        const targetAgg = isLoss
          ? map[key].budgetTotalsLossAgg
          : map[key].budgetTotalsGainAgg;
        const current = Number(targetAgg[b.budgetName] ?? 0) || 0;
        targetAgg[b.budgetName] = current + (Number(b.total) || 0);
      });
    };

    lossPoints.forEach((p) => {
      if (!p?.dateObj) return;
      const key = `${p.dateObj.getFullYear()}-${p.dateObj.getMonth()}`;
      upsert(p, key, true);
    });

    gainPoints.forEach((p) => {
      if (!p?.dateObj) return;
      const key = `${p.dateObj.getFullYear()}-${p.dateObj.getMonth()}`;
      upsert(p, key, false);
    });

    return Object.values(map)
      .map((bucket) => ({
        ...bucket,
        date: bucket.xLabel,
        budgetTotalsLoss: Object.entries(bucket.budgetTotalsLossAgg || {}).map(
          ([budgetName, total]) => ({
            budgetName: String(budgetName).trim(),
            total: Number(total) || 0,
          })
        ),
        budgetTotalsGain: Object.entries(bucket.budgetTotalsGainAgg || {}).map(
          ([budgetName, total]) => ({
            budgetName: String(budgetName).trim(),
            total: Number(total) || 0,
          })
        ),
      }))
      .sort((a, b) =>
        a.year === b.year ? a.monthIndex - b.monthIndex : a.year - b.year
      );
  };

  const chartData = (() => {
    if (isOverlayAllMode) {
      const lossRaw = buildNormalizedSeries("loss");
      const gainRaw = buildNormalizedSeries("gain");

      const lossTrimmed =
        timeframe === "all_time" ? trimLeadingZeroSpending(lossRaw) : lossRaw;
      const gainTrimmed =
        timeframe === "all_time" ? trimLeadingZeroSpending(gainRaw) : gainRaw;

      const lossFilled = fillMissingDaysToToday(lossTrimmed, "loss");
      const gainFilled = fillMissingDaysToToday(gainTrimmed, "gain");

      if (isYearView) {
        return buildOverlayAllMonthlyBuckets(lossFilled, gainFilled, false);
      }
      if (isAllTimeView) {
        return buildOverlayAllMonthlyBuckets(lossTrimmed, gainTrimmed, true);
      }

      return buildOverlayAllDaily(lossFilled, gainFilled);
    }

    if (isYearView) {
      return buildMonthlyBuckets(normalizedWithFill, false);
    }
    if (isAllTimeView) {
      return buildMonthlyBuckets(trimmedData, true);
    }

    return normalizedWithFill.map((point) => ({
      xLabel: point.xLabel,
      spending: point.spending,
      date: point.date,
      type: point.type,
      expenses: point.expenses,
      budgetTotals: point.budgetTotals,
    }));
  })();

  const totalPoints = chartData.length || 0;
  const totalSpending = chartData.reduce((sum, item) => {
    if (isOverlayAllMode) {
      return sum + (item.spendingLoss || 0) + (item.spendingGain || 0);
    }
    return sum + (item.spending || 0);
  }, 0);
  const averageSpending = totalPoints > 0 ? totalSpending / totalPoints : 0;
  const averageLineColor = mode === "dark" ? "#facc15" : "#eab308";
  const averageLabelText =
    averageSpending > 0
      ? `${t("cashflow.chart.averageLabel")} ${currencySymbol}${Math.round(
          averageSpending
        ).toLocaleString()}`
      : "";

  const xTickFormatter = (value, index) => {
    if (!value || totalPoints === 0) return "";

    if (isAllTimeView) {
      const maxTicks = isMobile ? 4 : 8;
      const step = Math.max(1, Math.ceil(totalPoints / maxTicks));
      return index % step === 0 ? value : "";
    }

    if (timeframe === "last_3_months") {
      const maxTicks = isMobile ? 6 : 10;
      const step = Math.max(1, Math.ceil(totalPoints / maxTicks));
      return index % step === 0 ? value : "";
    }

    return value;
  };

  // Theme and styling
  const theme = getThemeColors(
    isOverlayAllMode ? "loss" : activeType,
    CHART_THEME
  );
  const gradientId = `spendingGradient-${activeType}`;
  const animationKey = `${timeframe}-${activeType}-${chartData.length}`;
  const chartTitle = title || t("dashboard.charts.titles.dailySpending");
  const timeframeSelectorOptions =
    timeframeOptions && timeframeOptions.length > 0
      ? timeframeOptions
      : DEFAULT_TIMEFRAME_OPTIONS;
  const typeSelectorOptions =
    typeOptions && typeOptions.length > 0 ? typeOptions : DEFAULT_TYPE_OPTIONS;
  const showEmpty = !loading && (chartData.length === 0 || totalSpending === 0);

  const OverlayAllBudgetTotalsTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload?.[0]?.payload;
    if (!point) return null;

    const dateLabel = point?.dateObj
      ? point.dateObj.toLocaleDateString(locale || undefined, {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : point?.date || point?.xLabel || "";

    const tooltipBg = colors.primary_bg;
    const border = colors.border_color;
    const titleColor = colors.primary_text;
    const muted = colors.placeholder_text || colors.secondary_text;

    const lossAccent = "#ff5252";
    const gainAccent = "#00d4c0";
    const lossSoft = hexToRgba(lossAccent, mode === "dark" ? 0.22 : 0.16);
    const gainSoft = hexToRgba(gainAccent, mode === "dark" ? 0.22 : 0.16);

    const lossTotals = normalizeBudgetTotals(point?.budgetTotalsLoss)
      .filter((x) => Number.isFinite(x.total))
      .filter((x) => (showAllBudgetsInTooltip ? true : x.total !== 0))
      .sort((a, b) => {
        const diff = Math.abs(b.total) - Math.abs(a.total);
        if (diff !== 0) return diff;
        return a.budgetName.localeCompare(b.budgetName);
      });

    const gainTotals = normalizeBudgetTotals(point?.budgetTotalsGain)
      .filter((x) => Number.isFinite(x.total))
      .filter((x) => (showAllBudgetsInTooltip ? true : x.total !== 0))
      .sort((a, b) => {
        const diff = Math.abs(b.total) - Math.abs(a.total);
        if (diff !== 0) return diff;
        return a.budgetName.localeCompare(b.budgetName);
      });

    const shouldShowLossBudgets = lossTotals.length > 0;
    const shouldShowGainBudgets = gainTotals.length > 0;
    const shouldShowAnyBudgets = shouldShowLossBudgets || shouldShowGainBudgets;

    return (
      <div
        style={{
          background: tooltipBg,
          border: `1px solid ${border}`,
          borderRadius: 14,
          padding: 12,
          minWidth: 280,
          maxWidth: 380,
          boxShadow:
            mode === "dark"
              ? "0 12px 30px rgba(0,0,0,0.45)"
              : "0 12px 30px rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ color: titleColor, fontWeight: 900, fontSize: 13 }}>
          {dateLabel}
        </div>

        <div
          style={{
            marginTop: 10,
            display: "grid",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ color: muted, fontSize: 12, fontWeight: 800 }}>
              Total spending
            </div>
            <div
              style={{
                color: lossAccent,
                fontWeight: 900,
                fontSize: 14,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {formatMoney(point?.spendingLoss ?? 0)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ color: muted, fontSize: 12, fontWeight: 800 }}>
              Total gain
            </div>
            <div
              style={{
                color: gainAccent,
                fontWeight: 900,
                fontSize: 14,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {formatMoney(point?.spendingGain ?? 0)}
            </div>
          </div>
        </div>

        {showBudgetsInTooltip && shouldShowAnyBudgets ? (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {shouldShowLossBudgets ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: `1px solid ${colors.border_color}`,
                  backgroundColor: lossSoft || colors.secondary_bg,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ color: titleColor, fontSize: 12, fontWeight: 900 }}
                  >
                    Loss budgets
                  </div>
                  <div
                    style={{ color: titleColor, fontSize: 12, fontWeight: 800 }}
                  >
                    {lossTotals.length}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    display: "grid",
                    gap: 8,
                    maxHeight: 140,
                    overflowY: "auto",
                    paddingRight: 2,
                  }}
                >
                  {lossTotals.map((b) => (
                    <div
                      key={`loss-${b.budgetName}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          color: titleColor,
                          fontSize: 12,
                          fontWeight: 800,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={b.budgetName}
                      >
                        {b.budgetName}
                      </div>
                      <div
                        style={{
                          color: lossAccent,
                          fontSize: 12,
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatMoney(Math.abs(b.total))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {shouldShowGainBudgets ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: `1px solid ${colors.border_color}`,
                  backgroundColor: gainSoft || colors.secondary_bg,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ color: titleColor, fontSize: 12, fontWeight: 900 }}
                  >
                    Gain budgets
                  </div>
                  <div
                    style={{ color: titleColor, fontSize: 12, fontWeight: 800 }}
                  >
                    {gainTotals.length}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    display: "grid",
                    gap: 8,
                    maxHeight: 140,
                    overflowY: "auto",
                    paddingRight: 2,
                  }}
                >
                  {gainTotals.map((b) => (
                    <div
                      key={`gain-${b.budgetName}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          color: titleColor,
                          fontSize: 12,
                          fontWeight: 800,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={b.budgetName}
                      >
                        {b.budgetName}
                      </div>
                      <div
                        style={{
                          color: gainAccent,
                          fontSize: 12,
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatMoney(Math.abs(b.total))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div
      className="chart-container daily-spending-chart fade-in"
      style={{
        position: "relative",
        zIndex: 5,
        overflow: "visible",
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {/* Chart header */}
      <div className="chart-header">
        <h3 style={{ color: colors.primary_text }}>
          {icon || ""}
          {chartTitle}
        </h3>
        {!hideControls ? (
          <div className="chart-controls">
            <ChartTimeframeSelector
              value={timeframe}
              onChange={onTimeframeChange}
              options={timeframeSelectorOptions}
            />
            <ChartTypeToggle
              selectedType={activeType}
              onToggle={onTypeToggle}
              options={typeSelectorOptions}
            />
          </div>
        ) : null}
      </div>

      {/* Chart visualization */}
      {showEmpty ? (
        <EmptyStateCard
          icon="📉"
          title="No spending data"
          message="No transactions available for this timeframe yet."
          height={chartHeight + 40}
          bordered={false}
        />
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={chartData} key={animationKey}>
            <defs>
              {!isOverlayAllMode ? (
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.color} stopOpacity={0.8} />
                  <stop
                    offset="95%"
                    stopColor={theme.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ) : (
                <>
                  <linearGradient
                    id="spendingGradient-loss"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={getThemeColors("loss", CHART_THEME).color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={getThemeColors("loss", CHART_THEME).color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient
                    id="spendingGradient-gain"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={getThemeColors("gain", CHART_THEME).color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={getThemeColors("gain", CHART_THEME).color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </>
              )}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={colors.border_color} />

            <XAxis
              dataKey="xLabel"
              stroke={colors.primary_text}
              fontSize={12}
              tickLine={false}
              tickFormatter={xTickFormatter}
              hide={hideXAxis}
            />

            <YAxis
              stroke={colors.primary_text}
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) =>
                `${currencySymbol}${Math.round(value / 1000)}K`
              }
            />

            <Tooltip
              wrapperStyle={{
                zIndex: 2000,
                outline: "none",
              }}
              cursor={{
                stroke: theme.color,
                strokeWidth: 2,
                strokeDasharray: "5 5",
                opacity: 0.5,
              }}
              position={{ y: 0 }}
              allowEscapeViewBox={{ x: false, y: true }}
              animationDuration={150}
              animationEasing="ease-out"
              content={(props) => {
                const point = props?.payload?.[0]?.payload;

                const hasAnyOverlayBudgets = (() => {
                  if (!point) return false;
                  const lossTotals = normalizeBudgetTotals(
                    point?.budgetTotalsLoss
                  )
                    .filter((x) => Number.isFinite(x.total))
                    .filter((x) =>
                      showAllBudgetsInTooltip ? true : x.total !== 0
                    );
                  const gainTotals = normalizeBudgetTotals(
                    point?.budgetTotalsGain
                  )
                    .filter((x) => Number.isFinite(x.total))
                    .filter((x) =>
                      showAllBudgetsInTooltip ? true : x.total !== 0
                    );
                  return lossTotals.length > 0 || gainTotals.length > 0;
                })();

                const hasAnyBudgets = (() => {
                  if (!point) return false;
                  const totals = normalizeBudgetTotals(point?.budgetTotals)
                    .filter((x) => Number.isFinite(x.total))
                    .filter((x) =>
                      showAllBudgetsInTooltip ? true : x.total !== 0
                    );
                  return totals.length > 0;
                })();

                if (
                  isOverlayAllMode &&
                  showBudgetTotalsInTooltip &&
                  hasAnyOverlayBudgets
                ) {
                  return <OverlayAllBudgetTotalsTooltip {...props} />;
                }

                const hasBudgetTotals =
                  showBudgetTotalsInTooltip &&
                  point &&
                  point.budgetTotals &&
                  (Array.isArray(point.budgetTotals) ||
                    typeof point.budgetTotals === "object");

                if (hasBudgetTotals && hasAnyBudgets) {
                  return <BudgetTotalsTooltip {...props} />;
                }

                return (
                  <SpendingChartTooltip
                    {...props}
                    selectedType={activeType}
                    timeframe={timeframe}
                    config={tooltipConfig || TOOLTIP_CONFIG}
                    theme={theme}
                  />
                );
              }}
            />

            {!isOverlayAllMode && averageSpending > 0 && averageLabelText && (
              <ReferenceLine
                y={averageSpending}
                stroke={averageLineColor}
                strokeDasharray="4 4"
                strokeWidth={3}
                ifOverflow="extendDomain"
                label={{
                  value: averageLabelText,
                  position: "top",
                  fill: averageLineColor,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}

            {!isOverlayAllMode ? (
              <Area
                type="monotone"
                dataKey="spending"
                stroke={theme.color}
                fillOpacity={0.3}
                fill={`url(#${gradientId})`}
                strokeWidth={2}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              />
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="spendingLoss"
                  stroke={getThemeColors("loss", CHART_THEME).color}
                  fillOpacity={0.25}
                  fill="url(#spendingGradient-loss)"
                  strokeWidth={2}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="spendingGain"
                  stroke={getThemeColors("gain", CHART_THEME).color}
                  fillOpacity={0.25}
                  fill="url(#spendingGradient-gain)"
                  strokeWidth={2}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DailySpendingChart;
