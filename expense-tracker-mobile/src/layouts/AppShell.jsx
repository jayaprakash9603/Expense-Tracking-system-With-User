import React from "react";
import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomNavigation } from "./BottomNavigation";
import { Sidebar } from "./Sidebar";
import { useLayout } from "@/shared/hooks/useLayout";
import { useAppInitialization } from "@/shared/hooks/app/useAppInitialization";
import { getActiveJwt } from "@/shared/utils/authStorage";
import { UniversalSearchHost } from "@/app/search";

export function AppShell() {
  const { showBottomNav } = useLayout();
  useAppInitialization(getActiveJwt());

  return (
    <div className="app-shell">
      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <UniversalSearchHost />
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
