import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppShell } from "@/layouts/AppShell";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { PublicRoute } from "@/app/guards/PublicRoute";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ROUTE_CATALOG } from "@/app/routing/routeCatalog";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import OtpVerificationPage from "@/features/auth/pages/OtpVerificationPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";

const ExpenseListPage = lazy(() => import("@/features/expenses/pages/ExpenseListPage"));
const ExpenseFormPage = lazy(() => import("@/features/expenses/pages/ExpenseFormPage"));
const ExpenseDetailPage = lazy(() => import("@/features/expenses/pages/ExpenseDetailPage"));
const BudgetListPage = lazy(() => import("@/features/budgets/pages/BudgetListPage"));
const BudgetFormPage = lazy(() => import("@/features/budgets/pages/BudgetFormPage"));
const CategoryListPage = lazy(() => import("@/features/categories/pages/CategoryListPage"));
const CategoryFormPage = lazy(() => import("@/features/categories/pages/CategoryFormPage"));
const BillListPage = lazy(() => import("@/features/bills/pages/BillListPage"));
const BillFormPage = lazy(() => import("@/features/bills/pages/BillFormPage"));
const NotificationListPage = lazy(() => import("@/features/notifications/pages/NotificationListPage"));
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage"));
const MonthlyReportPage = lazy(() => import("@/features/reports/pages/MonthlyReportPage"));
const CategoryReportPage = lazy(() => import("@/features/reports/pages/CategoryReportPage"));
const PaymentReportPage = lazy(() => import("@/features/reports/pages/PaymentReportPage"));
const TrendReportPage = lazy(() => import("@/features/reports/pages/TrendReportPage"));
const OverviewPage = lazy(() => import("@/features/analytics/pages/OverviewPage"));
const RoutePlaceholderPage = lazy(() => import("@/features/system/pages/RoutePlaceholderPage"));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));

const IMPLEMENTED_PAGES = {
  "dashboard": DashboardPage,
  "settings": SettingsPage,
  "expenses": ExpenseListPage,
  "expenses-add": ExpenseFormPage,
  "expenses-edit": ExpenseFormPage,
  "expenses-detail": ExpenseDetailPage,
  "budgets": BudgetListPage,
  "budgets-add": BudgetFormPage,
  "budgets-edit": BudgetFormPage,
  "categories": CategoryListPage,
  "categories-add": CategoryFormPage,
  "categories-edit": CategoryFormPage,
  "bills": BillListPage,
  "bills-add": BillFormPage,
  "bills-edit": BillFormPage,
  "notifications": NotificationListPage,
  "reports": ReportsPage,
  "reports-monthly": MonthlyReportPage,
  "reports-category": CategoryReportPage,
  "reports-payment": PaymentReportPage,
  "reports-trend": TrendReportPage,
  "profile": ProfilePage,
  "analytics": OverviewPage,
};

function LazyFallback() {
  return <LoadingSpinner size="lg" className="mt-20" />;
}

function LazyWrap({ Component }) {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Component />
    </Suspense>
  );
}

function buildProtectedRoutes() {
  return ROUTE_CATALOG
    .filter((r) => r.guard === "protected" || r.guard === "admin")
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
        const isEager = route.key === "dashboard" || route.key === "settings";
        return (
          <Route
            key={route.key}
            path={route.path}
            element={isEager ? <PageComponent /> : <LazyWrap Component={PageComponent} />}
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
    });
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
        <Route element={<AppShell />}>
          {buildProtectedRoutes()}
        </Route>
      </Route>

      <Route
        path="/share/:token"
        element={<Suspense fallback={<LazyFallback />}><RoutePlaceholderPage /></Suspense>}
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
