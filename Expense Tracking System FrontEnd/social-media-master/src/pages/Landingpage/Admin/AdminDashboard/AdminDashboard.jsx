import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 12847,
      activeUsers: 9234,
      totalExpenses: 45623,
      totalRevenue: 234567,
      userGrowth: 12.5,
      expenseGrowth: -3.2,
      revenueGrowth: 8.7,
    },
    users: [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "/api/placeholder/40/40",
        status: "active",
        role: "user",
        joinDate: "2024-01-15",
        lastActive: "2 hours ago",
        totalExpenses: 1250.5,
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        avatar: "/api/placeholder/40/40",
        status: "active",
        role: "moderator",
        joinDate: "2024-01-10",
        lastActive: "1 day ago",
        totalExpenses: 2340.75,
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        avatar: "/api/placeholder/40/40",
        status: "suspended",
        role: "user",
        joinDate: "2024-01-05",
        lastActive: "1 week ago",
        totalExpenses: 890.25,
      },
    ],
    auditLogs: [
      {
        id: 1,
        type: "info",
        title: "User Registration",
        description: "New user john.doe@example.com registered successfully",
        timestamp: "2024-01-20 14:30:00",
        severity: "info",
        user: "System",
      },
      {
        id: 2,
        type: "warning",
        title: "Failed Login Attempt",
        description:
          "Multiple failed login attempts detected for user jane.smith@example.com",
        timestamp: "2024-01-20 13:45:00",
        severity: "warning",
        user: "Security System",
      },
      {
        id: 3,
        type: "error",
        title: "Database Connection Error",
        description:
          "Temporary database connection issue resolved automatically",
        timestamp: "2024-01-20 12:15:00",
        severity: "error",
        user: "System Monitor",
      },
    ],
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "User Management", icon: "👥" },
    { id: "roles", label: "Roles & Permissions", icon: "🔐" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "security", label: "Security & Audit", icon: "🛡️" },
    { id: "settings", label: "System Settings", icon: "⚙️" },
  ];

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on users:`, selectedUsers);
    setSelectedUsers([]);
  };

  const filteredUsers = dashboardData.users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOverviewTab = () => (
    <div className="expense-tab-content">
      <div className="expense-overview-grid">
        <div className="expense-overview-card">
          <div className="expense-overview-header">
            <div className="expense-overview-icon">👥</div>
            <div className="expense-overview-trend up">
              <span>↗</span>+{dashboardData.overview.userGrowth}%
            </div>
          </div>
          <div className="expense-overview-content">
            <h3>Total Users</h3>
            <div className="expense-overview-value">
              {dashboardData.overview.totalUsers.toLocaleString()}
            </div>
            <p className="expense-overview-description">
              Active users across all platforms
            </p>
          </div>
        </div>

        <div className="expense-overview-card">
          <div className="expense-overview-header">
            <div className="expense-overview-icon">💰</div>
            <div className="expense-overview-trend up">
              <span>↗</span>+{dashboardData.overview.revenueGrowth}%
            </div>
          </div>
          <div className="expense-overview-content">
            <h3>Total Revenue</h3>
            <div className="expense-overview-value">
              ${dashboardData.overview.totalRevenue.toLocaleString()}
            </div>
            <p className="expense-overview-description">
              Revenue generated this month
            </p>
          </div>
        </div>

        <div className="expense-overview-card">
          <div className="expense-overview-header">
            <div className="expense-overview-icon">📋</div>
            <div className="expense-overview-trend down">
              <span>↘</span>
              {dashboardData.overview.expenseGrowth}%
            </div>
          </div>
          <div className="expense-overview-content">
            <h3>Total Expenses</h3>
            <div className="expense-overview-value">
              {dashboardData.overview.totalExpenses.toLocaleString()}
            </div>
            <p className="expense-overview-description">
              Expenses tracked this month
            </p>
          </div>
        </div>

        <div className="expense-overview-card">
          <div className="expense-overview-header">
            <div className="expense-overview-icon">✅</div>
            <div className="expense-overview-trend up">
              <span>↗</span>+{dashboardData.overview.userGrowth}%
            </div>
          </div>
          <div className="expense-overview-content">
            <h3>Active Users</h3>
            <div className="expense-overview-value">
              {dashboardData.overview.activeUsers.toLocaleString()}
            </div>
            <p className="expense-overview-description">
              Users active in the last 30 days
            </p>
          </div>
        </div>
      </div>

      <div className="expense-system-analytics">
        <div className="expense-section-header">
          <div className="expense-section-title">
            <span className="expense-section-icon">📈</span>
            <h2>System Analytics</h2>
          </div>
          <div className="expense-section-actions">
            <button className="expense-btn secondary">
              <span>📊</span>
              Export Report
            </button>
          </div>
        </div>

        <div className="expense-analytics-grid">
          <div className="expense-chart-container">
            <div className="expense-chart-header">
              <h3 className="expense-chart-title">User Activity</h3>
              <div className="expense-time-selector">
                {["7d", "30d", "90d", "1y"].map((period) => (
                  <button
                    key={period}
                    className={`expense-time-option ${
                      timeRange === period ? "active" : ""
                    }`}
                    onClick={() => setTimeRange(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="expense-chart-placeholder">
              Chart will be rendered here
            </div>
          </div>

          <div className="expense-quick-stats">
            <div className="expense-quick-stat revenue">
              <div className="expense-quick-stat-header">
                <div className="expense-quick-stat-icon">💰</div>
                <div className="expense-quick-stat-trend up">
                  <span>↗</span>
                  +12%
                </div>
              </div>
              <div className="expense-quick-stat-value">$24.5K</div>
              <div className="expense-quick-stat-label">Monthly Revenue</div>
            </div>

            <div className="expense-quick-stat expenses">
              <div className="expense-quick-stat-header">
                <div className="expense-quick-stat-icon">📊</div>
                <div className="expense-quick-stat-trend down">
                  <span>↘</span>
                  -3%
                </div>
              </div>
              <div className="expense-quick-stat-value">1,247</div>
              <div className="expense-quick-stat-label">Total Expenses</div>
            </div>

            <div className="expense-quick-stat users">
              <div className="expense-quick-stat-header">
                <div className="expense-quick-stat-icon">👥</div>
                <div className="expense-quick-stat-trend up">
                  <span>↗</span>
                  +8%
                </div>
              </div>
              <div className="expense-quick-stat-value">892</div>
              <div className="expense-quick-stat-label">Active Users</div>
            </div>

            <div className="expense-quick-stat growth">
              <div className="expense-quick-stat-header">
                <div className="expense-quick-stat-icon">📈</div>
                <div className="expense-quick-stat-trend up">
                  <span>↗</span>
                  +15%
                </div>
              </div>
              <div className="expense-quick-stat-value">23%</div>
              <div className="expense-quick-stat-label">Growth Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="expense-tab-content">
      <div className="expense-user-management">
        <div className="expense-user-management-header">
          <div className="expense-section-header">
            <div className="expense-section-title">
              <span className="expense-section-icon">👥</span>
              <h2>User Management</h2>
            </div>
            <div className="expense-section-actions">
              <select className="expense-filter-select">
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <button className="expense-btn primary">
                <span>➕</span>
                Add User
              </button>
            </div>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="expense-bulk-actions">
            <div className="expense-bulk-info">
              {selectedUsers.length} user(s) selected
            </div>
            <div className="expense-bulk-buttons">
              <button
                className="expense-btn warning small"
                onClick={() => handleBulkAction("suspend")}
              >
                Suspend
              </button>
              <button
                className="expense-btn danger small"
                onClick={() => handleBulkAction("delete")}
              >
                Delete
              </button>
              <button
                className="expense-btn secondary small"
                onClick={() => setSelectedUsers([])}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="expense-user-table">
          <div className="expense-table-header">
            <div className="expense-table-cell">
              <input
                type="checkbox"
                checked={selectedUsers.length === filteredUsers.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers(filteredUsers.map((user) => user.id));
                  } else {
                    setSelectedUsers([]);
                  }
                }}
              />
            </div>
            <div className="expense-table-cell">User</div>
            <div className="expense-table-cell">Status</div>
            <div className="expense-table-cell">Role</div>
            <div className="expense-table-cell">Expenses</div>
            <div className="expense-table-cell">Last Active</div>
            <div className="expense-table-cell">Actions</div>
          </div>

          {filteredUsers.map((user) => (
            <div key={user.id} className="expense-table-row">
              <div className="expense-table-cell">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserSelect(user.id)}
                />
              </div>
              <div className="expense-table-cell">
                <div className="expense-user-info">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="expense-user-avatar"
                  />
                  <div className="expense-user-details">
                    <div className="expense-user-name">{user.name}</div>
                    <div className="expense-user-email">{user.email}</div>
                    <div className="expense-user-id">ID: {user.id}</div>
                  </div>
                </div>
              </div>
              <div className="expense-table-cell">
                <span className={`expense-status-badge ${user.status}`}>
                  {user.status}
                </span>
              </div>
              <div className="expense-table-cell">
                <span className={`expense-role-badge ${user.role}`}>
                  {user.role}
                </span>
              </div>
              <div className="expense-table-cell">
                ${user.totalExpenses.toFixed(2)}
              </div>
              <div className="expense-table-cell">{user.lastActive}</div>
              <div className="expense-table-cell">
                <div className="expense-action-buttons">
                  <button className="expense-icon-btn">
                    <span>✏️</span>
                  </button>
                  <button className="expense-icon-btn warning">
                    <span>⚠️</span>
                  </button>
                  <button className="expense-icon-btn danger">
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="expense-pagination">
          <button
            className="expense-pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ←
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`expense-pagination-btn ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="expense-pagination-btn"
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            →
          </button>
          <div className="expense-pagination-info">
            Showing 1-10 of 247 users
          </div>
        </div>
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="expense-tab-content">
      <div className="expense-role-management">
        <div className="expense-section-header">
          <div className="expense-section-title">
            <span className="expense-section-icon">🔐</span>
            <h2>Roles & Permissions</h2>
          </div>
          <div className="expense-section-actions">
            <button className="expense-btn primary">
              <span>➕</span>
              Create Role
            </button>
          </div>
        </div>

        <div className="expense-roles-grid">
          <div className="expense-role-card">
            <div className="expense-role-header">
              <div className="expense-role-icon">👑</div>
              <div className="expense-role-actions">
                <button className="expense-icon-btn">
                  <span>✏️</span>
                </button>
                <button className="expense-icon-btn danger">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
            <div className="expense-role-content">
              <h4>Administrator</h4>
              <p>
                Full system access with all permissions including user
                management and system configuration.
              </p>
              <div className="expense-role-stats">
                <div className="expense-role-stat">
                  <span className="expense-role-stat-value">3</span>
                  <span className="expense-role-stat-label">Users</span>
                </div>
                <div className="expense-role-stat">
                  <span className="expense-role-stat-value">25</span>
                  <span className="expense-role-stat-label">Permissions</span>
                </div>
              </div>
              <div className="expense-permissions-list">
                <span className="expense-permission-chip">User Management</span>
                <span className="expense-permission-chip">System Config</span>
                <span className="expense-permission-chip">Analytics</span>
                <span className="expense-permission-chip">Security</span>
              </div>
            </div>
          </div>

          <div className="expense-role-card">
            <div className="expense-role-header">
              <div className="expense-role-icon">🛡️</div>
              <div className="expense-role-actions">
                <button className="expense-icon-btn">
                  <span>✏️</span>
                </button>
                <button className="expense-icon-btn danger">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
            <div className="expense-role-content">
              <h4>Moderator</h4>
              <p>
                Limited administrative access with user management and content
                moderation capabilities.
              </p>
              <div className="expense-role-stats">
                <div className="expense-role-stat">
                  <span className="expense-role-stat-value">12</span>
                  <span className="expense-role-stat-label">Users</span>
                </div>
                <div className="expense-role-stat">
                  <span className="expense-role-stat-value">15</span>
                  <span className="expense-role-stat-label">Permissions</span>
                </div>
              </div>
              <div className="expense-permissions-list">
                <span className="expense-permission-chip">User Management</span>
                <span className="expense-permission-chip">
                  Content Moderation
                </span>
                <span className="expense-permission-chip">Reports</span>
              </div>
            </div>
          </div>

          <div className="expense-role-card">
            <div className="expense-role-header">
              <div className="expense-role-icon">👤</div>
              <div className="expense-role-actions">
                <button className="expense-icon-btn">
                  <span>✏️</span>
                </button>
                <button className="expense-icon-btn danger">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
            <div className="expense-role-content">
              <h4>User</h4>
              <p>
                Standard user access with expense tracking and basic reporting
                features.
              </p>
              <div className="expense-role-stats">
                <div className="expense-role-stat">
                  <span className="expense-role-stat-value">12,832</span>
                  <span className="expense-role-stat-label">Users</span>
                </div>
                <div className="expense-role-stat">
                  <span className="expense-role-stat-value">8</span>
                  <span className="expense-role-stat-label">Permissions</span>
                </div>
              </div>
              <div className="expense-permissions-list">
                <span className="expense-permission-chip">
                  Expense Tracking
                </span>
                <span className="expense-permission-chip">Reports</span>
                <span className="expense-permission-chip">Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="expense-tab-content">
      <div className="expense-system-analytics">
        <div className="expense-section-header">
          <div className="expense-section-title">
            <span className="expense-section-icon">📈</span>
            <h2>Advanced Analytics</h2>
          </div>
          <div className="expense-section-actions">
            <select className="expense-filter-select">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="expense-btn primary">
              <span>📊</span>
              Generate Report
            </button>
          </div>
        </div>

        <div className="expense-analytics-grid">
          <div className="expense-chart-container">
            <div className="expense-chart-header">
              <h3 className="expense-chart-title">Revenue Trends</h3>
              <div className="expense-time-selector">
                {["Daily", "Weekly", "Monthly"].map((period) => (
                  <button key={period} className="expense-time-option">
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="expense-chart-placeholder">
              Revenue chart will be rendered here
            </div>
          </div>

          <div className="expense-chart-container">
            <div className="expense-chart-header">
              <h3 className="expense-chart-title">User Growth</h3>
            </div>
            <div className="expense-chart-placeholder">
              User growth chart will be rendered here
            </div>
          </div>
        </div>

        <div className="expense-analytics-grid">
          <div className="expense-chart-container">
            <div className="expense-chart-header">
              <h3 className="expense-chart-title">Expense Categories</h3>
            </div>
            <div className="expense-chart-placeholder">
              Category breakdown chart will be rendered here
            </div>
          </div>

          <div className="expense-quick-stats">
            <div className="expense-quick-stat revenue">
              <div className="expense-quick-stat-header">
                <div className="expense-quick-stat-icon">💰</div>
                <div className="expense-quick-stat-trend up">
                  <span>↗</span>
                  +18%
                </div>
              </div>
              <div className="expense-quick-stat-value">$156.2K</div>
              <div className="expense-quick-stat-label">Total Revenue</div>
            </div>

            <div className="expense-quick-stat expenses">
              <div className="expense-quick-stat-header">
                <div className="expense-quick-stat-icon">📊</div>
                <div className="expense-quick-stat-trend up">
                  <span>↗</span>
                  +5%
                </div>
              </div>
              <div className="expense-quick-stat-value">8,247</div>
              <div className="expense-quick-stat-label">Total Transactions</div>
            </div>

            <div className="expense-quick-stat users">
              <div className="expense-quick-stat-header">
                <div className="expense-quick-stat-icon">👥</div>
                <div className="expense-quick-stat-trend up">
                  <span>↗</span>
                  +12%
                </div>
              </div>
              <div className="expense-quick-stat-value">2,847</div>
              <div className="expense-quick-stat-label">New Users</div>
            </div>

            <div className="expense-quick-stat growth">
              <div className="expense-quick-stat-header">
                <div className="expense-quick-stat-icon">📈</div>
                <div className="expense-quick-stat-trend up">
                  <span>↗</span>
                  +25%
                </div>
              </div>
              <div className="expense-quick-stat-value">94.2%</div>
              <div className="expense-quick-stat-label">User Retention</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="expense-tab-content">
      <div className="expense-security-audit">
        <div className="expense-section-header">
          <div className="expense-section-title">
            <span className="expense-section-icon">🛡️</span>
            <h2>Security & Audit</h2>
          </div>
          <div className="expense-section-actions">
            <button className="expense-btn secondary">
              <span>📥</span>
              Export Logs
            </button>
            <button className="expense-btn primary">
              <span>🔍</span>
              Security Scan
            </button>
          </div>
        </div>

        <div className="expense-security-metrics">
          <div className="expense-security-metric good">
            <div className="expense-metric-icon">🔒</div>
            <div className="expense-metric-content">
              <h4>System Security</h4>
              <span className="expense-metric-value">98.5%</span>
              <div className="expense-metric-description">Security score</div>
            </div>
          </div>

          <div className="expense-security-metric warning">
            <div className="expense-metric-icon">⚠️</div>
            <div className="expense-metric-content">
              <h4>Failed Logins</h4>
              <span className="expense-metric-value">23</span>
              <div className="expense-metric-description">Last 24 hours</div>
            </div>
          </div>

          <div className="expense-security-metric good">
            <div className="expense-metric-icon">🔐</div>
            <div className="expense-metric-content">
              <h4>Active Sessions</h4>
              <span className="expense-metric-value">1,247</span>
              <div className="expense-metric-description">Current users</div>
            </div>
          </div>

          <div className="expense-security-metric critical">
            <div className="expense-metric-icon">🚨</div>
            <div className="expense-metric-content">
              <h4>Security Alerts</h4>
              <span className="expense-metric-value">2</span>
              <div className="expense-metric-description">
                Requires attention
              </div>
            </div>
          </div>
        </div>

        <div className="expense-audit-logs">
          <h4>Recent Audit Logs</h4>
          <div className="expense-logs-list">
            {dashboardData.auditLogs.map((log) => (
              <div key={log.id} className={`expense-log-item ${log.type}`}>
                <div className="expense-log-icon">
                  {log.type === "info"
                    ? "📝"
                    : log.type === "warning"
                    ? "⚠️"
                    : "🚨"}
                </div>
                <div className="expense-log-content">
                  <div className="expense-log-title">{log.title}</div>
                  <div className="expense-log-description">
                    {log.description}
                  </div>
                  <div className="expense-log-meta">
                    <span>{log.timestamp}</span>
                    <span>•</span>
                    <span>{log.user}</span>
                  </div>
                </div>
                <div className={`expense-log-severity ${log.severity}`}>
                  {log.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="expense-tab-content">
      <div className="expense-empty-state">
        <div className="expense-empty-icon">⚙️</div>
        <h3 className="expense-empty-title">System Settings</h3>
        <p className="expense-empty-description">
          Configure system-wide settings, integrations, and preferences.
        </p>
        <button className="expense-btn primary">
          <span>⚙️</span>
          Open Settings
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="expense-loading-container">
          <div className="expense-spinner"></div>
          <div className="expense-loading-text">Loading dashboard data...</div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "users":
        return renderUsersTab();
      case "roles":
        return renderRolesTab();
      case "analytics":
        return renderAnalyticsTab();
      case "security":
        return renderSecurityTab();
      case "settings":
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="expense-admin-dashboard">
      <a href="#main-content" className="expense-skip-link">
        Skip to main content
      </a>

      <header className="expense-admin-header">
        <div className="expense-admin-header-content">
          <div className="expense-admin-header-left">
            <div className="expense-admin-header-title">
              <h1>Admin Dashboard</h1>
              <p>Manage your expense tracking system</p>
            </div>
            <div className="expense-system-status">
              <div className="expense-status-dot"></div>
              System Online
            </div>
          </div>

          <div className="expense-admin-header-actions">
            <div className="expense-search-container">
              <input
                type="text"
                placeholder="Search users, expenses, or reports..."
                className="expense-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="expense-search-icon">🔍</span>
            </div>

            <button className="expense-notification-btn">
              <span>🔔</span>
              <div className="expense-notification-badge">3</div>
            </button>

            <div className="expense-admin-profile">
              <img
                src="/api/placeholder/40/40"
                alt="Admin Avatar"
                className="expense-admin-avatar"
              />
              <div className="expense-admin-info">
                <div className="expense-admin-name">Admin User</div>
                <div className="expense-admin-role">System Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="expense-admin-tabs">
        <div className="expense-tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`expense-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="expense-tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main id="main-content">{renderTabContent()}</main>
    </div>
  );
};

export default AdminDashboard;
