import React from "react";
import useUserSettings from "../../hooks/useUserSettings";
import ModernOverviewCard from "../common/ModernOverviewCard";
import WalletIcon from "@mui/icons-material/Wallet";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BarChartIcon from "@mui/icons-material/BarChart";
import TagIcon from "@mui/icons-material/Tag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import IosShareIcon from "@mui/icons-material/IosShare";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TimerOffIcon from "@mui/icons-material/TimerOff";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SecurityIcon from "@mui/icons-material/Security";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import EditNoteIcon from "@mui/icons-material/EditNote";
import LockIcon from "@mui/icons-material/Lock";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SaveIcon from "@mui/icons-material/Save";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";

const SharedOverviewCards = ({
  data = [],
  mode = "payment",
  currencySymbol,
}) => {
  const settings = useUserSettings();
  const displayCurrency = currencySymbol || settings.getCurrency().symbol;
  const safe = Array.isArray(data) ? data : [];
  
  const isPayment = mode === "payment";
  const isCategory = mode === "category";
  const isExpenses = mode === "expenses";
  const isBudget = mode === "budget";
  const isFriendship = mode === "friendship";
  const isShares = mode === "shares";
  const isAdminAnalytics = mode === "admin-analytics";
  const isAdminUsers = mode === "admin-users";
  const isAdminAudit = mode === "admin-audit";
  const isAdminReports = mode === "admin-reports";

  const amountKey = isPayment || isExpenses ? "totalAmount" : "amount";
  const nameKey = isPayment ? "method" : isCategory ? "name" : "method";
  const getExpenseDetails = (expense) => expense?.details || expense?.expense || {};

  const totalAmount = safe.reduce((sum, item) => sum + Number(item?.[amountKey] || 0), 0);
  const totalTransactions = safe.reduce((sum, item) => sum + Number(item?.transactions || item?.count || 0), 0);

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
    expenseMap.forEach((amt, name) => {
      if (amt > topExpenseAmount) {
        topExpenseAmount = amt;
        topExpenseName = name;
      }
    });
  }

  const topItem = !isExpenses ? safe[0] || { [nameKey]: "-", [amountKey]: 0, percentage: 0 } : null;
  const avgTransactionValue = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
  const topPercentage = (() => {
    if (totalAmount <= 0) return 0;
    if (isExpenses) return ((topExpenseAmount || 0) / totalAmount) * 100;
    return (Number(topItem?.[amountKey] || 0) / totalAmount) * 100;
  })().toFixed(2);

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  };

  if (isBudget) {
    const budgetData = safe[0] || {};
    return (
      <div style={containerStyle}>
        <ModernOverviewCard title="Total Budgets" value={budgetData.totalBudgets || 0} icon={<BarChartIcon />} variant="blue" percentage="+10%" trend="up" sparklineData={[2, 3, 5, 4, 6]} />
        <ModernOverviewCard title="Active Budgets" value={budgetData.activeBudgets || 0} icon={<CheckCircleIcon />} variant="purple" percentage="All time" trend="up" sparklineData={[4, 5, 4, 5, 4]} />
        <ModernOverviewCard title="Total Spent" value={`${displayCurrency}${Number(budgetData.totalSpent || 0).toLocaleString()}`} icon={<MoneyOffIcon />} variant="yellow" percentage="-5.2%" trend="down" sparklineData={[8, 7, 5, 6, 4]} />
        <ModernOverviewCard title="Total Remaining" value={`${displayCurrency}${Number(budgetData.totalRemaining || 0).toLocaleString()}`} icon={<AccountBalanceIcon />} variant="red" percentage="+12.5%" trend="up" sparklineData={[3, 5, 6, 8, 9]} />
      </div>
    );
  }

  if (isShares) {
    const sharesData = safe[0] || {};
    return (
      <div style={containerStyle}>
        <ModernOverviewCard title="Total Shares" value={sharesData.totalShares || 0} icon={<IosShareIcon />} variant="blue" percentage="+2.4%" trend="up" sparklineData={[1, 2, 4, 3, 5]} />
        <ModernOverviewCard title="Active Shares" value={sharesData.activeShares || 0} icon={<CheckCircleIcon />} variant="purple" percentage="+1.1%" trend="up" sparklineData={[3, 4, 4, 5, 6]} />
        <ModernOverviewCard title="Total Views" value={sharesData.totalViews || 0} icon={<VisibilityIcon />} variant="yellow" percentage="+8.5%" trend="up" sparklineData={[2, 5, 6, 9, 12]} />
        <ModernOverviewCard title="Expired Shares" value={sharesData.expiredShares || 0} icon={<TimerOffIcon />} variant="red" percentage="-0.5%" trend="down" sparklineData={[5, 4, 3, 2, 1]} />
      </div>
    );
  }

  if (isAdminAnalytics) {
    const d = safe[0] || {};
    return (
      <div style={containerStyle}>
        <ModernOverviewCard title="Total Users" value={Number(d.totalUsers || 0).toLocaleString()} icon={<PeopleIcon />} variant="blue" percentage={`${d.userGrowth >= 0 ? "+" : ""}${d.userGrowth || 0}%`} trend={d.userGrowth >= 0 ? "up" : "down"} sparklineData={[5, 6, 7, 9, 10]} />
        <ModernOverviewCard title="Active Users" value={Number(d.activeUsers || 0).toLocaleString()} icon={<CheckCircleIcon />} variant="purple" percentage={`${d.activeGrowth >= 0 ? "+" : ""}${d.activeGrowth || 0}%`} trend={d.activeGrowth >= 0 ? "up" : "down"} sparklineData={[4, 5, 7, 6, 8]} />
        <ModernOverviewCard title="Total Expenses" value={`${displayCurrency}${Number(d.totalExpenses || 0).toLocaleString()}`} icon={<ReceiptIcon />} variant="yellow" percentage={`${d.expenseGrowth >= 0 ? "+" : ""}${d.expenseGrowth || 0}%`} trend={d.expenseGrowth >= 0 ? "up" : "down"} sparklineData={[8, 7, 9, 8, 10]} />
        <ModernOverviewCard title="Total Revenue" value={`${displayCurrency}${Number(d.totalRevenue || 0).toLocaleString()}`} icon={<MonetizationOnIcon />} variant="red" percentage={`${d.revenueGrowth >= 0 ? "+" : ""}${d.revenueGrowth || 0}%`} trend={d.revenueGrowth >= 0 ? "up" : "down"} sparklineData={[5, 7, 8, 10, 12]} />
      </div>
    );
  }

  if (isAdminUsers) {
    const d = safe[0] || {};
    return (
      <div style={containerStyle}>
        <ModernOverviewCard title="Total Users" value={Number(d.totalUsers || d.total || 0).toLocaleString()} icon={<PeopleIcon />} variant="blue" percentage="+5.4%" trend="up" sparklineData={[10, 12, 15, 18, 22]} />
        <ModernOverviewCard title="Active Users" value={Number(d.activeUsers || d.active || 0).toLocaleString()} icon={<CheckCircleIcon />} variant="purple" percentage="+2.1%" trend="up" sparklineData={[8, 9, 11, 14, 16]} />
        <ModernOverviewCard title="Admins" value={Number(d.admins || 0).toLocaleString()} icon={<SecurityIcon />} variant="yellow" percentage="0.0%" trend="up" sparklineData={[2, 2, 2, 2, 2]} />
        <ModernOverviewCard title="New This Month" value={Number(d.newThisMonth || 0).toLocaleString()} icon={<FiberNewIcon />} variant="red" percentage="+12.4%" trend="up" sparklineData={[1, 3, 5, 8, 12]} />
      </div>
    );
  }

  if (isAdminAudit) {
    const d = safe[0] || {};
    return (
      <div style={{ ...containerStyle, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <ModernOverviewCard title="Total Logs" value={Number(d.totalLogs || 0).toLocaleString()} icon={<ListAltIcon />} variant="blue" percentage="+15%" trend="up" sparklineData={[20, 25, 30, 40, 50]} />
        <ModernOverviewCard title="User Management" value={Number(d.userManagement || 0).toLocaleString()} icon={<ManageAccountsIcon />} variant="purple" percentage="+5%" trend="up" sparklineData={[5, 8, 7, 10, 12]} />
        <ModernOverviewCard title="Data Changes" value={Number(d.dataChanges || d.dataModification || 0).toLocaleString()} icon={<EditNoteIcon />} variant="yellow" percentage="-2%" trend="down" sparklineData={[15, 12, 14, 10, 8]} />
        <ModernOverviewCard title="Authentication" value={Number(d.authentication || 0).toLocaleString()} icon={<LockIcon />} variant="red" percentage="+8%" trend="up" sparklineData={[30, 35, 32, 38, 42]} />
      </div>
    );
  }

  if (isAdminReports) {
    const d = safe[0] || {};
    return (
      <div style={containerStyle}>
        <ModernOverviewCard title="Report Types" value={d.reportTypes || 5} icon={<InsertDriveFileIcon />} variant="blue" percentage="0%" trend="up" sparklineData={[5, 5, 5, 5, 5]} />
        <ModernOverviewCard title="Generated This Month" value={Number(d.generatedThisMonth || 0).toLocaleString()} icon={<CalendarMonthIcon />} variant="purple" percentage="+18%" trend="up" sparklineData={[2, 5, 8, 12, 20]} />
        <ModernOverviewCard title="Total Reports" value={Number(d.totalReports || 0).toLocaleString()} icon={<AssessmentIcon />} variant="yellow" percentage="+4.5%" trend="up" sparklineData={[40, 45, 50, 55, 62]} />
        <ModernOverviewCard title="Avg Size" value={`${d.avgSize || "0"} MB`} icon={<SaveIcon />} variant="red" percentage="-1.2%" trend="down" sparklineData={[2.5, 2.4, 2.6, 2.3, 2.1]} />
      </div>
    );
  }

  if (isFriendship) {
    const d = safe[0] || {};
    return (
      <div style={containerStyle}>
        <ModernOverviewCard title="Total Friends" value={d.totalFriends || 0} icon={<PeopleIcon />} variant="blue" percentage="+10.2%" trend="up" sparklineData={[5, 6, 8, 10, 12]} />
        <ModernOverviewCard title="Pending Requests" value={d.pendingRequests || 0} icon={<HourglassEmptyIcon />} variant="purple" percentage="-5.0%" trend="down" sparklineData={[4, 3, 5, 2, 1]} />
        <ModernOverviewCard title="I Shared With" value={d.iSharedWithCount || 0} icon={<ForwardToInboxIcon />} variant="yellow" percentage="+3.5%" trend="up" sparklineData={[2, 3, 3, 5, 6]} />
        <ModernOverviewCard title="Shared With Me" value={d.sharedWithMeCount || 0} icon={<MoveToInboxIcon />} variant="red" percentage="+8.1%" trend="up" sparklineData={[1, 3, 4, 6, 8]} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <ModernOverviewCard 
        title="Total Spending" 
        value={`${displayCurrency}${Number(totalAmount).toLocaleString()}`} 
        icon={<WalletIcon />} 
        variant="blue" 
        percentage={`+${isPayment ? "15.2" : isCategory ? "12.5" : "10.0"}%`} 
        trend="up" 
        sparklineData={[10, 15, 12, 18, 25]} 
      />
      <ModernOverviewCard 
        title={isExpenses ? "Top Expense Name" : isPayment ? "Top Payment Method" : "Top Category"} 
        value={isExpenses ? topExpenseName : topItem?.[nameKey]} 
        icon={<EmojiEventsIcon />} 
        variant="purple" 
        percentage={`${topPercentage}%`} 
        trend="up" 
        sparklineData={[5, 6, 8, 9, 12]} 
      />
      <ModernOverviewCard 
        title="Avg Transaction" 
        value={`${displayCurrency}${Math.round(avgTransactionValue)}`} 
        icon={<BarChartIcon />} 
        variant="yellow" 
        percentage={`-${isPayment ? "3.1" : isCategory ? "5.2" : "4.0"}%`} 
        trend="down" 
        sparklineData={[20, 18, 15, 16, 12]} 
      />
      <ModernOverviewCard 
        title="Total Transactions" 
        value={totalTransactions} 
        icon={<TagIcon />} 
        variant="red" 
        percentage={`+${isPayment ? "12.8" : isCategory ? "8.7" : "9.3"}%`} 
        trend="up" 
        sparklineData={[30, 35, 40, 48, 60]} 
      />
    </div>
  );
};

export default SharedOverviewCards;