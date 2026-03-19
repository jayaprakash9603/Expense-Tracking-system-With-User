import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Receipt,
  Plus,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useLayout } from "@/shared/hooks/useLayout";
import { AppIcon } from "@/shared/components/AppIcon";
import { UserAvatar } from "@/shared/components/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, SIDEBAR_WIDTH } from "@/config/constants";
import { logoutAction } from "@/redux/auth/auth.actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", icon: Home, labelKey: "navigation.home" },
  { path: "/expenses", icon: Receipt, labelKey: "navigation.expenses" },
  { path: "/add", icon: Plus, labelKey: "navigation.addNew" },
  { path: "/budget", icon: Wallet, labelKey: "navigation.budget" },
  { path: "/settings", icon: Settings, labelKey: "navigation.settings" },
];

function SidebarContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { sidebarCollapsed, toggleSidebar, isTablet } = useLayout();
  const user = useSelector((state) => state.auth?.user);
  const collapsed = isTablet || sidebarCollapsed;

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center shrink-0 border-b border-border h-14", collapsed ? "justify-center px-2" : "px-4")}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm text-primary-foreground font-black font-display">E</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-sm text-primary-foreground font-black font-display">E</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">{APP_NAME}</h2>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg transition-colors tap-highlight-none",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                isActive
                  ? "bg-primary/10 font-medium"
                  : "hover:bg-accent"
              )}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <AppIcon icon={item.icon} color={isActive ? "primary" : "soft"} size="md" />
              {!collapsed && (
                <span className={cn("text-sm truncate", isActive ? "icon-primary" : "text-muted-foreground")}>
                  {t(item.labelKey)}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-2 space-y-2">
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

        <div className={cn("flex items-center", collapsed ? "justify-center py-1" : "gap-3 px-2 py-1")}>
          <UserAvatar size="sm" showName={!collapsed} />
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full rounded-lg py-2 hover:bg-destructive/10 transition-colors",
            collapsed ? "justify-center px-2" : "px-3"
          )}
          title={collapsed ? t("settings.logout") : undefined}
        >
          <AppIcon icon={LogOut} color="error" size="sm" />
          {!collapsed && <span className="text-sm text-destructive">{t("settings.logout")}</span>}
        </button>
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
