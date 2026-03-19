import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomNavigation } from "./BottomNavigation";
import { Sidebar } from "./Sidebar";
import { useLayout } from "@/shared/hooks/useLayout";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { getRouteTitleKey } from "@/app/routing/routeCatalog";

export function AppShell() {
  const location = useLocation();
  const { t } = useLanguage();
  const { showBottomNav } = useLayout();

  const titleKey = getRouteTitleKey(location.pathname);

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
