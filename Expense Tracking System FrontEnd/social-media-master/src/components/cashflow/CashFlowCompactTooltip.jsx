import React from "react";

const CashFlowCompactTooltip = ({
  active,
  payload,
  label,
  colors,
  currencySymbol,
  formatNumberFull,
  formatCurrencyCompact,
  t,
  isHovering = true,
}) => {
  if (
    !active ||
    !isHovering ||
    !Array.isArray(payload) ||
    payload.length === 0
  ) {
    return null;
  }

  const entry = payload[0]?.payload || {};
  const totalAmount = Number(entry.amount) || 0;
  const expenses = Array.isArray(entry.expenses) ? entry.expenses : [];
  const inflowCount = expenses.filter((item) => {
    const rawType = (item?.expense?.type || item?.type || "outflow")
      .toString()
      .toLowerCase();
    return rawType === "inflow" || rawType === "gain";
  }).length;
  const outflowCount = expenses.length - inflowCount;
  const fallbackLabel =
    typeof label === "string" && label.length
      ? label
      : entry?.label || entry?.day || entry?.x || "";

  return (
    <div
      style={{
        minWidth: 180,
        maxWidth: 220,
        borderRadius: 10,
        border: `1px solid ${colors.border_color}`,
        background: colors.secondary_bg,
        color: colors.primary_text,
        padding: "10px 12px",
        boxShadow: "0 8px 18px rgba(7, 15, 35, 0.4)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 6,
          color: colors.primary_accent,
        }}
      >
        {fallbackLabel || t("cashflow.labels.unknownDate")}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 11, color: colors.secondary_text }}>
          {t("cashflow.labels.expenses", "Expenses")}
        </span>
        <strong style={{ fontSize: 13 }}>
          {formatNumberFull(expenses.length)}
        </strong>
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {formatCurrencyCompact(totalAmount, currencySymbol)}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: colors.secondary_text,
        }}
      >
        <span>
          {t("cashflow.flowToggle.inflow", "Money In")}: {inflowCount}
        </span>
        <span>
          {t("cashflow.flowToggle.outflow", "Money Out")}: {outflowCount}
        </span>
      </div>
    </div>
  );
};

export default CashFlowCompactTooltip;
