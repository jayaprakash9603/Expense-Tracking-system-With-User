import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Bell } from "lucide-react";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { AppBreadcrumb } from "@/shared/components/navigation/AppBreadcrumb";
import { getBreadcrumbSegments } from "@/app/routing/breadcrumbResolver";
import { useLayout } from "@/shared/hooks/layout/useLayout";
import { ProfileDropdown } from "./ProfileDropdown";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function TopBar({ showBack = false, breadcrumbItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { isMinMd, isMinLg } = useLayout();
  const items = breadcrumbItems ?? getBreadcrumbSegments(location.pathname);

  const handleOpenUniversalSearch = () => {
    window.dispatchEvent(new Event("open-universal-search"));
  };

  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card safe-top",
        isMinLg ? "h-14 px-6 xl:px-8" : isMinMd ? "h-13 px-5" : "h-12 px-4",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-accent tap-highlight-none"
          >
            <AppIcon icon={ArrowLeft} color="foreground" size="md" />
          </button>
        )}
        <AppBreadcrumb items={items} className="text-xs sm:text-sm" />
      </div>

      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        <button
          type="button"
          onClick={handleOpenUniversalSearch}
          className={cn(
            "flex items-center justify-center rounded-full hover:bg-accent tap-highlight-none",
            isMinLg ? "h-9 min-w-[6.875rem] px-3" : "h-9 w-9",
          )}
          aria-label={t("common.aria.openSearch")}
        >
          <AppIcon icon={Search} color="soft" size="sm" />
          {isMinLg ? (
            <span className="ml-2 text-xs text-muted-foreground">{t("common.searchShortcut")}</span>
          ) : null}
        </button>

        {isMinMd && (
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent tap-highlight-none"
          >
            <AppIcon icon={Bell} color="soft" size="sm" />
          </button>
        )}

        <ProfileDropdown />
      </div>
    </header>
  );
}

export default TopBar;
