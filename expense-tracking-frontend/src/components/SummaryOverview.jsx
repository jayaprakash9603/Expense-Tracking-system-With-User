import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../hooks/useTheme";
import useUserSettings from "../hooks/useUserSettings";
import { useTranslation } from "../hooks/useTranslation";
import { useMediaQuery } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getAccentFunctionalIcon } from "../utils/ui/iconMapping";
import EmptyStateCard from "./EmptyStateCard";

const formatNumber0 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

/**
 * SummaryOverview
 * Application metrics card — responsive: full-width individual cards on small screens.
 */
const SummaryOverview = ({ summary, loading = false }) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const currencySymbol = settings.getCurrency().symbol;
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");
  const preferReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const containerStyle = {
    backgroundColor: "var(--color-secondary-bg)",
    border: "1px solid var(--color-border-color)",
    borderRadius: isMobile ? "12px" : "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    width: "100%",
    boxSizing: "border-box",
  };

  const showEmpty = !summary && !loading;

  if (showEmpty) {
    return (
      <div className="chart-container summary-overview" style={containerStyle}>
        <div
          className="chart-header summary-overview-header"
          style={{
            background: `linear-gradient(135deg, ${colors.primary_accent}15 0%, ${colors.primary_accent}05 100%)`,
            padding: isMobile ? "12px 14px" : "14px 24px",
            borderBottom: `1px solid ${colors.border_color}`,
          }}
        >
          <h3 style={{ color: "var(--color-primary-text)", margin: 0, fontSize: isMobile ? 15 : 18 }}>
            {t("dashboard.overview.title")}
          </h3>
        </div>
        <div style={{ padding: isMobile ? 14 : 20 }}>
          <EmptyStateCard
            icon="search"
            title={t("dashboard.overview.title")}
            message="No application overview data available yet."
            height={200}
            bordered={false}
          />
        </div>
      </div>
    );
  }

  const s = {
    totalExpenses: summary?.totalExpenses ?? 0,
    creditDue: summary?.creditDue ?? 0,
    budgetsActive: summary?.budgetsActive ?? 0,
    friendsCount: summary?.friendsCount ?? 0,
    groupsCount: summary?.groupsCount ?? 0,
    averageDaily: summary?.averageDaily ?? 0,
    savingsRate: summary?.savingsRate ?? 0,
    upcomingBills: summary?.upcomingBills ?? 0,
    topExpenses: summary?.topExpenses ?? [],
  };

  const formatPercent1 = (v) =>
    Number(v ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  const metricsData = [
    {
      iconKey: "spending",
      title: t("dashboard.overview.totalExpenses"),
      value: `${currencySymbol}${formatNumber0(s.totalExpenses)}`,
    },
    {
      iconKey: "bank",
      title: t("dashboard.overview.creditDue"),
      value: `${currencySymbol}${formatNumber0(Math.abs(s.creditDue))}`,
    },
    {
      iconKey: "budget",
      title: t("dashboard.overview.activeBudgets"),
      value: s.budgetsActive,
    },
    {
      iconKey: "friends",
      title: t("dashboard.overview.friends"),
      value: s.friendsCount,
    },
    {
      iconKey: "groups",
      title: t("dashboard.overview.groups"),
      value: s.groupsCount,
    },
  ];

  const kpiData = [
    {
      iconKey: "trend",
      title: t("dashboard.overview.avgDailySpend"),
      value: `${currencySymbol}${formatNumber0(s.averageDaily)}`,
      subtitle: t("dashboard.overview.last30Days"),
    },
    {
      iconKey: "savings",
      title: t("dashboard.overview.savingsRate"),
      value: `${formatPercent1(s.savingsRate)}%`,
      subtitle: t("dashboard.overview.ofIncome"),
    },
    {
      iconKey: "calendar",
      title: t("dashboard.overview.upcomingBills"),
      value: `${currencySymbol}${formatNumber0(s.upcomingBills)}`,
      subtitle: t("dashboard.overview.dueThisPeriod"),
    },
  ];

  const sectionPad = isMobile ? "12px" : "20px 24px 16px";
  const sectionPadBottom = isMobile ? "0 12px 12px" : "0 24px 20px";
  const cardRadius = isMobile ? 12 : 12;

  return (
    <div
      className={`chart-container summary-overview${isMobile ? " is-mobile" : ""}${
        isTablet ? " is-tablet" : ""
      }`}
      style={containerStyle}
    >
      {/* Header */}
      <div
        className="chart-header dashboard-chart-header summary-overview-header"
        style={{
          background: `linear-gradient(135deg, ${colors.primary_accent}15 0%, ${colors.primary_accent}05 100%)`,
          padding: isMobile ? "12px 14px" : "14px 24px",
          borderBottom: `1px solid ${colors.border_color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "nowrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          {getAccentFunctionalIcon("search", colors.primary_accent, {
            sx: { fontSize: isMobile ? 20 : 24, flexShrink: 0 },
          })}
          <h3
            style={{
              color: "var(--color-primary-text)",
              margin: 0,
              fontSize: isMobile ? "0.95rem" : "1.125rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {t("dashboard.overview.title")}
          </h3>
        </div>
        <div
          className="summary-live-badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: isMobile ? "6px 10px" : "6px 12px",
            borderRadius: 20,
            background: `linear-gradient(135deg, ${colors.primary_accent} 0%, #0d9488 100%)`,
            boxShadow: `0 2px 8px ${colors.primary_accent}40`,
            flexShrink: 0,
            minHeight: 32,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              animation: preferReducedMotion ? "none" : "summaryPulse 2s infinite",
            }}
          />
          <span
            style={{
              color: "#ffffff",
              fontSize: isMobile ? 11 : 12,
              fontWeight: 600,
              letterSpacing: "0.3px",
              whiteSpace: "nowrap",
            }}
          >
            {t("dashboard.overview.liveSummary")}
          </span>
        </div>
      </div>

      {/* Metric cards — full-width stack on mobile */}
      <div className="summary-metrics-section" style={{ padding: sectionPad }}>
        <div
          className="summary-metrics-grid"
          style={{
            display: "grid",
            width: "100%",
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
                ? "repeat(3, minmax(0, 1fr))"
                : "repeat(5, minmax(0, 1fr))",
            gap: isMobile ? 10 : 12,
          }}
        >
          {metricsData.map((metric, i) => (
            <div
              key={i}
              className="summary-metric-card"
              style={{
                background: colors.tertiary_bg,
                borderRadius: cardRadius,
                padding: isMobile ? "14px 14px" : "16px 12px",
                border: "1px solid var(--color-border-color)",
                transition: preferReducedMotion
                  ? "none"
                  : "border-color 0.2s ease, box-shadow 0.2s ease",
                position: "relative",
                overflow: "hidden",
                minWidth: 0,
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                alignItems: isMobile ? "center" : "stretch",
                gap: isMobile ? 12 : 0,
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: isMobile ? 48 : 60,
                  height: isMobile ? 48 : 60,
                  background: colors.primary_accent,
                  opacity: 0.1,
                  borderRadius: "50%",
                  transform: "translate(30%, -30%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: isMobile ? 40 : "auto",
                  height: isMobile ? 40 : "auto",
                  borderRadius: isMobile ? 10 : 0,
                  background: isMobile
                    ? `${colors.primary_accent}18`
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: isMobile ? 0 : 8,
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {getAccentFunctionalIcon(metric.iconKey, colors.primary_accent, {
                  sx: { fontSize: isMobile ? 22 : 24 },
                })}
              </div>
              <div style={{ minWidth: 0, flex: 1, position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: isMobile ? 11 : 11,
                    color: "var(--color-secondary-text)",
                    marginBottom: 2,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    lineHeight: 1.25,
                  }}
                >
                  {metric.title}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "1.25rem" : "1.125rem",
                    color: "var(--color-primary-text)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                    wordBreak: "break-word",
                    lineHeight: 1.2,
                  }}
                >
                  {metric.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI cards — always stacked on mobile */}
      <div className="summary-kpi-section" style={{ padding: sectionPadBottom }}>
        <div
          className="summary-kpi-grid"
          style={{
            display: "grid",
            width: "100%",
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(3, minmax(0, 1fr))",
            gap: isMobile ? 10 : 12,
          }}
        >
          {kpiData.map((kpi, i) => (
            <div
              key={i}
              className="summary-kpi-card"
              style={{
                background: colors.tertiary_bg,
                borderRadius: cardRadius,
                padding: isMobile ? "14px 16px" : "16px",
                border: "1px solid var(--color-border-color)",
                transition: preferReducedMotion
                  ? "none"
                  : "border-color 0.2s ease, box-shadow 0.2s ease",
                position: "relative",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: -8,
                  right: -4,
                  opacity: 0.08,
                  pointerEvents: "none",
                }}
              >
                {getAccentFunctionalIcon(kpi.iconKey, colors.primary_accent, {
                  sx: { fontSize: isMobile ? 56 : 48 },
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: isMobile ? 10 : 8,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {getAccentFunctionalIcon(kpi.iconKey, colors.primary_accent, {
                  sx: { fontSize: isMobile ? 22 : 20 },
                })}
                <div
                  style={{
                    fontSize: isMobile ? 13 : 12,
                    color: "var(--color-secondary-text)",
                    fontWeight: 600,
                  }}
                >
                  {kpi.title}
                </div>
              </div>
              <div
                style={{
                  fontSize: isMobile ? "1.75rem" : "1.5rem",
                  color: "var(--color-primary-text)",
                  fontWeight: 700,
                  marginBottom: 4,
                  letterSpacing: "-0.03em",
                  fontVariantNumeric: "tabular-nums",
                  wordBreak: "break-word",
                  lineHeight: 1.15,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {kpi.value}
              </div>
              <div
                style={{
                  fontSize: isMobile ? 12 : 11,
                  color: "var(--color-secondary-text)",
                  opacity: 0.85,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {kpi.subtitle}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Expenses — individual rows */}
      <div
        className="summary-top-expenses-section"
        style={{ padding: isMobile ? "0 12px 12px" : "0 24px 24px" }}
      >
        <div
          className="summary-top-expenses"
          style={{
            background: colors.tertiary_bg,
            borderRadius: cardRadius,
            border: "1px solid var(--color-border-color)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: isMobile ? "12px 14px" : "16px",
              borderBottom: `1px solid ${colors.border_color}`,
              background: `linear-gradient(135deg, ${colors.primary_accent}08 0%, transparent 100%)`,
            }}
          >
            <div
              style={{
                fontSize: isMobile ? 13 : 14,
                color: "var(--color-primary-text)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <TrendingUpIcon
                sx={{ fontSize: isMobile ? 18 : 20, color: "var(--color-primary-accent)" }}
              />
              {t("dashboard.overview.topExpenses")}
            </div>
          </div>
          {s.topExpenses.length > 0 ? (
            <div
              className="summary-top-expenses-list"
              style={{
                padding: isMobile ? 10 : 12,
                display: "grid",
                // Mobile: single column. Tablet/desktop: 2-up to fill wide overview.
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
                gap: isMobile ? 8 : 10,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {s.topExpenses.map((e, i) => (
                <div
                  key={i}
                  className="summary-top-expense-item"
                  style={{
                    padding: isMobile ? "12px 12px" : "12px 14px",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    minHeight: 52,
                    background: colors.secondary_bg || "transparent",
                    border: "1px solid var(--color-border-color)",
                    boxSizing: "border-box",
                    width: "100%",
                    minWidth: 0,
                    transition: preferReducedMotion
                      ? "none"
                      : "border-color 180ms ease, background-color 180ms ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `${colors.primary_accent}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--color-primary-accent)",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: isMobile ? 14 : 13,
                          color: "var(--color-primary-text)",
                          fontWeight: 600,
                          marginBottom: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={e.name}
                      >
                        {e.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-secondary-text)",
                        }}
                      >
                        {new Date(e.date).toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 15 : 14,
                      color: "var(--color-primary-text)",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                    }}
                  >
                    {currencySymbol}
                    {formatNumber0(e.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: isMobile ? 24 : 32,
                textAlign: "center",
                color: "var(--color-secondary-text)",
              }}
            >
              {getAccentFunctionalIcon("chart", colors.primary_accent, {
                sx: { fontSize: 32, mb: 1 },
              })}
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {t("dashboard.overview.noExpensesData")}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes summaryPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .summary-overview.is-mobile {
            padding: 0 !important;
          }
          .summary-overview.is-mobile .summary-metric-card,
          .summary-overview.is-mobile .summary-kpi-card,
          .summary-overview.is-mobile .summary-top-expense-item {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
        `}
      </style>
    </div>
  );
};

SummaryOverview.propTypes = {
  summary: PropTypes.object,
  loading: PropTypes.bool,
};

export default SummaryOverview;
