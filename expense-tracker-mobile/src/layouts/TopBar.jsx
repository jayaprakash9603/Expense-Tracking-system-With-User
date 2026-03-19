import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Bell } from "lucide-react";
import { AppIcon } from "@/shared/components/AppIcon";
import { useLayout } from "@/shared/hooks/useLayout";
import { ProfileDropdown } from "./ProfileDropdown";
import { cn } from "@/lib/utils";

export function TopBar({ title, showBack = false }) {
  const navigate = useNavigate();
  const { isMinMd, isMinLg } = useLayout();

  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between border-b border-border bg-card safe-top",
        isMinLg ? "h-14 px-6 xl:px-8" : isMinMd ? "h-13 px-5" : "h-12 px-4"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent tap-highlight-none"
          >
            <AppIcon icon={ArrowLeft} color="foreground" size="md" />
          </button>
        )}

        <h1
          className={cn(
            "font-semibold truncate",
            isMinLg ? "text-lg" : "text-base"
          )}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {isMinLg && (
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent tap-highlight-none">
            <AppIcon icon={Search} color="soft" size="sm" />
          </button>
        )}

        {isMinMd && (
          <button
            onClick={() => navigate("/notifications")}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent tap-highlight-none relative"
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
