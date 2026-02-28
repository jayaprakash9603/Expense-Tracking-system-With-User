import React, { useMemo } from "react";

const fallbackTranslation = (t, key, fallbackText) => {
  if (typeof t !== "function") return fallbackText;
  const translated = t(key);
  return translated === key ? fallbackText : translated;
};

const formatSignedCurrency = (value, currencySymbol, formatNumberFull) => {
  if (!Number.isFinite(value)) return `${currencySymbol}0`;
  const abs = Math.abs(value);
  const formatted = `${currencySymbol}${formatNumberFull(abs)}`;
  return value < 0 ? `-${formatted}` : formatted;
};

const buildAccentColor = (accentRGB, accentColor, alphaHex, alphaNumeric) => {
  if (accentRGB) {
    return `rgba(${accentRGB}, ${alphaNumeric})`;
  }
  if (accentColor && accentColor.startsWith("#") && accentColor.length === 7) {
    return `${accentColor}${alphaHex}`;
  }
  return accentColor || "#5b7fff";
};

const alphaToHex = (alpha) => {
  if (!Number.isFinite(alpha) || alpha <= 0) return "00";
  if (alpha >= 1) return "ff";
  return Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
};

const CashFlowTooltip = ({
  active,
  payload,
  label,
  labelFormatter,
  colors,
  currencySymbol,
  formatCurrencyCompact,
  formatNumberFull,
  accentColor,
  accentRGB,
  t,
  isHovering = true,
  mode = "dark",
}) => {
  const normalizedPayload = Array.isArray(payload) ? payload : [];
  const entry = normalizedPayload[0]?.payload || {};
  const expenses = Array.isArray(entry.expenses) ? entry.expenses : [];
  const displayLabel =
    typeof labelFormatter === "function"
      ? labelFormatter(label, payload)
      : label;

  const uncategorizedLabel = fallbackTranslation(
    t,
    "cashflow.labels.uncategorized",
    "Uncategorized"
  );
  const unknownPaymentLabel = fallbackTranslation(
    t,
    "cashflow.labels.unknownPayment",
    "Unknown"
  );

  const stats = useMemo(() => {
    const baselineTotal = Number(entry.amount) || 0;
    if (!expenses.length) {
      return {
        total: baselineTotal,
        count: 0,
        inflow: 0,
        outflow: 0,
        inflowCount: 0,
        outflowCount: 0,
        average: 0,
        net: 0,
        topCategories: [],
        dominantPayment: null,
        largest: null,
      };
    }

    const summary = expenses.reduce(
      (acc, item) => {
        const rawAmount = Number(item?.expense?.amount ?? item?.amount ?? 0);
        if (!Number.isFinite(rawAmount)) {
          return acc;
        }

        acc.total += rawAmount;
        acc.count += 1;

        const rawType = (item?.expense?.type || item?.type || "outflow")
          .toString()
          .toLowerCase();
        const typeKey =
          rawType === "inflow" || rawType === "gain" ? "inflow" : "outflow";
        acc[typeKey] += rawAmount;
        acc[`${typeKey}Count`] += 1;

        const category =
          item?.categoryName ||
          item?.category?.name ||
          item?.expense?.categoryName ||
          item?.expense?.category?.name ||
          uncategorizedLabel;
        acc.categoryMap[category] =
          (acc.categoryMap[category] || 0) + rawAmount;

        const paymentMethod =
          item?.paymentMethodName ||
          item?.paymentMethod ||
          item?.expense?.paymentMethod ||
          unknownPaymentLabel;
        acc.paymentMap[paymentMethod] =
          (acc.paymentMap[paymentMethod] || 0) + rawAmount;

        if (rawAmount > acc.maxAmount) {
          acc.maxAmount = rawAmount;
          acc.maxLabel =
            item?.expense?.expenseName ||
            item?.name ||
            item?.expense?.comments ||
            category;
        }

        return acc;
      },
      {
        total: 0,
        count: 0,
        inflow: 0,
        outflow: 0,
        inflowCount: 0,
        outflowCount: 0,
        categoryMap: {},
        paymentMap: {},
        maxAmount: 0,
        maxLabel: "",
      }
    );

    const topCategories = Object.entries(summary.categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name, amount]) => ({ name, amount }));

    const dominantPaymentEntry = Object.entries(summary.paymentMap).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      total: summary.total || baselineTotal,
      count: summary.count,
      inflow: summary.inflow,
      outflow: summary.outflow,
      inflowCount: summary.inflowCount,
      outflowCount: summary.outflowCount,
      average: summary.count ? summary.total / summary.count : 0,
      net: summary.inflow - summary.outflow,
      topCategories,
      dominantPayment: dominantPaymentEntry
        ? { name: dominantPaymentEntry[0], amount: dominantPaymentEntry[1] }
        : null,
      largest:
        summary.maxAmount > 0
          ? { name: summary.maxLabel, amount: summary.maxAmount }
          : null,
    };
  }, [expenses, entry.amount, uncategorizedLabel, unknownPaymentLabel]);

  if (!active || !isHovering || normalizedPayload.length === 0) {
    return null;
  }

  const totalLabel = fallbackTranslation(
    t,
    "cashflow.chart.tooltipAmount",
    "Amount"
  );
  const expensesLabel = fallbackTranslation(
    t,
    "cashflow.labels.expenses",
    "Expenses"
  );
  const averageLabel = fallbackTranslation(t, "cashflow.labels.average", "Avg");
  const inflowLabel = fallbackTranslation(
    t,
    "cashflow.flowToggle.inflow",
    "Money In"
  );
  const outflowLabel = fallbackTranslation(
    t,
    "cashflow.flowToggle.outflow",
    "Money Out"
  );
  const netLabel = fallbackTranslation(
    t,
    "cashflow.tableHeaders.netAmount",
    "Net Amount"
  );
  const topCategoriesLabel = fallbackTranslation(
    t,
    "cashflow.chart.tooltipTopCategories",
    "Top categories"
  );
  const paymentLabel = fallbackTranslation(
    t,
    "cashflow.tableHeaders.paymentMethod",
    "Payment method"
  );
  const largestLabel = fallbackTranslation(
    t,
    "cashflow.chart.tooltipLargest",
    "Largest item"
  );

  const tintBackground = buildAccentColor(accentRGB, accentColor, "22", 0.12);
  const tintBorder = buildAccentColor(accentRGB, accentColor, "3d", 0.24);
  const totalFlow = stats.inflow + stats.outflow;
  const inflowPercent =
    totalFlow > 0 ? Math.round((stats.inflow / totalFlow) * 100) : 0;
  const outflowPercent = Math.max(0, 100 - inflowPercent);
  const accentBase = accentColor || "#5b7fff";
  const gradientStartAlpha = mode === "light" ? 0.18 : 0.28;
  const gradientEndAlpha = mode === "light" ? 0.04 : 0.06;
  const accentGradient = accentRGB
    ? `linear-gradient(135deg, rgba(${accentRGB},${gradientStartAlpha}) 0%, rgba(${accentRGB},${gradientEndAlpha}) 100%)`
    : `linear-gradient(135deg, ${accentBase}${alphaToHex(
        gradientStartAlpha
      )} 0%, ${accentBase}${alphaToHex(gradientEndAlpha)} 100%)`;
  const overlayOpacity = mode === "light" ? 1 : 0.9;
  const positiveTone = colors?.positive || "#38d49c";
  const negativeTone = colors?.negative || "#f87171";
  const netIsPositive = stats.net >= 0;
  const netAccent = netIsPositive ? positiveTone : negativeTone;
  const netTint = netIsPositive
    ? "rgba(56, 212, 156, 0.16)"
    : "rgba(248, 113, 113, 0.18)";
  const borderColor = colors?.border_color || "rgba(255,255,255,0.08)";
  const mutedText = colors?.secondary_text || "#a0a6b1";
  const surfaceColor =
    mode === "light"
      ? colors?.card_bg || "#ffffff"
      : colors?.secondary_bg || "#000000";
  const showMetaGrid = Boolean(stats.dominantPayment || stats.largest);

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: surfaceColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 14,
        padding: "18px 20px 16px",
        boxShadow: "0 18px 34px rgba(8, 15, 35, 0.32)",
        color: colors?.primary_text || "#ffffff",
        minWidth: 240,
        maxWidth: 300,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: accentGradient,
          borderRadius: 14,
          opacity: overlayOpacity,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 16 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              {displayLabel}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: mutedText }}>
              {expensesLabel}: {formatNumberFull(stats.count)}
            </span>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                backgroundColor: tintBackground,
                border: `1px solid ${tintBorder}`,
                fontSize: 12,
                fontWeight: 600,
                width: "fit-content",
              }}
            >
              <span style={{ color: accentColor || "#5b7fff" }}>
                {totalLabel}
              </span>
              <span>
                {formatSignedCurrency(
                  stats.total,
                  currencySymbol,
                  formatNumberFull
                )}
              </span>
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: mutedText,
              }}
            >
              {netLabel}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                backgroundColor: netTint,
                color: netAccent,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {formatSignedCurrency(
                stats.net,
                currencySymbol,
                formatNumberFull
              )}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: mutedText }}>
              {averageLabel}:{" "}
              {formatCurrencyCompact(stats.average, currencySymbol)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 12,
            backgroundColor: colors?.tertiary_bg || "rgba(12, 18, 32, 0.54)",
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              fontWeight: 600,
              color: mutedText,
            }}
          >
            <span>{inflowLabel}</span>
            <span>{outflowLabel}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                display: "flex",
                flex: 1,
                height: 6,
                borderRadius: 999,
                overflow: "hidden",
                backgroundColor: "rgba(148, 163, 184, 0.18)",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, inflowPercent))}%`,
                  height: "100%",
                  backgroundColor: positiveTone,
                  transition: "width 160ms ease-out",
                }}
              />
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, outflowPercent))}%`,
                  height: "100%",
                  backgroundColor: negativeTone,
                  transition: "width 160ms ease-out",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                fontWeight: 600,
                color: mutedText,
              }}
            >
              <span>{inflowPercent}%</span>
              <span>{outflowPercent}%</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>{formatCurrencyCompact(stats.inflow, currencySymbol)}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: mutedText }}>
                {formatNumberFull(stats.inflowCount)}{" "}
                {expensesLabel.toLowerCase()}
              </span>
            </div>
            <div
              style={{
                textAlign: "right",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span>
                {formatCurrencyCompact(stats.outflow, currencySymbol)}
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: mutedText }}>
                {formatNumberFull(stats.outflowCount)}{" "}
                {expensesLabel.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {stats.topCategories.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: mutedText }}>
              {topCategoriesLabel}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.topCategories.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 10,
                    backgroundColor:
                      colors?.tertiary_bg || "rgba(12, 18, 32, 0.54)",
                    border: `1px solid ${borderColor}`,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span>{item.name}</span>
                  <span>
                    {formatCurrencyCompact(item.amount, currencySymbol)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showMetaGrid && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              fontSize: 12,
              fontWeight: 600,
              color: mutedText,
            }}
          >
            {stats.dominantPayment && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "10px 12px",
                  borderRadius: 10,
                  backgroundColor: "rgba(15, 23, 42, 0.38)",
                  border: `1px solid ${borderColor}`,
                }}
              >
                <span>{paymentLabel}</span>
                <span
                  style={{
                    color: colors?.primary_text || "#ffffff",
                    fontWeight: 700,
                  }}
                >
                  {stats.dominantPayment.name}
                </span>
              </div>
            )}
            {stats.largest && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "10px 12px",
                  borderRadius: 10,
                  backgroundColor: "rgba(15, 23, 42, 0.38)",
                  border: `1px solid ${borderColor}`,
                }}
              >
                <span>{largestLabel}</span>
                <span
                  style={{
                    color: colors?.primary_text || "#ffffff",
                    fontWeight: 700,
                  }}
                >
                  {stats.largest.name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowTooltip;
