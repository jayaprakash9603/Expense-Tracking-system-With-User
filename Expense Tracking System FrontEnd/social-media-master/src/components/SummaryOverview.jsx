import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../hooks/useTheme";
import useUserSettings from "../hooks/useUserSettings";
import { useTranslation } from "../hooks/useTranslation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useMediaQuery } from "@mui/material";

const formatNumber0 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

/**
 * SummaryOverview
 * Modern, UI/UX optimized application metrics card with enhanced visual design
 * Now uses only dynamic data from backend - no fallback static data
 */
const SummaryOverview = ({ summary, loading = false }) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const currencySymbol = settings.getCurrency().symbol;
  const isMobile = useMediaQuery("(max-width:600px)");

  // Return null if no data and not loading
  if (!summary && !loading) {
    return null;
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
      icon: "💸",
      title: t("dashboard.overview.totalExpenses"),
      value: `${currencySymbol}${formatNumber0(s.totalExpenses)}`,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: "🏦",
      title: t("dashboard.overview.creditDue"),
      value: `${currencySymbol}${formatNumber0(Math.abs(s.creditDue))}`,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: "📊",
      title: t("dashboard.overview.activeBudgets"),
      value: s.budgetsActive,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: "👥",
      title: t("dashboard.overview.friends"),
      value: s.friendsCount,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      icon: "🧑‍🤝‍🧑",
      title: t("dashboard.overview.groups"),
      value: s.groupsCount,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
  ];

  const kpiData = [
    {
      icon: "📈",
      title: t("dashboard.overview.avgDailySpend"),
      value: `${currencySymbol}${formatNumber0(s.averageDaily)}`,
      subtitle: t("dashboard.overview.last30Days"),
      color: "#667eea",
    },
    {
      icon: "💰",
      title: t("dashboard.overview.savingsRate"),
      value: `${formatPercent1(s.savingsRate)}%`,
      subtitle: t("dashboard.overview.ofIncome"),
      color: "#43e97b",
    },
    {
      icon: "📅",
      title: t("dashboard.overview.upcomingBills"),
      value: `${currencySymbol}${formatNumber0(s.upcomingBills)}`,
      subtitle: t("dashboard.overview.dueThisPeriod"),
      color: "#f5576c",
    },
  ];

  return (
    <div
      className="chart-container summary-overview"
      style={{
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Header Section */}
      <div
        className="chart-header"
        style={{
          background: `linear-gradient(135deg, ${colors.primary_accent}15 0%, ${colors.primary_accent}05 100%)`,
          padding: "14px 24px",
          borderBottom: `1px solid ${colors.border_color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              fontSize: "24px",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            }}
          >
            🔎
          </div>
          <h3
            style={{
              color: colors.primary_text,
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              letterSpacing: "-0.5px",
            }}
          >
            {t("dashboard.overview.title")}
          </h3>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "20px",
            background: `linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)`,
            boxShadow: "0 2px 8px rgba(67, 233, 123, 0.3)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              animation: "pulse 2s infinite",
            }}
          />
          <span
            style={{
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.3px",
            }}
          >
            {t("dashboard.overview.liveSummary")}
          </span>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div style={{ padding: "20px 24px 16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
            gap: "12px",
          }}
        >
          {metricsData.map((metric, i) => (
            <div
              key={i}
              style={{
                background: colors.tertiary_bg,
                borderRadius: "12px",
                padding: "16px 12px",
                border: `1px solid ${colors.border_color}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(0, 0, 0, 0.12)";
                e.currentTarget.style.borderColor = colors.primary_accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = colors.border_color;
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "60px",
                  height: "60px",
                  background: metric.gradient,
                  opacity: 0.08,
                  borderRadius: "50%",
                  transform: "translate(30%, -30%)",
                }}
              />
              <div
                style={{
                  fontSize: "24px",
                  marginBottom: "8px",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                }}
              >
                {metric.icon}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: colors.secondary_text,
                  marginBottom: "4px",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {metric.title}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: colors.primary_text,
                  fontWeight: "700",
                  letterSpacing: "-0.5px",
                }}
              >
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ padding: "0 24px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {kpiData.map((kpi, i) => (
            <div
              key={i}
              style={{
                background: colors.tertiary_bg,
                borderRadius: "12px",
                padding: "16px",
                border: `1px solid ${colors.border_color}`,
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = kpi.color;
                e.currentTarget.style.boxShadow = `0 4px 16px ${kpi.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border_color;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  fontSize: "48px",
                  opacity: 0.1,
                }}
              >
                {kpi.icon}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "20px" }}>{kpi.icon}</span>
                <div
                  style={{
                    fontSize: "12px",
                    color: colors.secondary_text,
                    fontWeight: "500",
                  }}
                >
                  {kpi.title}
                </div>
              </div>
              <div
                style={{
                  fontSize: "24px",
                  color: colors.primary_text,
                  fontWeight: "700",
                  marginBottom: "4px",
                  letterSpacing: "-0.5px",
                }}
              >
                {kpi.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: colors.secondary_text,
                  opacity: 0.8,
                }}
              >
                {kpi.subtitle}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Expenses Section */}
      <div style={{ padding: "0 24px 24px" }}>
        <div
          style={{
            background: colors.tertiary_bg,
            borderRadius: "12px",
            border: `1px solid ${colors.border_color}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: `1px solid ${colors.border_color}`,
              background: `linear-gradient(135deg, ${colors.primary_accent}08 0%, transparent 100%)`,
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: colors.primary_text,
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🔝</span>
              {t("dashboard.overview.topExpenses")}
            </div>
          </div>
          {s.topExpenses.length > 0 ? (
            <div
              style={{
                padding: "8px",
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                gap: "8px",
              }}
            >
              {s.topExpenses.map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    background: "transparent",
                    border: `1px solid ${colors.border_color}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${colors.primary_accent}10`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: `linear-gradient(135deg, ${colors.primary_accent}20 0%, ${colors.primary_accent}10 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "700",
                        color: colors.primary_accent,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: colors.primary_text,
                          fontWeight: "600",
                          marginBottom: "2px",
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
                          fontSize: "10px",
                          color: colors.secondary_text,
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
                      fontSize: "14px",
                      color: colors.primary_text,
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      marginLeft: "8px",
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
                padding: "32px",
                textAlign: "center",
                color: colors.secondary_text,
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>
                {t("dashboard.overview.noExpensesData")}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
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
