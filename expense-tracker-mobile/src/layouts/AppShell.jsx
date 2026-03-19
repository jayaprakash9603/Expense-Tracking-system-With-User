import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomNavigation } from "./BottomNavigation";
import { Sidebar } from "./Sidebar";
import { useLayout } from "@/shared/hooks/useLayout";
import { useLanguage } from "@/shared/hooks/useLanguage";

const ROUTE_TITLES = {
  "/dashboard": "dashboard.title",
  "/expenses": "navigation.expenses",
  "/expenses/add": "expenses.addTitle",
  "/budgets": "navigation.budget",
  "/budgets/add": "budgets.addTitle",
  "/categories": "navigation.categories",
  "/categories/add": "categories.addTitle",
  "/bills": "navigation.bills",
  "/bills/add": "bills.addTitle",
  "/notifications": "navigation.notifications",
  "/friends": "navigation.friends",
  "/reports": "navigation.reports",
  "/settings": "settings.title",
  "/add": "navigation.addNew",
};

export function AppShell() {
  const location = useLocation();
  const { t } = useLanguage();
  const { showSidebar, showBottomNav } = useLayout();

  const titleKey = ROUTE_TITLES[location.pathname]
    || (location.pathname.includes("/edit/") && "common.edit")
    || "dashboard.title";

  return (
    <div className="app-shell">
      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar title={t(titleKey)} />
          <main className="flex-1 overflow-y-auto no-scrollbar bg-background">
            <Outlet />
          </main>
          {showBottomNav && <BottomNavigation />}
        </div>
      </div>
    </div>
  );
}

export default AppShell;
