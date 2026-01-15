import React from "react";

const BREAKPOINTS = {
  mobile: 600,
  tablet: 1024,
};

const getTooltipResponsive = () => {
  if (typeof window === "undefined") {
    return {
      container: {
        minWidth: 280,
        maxWidth: 360,
        borderRadius: 22,
        borderWidth: 2,
      },
      header: {
        padding: "8px 14px 7px 14px",
        dateSize: 10,
        labelSize: 9,
        amountSize: 16,
        iconDate: 12,
        iconArrow: 15,
        arrowWrapper: 24,
        gap: 5,
      },
      body: {
        padding: "14px 16px 14px",
        sectionGap: 14,
      },
      typography: {
        sectionTitle: 13,
        badge: 12,
        itemName: 12,
        itemAmount: 13,
        muted: 12,
        net: 14,
      },
      sizes: {
        checkbox: 18,
        dot: 8,
        badgeHeight: 22,
      },
      spacing: {
        sectionHeaderMb: 10,
        rowsGap: 10,
      },
    };
  }

  const width = window.innerWidth;
  if (width <= BREAKPOINTS.mobile) {
    return {
      container: {
        minWidth: 240,
        maxWidth: 300,
        borderRadius: 16,
        borderWidth: 2,
      },
      header: {
        padding: "6px 10px 5px 10px",
        dateSize: 8,
        labelSize: 7,
        amountSize: 13,
        iconDate: 10,
        iconArrow: 13,
        arrowWrapper: 22,
        gap: 5,
      },
      body: {
        padding: "10px 12px 10px",
        sectionGap: 10,
      },
      typography: {
        sectionTitle: 12,
        badge: 11,
        itemName: 11,
        itemAmount: 12,
        muted: 11,
        net: 12,
      },
      sizes: {
        checkbox: 16,
        dot: 7,
        badgeHeight: 20,
      },
      spacing: {
        sectionHeaderMb: 8,
        rowsGap: 8,
      },
    };
  }

  if (width <= BREAKPOINTS.tablet) {
    return {
      container: {
        minWidth: 260,
        maxWidth: 330,
        borderRadius: 18,
        borderWidth: 2,
      },
      header: {
        padding: "7px 12px 6px 12px",
        dateSize: 9,
        labelSize: 8,
        amountSize: 15,
        iconDate: 11,
        iconArrow: 14,
        arrowWrapper: 23,
        gap: 5,
      },
      body: {
        padding: "12px 14px 12px",
        sectionGap: 12,
      },
      typography: {
        sectionTitle: 12,
        badge: 11,
        itemName: 11,
        itemAmount: 12,
        muted: 11,
        net: 13,
      },
      sizes: {
        checkbox: 17,
        dot: 8,
        badgeHeight: 21,
      },
      spacing: {
        sectionHeaderMb: 9,
        rowsGap: 9,
      },
    };
  }

  return {
    container: {
      minWidth: 280,
      maxWidth: 360,
      borderRadius: 22,
      borderWidth: 2,
    },
    header: {
      padding: "8px 14px 7px 14px",
      dateSize: 10,
      labelSize: 9,
      amountSize: 16,
      iconDate: 12,
      iconArrow: 15,
      arrowWrapper: 24,
      gap: 5,
    },
    body: {
      padding: "14px 16px 14px",
      sectionGap: 14,
    },
    typography: {
      sectionTitle: 13,
      badge: 12,
      itemName: 12,
      itemAmount: 13,
      muted: 12,
      net: 14,
    },
    sizes: {
      checkbox: 18,
      dot: 8,
      badgeHeight: 22,
    },
    spacing: {
      sectionHeaderMb: 10,
      rowsGap: 10,
    },
  };
};

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

const AllTypesIcon = ({ color = "white", size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Up arrow (left) */}
    <path
      d="M9 18V6M9 6l-3 3M9 6l3 3"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Down arrow (right) */}
    <path
      d="M15 6v12M15 18l-3-3M15 18l3-3"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

const DecorativeCircles = () => (
  <>
    <div
      style={{
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.1)",
        top: -15,
        right: -15,
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.08)",
        bottom: -8,
        left: -8,
      }}
    />
  </>
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
  responsive,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: responsive?.spacing?.sectionHeaderMb ?? 10,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: responsive?.sizes?.checkbox ?? 18,
          height: responsive?.sizes?.checkbox ?? 18,
          borderRadius: 4,
          border: `1px solid ${checkboxBorder}`,
          background: getGlow(color, 0.18) || "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: checkboxCheck,
          fontSize: (responsive?.sizes?.checkbox ?? 18) - 6,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        ✓
      </div>
      <div
        style={{
          color,
          fontWeight: 900,
          fontSize: responsive?.typography?.sectionTitle ?? 13,
        }}
      >
        {title}
      </div>
    </div>

    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 26,
        height: responsive?.sizes?.badgeHeight ?? 22,
        padding: "0 10px",
        borderRadius: 999,
        background: badgeBg,
        color: "#fff",
        fontSize: responsive?.typography?.badge ?? 12,
        fontWeight: 900,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {count}
    </div>
  </div>
);

