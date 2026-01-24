import { Route, Navigate } from "react-router-dom";
import Authentication from "../pages/Authentication/Authentication";
import Home from "../pages/Landingpage/Home";
import ExpenseDashboard from "../features/dashboard/ExpenseDashboard";
import Chat from "../services/Chat";
import AdminDashboard from "../pages/Landingpage/Admin/AdminDashboard";
import InvestmentDashboard from "../pages/Landingpage/Investement/InvestementDashboard";
import Groups from "../pages/Landingpage/Groups";
import CreateGroup from "../pages/Landingpage/CreateGroup";
import GroupDetail from "../pages/Landingpage/GroupDetail";
import Profile from "../pages/Landingpage/Profile";
import Settings from "../pages/Landingpage/Settings";
import NotificationSettings from "../pages/Landingpage/NotificationSettings";
import Friends from "../pages/Landingpage/Friends";
import FriendshipReport from "../pages/Landingpage/FriendshipReport";
import { FriendActivityPage } from "../pages/Landingpage/FriendActivity";
import PaymentMethodFlow from "../pages/Landingpage/PaymentMethodFlow";
import CreatePaymentMethod from "../pages/Landingpage/CreatePaymentMethod";
import EditPaymentMethod from "../pages/Landingpage/EditPaymentMethod";
import PaymentMethodsReport from "../pages/Landingpage/Payment Report/PaymentReport";
import Bill from "../pages/Landingpage/Bills/Bill";
import BillReport from "../pages/Landingpage/BillReport";
import UploadBills from "../pages/Fileupload/UploadBills";
import CreateBill from "../pages/Landingpage/CreateBill";
import EditBill from "../pages/Landingpage/EditBill";
import BillCalendarView from "../pages/Landingpage/BillCalendarView";
import Cashflow from "../pages/expenses-view/CashFlow";
import Utilities from "../pages/Landingpage/Utilities";
import Upload from "../pages/Fileupload/Upload";
import NewExpense from "../pages/Landingpage/NewExpense";
import EditExpense from "../pages/Landingpage/EditExpense";
import CombinedExpenseReport from "../pages/Landingpage/CombinedExpenseReport";
import CategoryFlow from "../pages/Landingpage/CategoryFlow";
import CreateCategory from "../pages/Landingpage/CreateCategory";
import CategoryReport from "../pages/Landingpage/Category Report/CategoryReport";
import EditCategory from "../pages/Landingpage/EditCategory";
import TransactionsContent from "../pages/Landingpage/TransactionsContent";
import CreditDueContent from "../pages/Landingpage/CreditDueContent";
import Reports from "../pages/Landingpage/Reports";
import ExpensesView from "../pages/Landingpage/ExpensesView";
import Budget from "../pages/Landingpage/Budget";
import NewBudget from "../pages/Landingpage/NewBudget";
import EditBudget from "../pages/Landingpage/EditBudget";
import BudgetReport from "../pages/Landingpage/Budget Report/BudgetReport";
import AllBudgetsReport from "../pages/Landingpage/Budget Report/AllBudgetsReport";
import CalendarView from "../pages/Landingpage/CalendarView";
import CategoryCalendarView from "../pages/Landingpage/CategoryCalendarView";
import PaymentMethodCalendarView from "../pages/Landingpage/PaymentMethodCalendarView";
import DayTransactionsView from "../pages/Landingpage/DayTransactionsView";
import DayBillsView from "../pages/Landingpage/DayBillsView";
import SystemAnalytics from "../pages/Landingpage/Admin/SystemAnalytics";
import UserManagement from "../pages/Landingpage/Admin/UserManagement";
import RoleManagement from "../pages/Landingpage/Admin/RoleManagement";
import AuditLogsAdmin from "../pages/Landingpage/Admin/AuditLogs";
import ReportsAdmin from "../pages/Landingpage/Admin/Reports";
import AdminSettings from "../pages/Landingpage/Admin/AdminSettings";
import NotFound from "../pages/Landingpage/Errors/NotFound";

/**
 * Authentication Routes - Returns Route element directly
 */
export const getAuthRoutes = () => (
  <Route path="/*" element={<Authentication />} />
);

/**
 * Main Application Routes - Returns Route element directly
 */
