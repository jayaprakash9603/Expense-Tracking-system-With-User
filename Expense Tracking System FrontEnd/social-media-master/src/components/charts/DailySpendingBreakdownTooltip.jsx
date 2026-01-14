import React from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toUpperDate = (text) => {
  const str = String(text ?? "").trim();
  return str ? str.toUpperCase() : "";
};

const ArrowIcon = ({ direction = "down", color = "white", size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {direction === "down" ? (
      <path
        d="M12 5v14M12 19l-7-7M12 19l7-7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M12 19V5M12 5l7 7M12 5l-7 7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const CalendarIcon = ({ color = "white", size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="15"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M3 10h18" stroke={color} strokeWidth="2" />
    <path
      d="M8 3v4M16 3v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const getGlow = (hex, alpha) => {
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

  const a = clamp(Number(alpha) || 0, 0, 1);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const buildTopN = (items, maxItems) => {
  const safe = Array.isArray(items) ? items : [];
  const max = Math.max(0, Number(maxItems) || 0);
  const visible = safe.slice(0, max);
  const hiddenCount = Math.max(0, safe.length - visible.length);
  return { visible, hiddenCount, total: safe.length };
};

const SectionHeader = ({
  title,
  count,
  color,
  badgeBg,
  checkboxBorder,
  checkboxCheck,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 10,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: `1px solid ${checkboxBorder}`,
          background: getGlow(color, 0.18) || "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: checkboxCheck,
          fontSize: 12,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        ✓
      </div>
      <div style={{ color, fontWeight: 900, fontSize: 13 }}>{title}</div>
    </div>

    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 28,
        height: 22,
        padding: "0 10px",
        borderRadius: 999,
        background: badgeBg,
        color: "#fff",
        fontSize: 12,
        fontWeight: 900,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {count}
    </div>
  </div>
);

const ItemRow = ({ name, amountText, color, dotColor, textColor }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: dotColor || color,
          boxShadow: `0 0 0 4px ${
            getGlow(dotColor || color, 0.15) || "transparent"
          }`,
          flex: "0 0 auto",
        }}
      />
      <div
        title={name}
        style={{
          color: textColor,
          fontSize: 12,
          fontWeight: 800,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>

    <div
      style={{
        color,
        fontSize: 13,
        fontWeight: 900,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {amountText}
    </div>
  </div>
);

const SectionCard = ({
  title,
  count,
  color,
  items,
  formatMoney,
  emptyMessage,
  maxItems,
  muted,
  surface,
  border,
  textColor,
}) => {
  const { visible, hiddenCount, total } = buildTopN(items, maxItems);

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        background: surface,
        border: `1px solid ${border}`,
      }}
    >
      <SectionHeader
        title={title}
        count={count ?? total}
        color={color}
        badgeBg={getGlow(color, 0.45) || color}
        checkboxBorder={getGlow(color, 0.55) || border}
        checkboxCheck={color}
      />

      <div style={{ display: "grid", gap: 10 }}>
        {visible.length > 0 ? (
          visible.map((item) => (
            <ItemRow
              key={item.name}
              name={item.name}
              amountText={formatMoney(Math.abs(item.total))}
              color={color}
              dotColor={color}
              textColor={textColor}
            />
          ))
        ) : (
          <div style={{ color: muted, fontSize: 12, fontWeight: 700 }}>
            {emptyMessage}
          </div>
        )}

        {hiddenCount > 0 ? (
          <div
            style={{
              color: muted,
              fontSize: 12,
              fontWeight: 800,
              textAlign: "right",
            }}
          >
            +{hiddenCount} more
          </div>
        ) : null}
      </div>
    </div>
  );
};

const DailySpendingBreakdownTooltip = ({
  active,
  payload,
  mode,
  colors,
  dateLabel,
  totalLabel,
  totalAmount,
  totalAmountColor,
  lossSection,
  gainSection,
  net,
  locale,
  formatMoney,
  maxItems = 5,
}) => {
  if (!active || !Array.isArray(payload) || payload.length === 0) return null;

  const titleColor = colors?.primary_text || "#fff";
  const muted = colors?.placeholder_text || colors?.secondary_text || "#b9c0d0";

  const lossAccent = "#ff5252";
  const gainAccent = "#00d4c0";

  const baseBorder = colors?.border_color || "rgba(255,255,255,0.12)";
  const surface = colors?.primary_bg || "rgba(12,12,18,0.92)";

  const frameColor = lossSection
    ? lossAccent
    : gainSection
    ? gainAccent
    : "#ff5252";

  const frameBorder =
    getGlow(frameColor, mode === "dark" ? 0.55 : 0.45) || baseBorder;
  const frameGlow =
    getGlow(frameColor, mode === "dark" ? 0.35 : 0.22) || "rgba(0,0,0,0.25)";

  const headerBg =
    `radial-gradient(circle at 85% 0%, ${
      getGlow(frameColor, 0.25) || "rgba(255,82,82,0.25)"
    } 0%, transparent 55%), ` +
    `linear-gradient(160deg, ${
      getGlow(frameColor, 0.22) || "rgba(255,82,82,0.22)"
    } 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.85) 100%)`;

  const containerBg =
    `radial-gradient(circle at 15% 15%, rgba(255,255,255,0.08) 0%, transparent 45%), ` +
    `radial-gradient(circle at 85% 20%, ${
      getGlow(frameColor, 0.18) || "rgba(255,82,82,0.18)"
    } 0%, transparent 60%), ` +
    `linear-gradient(180deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.92) 100%)`;

  const dateText = toUpperDate(dateLabel);

  const totalText = formatMoney(totalAmount ?? 0);
  const amountColor = totalAmountColor || frameColor;

  const showNet = net && Number.isFinite(net.amount);
  const netAmount = showNet ? Number(net.amount) : 0;
  const netIsPositive = netAmount >= 0;

  return (
    <div
      style={{
        position: "relative",
        minWidth: 300,
        maxWidth: 360,
        borderRadius: 22,
        border: `2px solid ${frameBorder}`,
        background: containerBg,
        boxShadow: "none",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          padding: "14px 16px 12px",
          background: headerBg,
          borderBottom: `1px solid ${getGlow(frameColor, 0.3) || baseBorder}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "rgba(255,255,255,0.9)",
            fontSize: 12,
            fontWeight: 900,
            boxShadow: "none",
          }}
        >
          <CalendarIcon size={14} color="rgba(255,255,255,0.9)" />
          <span>{dateText}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 10,
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <div
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {totalLabel}
            </div>
            <div
              style={{
                color: "#fff",
                fontSize: 26,
                fontWeight: 950,
                letterSpacing: 0.2,
                lineHeight: 1,
              }}
            >
              {totalText}
            </div>
          </div>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: getGlow(amountColor, 0.35) || "rgba(255,82,82,0.35)",
              border: `1px solid ${getGlow(amountColor, 0.55) || baseBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 10px 24px ${
                getGlow(amountColor, 0.25) || "rgba(0,0,0,0.25)"
              }`,
              flex: "0 0 auto",
            }}
          >
            <ArrowIcon
              direction={lossSection ? "down" : gainSection ? "up" : "down"}
              color="#ffffff"
              size={20}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px 14px", background: surface }}>
        <div style={{ display: "grid", gap: 14 }}>
          {lossSection ? (
            <SectionCard
              title={lossSection.title}
              count={lossSection.count}
              color={lossAccent}
              items={lossSection.items}
              formatMoney={formatMoney}
              emptyMessage={lossSection.emptyMessage}
              maxItems={maxItems}
              muted={muted}
              surface={getGlow(lossAccent, 0.14) || "rgba(255,82,82,0.12)"}
              border={getGlow(lossAccent, 0.28) || baseBorder}
              textColor={titleColor}
            />
          ) : null}

          {gainSection ? (
            <SectionCard
              title={gainSection.title}
              count={gainSection.count}
              color={gainAccent}
              items={gainSection.items}
              formatMoney={formatMoney}
              emptyMessage={gainSection.emptyMessage}
              maxItems={maxItems}
              muted={muted}
              surface={getGlow(gainAccent, 0.14) || "rgba(0,212,192,0.12)"}
              border={getGlow(gainAccent, 0.28) || baseBorder}
              textColor={titleColor}
            />
          ) : null}

          {showNet ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                paddingTop: 4,
                color: netIsPositive ? gainAccent : lossAccent,
                fontWeight: 950,
                fontSize: 14,
                letterSpacing: 0.2,
              }}
            >
              <span style={{ color: muted, fontWeight: 900 }}>Net:</span>
              <span>
                {netIsPositive ? "+" : "-"}
                {formatMoney(Math.abs(netAmount))}
              </span>
              <span style={{ fontSize: 14, lineHeight: 1 }}>
                {netIsPositive ? "▲" : "▼"}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DailySpendingBreakdownTooltip;
