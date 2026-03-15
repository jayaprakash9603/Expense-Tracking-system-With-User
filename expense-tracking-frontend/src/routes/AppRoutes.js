import { Route, Navigate } from "react-router-dom";
import Authentication from "../pages/Authentication/Authentication";
import Home from "../shared/layout/HomeShell";
import { ExpenseDashboard } from "../features/dashboard";
import { ChatPage } from "../features/chat";
import { AdminDashboard } from "../features/admin";
import { InvestmentDashboard } from "../features/investment";
import { Groups, CreateGroup, GroupDetail } from "../features/groups";
import {
  Profile,
  Settings,
  NotificationSettings,
  MfaSetup,
} from "../features/settings";
import {
  Friends,
  FriendshipReport,
  FriendActivityPage,
  FriendChat,
} from "../features/friends";
import {
  PaymentMethodFlow,
  CreatePaymentMethod,
  EditPaymentMethod,
  PaymentMethodsReport,
  PaymentMethodCalendarView,
  PaymentMethodAnalyticsView,
} from "../features/payment-methods";
import { Bill, BillReport, CreateBill, EditBill, BillCalendarView } from "../features/bills";
import { UploadBills, Upload } from "../features/upload";
import {
  Cashflow,
  NewExpense,
  EditExpense,
  ViewExpense,
  CombinedExpenseReport,
  ExpensesView,
} from "../features/expenses";
import {
  CategoryFlow,
  CreateCategory,
  CategoryReport,
  EditCategory,
  CategoryAnalyticsView,
  CategoryCalendarView,
} from "../features/categories";
import { TransactionsContent, CreditDueContent, Reports } from "../features/reports";
import { Utilities } from "../features/utilities";
import {
  Budget,
  NewBudget,
  EditBudget,
  BudgetReport,
  AllBudgetsReport,
} from "../features/budgets";
import { CalendarView, DayTransactionsView, DayBillsView } from "../features/calendar";
import {
  SystemAnalytics,
  UserManagement,
  RoleManagement,
  AuditLogsAdmin,
  ReportsAdmin,
  AdminSettings,
  AdminStoryManagement,
  CreateStory,
  EditStory,
} from "../features/admin";
import { NotFound } from "../features/errors";
import { HelpCenter, ContactSupport, TermsOfService, PrivacyPolicy } from "../features/help-support";
import SharedViewPage from "../pages/SharedViewPage";
import {
  MySharesPage,
  CreateSharePage,
  PublicSharesPage,
  SharedWithMePage,
} from "../features/sharing";

/**
 * Authentication Routes - Returns Route element directly
 * Also includes public routes like shared view page
 */
export const getAuthRoutes = () => (
  <>
    {/* Public Share View Route - accessible without authentication */}
    <Route path="/share/:token" element={<SharedViewPage />} />
    {/* Authentication routes */}
    <Route path="/*" element={<Authentication />} />
  </>
);

/**
 * Main Application Routes - Returns Route element directly
 */
export const getAppRoutes = () => (
  <>
    {/* Public Share View Route - accessible for authenticated users too */}
    <Route path="/share/:token" element={<SharedViewPage />} />

    <Route path="/" element={<Home />}>
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="/chats" element={<ChatPage />} />
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
      <Route path="settings/mfa" element={<MfaSetup />} />

      {/* Shared Data Routes */}
      <Route path="my-shares" element={<MySharesPage />} />
      <Route path="my-shares/create" element={<CreateSharePage />} />
      <Route path="public-shares" element={<PublicSharesPage />} />
      <Route path="shared-with-me" element={<SharedWithMePage />} />

      {/* Help & Support Routes */}
      <Route path="support">
        <Route path="help" element={<HelpCenter />} />
        <Route path="contact" element={<ContactSupport />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
      </Route>

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
        <Route
          path="calendar/:friendId"
          element={<PaymentMethodCalendarView />}
        />
        <Route path="reports" element={<PaymentMethodsReport />} />
        <Route path="reports/:friendId" element={<PaymentMethodsReport />} />
        <Route path="create" element={<CreatePaymentMethod />} />
        <Route path="create/:friendId" element={<CreatePaymentMethod />} />
        <Route path="edit/:id" element={<EditPaymentMethod />} />
        <Route
          path="edit/:id/friend/:friendId"
          element={<EditPaymentMethod />}
        />
        <Route
          path="view/:paymentMethodId"
          element={<PaymentMethodAnalyticsView />}
        />
        <Route
          path="view/:paymentMethodId/friend/:friendId"
          element={<PaymentMethodAnalyticsView />}
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
        <Route path="edit-by-expense/:expenseId" element={<EditBill />} />
        <Route
          path="edit-by-expense/:expenseId/friend/:friendId"
          element={<EditBill />}
        />
        <Route path="calendar" element={<BillCalendarView />} />
        <Route path="calendar/:friendId" element={<BillCalendarView />} />
      </Route>

      {/* Utilities & Upload Routes */}
      <Route path="utilities" element={<Utilities />} />
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
        <Route path="view/:id" element={<ViewExpense />} />
        <Route path="view/:id/friend/:friendId" element={<ViewExpense />} />
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
        <Route path="view/:categoryId" element={<CategoryAnalyticsView />} />
        <Route
          path="view/:categoryId/friend/:friendId"
          element={<CategoryAnalyticsView />}
        />
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
        <Route path="stories" element={<AdminStoryManagement />} />
        <Route path="stories/create" element={<CreateStory />} />
        <Route path="stories/edit/:id" element={<EditStory />} />
      </Route>
    </Route>

    {/* Full-screen Chat Route - Outside Home layout for 100vw/100vh */}
    <Route path="/friend-chat" element={<FriendChat />} />

    {/* 404 Not Found - Catch all undefined routes (outside Home layout) */}
    <Route path="*" element={<NotFound />} />
  </>
);
