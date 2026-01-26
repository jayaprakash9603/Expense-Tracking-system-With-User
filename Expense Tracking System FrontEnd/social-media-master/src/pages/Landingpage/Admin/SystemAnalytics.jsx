import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  CircularProgress,
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
import {
  fetchDashboardAnalytics,
  fetchTopCategories,
  fetchRecentActivity,
  fetchTopUsers,
} from "../../../Redux/Admin/admin.action";

/**
 * System Analytics Component
 * Displays comprehensive system metrics, user statistics, and activity trends
 */
const SystemAnalytics = () => {
  const dispatch = useDispatch();

  // Safely access admin state with fallbacks
  const adminState = useSelector((state) => state.admin) || {};
  const analytics = adminState.analytics || {
    overview: null,
    topCategories: [],
    recentActivity: [],
    topUsers: [],
    loading: false,
    error: null,
  };
  const loading = analytics.loading || false;
  const error = analytics.error || null;

  const [timeRange, setTimeRange] = useState("7d");

  // Fetch analytics data when component mounts or time range changes
  useEffect(() => {
    dispatch(fetchDashboardAnalytics(timeRange));
  }, [dispatch, timeRange]);

  // Derive stats from Redux state with fallbacks
  const stats = {
    totalUsers: analytics.overview?.totalUsers || 0,
    activeUsers: analytics.overview?.activeUsers || 0,
    totalExpenses: analytics.overview?.totalExpenses || 0,
    totalRevenue: analytics.overview?.totalRevenue || 0,
    avgExpensePerUser: analytics.overview?.avgExpensePerUser || 0,
    newUsersThisMonth: analytics.overview?.newUsersThisMonth || 0,
    userGrowth: analytics.overview?.userGrowthPercentage || 0,
    expenseGrowth: analytics.overview?.expenseGrowthPercentage || 0,
    revenueGrowth: analytics.overview?.revenueGrowthPercentage || 0,
    activeGrowth: analytics.overview?.activeGrowthPercentage || 0,
  };

  // Top categories from Redux with fallbacks
  const topCategories = (analytics.topCategories || []).map((cat, index) => ({
    name: cat.name,
    count: cat.count,
    percentage: cat.percentage || cat.growthPercentage,
    color: ["#4caf50", "#2196f3", "#ff9800", "#e91e63", "#9c27b0"][index % 5],
  }));

  // Recent activity from Redux with fallbacks
  const recentActivity = (analytics.recentActivity || []).map((activity) => ({
    type: activity.title || activity.type,
    count: activity.count,
    time: activity.timeLabel || "Last hour",
    icon: getActivityIcon(activity.type || activity.icon),
  }));

  // Top users from Redux with fallbacks
  const topUsers = (analytics.topUsers || []).map((user) => ({
    name: user.name,
    expenses: user.expenseCount,
    amount: user.totalAmount,
    rank: user.rank,
  }));

  function getActivityIcon(type) {
    const icons = {
      USER_REGISTRATION: "👤",
      EXPENSE_CREATED: "💰",
      BUDGET_CREATED: "📊",
      CATEGORY_ADDED: "📁",
      person: "👤",
      receipt: "💰",
      savings: "📊",
      folder: "📁",
    };
    return icons[type] || "📋";
  }

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

      {/* Loading State */}
      {loading.analytics && (
        <div className="flex justify-center p-8">
          <CircularProgress />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-red-500 p-4 text-center mb-4">
          Error loading analytics: {error}
        </div>
      )}

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
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
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
                  <div
                    className="text-xl font-bold"
                    style={{ color: "#14b8a6" }}
                  >
                    {activity.count}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center opacity-70 py-4">No recent activity</p>
            )}
          </div>
        </SectionCard>

        {/* Top Categories Section */}
        <SectionCard title="Top Categories">
          <div className="space-y-4">
            {topCategories.length > 0 ? (
              topCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm opacity-70">
                      {formatNumber(category.count)} (
                      {formatPercentage(category.percentage || 0, 1)})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-gray-700">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(category.percentage || 0, 100)}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center opacity-70 py-4">
                No category data available
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Top Users Table */}
      <SectionCard title="Top Active Users">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  User Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Expenses
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {topUsers.length > 0 ? (
                topUsers.map((user, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="px-4 py-3 opacity-70">
                      {user.rank || `#${index + 1}`}
                    </td>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 opacity-70">
                      {formatNumber(user.expenses || 0)}
                    </td>
                    <td
                      className="px-4 py-3 font-semibold"
                      style={{ color: "#14b8a6" }}
                    >
                      {formatCurrency(user.amount || 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center opacity-70">
                    No user data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AdminPanelContainer>
  );
};

export default SystemAnalytics;
