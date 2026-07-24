import { Route, Navigate } from "react-router-dom";
import Authentication from "../pages/Authentication/Authentication";
import OAuthCallback from "../pages/OAuthCallback";
import Home from "../shared/layout/HomeShell";
import FeatureRoute from "./FeatureRoute";
import { FEATURE_KEYS, SUB_FEATURE_KEYS } from "../config/featureCatalog";
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
    <Route
      path="/share/:token"
      element={
        <FeatureRoute feature={SUB_FEATURE_KEYS.SHARING_SHARED_WITH_ME}>
          <SharedViewPage />
        </FeatureRoute>
      }
    />
    <Route path="/oauth/callback" element={<OAuthCallback />} />
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
    <Route
      path="/share/:token"
      element={
        <FeatureRoute feature={SUB_FEATURE_KEYS.SHARING_SHARED_WITH_ME}>
          <SharedViewPage />
        </FeatureRoute>
      }
    />

    <Route path="/" element={<Home />}>
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="/chats" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CHAT_MESSAGING} />}>
        <Route index element={<ChatPage />} />
      </Route>
      <Route
        path="/component1"
        element={<FeatureRoute feature={FEATURE_KEYS.ADMIN} />}
      >
        <Route index element={<AdminDashboard />} />
      </Route>
      <Route
        path="/component2"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.INVESTMENT_DASHBOARD} />}
      >
        <Route index element={<InvestmentDashboard />} />
      </Route>
      <Route path="dashboard" element={<ExpenseDashboard />} />

      {/* Group Routes */}
      <Route path="groups" element={<FeatureRoute feature={FEATURE_KEYS.GROUPS} />}>
        <Route index element={<Groups />} />
        <Route path="create" element={<FeatureRoute feature={SUB_FEATURE_KEYS.GROUPS_CREATE}><CreateGroup /></FeatureRoute>} />
        <Route path=":id" element={<FeatureRoute feature={SUB_FEATURE_KEYS.GROUPS_VIEW}><GroupDetail /></FeatureRoute>} />
      </Route>

      {/* Profile & Settings Routes */}
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
      <Route
        path="settings/notifications"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.NOTIFICATIONS_PREFERENCES} />}
      >
        <Route index element={<NotificationSettings />} />
      </Route>
      <Route path="settings/mfa" element={<FeatureRoute feature={SUB_FEATURE_KEYS.AUTH_MFA}><MfaSetup /></FeatureRoute>} />

      {/* Shared Data Routes */}
      <Route
        path="my-shares"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.SHARING_MY_SHARES} />}
      >
        <Route index element={<MySharesPage />} />
        <Route path="create" element={<FeatureRoute feature={SUB_FEATURE_KEYS.SHARING_CREATE}><CreateSharePage /></FeatureRoute>} />
      </Route>
      <Route
        path="public-shares"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.SHARING_PUBLIC} />}
      >
        <Route index element={<PublicSharesPage />} />
      </Route>
      <Route
        path="shared-with-me"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.SHARING_SHARED_WITH_ME} />}
      >
        <Route index element={<SharedWithMePage />} />
      </Route>

      {/* Help & Support Routes */}
      <Route
        path="support"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.HELP_SUPPORT_SUPPORT} />}
      >
        <Route path="help" element={<HelpCenter />} />
        <Route path="contact" element={<ContactSupport />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
      </Route>

      {/* Friends Routes */}
      <Route path="friends" element={<FeatureRoute feature={FEATURE_KEYS.FRIENDS} />}>
        <Route index element={<Friends />} />
        <Route
          path="report"
          element={
            <FeatureRoute feature={SUB_FEATURE_KEYS.FRIENDS_REPORTS}>
              <FriendshipReport />
            </FeatureRoute>
          }
        />
        <Route
          path="activity"
          element={
            <FeatureRoute feature={SUB_FEATURE_KEYS.FRIENDS_ACTIVITY}>
              <FriendActivityPage />
            </FeatureRoute>
          }
        />
        <Route
          path="expenses/:friendId"
          element={
            <FeatureRoute feature={SUB_FEATURE_KEYS.FRIENDS_CHAT}>
              <Cashflow />
            </FeatureRoute>
          }
        />
      </Route>

      {/* Payment Method Routes */}
      <Route
        path="payment-method"
        element={<FeatureRoute feature={FEATURE_KEYS.PAYMENT_METHODS} />}
      >
        <Route index element={<PaymentMethodFlow />} />
        <Route path=":friendId" element={<PaymentMethodFlow />} />
        <Route path="calendar" element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_CALENDAR}><PaymentMethodCalendarView /></FeatureRoute>} />
        <Route
          path="calendar/:friendId"
          element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_CALENDAR}><PaymentMethodCalendarView /></FeatureRoute>}
        />
        <Route path="reports" element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_REPORTS}><PaymentMethodsReport /></FeatureRoute>} />
        <Route path="reports/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_REPORTS}><PaymentMethodsReport /></FeatureRoute>} />
        <Route path="create" element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_CREATE}><CreatePaymentMethod /></FeatureRoute>} />
        <Route path="create/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_CREATE}><CreatePaymentMethod /></FeatureRoute>} />
        <Route path="edit/:id" element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_EDIT}><EditPaymentMethod /></FeatureRoute>} />
        <Route
          path="edit/:id/friend/:friendId"
          element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_EDIT}><EditPaymentMethod /></FeatureRoute>}
        />
        <Route
          path="view/:paymentMethodId"
          element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_ANALYTICS}><PaymentMethodAnalyticsView /></FeatureRoute>}
        />
        <Route
          path="view/:paymentMethodId/friend/:friendId"
          element={<FeatureRoute feature={SUB_FEATURE_KEYS.PAYMENT_METHODS_ANALYTICS}><PaymentMethodAnalyticsView /></FeatureRoute>}
        />
      </Route>

      {/* Bill Routes */}
      <Route path="bill" element={<FeatureRoute feature={FEATURE_KEYS.BILLS} />}>
        <Route index element={<Bill />} />
        <Route path=":friendId" element={<Bill />} />
        <Route path="report" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_REPORTS}><BillReport /></FeatureRoute>} />
        <Route path="report/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_REPORTS}><BillReport /></FeatureRoute>} />
        <Route path="upload" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_UPLOAD}><UploadBills /></FeatureRoute>} />
        <Route path="upload/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_UPLOAD}><UploadBills /></FeatureRoute>} />
        <Route path="create" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_CREATE}><CreateBill /></FeatureRoute>} />
        <Route path="create/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_CREATE}><CreateBill /></FeatureRoute>} />
        <Route path="edit/:id" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_EDIT}><EditBill /></FeatureRoute>} />
        <Route path="edit/:id/friend/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_EDIT}><EditBill /></FeatureRoute>} />
        <Route path="edit-by-expense/:expenseId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_EDIT}><EditBill /></FeatureRoute>} />
        <Route
          path="edit-by-expense/:expenseId/friend/:friendId"
          element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_EDIT}><EditBill /></FeatureRoute>}
        />
        <Route path="calendar" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_CALENDAR}><BillCalendarView /></FeatureRoute>} />
        <Route path="calendar/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BILLS_CALENDAR}><BillCalendarView /></FeatureRoute>} />
      </Route>

      {/* Utilities & Upload Routes */}
      <Route
        path="utilities"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.UTILITIES_TOOLS} />}
      >
        <Route index element={<Utilities />} />
      </Route>
      <Route path="upload" element={<FeatureRoute feature={FEATURE_KEYS.UPLOAD} />}>
        <Route path="expenses" element={<Upload />} />
        <Route path="categories" element={<Upload />} />
        <Route path="categories/:friendId" element={<Upload />} />
        <Route path="payments" element={<Upload />} />
        <Route path="payments/:friendId" element={<Upload />} />
        <Route path="expenses/:friendId" element={<Upload />} />
      </Route>

      {/* Expense Routes */}
      <Route path="expenses" element={<FeatureRoute feature={FEATURE_KEYS.EXPENSES} />}>
        <Route index element={<Cashflow />} />
        <Route path="create" element={<FeatureRoute feature={SUB_FEATURE_KEYS.EXPENSES_CREATE}><NewExpense /></FeatureRoute>} />
        <Route path="create/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.EXPENSES_CREATE}><NewExpense /></FeatureRoute>} />
        <Route path="view/:id" element={<FeatureRoute feature={SUB_FEATURE_KEYS.EXPENSES_VIEW}><ViewExpense /></FeatureRoute>} />
        <Route path="view/:id/friend/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.EXPENSES_VIEW}><ViewExpense /></FeatureRoute>} />
        <Route path="edit/:id" element={<FeatureRoute feature={SUB_FEATURE_KEYS.EXPENSES_EDIT}><EditExpense /></FeatureRoute>} />
        <Route path="edit/:id/friend/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.EXPENSES_EDIT}><EditExpense /></FeatureRoute>} />
        <Route path="reports" element={<FeatureRoute feature={SUB_FEATURE_KEYS.EXPENSES_REPORTS}><CombinedExpenseReport /></FeatureRoute>} />
        <Route path="reports/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.EXPENSES_REPORTS}><CombinedExpenseReport /></FeatureRoute>} />
      </Route>

      {/* Category Routes */}
      <Route
        path="category-flow"
        element={<FeatureRoute feature={FEATURE_KEYS.CATEGORIES} />}
      >
        <Route index element={<CategoryFlow />} />
        <Route path=":friendId" element={<CategoryFlow />} />
        <Route path="calendar" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_CALENDAR}><CategoryCalendarView /></FeatureRoute>} />
        <Route path="calendar/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_CALENDAR}><CategoryCalendarView /></FeatureRoute>} />
        <Route path="create" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_CREATE}><CreateCategory /></FeatureRoute>} />
        <Route path="create/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_CREATE}><CreateCategory /></FeatureRoute>} />
        <Route path="reports" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_REPORTS}><CategoryReport /></FeatureRoute>} />
        <Route path="reports/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_REPORTS}><CategoryReport /></FeatureRoute>} />
        <Route path="edit/:id" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_EDIT}><EditCategory /></FeatureRoute>} />
        <Route path="edit/:id/friend/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_EDIT}><EditCategory /></FeatureRoute>} />
        <Route path="view/:categoryId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_VIEW}><CategoryAnalyticsView /></FeatureRoute>} />
        <Route
          path="view/:categoryId/friend/:friendId"
          element={<FeatureRoute feature={SUB_FEATURE_KEYS.CATEGORIES_VIEW}><CategoryAnalyticsView /></FeatureRoute>}
        />
      </Route>

      {/* Transaction & Insights Routes */}
      <Route
        path="transactions"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.REPORTS_TRANSACTIONS} />}
      >
        <Route index element={<TransactionsContent />} />
        <Route path=":friendId" element={<TransactionsContent />} />
      </Route>
      <Route path="history" element={<FeatureRoute feature={SUB_FEATURE_KEYS.EXPENSES_TRANSACTIONS} />}>
        <Route index element={<TransactionsContent />} />
        <Route path=":friendId" element={<TransactionsContent />} />
      </Route>
      <Route path="insights" element={<FeatureRoute feature={SUB_FEATURE_KEYS.REPORTS_CREDIT_DUE} />}>
        <Route index element={<CreditDueContent />} />
        <Route path=":friendId" element={<CreditDueContent />} />
      </Route>

      {/* Reports & Cashflow Routes */}
      <Route path="reports" element={<FeatureRoute feature={SUB_FEATURE_KEYS.REPORTS_OVERVIEW} />}>
        <Route index element={<Reports />} />
        <Route path=":friendId" element={<Reports />} />
      </Route>
      <Route path="cashflow" element={<FeatureRoute feature={FEATURE_KEYS.EXPENSES} />}>
        <Route index element={<ExpensesView />} />
        <Route path=":friendId" element={<ExpensesView />} />
      </Route>

      {/* Budget Routes */}
      <Route path="budget" element={<FeatureRoute feature={FEATURE_KEYS.BUDGETS} />}>
        <Route index element={<Budget />} />
        <Route path=":friendId" element={<Budget />} />
        <Route path="create" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BUDGETS_CREATE}><NewBudget /></FeatureRoute>} />
        <Route path="create/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BUDGETS_CREATE}><NewBudget /></FeatureRoute>} />
        <Route path="edit/:id" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BUDGETS_EDIT}><EditBudget /></FeatureRoute>} />
        <Route path="edit/:id/friend/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BUDGETS_EDIT}><EditBudget /></FeatureRoute>} />
        <Route path="reports" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BUDGETS_REPORTS}><AllBudgetsReport /></FeatureRoute>} />
        <Route path="reports/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BUDGETS_REPORTS}><AllBudgetsReport /></FeatureRoute>} />
        <Route path="report/:id" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BUDGETS_REPORTS}><BudgetReport /></FeatureRoute>} />
        <Route path="report/:id/friend/:friendId" element={<FeatureRoute feature={SUB_FEATURE_KEYS.BUDGETS_REPORTS}><BudgetReport /></FeatureRoute>} />
      </Route>

      {/* Detailed Budget Report Routes */}
      <Route
        path="budget-report/:budgetId"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.BUDGETS_REPORTS} />}
      >
        <Route index element={<BudgetReport />} />
        <Route path=":friendId" element={<BudgetReport />} />
      </Route>

      {/* Calendar Views */}
      <Route
        path="/calendar-view"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.CALENDAR_VIEW} />}
      >
        <Route index element={<CalendarView />} />
        <Route path=":friendId" element={<CalendarView />} />
      </Route>
      <Route path="/day-view" element={<FeatureRoute feature={SUB_FEATURE_KEYS.CALENDAR_DAY_VIEW} />}>
        <Route path=":date" element={<DayTransactionsView />} />
        <Route
          path=":date/friend/:friendId"
          element={<DayTransactionsView />}
        />
      </Route>
      <Route
        path="/bill-day-view"
        element={<FeatureRoute feature={SUB_FEATURE_KEYS.CALENDAR_BILL_DAY_VIEW} />}
      >
        <Route path=":date" element={<DayBillsView />} />
        <Route path=":date/friend/:friendId" element={<DayBillsView />} />
      </Route>

      {/* Admin Routes */}
      <Route path="admin" element={<FeatureRoute feature={FEATURE_KEYS.ADMIN} />}>
        <Route path="dashboard" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_DASHBOARD}><SystemAnalytics /></FeatureRoute>} />
        <Route path="users" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_USERS}><UserManagement /></FeatureRoute>} />
        <Route path="roles" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_ROLES}><RoleManagement /></FeatureRoute>} />
        <Route path="analytics" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_ANALYTICS}><SystemAnalytics /></FeatureRoute>} />
        <Route path="audit" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_AUDIT}><AuditLogsAdmin /></FeatureRoute>} />
        <Route path="reports" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_REPORTS}><ReportsAdmin /></FeatureRoute>} />
        <Route path="settings" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_SETTINGS}><AdminSettings /></FeatureRoute>} />
        <Route path="stories" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_STORIES} />}>
          <Route index element={<AdminStoryManagement />} />
          <Route path="create" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_CREATE}><CreateStory /></FeatureRoute>} />
          <Route path="edit/:id" element={<FeatureRoute feature={SUB_FEATURE_KEYS.ADMIN_EDIT}><EditStory /></FeatureRoute>} />
        </Route>
      </Route>
    </Route>

    {/* Full-screen Chat Route - Outside Home layout for 100vw/100vh */}
    <Route
      path="/friend-chat"
      element={<FeatureRoute feature={SUB_FEATURE_KEYS.FRIENDS_CHAT} />}
    >
      <Route index element={<FriendChat />} />
    </Route>

    <Route path="/oauth/callback" element={<OAuthCallback />} />

    {/* 404 Not Found - Catch all undefined routes (outside Home layout) */}
    <Route path="*" element={<NotFound />} />
  </>
);
