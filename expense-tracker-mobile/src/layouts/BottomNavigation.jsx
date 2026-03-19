import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Receipt, Plus, Wallet, Settings } from "lucide-react";
import { AppIcon } from "@/shared/components/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", icon: Home, labelKey: "navigation.home" },
  { path: "/expenses", icon: Receipt, labelKey: "navigation.expenses" },
  { path: "/add", icon: Plus, labelKey: "navigation.addNew", isCenter: true },
  { path: "/budget", icon: Wallet, labelKey: "navigation.budget" },
  { path: "/settings", icon: Settings, labelKey: "navigation.settings" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="shrink-0 border-t border-border bg-card safe-bottom">
      <div className="flex h-16 items-end justify-around px-2 pb-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center -mt-4 tap-highlight-none"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <AppIcon icon={item.icon} color="inherit" size="lg" />
                </div>
                <span className="mt-0.5 text-[10px] icon-primary font-medium">
                  {t(item.labelKey)}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-3 tap-highlight-none",
                isActive ? "icon-primary" : "icon-muted"
              )}
            >
              <AppIcon icon={item.icon} color="inherit" size="md" />
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
