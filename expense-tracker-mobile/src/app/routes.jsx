import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppShell } from "@/layouts/AppShell";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { PublicRoute } from "@/app/guards/PublicRoute";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
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

function LazyFallback() {
  return <LoadingSpinner size="lg" className="mt-20" />;
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/expenses" element={<Suspense fallback={<LazyFallback />}><ExpenseListPage /></Suspense>} />
          <Route path="/expenses/add" element={<Suspense fallback={<LazyFallback />}><ExpenseFormPage /></Suspense>} />
          <Route path="/expenses/edit/:id" element={<Suspense fallback={<LazyFallback />}><ExpenseFormPage /></Suspense>} />
          <Route path="/expenses/:id" element={<Suspense fallback={<LazyFallback />}><ExpenseDetailPage /></Suspense>} />

          <Route path="/budgets" element={<Suspense fallback={<LazyFallback />}><BudgetListPage /></Suspense>} />
          <Route path="/budgets/add" element={<Suspense fallback={<LazyFallback />}><BudgetFormPage /></Suspense>} />
          <Route path="/budgets/edit/:id" element={<Suspense fallback={<LazyFallback />}><BudgetFormPage /></Suspense>} />

          <Route path="/categories" element={<Suspense fallback={<LazyFallback />}><CategoryListPage /></Suspense>} />
          <Route path="/categories/add" element={<Suspense fallback={<LazyFallback />}><CategoryFormPage /></Suspense>} />
          <Route path="/categories/edit/:id" element={<Suspense fallback={<LazyFallback />}><CategoryFormPage /></Suspense>} />

          <Route path="/bills" element={<Suspense fallback={<LazyFallback />}><BillListPage /></Suspense>} />
          <Route path="/bills/add" element={<Suspense fallback={<LazyFallback />}><BillFormPage /></Suspense>} />
          <Route path="/bills/edit/:id" element={<Suspense fallback={<LazyFallback />}><BillFormPage /></Suspense>} />

          <Route path="/notifications" element={<Suspense fallback={<LazyFallback />}><NotificationListPage /></Suspense>} />

          <Route path="/friends" element={<PlaceholderPage title="Friends" />} />

          <Route path="/reports" element={<Suspense fallback={<LazyFallback />}><ReportsPage /></Suspense>} />
          <Route path="/reports/monthly" element={<Suspense fallback={<LazyFallback />}><MonthlyReportPage /></Suspense>} />
          <Route path="/reports/category" element={<Suspense fallback={<LazyFallback />}><CategoryReportPage /></Suspense>} />
          <Route path="/reports/payment" element={<Suspense fallback={<LazyFallback />}><PaymentReportPage /></Suspense>} />
          <Route path="/reports/trend" element={<Suspense fallback={<LazyFallback />}><TrendReportPage /></Suspense>} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
      <p className="text-lg">{title} — Coming Soon</p>
    </div>
  );
}

export default AppRoutes;
