import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useLayout } from "@/shared/hooks/useLayout";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/config/constants";
import { getSidebarItems, NAV_GROUPS, isActiveRoute } from "@/app/routing/routeCatalog";
import { SidebarProfileFooter } from "@/layouts/SidebarProfileFooter";
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
  const { t } = useLanguage();
  const { sidebarCollapsed, toggleSidebar, isTablet } = useLayout();
  const user = useSelector((state) => state.auth?.user);
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const collapsed = isTablet || sidebarCollapsed;
  const navGroups = groupSidebarItems(currentMode);

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "flex items-center shrink-0 border-b border-border h-14",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        {collapsed ? (
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm text-primary-foreground font-black font-display">E</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-sm text-primary-foreground font-black font-display">E</span>
            </div>
            <h2 className="text-sm font-bold truncate">{APP_NAME}</h2>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4 sidebar-scrollbar">
        {navGroups.map((group) => (
          <div key={group.key}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t(group.labelKey)}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActiveRoute(location.pathname, item.path);
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex items-center gap-3 w-full rounded-lg transition-colors tap-highlight-none",
                      collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                      active ? "bg-primary/10 font-medium" : "hover:bg-accent",
                    )}
                    title={collapsed ? t(item.titleKey) : undefined}
                  >
                    {item.navIcon && (
                      <AppIcon icon={item.navIcon} color={active ? "primary" : "soft"} size="md" />
                    )}
                    {!collapsed && (
                      <span
                        className={cn(
                          "text-sm truncate",
                          active ? "icon-primary" : "text-muted-foreground",
                        )}
                      >
                        {t(item.titleKey)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-2 space-y-1.5">
        {!isTablet && (
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-accent transition-colors"
            title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          >
            {collapsed ? (
              <AppIcon icon={ChevronRight} color="soft" size="sm" className="mx-auto" />
            ) : (
              <>
                <AppIcon icon={ChevronLeft} color="soft" size="sm" />
                <span className="text-sm text-muted-foreground">{t("sidebar.collapse")}</span>
              </>
            )}
          </button>
        )}

        <Separator />

        <SidebarProfileFooter user={user} collapsed={collapsed} />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { showSidebar, sidebarWidth, isMobile } = useLayout();

  if (isMobile || !showSidebar) return null;

  return (
    <aside
      className="shrink-0 h-full bg-card border-r border-border transition-[width] duration-200 overflow-hidden"
      style={{ width: sidebarWidth }}
    >
      <SidebarContent />
    </aside>
  );
}

export default Sidebar;
