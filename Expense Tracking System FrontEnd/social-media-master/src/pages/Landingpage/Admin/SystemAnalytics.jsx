import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { getThemeColors } from "../../../config/themeConfig";

const SystemAnalytics = () => {
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);
  const [timeRange, setTimeRange] = useState("7d");

  // Static analytics data
  const stats = {
    totalUsers: 12847,
    activeUsers: 9234,
    totalExpenses: 45623,
    totalRevenue: 234567,
    avgExpensePerUser: 3.55,
    newUsersThisMonth: 342,
    userGrowth: 12.5,
    expenseGrowth: -3.2,
    revenueGrowth: 8.7,
    activeGrowth: 15.3,
  };

  const topCategories = [
    { name: "Food & Dining", count: 8234, percentage: 18.5, color: "#4caf50" },
    { name: "Transportation", count: 6453, percentage: 14.2, color: "#2196f3" },
    { name: "Shopping", count: 5876, percentage: 12.9, color: "#ff9800" },
    { name: "Bills & Utilities", count: 4321, percentage: 9.5, color: "#e91e63" },
    { name: "Entertainment", count: 3987, percentage: 8.7, color: "#9c27b0" },
  ];

  const recentActivity = [
    {
      type: "User Registration",
      count: 23,
      time: "Last hour",
      icon: "👤",
    },
    {
      type: "Expenses Created",
      count: 156,
      time: "Last hour",
      icon: "💰",
    },
    {
      type: "Budgets Created",
      count: 12,
      time: "Last hour",
      icon: "📊",
    },
    {
      type: "Categories Added",
      count: 8,
      time: "Last hour",
      icon: "📁",
    },
  ];

  const topUsers = [
    { name: "John Doe", expenses: 234, amount: 12450.50 },
    { name: "Jane Smith", expenses: 189, amount: 10230.75 },
    { name: "Mike Johnson", expenses: 156, amount: 8970.25 },
    { name: "Sarah Williams", expenses: 142, amount: 7650.00 },
    { name: "David Brown", expenses: 128, amount: 6890.50 },
  ];

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: themeColors.primary_bg,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: themeColors.primary_text }}
          >
            System Analytics
          </h1>
          <p style={{ color: themeColors.secondary_text }}>
            Monitor system performance and user activity
          </p>
        </div>
        <FormControl size="small" style={{ minWidth: 150 }}>
          <InputLabel style={{ color: themeColors.secondary_text }}>
            Time Range
          </InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
            style={{
              color: themeColors.primary_text,
              backgroundColor: themeColors.card_bg,
            }}
          >
            <MuiMenuItem value="7d">Last 7 Days</MuiMenuItem>
            <MuiMenuItem value="30d">Last 30 Days</MuiMenuItem>
            <MuiMenuItem value="90d">Last 90 Days</MuiMenuItem>
            <MuiMenuItem value="1y">Last Year</MuiMenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <div className="flex justify-between items-start mb-2">
            <p
              className="text-sm"
              style={{ color: themeColors.secondary_text }}
            >
              Total Users
            </p>
            <div
              className="flex items-center gap-1 text-sm"
              style={{ color: "#4caf50" }}
            >
              <TrendingUpIcon fontSize="small" />
              <span>+{stats.userGrowth}%</span>
            </div>
          </div>
          <p
            className="text-3xl font-bold"
            style={{ color: themeColors.primary_text }}
          >
            {stats.totalUsers.toLocaleString()}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: themeColors.secondary_text }}
          >
            +{stats.newUsersThisMonth} this month
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <div className="flex justify-between items-start mb-2">
            <p
              className="text-sm"
              style={{ color: themeColors.secondary_text }}
            >
              Active Users
            </p>
            <div
              className="flex items-center gap-1 text-sm"
              style={{ color: "#4caf50" }}
            >
              <TrendingUpIcon fontSize="small" />
              <span>+{stats.activeGrowth}%</span>
            </div>
          </div>
          <p
            className="text-3xl font-bold"
            style={{ color: themeColors.primary_text }}
          >
            {stats.activeUsers.toLocaleString()}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: themeColors.secondary_text }}
          >
            Last 30 days
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <div className="flex justify-between items-start mb-2">
            <p
              className="text-sm"
              style={{ color: themeColors.secondary_text }}
            >
              Total Expenses
            </p>
            <div
              className="flex items-center gap-1 text-sm"
              style={{ color: "#f44336" }}
            >
              <TrendingDownIcon fontSize="small" />
              <span>{stats.expenseGrowth}%</span>
            </div>
          </div>
          <p
            className="text-3xl font-bold"
            style={{ color: themeColors.primary_text }}
          >
            {stats.totalExpenses.toLocaleString()}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: themeColors.secondary_text }}
          >
            Avg {stats.avgExpensePerUser}/user
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <div className="flex justify-between items-start mb-2">
            <p
              className="text-sm"
              style={{ color: themeColors.secondary_text }}
            >
              Total Revenue
            </p>
            <div
              className="flex items-center gap-1 text-sm"
              style={{ color: "#4caf50" }}
            >
              <TrendingUpIcon fontSize="small" />
              <span>+{stats.revenueGrowth}%</span>
            </div>
          </div>
          <p
            className="text-3xl font-bold"
            style={{ color: themeColors.primary_text }}
          >
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: themeColors.secondary_text }}
          >
            This month
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Categories */}
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: themeColors.primary_text }}
          >
            Top Categories
          </h3>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <p
                    className="text-sm font-medium"
                    style={{ color: themeColors.primary_text }}
                  >
                    {category.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: themeColors.secondary_text }}
                  >
                    {category.count.toLocaleString()} ({category.percentage}%)
                  </p>
                </div>
                <div
                  className="w-full h-2 rounded-full"
                  style={{ backgroundColor: themeColors.primary_bg }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${category.percentage * 5}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: themeColors.card_bg }}
        >
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: themeColors.primary_text }}
          >
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded"
                style={{ backgroundColor: themeColors.primary_bg }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: themeColors.primary_text }}
                    >
                      {activity.type}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: themeColors.secondary_text }}
                    >
                      {activity.time}
                    </p>
                  </div>
                </div>
                <p
                  className="text-xl font-bold"
                  style={{ color: "#14b8a6" }}
                >
                  {activity.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: themeColors.card_bg }}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: themeColors.primary_text }}
        >
          Top Users by Activity
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${themeColors.border}` }}>
                <th
                  className="px-4 py-2 text-left text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  Rank
                </th>
                <th
                  className="px-4 py-2 text-left text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  User
                </th>
                <th
                  className="px-4 py-2 text-right text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  Expenses
                </th>
                <th
                  className="px-4 py-2 text-right text-sm font-semibold"
                  style={{ color: themeColors.primary_text }}
                >
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, index) => (
                <tr
                  key={index}
                  style={{ borderBottom: `1px solid ${themeColors.border}` }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color:
                          index === 0
                            ? "#ffd700"
                            : index === 1
                            ? "#c0c0c0"
                            : index === 2
                            ? "#cd7f32"
                            : themeColors.secondary_text,
                      }}
                    >
                      #{index + 1}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: themeColors.primary_text }}
                  >
                    {user.name}
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    style={{ color: themeColors.secondary_text }}
                  >
                    {user.expenses}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-semibold"
                    style={{ color: "#14b8a6" }}
                  >
                    ${user.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;
