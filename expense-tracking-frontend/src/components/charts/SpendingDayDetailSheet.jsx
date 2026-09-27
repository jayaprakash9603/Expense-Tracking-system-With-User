import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  IconButton,
  Slide,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useTranslation } from "../../hooks/useTranslation";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const formatNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const toNonEmptyString = (v) => {
  if (v == null) return "";
  const s = String(v).trim();
  return s.length ? s : "";
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const CalendarIcon = ({ size = 16, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

const ArrowIcon = ({ direction = "down", size = 18, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

const normalizeExpense = (expense, fallbackCategory = "") => {
  const safe = expense && typeof expense === "object" ? expense : {};
  const exp = safe.details || safe.expense || {};
  const name =
    toNonEmptyString(exp?.expenseName) ||
    toNonEmptyString(safe?.name) ||
    toNonEmptyString(safe?.expenseName) ||
    toNonEmptyString(safe?.details?.expenseName) ||
    "Unknown";
  const category =
    toNonEmptyString(safe?.category) ||
    toNonEmptyString(safe?.categoryName) ||
    toNonEmptyString(safe?.category?.name) ||
    toNonEmptyString(fallbackCategory) ||
    "Others";
  const amount = Math.abs(
    toNumber(
      exp?.amount ??
        exp?.netAmount ??
        safe?.amount ??
        safe?.netAmount ??
        safe?.details?.amount ??
        safe?.details?.netAmount ??
        safe?.expense?.amount ??
        safe?.expense?.netAmount,
    ),
  );
  return { name, category, amount };
};

/**
 * Full-screen day detail for small screens — same visual language as
 * SpendingChartTooltip, sized for touch and readable transaction lists.
 */
const SpendingDayDetailSheet = ({
  open,
  onClose,
  point,
  selectedType = "loss",
  theme,
  timeframe,
}) => {
  const { colors, mode } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const preferReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const currencySymbol = settings.getCurrency().symbol;
  const locale = settings.language || "en";

  const isOverlayAll =
    String(selectedType).toLowerCase() === "all" &&
    (Number.isFinite(Number(point?.spendingLoss)) ||
      Number.isFinite(Number(point?.spendingGain)) ||
      Array.isArray(point?.expensesLoss) ||
      Array.isArray(point?.expensesGain));

  const isLoss = String(selectedType).toLowerCase() !== "gain";

  const dateLabel = useMemo(() => {
    if (!point) return "";
    if (
      timeframe === "all_time" ||
      timeframe === "this_year" ||
      timeframe === "last_year"
    ) {
      return point?.xLabel || point?.date || "";
    }
    if (point?.dateObj instanceof Date && !Number.isNaN(point.dateObj.getTime())) {
      return point.dateObj.toLocaleDateString(locale || undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
    const raw = point?.rawDate || point?.date;
    if (raw) {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString(locale || undefined, {
          month: "short",
          day: "2-digit",
        });
      }
    }
    return point?.xLabel || "";
  }, [locale, point, timeframe]);

  const lossAccent = "#ff5252";
  const gainAccent = "#00d4c0";
  const accent = theme?.color || (isLoss ? lossAccent : gainAccent);

  const amountValue = toNumber(point?.spending ?? point?.amount ?? 0);

  const lossTotal = toNumber(point?.spendingLoss);
  const gainTotal = toNumber(point?.spendingGain);
  const net = gainTotal - lossTotal;

  const expenses = useMemo(() => {
    if (!point) return { all: [], loss: [], gain: [] };
    if (isOverlayAll) {
      const loss = (Array.isArray(point.expensesLoss) ? point.expensesLoss : [])
        .map((e) => normalizeExpense(e))
        .filter((e) => e.amount > 0)
        .sort((a, b) => b.amount - a.amount);
      const gain = (Array.isArray(point.expensesGain) ? point.expensesGain : [])
        .map((e) => normalizeExpense(e))
        .filter((e) => e.amount > 0)
        .sort((a, b) => b.amount - a.amount);
      return { all: [...loss, ...gain], loss, gain };
    }
    const list = (Array.isArray(point.expenses) ? point.expenses : [])
      .map((e) => normalizeExpense(e))
      .filter((e) => e.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    return { all: list, loss: isLoss ? list : [], gain: isLoss ? [] : list };
  }, [isLoss, isOverlayAll, point]);

  const headerGradient = isOverlayAll
    ? "linear-gradient(135deg, rgba(250, 219, 20, 0.95) 0%, rgba(212, 177, 6, 0.95) 100%)"
    : isLoss
      ? "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)"
      : "linear-gradient(135deg, #00dac6 0%, #00a896 100%)";

  const frameColor = isOverlayAll
    ? "#fadb14"
    : theme?.border || accent;

  const totalLabel = isLoss
    ? t("dashboard.charts.tooltip.totalSpending") || "Total Spending"
    : t("dashboard.charts.tooltip.totalIncome") || "Total Income";

  const renderTxn = (expense, color, key) => (
    <div
      key={key}
      style={{
        background: colors.tertiary_bg || colors.primary_bg,
        borderRadius: 12,
        padding: "12px 14px",
        border: `1px solid ${colors.border_color}`,
        minHeight: 56,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 15,
            color: colors.primary_text,
            fontWeight: 600,
            flex: 1,
            lineHeight: 1.35,
            minWidth: 0,
            wordBreak: "break-word",
          }}
        >
          {expense.name}
        </div>
        <div
          style={{
            fontSize: 15,
            color,
            fontWeight: 700,
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {currencySymbol}
          {formatNumber(expense.amount)}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            opacity: 0.75,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 13,
            color: colors.secondary_text,
            fontWeight: 500,
          }}
        >
          {expense.category}
        </span>
      </div>
    </div>
  );

  const section = (title, list, color) => {
    if (!list.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 700,
              color: colors.primary_text,
            }}
          >
            <span>{title}</span>
            <span
              style={{
                background: color,
                color: mode === "dark" ? "#0a0a0a" : "#fff",
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                minWidth: 22,
                textAlign: "center",
              }}
            >
              {list.length}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((expense, i) => renderTxn(expense, color, `${title}-${i}`))}
        </div>
      </div>
    );
  };

  return (
    <Dialog
      fullScreen
      open={Boolean(open && point)}
      onClose={onClose}
      TransitionComponent={preferReducedMotion ? undefined : Transition}
      aria-labelledby="spending-day-detail-title"
      PaperProps={{
        sx: {
          background: colors.secondary_bg || "#0b0b10",
          color: colors.primary_text,
          display: "flex",
          flexDirection: "column",
          m: 0,
          maxHeight: "100dvh",
        },
      }}
    >
      {/* Colored header matching desktop tooltip */}
      <div
        style={{
          background: headerGradient,
          padding: "16px 16px 18px",
          position: "relative",
          overflow: "hidden",
          borderBottom: `2px solid ${frameColor}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            top: -24,
            right: -16,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              id="spending-day-detail-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "rgba(255,255,255,0.95)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              <CalendarIcon size={14} color="rgba(255,255,255,0.95)" />
              <span>{String(dateLabel || "").toUpperCase()}</span>
            </div>

            {isOverlayAll ? (
              <div style={{ display: "grid", gap: 6 }}>
                {[
                  ["Total Spending", lossTotal],
                  ["Total Income", gainTotal],
                  ["Net", Math.abs(net)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: label === "Net" ? 18 : 16,
                        fontWeight: 800,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {currencySymbol}
                      {formatNumber(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ArrowIcon
                    size={20}
                    direction={isLoss ? "down" : "up"}
                    color="white"
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.88)",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    {totalLabel}
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#fff",
                      fontSize: 28,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {currencySymbol}
                    {formatNumber(amountValue)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <IconButton
            onClick={onClose}
            aria-label="Close day details"
            sx={{
              color: "#fff",
              bgcolor: "rgba(0,0,0,0.2)",
              width: 44,
              height: 44,
              flexShrink: 0,
              "&:hover": { bgcolor: "rgba(0,0,0,0.32)" },
              "&:focus-visible": {
                outline: "2px solid #fff",
                outlineOffset: 2,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </div>

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "16px 16px calc(16px + env(safe-area-inset-bottom, 0px))",
          background: colors.secondary_bg,
        }}
      >
        {isOverlayAll ? (
          <>
            {section(
              t("dashboard.charts.tooltip.transactions") || "Transactions",
              expenses.loss,
              lossAccent,
            )}
            {section("Income", expenses.gain, gainAccent)}
          </>
        ) : expenses.all.length > 0 ? (
          section(
            t("dashboard.charts.tooltip.transactions") || "Transactions",
            expenses.all,
            accent,
          )
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 16px",
              color: colors.secondary_text,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            No transactions for this day.
          </div>
        )}
      </div>
    </Dialog>
  );
};

SpendingDayDetailSheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  point: PropTypes.object,
  selectedType: PropTypes.string,
  theme: PropTypes.shape({
    color: PropTypes.string,
    border: PropTypes.string,
  }),
  timeframe: PropTypes.string,
};

export default SpendingDayDetailSheet;