const ItemRow = ({
  name,
  amountText,
  color,
  dotColor,
  textColor,
  responsive,
}) => (
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
          width: responsive?.sizes?.dot ?? 8,
          height: responsive?.sizes?.dot ?? 8,
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
          fontSize: responsive?.typography?.itemName ?? 12,
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
        fontSize: responsive?.typography?.itemAmount ?? 13,
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
  responsive,
}) => {
  const { visible, hiddenCount, total } = buildTopN(items, maxItems);

  return (
    <div
      style={{
        padding: responsive?.body?.padding?.includes(" ") ? 12 : 14,
        borderRadius: responsive?.container?.borderRadius
          ? Math.max(12, Math.round(responsive.container.borderRadius * 0.65))
          : 14,
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
        responsive={responsive}
      />

      <div style={{ display: "grid", gap: responsive?.spacing?.rowsGap ?? 10 }}>
        {visible.length > 0 ? (
          visible.map((item) => (
            <ItemRow
              key={item.name}
              name={item.name}
              amountText={formatMoney(Math.abs(item.total))}
              color={color}
              dotColor={color}
              textColor={textColor}
              responsive={responsive}
            />
          ))
        ) : (
          <div
            style={{
              color: muted,
              fontSize: responsive?.typography?.muted ?? 12,
              fontWeight: 700,
            }}
          >
            {emptyMessage}
          </div>
        )}

        {hiddenCount > 0 ? (
          <div
            style={{
              color: muted,
              fontSize: responsive?.typography?.muted ?? 12,
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
  isAllView = false,
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
  const bothAccent = "#fadb14";
  const bothAccentBorder =
    getGlow(bothAccent, mode === "dark" ? 0.75 : 0.7) || bothAccent;

  const baseBorder = colors?.border_color || "rgba(255,255,255,0.12)";
  const surface = colors?.primary_bg || "rgba(12,12,18,0.92)";

  const hasBothSections = Boolean(lossSection) && Boolean(gainSection);
  const shouldUseAllAccent = Boolean(isAllView) || hasBothSections;
  const isLossOnly =
    Boolean(lossSection) && !gainSection && !shouldUseAllAccent;

  const frameColor = shouldUseAllAccent
    ? bothAccent
    : lossSection
    ? lossAccent
    : gainSection
    ? gainAccent
    : "#ff5252";

  const frameBorder = shouldUseAllAccent
    ? bothAccentBorder
    : isLossOnly
    ? lossAccent
    : getGlow(frameColor, mode === "dark" ? 0.55 : 0.45) || baseBorder;
  const frameGlow =
    getGlow(frameColor, mode === "dark" ? 0.35 : 0.22) || "rgba(0,0,0,0.25)";

  const responsive = getTooltipResponsive();

  const labelText = String(totalLabel ?? "").toLowerCase();
  const headerIsLoss =
    labelText.includes("spend") ||
    labelText.includes("loss") ||
    (Boolean(lossSection) && !gainSection);

  const headerGradient = shouldUseAllAccent
    ? "linear-gradient(135deg, rgba(250, 219, 20, 0.82) 0%, rgba(212, 177, 6, 0.82) 100%)"
    : headerIsLoss
    ? "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)"
    : "linear-gradient(135deg, #00dac6 0%, #00a896 100%)";

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
        minWidth: responsive.container.minWidth,
        maxWidth: responsive.container.maxWidth,
        borderRadius: responsive.container.borderRadius,
        border: `${responsive.container.borderWidth}px solid ${frameBorder}`,
        background: containerBg,
        boxShadow: "none",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: headerGradient,
          padding: responsive.header.padding,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <DecorativeCircles />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "rgba(255,255,255,0.9)",
            fontSize: responsive.header.dateSize,
            fontWeight: 500,
            position: "relative",
            zIndex: 1,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          <CalendarIcon
            size={responsive.header.iconDate}
            color="rgba(255, 255, 255, 0.9)"
          />
          <span>{dateText}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: responsive.header.gap,
            position: "relative",
            zIndex: 1,
            marginTop: 3,
            width: "100%",
          }}
        >
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <div
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: responsive.header.labelSize,
                fontWeight: 500,
                marginBottom: 1,
                letterSpacing: "0.3px",
              }}
            >
              {totalLabel}
            </div>
            <div
              style={{
                color: "#fff",
                fontSize: responsive.header.amountSize,
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              {totalText}
            </div>
          </div>

          <div
            style={{
              width: responsive.header.arrowWrapper,
              height: responsive.header.arrowWrapper,
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
            }}
          >
            {shouldUseAllAccent ? (
              <AllTypesIcon
                color="#ffffff"
                size={responsive.header.iconArrow}
              />
            ) : (
              <ArrowIcon
                direction={headerIsLoss ? "down" : "up"}
                color="#ffffff"
                size={responsive.header.iconArrow}
              />
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: responsive.body.padding, background: surface }}>
        <div style={{ display: "grid", gap: responsive.body.sectionGap }}>
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
              responsive={responsive}
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
              responsive={responsive}
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
                fontSize: responsive.typography.net,
                letterSpacing: 0.2,
              }}
            >
              <span style={{ color: muted, fontWeight: 900 }}>Net:</span>
              <span>
                {netIsPositive ? "+" : "-"}
                {formatMoney(Math.abs(netAmount))}
              </span>
              <span
                style={{ fontSize: responsive.typography.net, lineHeight: 1 }}
              >
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