export const getAppRoutes = () => (
  <>
    <Route path="/" element={<Home />}>
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="/chats" element={<Chat />} />
      <Route path="/component1" element={<AdminDashboard />} />
      <Route path="/component2" element={<InvestmentDashboard />} />
      <Route path="dashboard" element={<ExpenseDashboard />} />

      {/* Group Routes */}
      <Route path="groups">
        <Route index element={<Groups />} />
        <Route path="create" element={<CreateGroup />} />
        <Route path=":id" element={<GroupDetail />} />
      </Route>

      {/* Profile & Settings Routes */}
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
      <Route path="settings/notifications" element={<NotificationSettings />} />

      {/* Friends Routes */}
      <Route path="friends">
        <Route index element={<Friends />} />
        <Route path="report" element={<FriendshipReport />} />
        <Route path="activity" element={<FriendActivityPage />} />
        <Route path="expenses/:friendId" element={<Cashflow />} />
      </Route>

      {/* Payment Method Routes */}
      <Route path="payment-method">
        <Route index element={<PaymentMethodFlow />} />
        <Route path=":friendId" element={<PaymentMethodFlow />} />
        <Route path="calendar" element={<PaymentMethodCalendarView />} />
        <Route path="calendar/:friendId" element={<PaymentMethodCalendarView />} />
        <Route path="reports" element={<PaymentMethodsReport />} />
        <Route path="reports/:friendId" element={<PaymentMethodsReport />} />
        <Route path="create" element={<CreatePaymentMethod />} />
        <Route path="create/:friendId" element={<CreatePaymentMethod />} />
        <Route path="edit/:id" element={<EditPaymentMethod />} />
        <Route
          path="edit/:id/friend/:friendId"
          element={<EditPaymentMethod />}
        />
      </Route>

      {/* Bill Routes */}
      <Route path="bill">
        <Route index element={<Bill />} />
        <Route path=":friendId" element={<Bill />} />
        <Route path="report" element={<BillReport />} />
        <Route path="report/:friendId" element={<BillReport />} />
        <Route path="upload" element={<UploadBills />} />
        <Route path="upload/:friendId" element={<UploadBills />} />
        <Route path="create" element={<CreateBill />} />
        <Route path="create/:friendId" element={<CreateBill />} />
        <Route path="edit/:id" element={<EditBill />} />
        <Route path="edit/:id/friend/:friendId" element={<EditBill />} />
        <Route path="calendar" element={<BillCalendarView />} />
        <Route path="calendar/:friendId" element={<BillCalendarView />} />
      </Route>

      {/* Utilities & Upload Routes */}
      <Route path="all" element={<Utilities />} />
      <Route path="upload">
        <Route path="expenses" element={<Upload />} />
        <Route path="categories" element={<Upload />} />
        <Route path="categories/:friendId" element={<Upload />} />
        <Route path="payments" element={<Upload />} />
        <Route path="payments/:friendId" element={<Upload />} />
        <Route path="expenses/:friendId" element={<Upload />} />
      </Route>

      {/* Expense Routes */}
      <Route path="expenses">
        <Route index element={<Cashflow />} />
        <Route path="create" element={<NewExpense />} />
        <Route path="create/:friendId" element={<NewExpense />} />
        <Route path="edit/:id" element={<EditExpense />} />
        <Route path="edit/:id/friend/:friendId" element={<EditExpense />} />
        <Route path="reports" element={<CombinedExpenseReport />} />
        <Route path="reports/:friendId" element={<CombinedExpenseReport />} />
      </Route>

      {/* Category Routes */}
      <Route path="category-flow">
        <Route index element={<CategoryFlow />} />
        <Route path=":friendId" element={<CategoryFlow />} />
        <Route path="calendar" element={<CategoryCalendarView />} />
        <Route path="calendar/:friendId" element={<CategoryCalendarView />} />
        <Route path="create" element={<CreateCategory />} />
        <Route path="create/:friendId" element={<CreateCategory />} />
        <Route path="reports" element={<CategoryReport />} />
        <Route path="reports/:friendId" element={<CategoryReport />} />
        <Route path="edit/:id" element={<EditCategory />} />
        <Route path="edit/:id/friend/:friendId" element={<EditCategory />} />
      </Route>

      {/* Transaction & Insights Routes */}
      <Route path="transactions">
        <Route index element={<TransactionsContent />} />
        <Route path=":friendId" element={<TransactionsContent />} />
      </Route>
      <Route path="history">
        <Route index element={<TransactionsContent />} />
        <Route path=":friendId" element={<TransactionsContent />} />
      </Route>
      <Route path="insights">
        <Route index element={<CreditDueContent />} />
        <Route path=":friendId" element={<CreditDueContent />} />
      </Route>

      {/* Reports & Cashflow Routes */}
      <Route path="reports">
        <Route index element={<Reports />} />
        <Route path=":friendId" element={<Reports />} />
      </Route>
      <Route path="cashflow">
        <Route index element={<ExpensesView />} />
        <Route path=":friendId" element={<ExpensesView />} />
      </Route>

      {/* Budget Routes */}
      <Route path="budget">
        <Route index element={<Budget />} />
        <Route path=":friendId" element={<Budget />} />
        <Route path="create" element={<NewBudget />} />
        <Route path="create/:friendId" element={<NewBudget />} />
        <Route path="edit/:id" element={<EditBudget />} />
        <Route path="edit/:id/friend/:friendId" element={<EditBudget />} />
        <Route path="report/:id" element={<BudgetReport />} />
        <Route path="report/:id/friend/:friendId" element={<BudgetReport />} />
        <Route path="reports" element={<AllBudgetsReport />} />
        <Route path="reports/:friendId" element={<AllBudgetsReport />} />
      </Route>

      {/* Detailed Budget Report Routes */}
      <Route path="budget-report/:budgetId" element={<BudgetReport />} />
      <Route
        path="budget-report/:budgetId/:friendId"
        element={<BudgetReport />}
      />

      {/* Calendar Views */}
      <Route path="/calendar-view">
        <Route index element={<CalendarView />} />
        <Route path=":friendId" element={<CalendarView />} />
      </Route>
      <Route path="/day-view">
        <Route path=":date" element={<DayTransactionsView />} />
        <Route
          path=":date/friend/:friendId"
          element={<DayTransactionsView />}
        />
      </Route>
      <Route path="/bill-day-view">
        <Route path=":date" element={<DayBillsView />} />
        <Route path=":date/friend/:friendId" element={<DayBillsView />} />
      </Route>

      {/* Admin Routes */}
      <Route path="admin">
        <Route path="dashboard" element={<SystemAnalytics />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="analytics" element={<SystemAnalytics />} />
        <Route path="audit" element={<AuditLogsAdmin />} />
        <Route path="reports" element={<ReportsAdmin />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Route>

    {/* 404 Not Found - Catch all undefined routes (outside Home layout) */}
    <Route path="*" element={<NotFound />} />
  </>
);
