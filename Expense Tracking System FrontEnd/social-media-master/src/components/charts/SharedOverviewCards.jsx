import React from "react";
import useUserSettings from "../../hooks/useUserSettings";
import { useTheme } from "../../hooks/useTheme";

/**
 * SharedOverviewCards
 * Modes: payment | category | expenses | budget | friendship | admin-analytics | admin-users | admin-audit | admin-reports
 * For expenses mode we show: Total Spending, Top Expense Name, Avg Transaction, Total Transactions
 * For budget mode we show: Total Budgets, Active Budgets, Total Spent, Total Remaining
 * For friendship mode we show: Total Friends, Pending Requests, I Shared With, Shared With Me
 * For admin-analytics mode we show: Total Users, Active Users, Total Expenses, Total Revenue
 * For admin-users mode we show: Total Users, Active Users, Admins, New This Month
 * For admin-audit mode we show: Total Logs, User Management, Data Changes, Authentication
 * For admin-reports mode we show: Report Types, Generated This Month, Total Reports, Avg Size
 */
const SharedOverviewCards = ({
  data = [],
  mode = "payment",
  currencySymbol,
}) => {
  const settings = useUserSettings();
  const { colors, mode: themeMode } = useTheme();
  const displayCurrency = currencySymbol || settings.getCurrency().symbol;
  const safe = Array.isArray(data) ? data : [];
  const isPayment = mode === "payment";
  const isCategory = mode === "category";
  const isExpenses = mode === "expenses";
  const isBudget = mode === "budget";
  const isFriendship = mode === "friendship";
  const isAdminAnalytics = mode === "admin-analytics";
  const isAdminUsers = mode === "admin-users";
  const isAdminAudit = mode === "admin-audit";
  const isAdminReports = mode === "admin-reports";

  const amountKey = isPayment || isExpenses ? "totalAmount" : "amount";
  const nameKey = isPayment ? "method" : isCategory ? "name" : "method"; // expenses receives payment-method style objects
  const getExpenseDetails = (expense) =>
    expense?.details || expense?.expense || {};

  // Total amount
  const totalAmount = safe.reduce(
    (sum, item) => sum + Number(item?.[amountKey] || 0),
    0,
  );

  // Total transactions count (expenses & payment share logic)
  const totalTransactions = safe.reduce(
    (sum, item) => sum + Number(item?.transactions || item?.count || 0),
    0,
  );

  // Build expense name aggregation only for expenses mode
  let topExpenseName = "-";
  let topExpenseAmount = 0;
  if (isExpenses) {
    const expenseMap = new Map();
    safe.forEach((method) => {
      (method.expenses || []).forEach((exp) => {
        const details = getExpenseDetails(exp);
        const name = details.expenseName || details.name || "Unknown";
        const amt = Number(details.amount ?? details.netAmount ?? 0);
        const prev = expenseMap.get(name) || 0;
        expenseMap.set(name, prev + amt);
      });
    });
    // Determine top expense by aggregated amount
    expenseMap.forEach((amt, name) => {
      if (amt > topExpenseAmount) {
        topExpenseAmount = amt;
        topExpenseName = name;
      }
    });
  }

  // Fallback top item for non-expenses modes (assume data already sorted)
  const topItem = !isExpenses
    ? safe[0] || { [nameKey]: "-", [amountKey]: 0, percentage: 0 }
    : null;

  const avgTransactionValue =
    totalTransactions > 0 ? totalAmount / totalTransactions : 0;

  // Percentage for top item (payment/category) or top expense (expenses)
  const topPercentage = (() => {
    if (totalAmount <= 0) return 0;
    if (isExpenses) return ((topExpenseAmount || 0) / totalAmount) * 100;
    const amt = Number(topItem?.[amountKey] || 0);
    return (amt / totalAmount) * 100;
  })().toFixed(2);

  // Theme-aware styles
  const cardStyle = {
    background:
      themeMode === "dark"
        ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
    border: `1px solid ${colors.border_color}`,
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    transition: "transform 0.2s, box-shadow 0.2s",
    minHeight: "120px",
  };

  const cardIconStyle = {
    fontSize: "32px",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      themeMode === "dark"
        ? "rgba(20, 184, 166, 0.1)"
        : "rgba(20, 184, 166, 0.15)",
    borderRadius: "12px",
  };

  const cardTitleStyle = {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: themeMode === "dark" ? "#888" : "#666",
    fontWeight: 500,
  };

  const cardValueStyle = {
    fontSize: "24px",
    fontWeight: 700,
    color: colors.primary_text,
    marginBottom: "4px",
  };

  const cardChangeStyle = {
    fontSize: "12px",
    fontWeight: 500,
  };

  const borderColors = {
    primary: "#14b8a6",
    secondary: "#06d6a0",
    tertiary: "#118ab2",
    quaternary: "#ffd166",
  };

  const getCardStyleWithBorder = (borderColor) => ({
    ...cardStyle,
    borderLeft: `4px solid ${borderColor}`,
  });

  const hoverEffect = (e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 8px 25px rgba(20, 184, 166, 0.15)";
  };

  const removeHoverEffect = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
  };

  // Budget mode renders different cards entirely
  if (isBudget) {
    // Extract budget stats from the parent component
    // Expecting data to contain budget statistics
    const budgetData = safe[0] || {};
    const totalBudgets = budgetData.totalBudgets || 0;
    const activeBudgets = budgetData.activeBudgets || 0;
    const totalSpent = budgetData.totalSpent || 0;
    const totalRemaining = budgetData.totalRemaining || 0;

    return (
      <div
        className="shared-overview-cards budget-overview-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {/* Total Budgets */}
        <div
          className="overview-card primary"
          style={getCardStyleWithBorder(borderColors.primary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📊
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Budgets</h3>
            <div className="card-value" style={cardValueStyle}>
              {totalBudgets}
            </div>
            <div
              className="card-change positive"
              style={{ ...cardChangeStyle, color: "#10b981" }}
            >
              All budgets created
            </div>
          </div>
        </div>

        {/* Active Budgets */}
        <div
          className="overview-card secondary"
          style={getCardStyleWithBorder(borderColors.secondary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            ✅
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Active Budgets</h3>
            <div className="card-value" style={cardValueStyle}>
              {activeBudgets}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: themeMode === "dark" ? "#888" : "#666",
              }}
            >
              Currently active
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div
          className="overview-card tertiary"
          style={getCardStyleWithBorder(borderColors.tertiary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            💸
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Spent</h3>
            <div className="card-value" style={cardValueStyle}>
              {displayCurrency}
              {Number(totalSpent).toLocaleString()}
            </div>
            <div
              className="card-change negative"
              style={{ ...cardChangeStyle, color: "#ef4444" }}
            >
              From all budgets
            </div>
          </div>
        </div>

        {/* Total Remaining */}
        <div
          className="overview-card quaternary"
          style={getCardStyleWithBorder(borderColors.quaternary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            💰
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Remaining</h3>
            <div className="card-value" style={cardValueStyle}>
              {displayCurrency}
              {Number(totalRemaining).toLocaleString()}
            </div>
            <div
              className="card-change positive"
              style={{ ...cardChangeStyle, color: "#10b981" }}
            >
              Available budget
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Analytics mode
  if (isAdminAnalytics) {
    const analyticsData = safe[0] || {};
    const totalUsers = analyticsData.totalUsers || 0;
    const activeUsers = analyticsData.activeUsers || 0;
    const totalExpenses = analyticsData.totalExpenses || 0;
    const totalRevenue = analyticsData.totalRevenue || 0;
    const userGrowth = analyticsData.userGrowth || 0;
    const activeGrowth = analyticsData.activeGrowth || 0;
    const expenseGrowth = analyticsData.expenseGrowth || 0;
    const revenueGrowth = analyticsData.revenueGrowth || 0;

    return (
      <div
        className="shared-overview-cards admin-analytics-overview-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div
          className="overview-card primary"
          style={getCardStyleWithBorder(borderColors.primary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            👥
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Users</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(totalUsers).toLocaleString()}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: userGrowth >= 0 ? "#10b981" : "#ef4444",
              }}
            >
              {userGrowth >= 0 ? "+" : ""}
              {userGrowth}% vs last period
            </div>
          </div>
        </div>

        <div
          className="overview-card secondary"
          style={getCardStyleWithBorder(borderColors.secondary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            ✅
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Active Users</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(activeUsers).toLocaleString()}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: activeGrowth >= 0 ? "#10b981" : "#ef4444",
              }}
            >
              {activeGrowth >= 0 ? "+" : ""}
              {activeGrowth}% vs last period
            </div>
          </div>
        </div>

        <div
          className="overview-card tertiary"
          style={getCardStyleWithBorder(borderColors.tertiary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            💰
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Expenses</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(totalExpenses).toLocaleString()}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: expenseGrowth >= 0 ? "#10b981" : "#ef4444",
              }}
            >
              {expenseGrowth >= 0 ? "+" : ""}
              {expenseGrowth}% vs last period
            </div>
          </div>
        </div>

        <div
          className="overview-card quaternary"
          style={getCardStyleWithBorder(borderColors.quaternary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            💵
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Revenue</h3>
            <div className="card-value" style={cardValueStyle}>
              {displayCurrency}
              {Number(totalRevenue).toLocaleString()}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: revenueGrowth >= 0 ? "#10b981" : "#ef4444",
              }}
            >
              {revenueGrowth >= 0 ? "+" : ""}
              {revenueGrowth}% vs last period
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Users mode
  if (isAdminUsers) {
    const usersData = safe[0] || {};
    const totalUsers = usersData.totalUsers || usersData.total || 0;
    const activeUsers = usersData.activeUsers || usersData.active || 0;
    const admins = usersData.admins || 0;
    const newThisMonth = usersData.newThisMonth || 0;

    return (
      <div
        className="shared-overview-cards admin-users-overview-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div
          className="overview-card primary"
          style={getCardStyleWithBorder(borderColors.primary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            👥
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Users</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(totalUsers).toLocaleString()}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: themeMode === "dark" ? "#888" : "#666",
              }}
            >
              All registered users
            </div>
          </div>
        </div>

        <div
          className="overview-card secondary"
          style={getCardStyleWithBorder(borderColors.secondary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            ✅
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Active Users</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(activeUsers).toLocaleString()}
            </div>
            <div
              className="card-change positive"
              style={{ ...cardChangeStyle, color: "#10b981" }}
            >
              Currently active
            </div>
          </div>
        </div>

        <div
          className="overview-card tertiary"
          style={getCardStyleWithBorder(borderColors.tertiary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            🛡️
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Admins</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(admins).toLocaleString()}
            </div>
            <div
              className="card-change"
              style={{ ...cardChangeStyle, color: "#e91e63" }}
            >
              Admin privileges
            </div>
          </div>
        </div>

        <div
          className="overview-card quaternary"
          style={getCardStyleWithBorder(borderColors.quaternary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            🆕
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>New This Month</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(newThisMonth).toLocaleString()}
            </div>
            <div
              className="card-change positive"
              style={{ ...cardChangeStyle, color: "#2196f3" }}
            >
              Recent registrations
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Audit mode
  if (isAdminAudit) {
    const auditData = safe[0] || {};
    const totalLogs = auditData.totalLogs || 0;
    const userManagement = auditData.userManagement || 0;
    const dataChanges =
      auditData.dataChanges || auditData.dataModification || 0;
    const authentication = auditData.authentication || 0;
    const reports = auditData.reports || auditData.reportGeneration || 0;

    return (
      <div
        className="shared-overview-cards admin-audit-overview-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div
          className="overview-card primary"
          style={getCardStyleWithBorder(borderColors.primary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📋
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Logs</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(totalLogs).toLocaleString()}
            </div>
          </div>
        </div>

        <div
          className="overview-card secondary"
          style={getCardStyleWithBorder("#2196f3")}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            👤
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>User Management</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(userManagement).toLocaleString()}
            </div>
          </div>
        </div>

        <div
          className="overview-card tertiary"
          style={getCardStyleWithBorder("#ff9800")}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📝
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Data Changes</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(dataChanges).toLocaleString()}
            </div>
          </div>
        </div>

        <div
          className="overview-card quaternary"
          style={getCardStyleWithBorder("#4caf50")}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            🔐
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Authentication</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(authentication).toLocaleString()}
            </div>
          </div>
        </div>

        <div
          className="overview-card quinary"
          style={getCardStyleWithBorder("#00bcd4")}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📊
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Reports</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(reports).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Reports mode
  if (isAdminReports) {
    const reportsData = safe[0] || {};
    const reportTypes = reportsData.reportTypes || 5;
    const generatedThisMonth = reportsData.generatedThisMonth || 0;
    const totalReports = reportsData.totalReports || 0;
    const avgSize = reportsData.avgSize || "0";

    return (
      <div
        className="shared-overview-cards admin-reports-overview-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div
          className="overview-card primary"
          style={getCardStyleWithBorder(borderColors.primary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📑
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Report Types</h3>
            <div className="card-value" style={cardValueStyle}>
              {reportTypes}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: themeMode === "dark" ? "#888" : "#666",
              }}
            >
              Available templates
            </div>
          </div>
        </div>

        <div
          className="overview-card secondary"
          style={getCardStyleWithBorder(borderColors.secondary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📅
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Generated This Month</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(generatedThisMonth).toLocaleString()}
            </div>
            <div
              className="card-change positive"
              style={{ ...cardChangeStyle, color: "#4caf50" }}
            >
              This month
            </div>
          </div>
        </div>

        <div
          className="overview-card tertiary"
          style={getCardStyleWithBorder(borderColors.tertiary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📊
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Reports</h3>
            <div className="card-value" style={cardValueStyle}>
              {Number(totalReports).toLocaleString()}
            </div>
            <div
              className="card-change"
              style={{ ...cardChangeStyle, color: "#2196f3" }}
            >
              All time
            </div>
          </div>
        </div>

        <div
          className="overview-card quaternary"
          style={getCardStyleWithBorder(borderColors.quaternary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            💾
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Avg Size</h3>
            <div className="card-value" style={cardValueStyle}>
              {avgSize} MB
            </div>
            <div
              className="card-change"
              style={{ ...cardChangeStyle, color: "#9c27b0" }}
            >
              Per report
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Friendship mode renders friendship-specific cards
  if (isFriendship) {
    const friendshipData = safe[0] || {};
    const totalFriends = friendshipData.totalFriends || 0;
    const pendingRequests = friendshipData.pendingRequests || 0;
    const iSharedWithCount = friendshipData.iSharedWithCount || 0;
    const sharedWithMeCount = friendshipData.sharedWithMeCount || 0;

    return (
      <div
        className="shared-overview-cards friendship-overview-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {/* Total Friends */}
        <div
          className="overview-card primary"
          style={getCardStyleWithBorder(borderColors.primary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            👥
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Friends</h3>
            <div className="card-value" style={cardValueStyle}>
              {totalFriends}
            </div>
            <div
              className="card-change positive"
              style={{ ...cardChangeStyle, color: "#10b981" }}
            >
              Active connections
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div
          className="overview-card secondary"
          style={getCardStyleWithBorder(borderColors.secondary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            ⏳
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Pending Requests</h3>
            <div className="card-value" style={cardValueStyle}>
              {pendingRequests}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color:
                  pendingRequests > 0
                    ? "#f59e0b"
                    : themeMode === "dark"
                      ? "#888"
                      : "#666",
              }}
            >
              {pendingRequests > 0
                ? "Awaiting response"
                : "No pending requests"}
            </div>
          </div>
        </div>

        {/* I Shared With */}
        <div
          className="overview-card tertiary"
          style={getCardStyleWithBorder(borderColors.tertiary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📤
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>I Shared With</h3>
            <div className="card-value" style={cardValueStyle}>
              {iSharedWithCount}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: themeMode === "dark" ? "#888" : "#666",
              }}
            >
              Friends I share data with
            </div>
          </div>
        </div>

        {/* Shared With Me */}
        <div
          className="overview-card quaternary"
          style={getCardStyleWithBorder(borderColors.quaternary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📥
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Shared With Me</h3>
            <div className="card-value" style={cardValueStyle}>
              {sharedWithMeCount}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: themeMode === "dark" ? "#888" : "#666",
              }}
            >
              Friends sharing with me
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`shared-overview-cards ${mode}-overview-cards`}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "32px",
      }}
    >
      {/* Total Spending */}
      <div
        className="overview-card primary"
        style={getCardStyleWithBorder(borderColors.primary)}
        onMouseEnter={hoverEffect}
        onMouseLeave={removeHoverEffect}
      >
        <div className="card-icon" style={cardIconStyle}>
          💰
        </div>
        <div className="card-content">
          <h3 style={cardTitleStyle}>Total Spending</h3>
          <div className="card-value" style={cardValueStyle}>
            {displayCurrency}
            {Number(totalAmount).toLocaleString()}
          </div>
          <div
            className="card-change positive"
            style={{ ...cardChangeStyle, color: "#10b981" }}
          >
            +{isPayment ? "15.2" : isCategory ? "12.5" : "10.0"}% vs last period
          </div>
        </div>
      </div>

      {/* Top Item / Top Expense Name */}
      <div
        className="overview-card secondary"
        style={getCardStyleWithBorder(borderColors.secondary)}
        onMouseEnter={hoverEffect}
        onMouseLeave={removeHoverEffect}
      >
        <div className="card-icon" style={cardIconStyle}>
          🏆
        </div>
        <div className="card-content">
          <h3 style={cardTitleStyle}>
            {isExpenses
              ? "Top Expense Name"
              : isPayment
                ? "Top Payment Method"
                : "Top Category"}
          </h3>
          <div
            className="card-value"
            title={isExpenses ? topExpenseName : topItem?.[nameKey]}
            style={{
              ...cardValueStyle,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px",
              cursor: "pointer",
            }}
          >
            {isExpenses ? topExpenseName : topItem?.[nameKey]}
          </div>
          <div
            className="card-change"
            style={{
              ...cardChangeStyle,
              color: themeMode === "dark" ? "#888" : "#666",
            }}
          >
            {displayCurrency}
            {(isExpenses
              ? Number(topExpenseAmount || 0)
              : Number(topItem?.[amountKey] || 0)
            ).toLocaleString()}{" "}
            ({topPercentage}%)
          </div>
        </div>
      </div>

      {/* Avg Transaction */}
      <div
        className="overview-card tertiary"
        style={getCardStyleWithBorder(borderColors.tertiary)}
        onMouseEnter={hoverEffect}
        onMouseLeave={removeHoverEffect}
      >
        <div className="card-icon" style={cardIconStyle}>
          {isPayment || isExpenses ? "📊" : "📈"}
        </div>
        <div className="card-content">
          <h3 style={cardTitleStyle}>Avg Transaction</h3>
          <div className="card-value" style={cardValueStyle}>
            {displayCurrency}
            {Math.round(avgTransactionValue)}
          </div>
          <div
            className="card-change negative"
            style={{ ...cardChangeStyle, color: "#ef4444" }}
          >
            -{isPayment ? "3.1" : isCategory ? "5.2" : "4.0"}% vs last period
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div
        className="overview-card quaternary"
        style={getCardStyleWithBorder(borderColors.quaternary)}
        onMouseEnter={hoverEffect}
        onMouseLeave={removeHoverEffect}
      >
        <div className="card-icon" style={cardIconStyle}>
          🔢
        </div>
        <div className="card-content">
          <h3 style={cardTitleStyle}>Total Transactions</h3>
          <div className="card-value" style={cardValueStyle}>
            {totalTransactions}
          </div>
          <div
            className="card-change positive"
            style={{ ...cardChangeStyle, color: "#10b981" }}
          >
            +{isPayment ? "12.8" : isCategory ? "8.7" : "9.3"}% vs last period
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedOverviewCards;
