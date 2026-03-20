import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MoreHorizontal, X, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { getBottomNavItems, getMoreMenuItems, isActiveRoute } from "@/app/routing/routeCatalog";
import { logoutAction } from "@/redux/auth/auth.actions";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const { t } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef(null);

  const primaryTabs = getBottomNavItems(currentMode);
  const moreItems = getMoreMenuItems(currentMode);
  const isMoreActive = moreItems.some((item) => isActiveRoute(location.pathname, item.path));

  if (!primaryTabs.length && !moreItems.length) {
    return null;
  }

  const handleNavigate = useCallback(
    (path) => {
      setMoreOpen(false);
      navigate(path);
    },
    [navigate],
  );

  const handleLogout = useCallback(() => {
    setMoreOpen(false);
    dispatch(logoutAction());
    navigate("/login");
  }, [dispatch, navigate]);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [moreOpen]);

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 bottom-sheet-overlay"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div
          ref={sheetRef}
          className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl bottom-sheet-panel safe-bottom"
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="text-sm font-semibold">{t("navigation.more")}</h3>
            <button
              onClick={() => setMoreOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent tap-highlight-none"
            >
              <AppIcon icon={X} color="soft" size="sm" />
            </button>
          </div>

          <div className="w-12 h-1 rounded-full bg-border mx-auto mb-3" />

          <div className="grid grid-cols-4 gap-1 px-4 pb-3">
            {moreItems.map((item) => {
              const active = isActiveRoute(location.pathname, item.path);
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-colors tap-highlight-none",
                    active ? "bg-primary/10" : "hover:bg-accent active:bg-accent",
                  )}
                >
                  {item.navIcon && (
                    <AppIcon icon={item.navIcon} color={active ? "primary" : "soft"} size="md" />
                  )}
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-tight text-center",
                      active ? "icon-primary" : "text-muted-foreground",
                    )}
                  >
                    {t(item.titleKey)}
                  </span>
                </button>
              );
            })}
          </div>

          <Separator />

          <div className="px-4 py-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 hover:bg-destructive/10 transition-colors tap-highlight-none"
            >
              <AppIcon icon={LogOut} color="error" size="sm" />
              <span className="text-sm text-destructive font-medium">{t("settings.logout")}</span>
            </button>
          </div>
        </div>
      )}

      <nav className="shrink-0 border-t border-border bg-card safe-bottom">
        <div className="flex h-[60px] items-stretch justify-around px-1">
          {primaryTabs.map((item) => (
            <BottomTab
              key={item.key}
              item={item}
              labelKey={item.bottomTitleKey || item.titleKey}
              active={isActiveRoute(location.pathname, item.path)}
              onPress={() => handleNavigate(item.path)}
              t={t}
            />
          ))}
          <MoreTab
            active={isMoreActive || moreOpen}
            onPress={() => setMoreOpen((prev) => !prev)}
            t={t}
          />
        </div>
      </nav>
    </>
  );
}

function BottomTab({ item, labelKey, active, onPress, t }) {
  return (
    <button
      onClick={onPress}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 flex-1 tap-highlight-none transition-colors",
        active ? "icon-primary" : "icon-muted",
      )}
    >
      {active && (
        <span className="absolute top-1.5 inset-x-0 mx-auto w-6 h-[2.5px] rounded-full bg-primary" />
      )}
      <span className={active ? "tab-icon-active" : ""}>
        {item.navIcon && <AppIcon icon={item.navIcon} color="inherit" size="md" />}
      </span>
      <span
        className={cn(
          "text-[10px] font-medium transition-colors",
          active ? "icon-primary" : "text-muted-foreground",
        )}
      >
        {t(labelKey)}
      </span>
    </button>
  );
}

function MoreTab({ active, onPress, t }) {
  return (
    <button
      onClick={onPress}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 flex-1 tap-highlight-none transition-colors",
        active ? "icon-primary" : "icon-muted",
      )}
    >
      {active && (
        <span className="absolute top-1.5 inset-x-0 mx-auto w-6 h-[2.5px] rounded-full bg-primary" />
      )}
      <span className={active ? "tab-icon-active" : ""}>
        <AppIcon icon={MoreHorizontal} color="inherit" size="md" />
      </span>
      <span
        className={cn(
          "text-[10px] font-medium transition-colors",
          active ? "icon-primary" : "text-muted-foreground",
        )}
      >
        {t("navigation.more")}
      </span>
    </button>
  );
}

export default BottomNavigation;
