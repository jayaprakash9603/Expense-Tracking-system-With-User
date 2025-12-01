import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import {
  AdminPanelContainer,
  AdminPageHeader,
  StatCard,
  SectionCard,
} from "./components";
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
} from "./utils/adminUtils";

/**
 * System Analytics Component
 * Displays comprehensive system metrics, user statistics, and activity trends
 */
const SystemAnalytics = () => {
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

  // Time range selector component
  const TimeRangeSelector = () => (
    <FormControl size="small" style={{ minWidth: 150 }}>
      <InputLabel>Time Range</InputLabel>
      <Select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        label="Time Range"
      >
        <MuiMenuItem value="7d">Last 7 Days</MuiMenuItem>
        <MuiMenuItem value="30d">Last 30 Days</MuiMenuItem>
        <MuiMenuItem value="90d">Last 90 Days</MuiMenuItem>
        <MuiMenuItem value="1y">Last Year</MuiMenuItem>
      </Select>
    </FormControl>
  );

  return (
    <AdminPanelContainer>
      {/* Page Header */}
      <AdminPageHeader
        title="System Analytics"
        description="Monitor system performance and user activity"
        actions={<TimeRangeSelector />}
      />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={formatNumber(stats.totalUsers)}
          growth={formatPercentage(stats.userGrowth)}
        />
        <StatCard
          label="Active Users"
          value={formatNumber(stats.activeUsers)}
          growth={formatPercentage(stats.activeGrowth)}
        />
        <StatCard
          label="Total Expenses"
          value={formatNumber(stats.totalExpenses)}
          growth={formatPercentage(stats.expenseGrowth)}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          growth={formatPercentage(stats.revenueGrowth)}
        />
      </div>

      {/* Activity & Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity Section */}
        <SectionCard title="Recent Activity">
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded"
                style={{ backgroundColor: "rgba(20, 184, 166, 0.1)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm opacity-70">{activity.time}</p>
                  </div>
                </div>
                <div className="text-xl font-bold" style={{ color: "#14b8a6" }}>
                  {activity.count}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Top Categories Section */}
        <SectionCard title="Top Categories">
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm opacity-70">
                    {formatNumber(category.count)} ({formatPercentage(category.percentage, 1)})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-gray-700">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Top Users Table */}
      <SectionCard title="Top Active Users">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">User Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Expenses</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="px-4 py-3 opacity-70">#{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 opacity-70">{formatNumber(user.expenses)}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "#14b8a6" }}>
                    {formatCurrency(user.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AdminPanelContainer>
  );
};

export default SystemAnalytics;
