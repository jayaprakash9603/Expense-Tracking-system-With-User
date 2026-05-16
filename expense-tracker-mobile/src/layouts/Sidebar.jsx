import React, { useTransition } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSelector } from "react-redux";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useLayout } from "@/shared/hooks/layout/useLayout";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/config/app/constants";
import { getSidebarItems, NAV_GROUPS, isActiveRoute } from "@/app/routing/routeCatalog";
import { SidebarProfileFooter } from "@/layouts/SidebarProfileFooter";
import { getActiveJwt } from "@/shared/utils/authStorage";
import { preloadRouteOnInteraction } from "@/app/routing/routePreloader";
import { cn } from "@/lib/utils";

function groupSidebarItems(currentMode = "USER") {
  const items = getSidebarItems(currentMode);
  const groups = {};
  items.forEach((item) => {
    if (!groups[item.navGroup]) groups[item.navGroup] = [];
    groups[item.navGroup].push(item);
  });
  return Object.entries(NAV_GROUPS)
    .filter(([key]) => {
      if (!groups[key]?.length) return false;
      if (currentMode === "ADMIN") return key === "admin";
      return key !== "admin";
    })
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, meta]) => ({ ...meta, items: groups[key] }));
}

function SidebarContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, startTransition] = useTransition();
  const { t } = useLanguage();
  const { sidebarCollapsed, toggleSidebar, isTablet } = useLayout();
  const user = useSelector((state) => state.auth?.user);
  const authLoading = useSelector((state) => state.auth?.loading);
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const sessionActive = Boolean(getActiveJwt());
  const profileLoading = sessionActive && !user && authLoading;
  const collapsed = isTablet || sidebarCollapsed;
  const navGroups = groupSidebarItems(currentMode);

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "flex items-center shrink-0 border-b border-border h-14 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <div className="flex items-center min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm text-primary-foreground font-black font-display">E</span>
          </div>
          <h2
            className={cn(
              "text-sm font-bold truncate transition-[opacity,max-width,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              collapsed ? "opacity-0 max-w-0 ml-0 overflow-hidden" : "opacity-100 max-w-[200px] ml-3",
            )}
          >
            {APP_NAME}
          </h2>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4 sidebar-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={group.key}>
            {!collapsed && (
              <div className="flex items-center justify-between px-3 mb-1.5">
                <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(group.labelKey)}
                </p>
                {idx === 0 && !isTablet && (
                  <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-accent transition-colors"
                    title={t("sidebar.collapse")}
                  >
                    <AppIcon icon={PanelLeftClose} color="soft" size="sm" />
                  </button>
                )}
              </div>
            )}
            {collapsed && idx === 0 && !isTablet && (
              <div className="flex justify-center mb-2">
                <button
                  onClick={toggleSidebar}
                  className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent transition-colors"
                  title={t("sidebar.expand")}
                >
                  <AppIcon icon={PanelLeftOpen} color="soft" size="sm" />
                </button>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActiveRoute(location.pathname, item.path);
                return (
                  <button
                    key={item.key}
                    onClick={() => startTransition(() => navigate(item.path))}
                    {...preloadRouteOnInteraction(item.path)}
                    className={cn(
                      "flex items-center gap-3 w-full rounded-lg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] tap-highlight-none",
                      collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                      active ? "bg-primary/10 font-medium" : "hover:bg-accent",
                    )}
                    title={collapsed ? t(item.titleKey) : undefined}
                  >
                    {item.navIcon && (
                      <AppIcon icon={item.navIcon} color={active ? "primary" : "soft"} size="md" />
                    )}
                    <span
                      className={cn(
                        "text-sm truncate transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                        collapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-[200px]",
                        active ? "icon-primary" : "text-muted-foreground",
                      )}
                    >
                      {t(item.titleKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-2 space-y-1.5">

        <Separator />

        <SidebarProfileFooter
          user={user}
          collapsed={collapsed}
          sessionActive={sessionActive}
          profileLoading={profileLoading}
        />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { showSidebar, sidebarWidth, isMobile } = useLayout();

  if (isMobile || !showSidebar) return null;

  return (
    <aside
      className="shrink-0 h-full bg-card border-r border-border transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
      style={{ width: sidebarWidth }}
    >
      <SidebarContent />
    </aside>
  );
}

export default Sidebar;
