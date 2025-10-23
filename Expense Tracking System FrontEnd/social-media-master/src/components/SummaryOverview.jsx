import React from "react";
import PropTypes from "prop-types";
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
 * Consolidated application metrics card with mini area sparkline + top expenses list.
 * Accepts a summary object; falls back to defaults for missing values.
 */
const SummaryOverview = ({ summary }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const s = {
    totalExpenses: summary?.totalExpenses ?? 30557,
    creditDue: summary?.creditDue ?? -4709,
    budgetsActive: summary?.budgetsActive ?? 4,
    friendsCount: summary?.friendsCount ?? 12,
    groupsCount: summary?.groupsCount ?? 3,
    monthlySpending: summary?.monthlySpending ?? [
      8000, 0, 469, 1200, 900, 1500, 2000, 1800,
    ],
    averageDaily: summary?.averageDaily ?? 1425,
    savingsRate: summary?.savingsRate ?? 18.6,
    upcomingBills: summary?.upcomingBills ?? 2,
    topCategories: summary?.topCategories ?? [
      { name: "Investment", value: 13000 },
      { name: "Pg Rent", value: 7000 },
      { name: "Mother Expenses", value: 8000 },
    ],
    topExpenses: summary?.topExpenses ?? [
      { name: "Grocery - Big Bazaar", amount: 4200, date: "2025-08-10" },
      { name: "Electricity Bill", amount: 2400, date: "2025-08-08" },
      { name: "Rent - PG", amount: 7000, date: "2025-08-01" },
      { name: "Investment - SIP", amount: 13000, date: "2025-08-03" },
    ],
    savingsGoals: summary?.savingsGoals ?? [
      { name: "Emergency Fund", current: 12000, target: 50000 },
      { name: "Vacation", current: 8000, target: 15000 },
    ],
    recommendations: summary?.recommendations ?? [
      { id: 1, text: "Reduce dining out to save ~₹1500/month" },
      { id: 2, text: "Move ₹2000 to high-yield savings" },
    ],
  };

  const chartData = s.monthlySpending.map((val, i) => ({
    month: `M${i + 1}`,
    value: val,
  }));

  return (
    <div className="chart-container summary-overview">
      <div className="chart-header">
        <h3>🔎 Application Overview</h3>
        <div className="total-amount">Live Summary</div>
      </div>
      <div className="overview-content">
        <div className="overview-metrics">
          {[
            ["💸", "Total Expenses", `₹${formatNumber0(s.totalExpenses)}`],
            ["🏦", "Credit Due", `₹${formatNumber0(Math.abs(s.creditDue))}`],
            ["📊", "Active Budgets", s.budgetsActive],
            ["👥", "Friends", s.friendsCount],
            ["🧑‍🤝‍🧑", "Groups", s.groupsCount],
          ].map(([icon, title, val], i) => (
            <div className="overview-metric" key={i}>
              <div className="metric-icon">{icon}</div>
              <div className="metric-body">
                <div className="metric-title">{title}</div>
                <div className="metric-value">{val}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="overview-chart">
          <ResponsiveContainer width="100%" height={isMobile ? 90 : 120}>
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1b1b1b",
                  border: "1px solid #14b8a6",
                  borderRadius: 8,
                  color: "#fff",
                }}
                formatter={(value) => [`₹${formatNumber0(value)}`, "Spending"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#14b8a6"
                fillOpacity={1}
                fill="url(#ovGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="overview-extra">
        <div className="kpi-row">
          {[
            [
              "Avg Daily Spend",
              `₹${formatNumber0(s.averageDaily)}`,
              "Last 30 days",
            ],
            ["Savings Rate", `${s.savingsRate}%`, "of income"],
            ["Upcoming Bills", s.upcomingBills, "due this week"],
          ].map(([title, val, sub], i) => (
            <div className="kpi-card" key={i}>
              <div className="kpi-title">{title}</div>
              <div className="kpi-value">{val}</div>
              <div className="kpi-sub">{sub}</div>
            </div>
          ))}
        </div>
        <div className="overview-bottom">
          <div className="top-expenses full-width">
            <div className="small-header">Top Expenses</div>
            <ul>
              {s.topExpenses.map((e, i) => (
                <li key={i} className="top-expense-item">
                  <div className="expense-left">
                    <div className="cat-name" title={e.name}>
                      {e.name}
                    </div>
                    <div className="cat-sub">
                      {new Date(e.date).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="expense-right">
                    <span className="cat-value">
                      ₹{formatNumber0(e.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

SummaryOverview.propTypes = {
  summary: PropTypes.object,
};

export default SummaryOverview;
