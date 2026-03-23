import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppShell } from "@/layouts/AppShell";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { PublicRoute } from "@/app/guards/PublicRoute";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { FlowPageRouteSkeleton } from "@/shared/components/flow/skeletons";
import { ROUTE_CATALOG } from "@/app/routing/routeCatalog";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import OtpVerificationPage from "@/features/auth/pages/OtpVerificationPage";

const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));
const NewExpensePage = lazy(() => import("@/features/expenses/pages/NewExpense"));
const EditExpensePage = lazy(() => import("@/features/expenses/pages/EditExpense"));
const ExpenseDetailPage = lazy(() => import("@/features/expenses/pages/ExpenseDetailPage"));
const BudgetListPage = lazy(() => import("@/features/budgets/pages/BudgetListPage"));
const NewBudgetPage = lazy(() => import("@/features/budgets/pages/NewBudget"));
const EditBudgetPage = lazy(() => import("@/features/budgets/pages/EditBudget"));
const CategoryFormPage = lazy(() => import("@/features/categories/pages/CategoryFormPage"));
const PaymentMethodFormPage = lazy(
  () => import("@/features/payment-methods/pages/PaymentMethodFormPage"),
);
const BillListPage = lazy(() => import("@/features/bills/pages/BillListPage"));
const NewBillPage = lazy(() => import("@/features/bills/pages/NewBill"));
const EditBillPage = lazy(() => import("@/features/bills/pages/EditBill"));
const NotificationListPage = lazy(
  () => import("@/features/notifications/pages/NotificationListPage"),
);
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage"));
const MonthlyReportPage = lazy(() => import("@/features/reports/pages/MonthlyReportPage"));
const CategoryReportPage = lazy(() => import("@/features/reports/pages/CategoryReportPage"));
const PaymentReportPage = lazy(() => import("@/features/reports/pages/PaymentReportPage"));
const TrendReportPage = lazy(() => import("@/features/reports/pages/TrendReportPage"));
const OverviewPage = lazy(() => import("@/features/analytics/pages/OverviewPage"));
const CashflowPage = lazy(() => import("@/features/expenses/pages/CashflowPage"));
const ExpenseReportsPage = lazy(() => import("@/features/expenses/pages/ExpenseReportsPage"));
const CategoryFlowPage = lazy(() => import("@/features/categories/pages/CategoryFlowPage"));
const PaymentMethodFlowPage = lazy(
  () => import("@/features/payment-methods/pages/PaymentMethodFlowPage"),
);
const RoutePlaceholderPage = lazy(() => import("@/features/system/pages/RoutePlaceholderPage"));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));
const AdminDashboardPage = lazy(() => import("@/features/system/admin/pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/features/system/admin/pages/AdminUsersPage"));
const AdminRolesPage = lazy(() => import("@/features/system/admin/pages/AdminRolesPage"));
const AdminAnalyticsPage = lazy(() => import("@/features/system/admin/pages/AdminAnalyticsPage"));
const AdminAuditPage = lazy(() => import("@/features/system/admin/pages/AdminAuditPage"));
const AdminReportsPage = lazy(() => import("@/features/system/admin/pages/AdminReportsPage"));
const AdminSettingsPage = lazy(() => import("@/features/system/admin/pages/AdminSettingsPage"));
const AdminStoriesPage = lazy(() => import("@/features/system/admin/pages/AdminStoriesPage"));
const NotFoundPage = lazy(() => import("@/features/errors/pages/NotFoundPage"));

const IMPLEMENTED_PAGES = {
  dashboard: DashboardPage,
  settings: SettingsPage,
  expenses: CashflowPage,
  "expenses-add": NewExpensePage,
  "expenses-edit": EditExpensePage,
  "expenses-detail": ExpenseDetailPage,
  "expenses-reports": ExpenseReportsPage,
  budgets: BudgetListPage,
  "budgets-add": NewBudgetPage,
  "budgets-edit": EditBudgetPage,
  categories: CategoryFlowPage,
  "categories-add": CategoryFormPage,
  "categories-edit": CategoryFormPage,
  bills: BillListPage,
  "bills-add": NewBillPage,
  "bills-edit": EditBillPage,
  notifications: NotificationListPage,
  reports: ReportsPage,
  "reports-monthly": MonthlyReportPage,
  "reports-category": CategoryReportPage,
  "reports-payment": PaymentReportPage,
  "reports-trend": TrendReportPage,
  profile: ProfilePage,
  analytics: OverviewPage,
  cashflow: CashflowPage,
  "category-flow": CategoryFlowPage,
  payments: PaymentMethodFlowPage,
  "payments-create": PaymentMethodFormPage,
  "payments-edit": PaymentMethodFormPage,
  "admin-dashboard": AdminDashboardPage,
  "admin-users": AdminUsersPage,
  "admin-roles": AdminRolesPage,
  "admin-analytics": AdminAnalyticsPage,
  "admin-audit": AdminAuditPage,
  "admin-reports": AdminReportsPage,
  "admin-settings": AdminSettingsPage,
  "admin-stories": AdminStoriesPage,
  "not-found": NotFoundPage,
};

function LazyFallback() {
  return <LoadingSpinner size="lg" className="mt-20" />;
}

function resolveLazyFallback(routeKey) {
  if (routeKey === "expenses" || routeKey === "cashflow" || routeKey === "expenses-reports") {
    return <FlowPageRouteSkeleton variant="expense" />;
  }
  if (routeKey === "categories" || routeKey === "category-flow" || routeKey === "payments") {
    return <FlowPageRouteSkeleton variant="entity" />;
  }
  return <LazyFallback />;
}

function LazyWrap({ routeKey, Component }) {
  return (
    <Suspense fallback={resolveLazyFallback(routeKey)}>
      <Component />
    </Suspense>
  );
}

function buildProtectedRoutes() {
  return ROUTE_CATALOG.filter((r) => r.guard === "protected" || r.guard === "admin")
    .map((route) => {
      if (route.elementMode === "redirect" && route.redirectTo) {
        return (
          <Route
            key={route.key}
            path={route.path}
            element={<Navigate to={route.redirectTo} replace />}
          />
        );
      }

      const PageComponent = IMPLEMENTED_PAGES[route.key];

      if (route.elementMode === "implemented" && PageComponent) {
        return (
          <Route
            key={route.key}
            path={route.path}
            element={<LazyWrap routeKey={route.key} Component={PageComponent} />}
          />
        );
      }

      return (
        <Route
          key={route.key}
          path={route.path}
          element={<LazyWrap Component={RoutePlaceholderPage} />}
        />
      );
    })
    .concat([
      <Route key="fallback-not-found" path="*" element={<Navigate to="/not-found" replace />} />,
    ]);
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/otp-verification" element={<OtpVerificationPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>{buildProtectedRoutes()}</Route>
      </Route>

      <Route
        path="/share/:token"
        element={
          <Suspense fallback={<LazyFallback />}>
            <RoutePlaceholderPage />
          </Suspense>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}

export default AppRoutes;
