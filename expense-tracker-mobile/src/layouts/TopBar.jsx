import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Bell, User } from "lucide-react";
import { AppIcon } from "@/shared/components/AppIcon";
import { useLayout } from "@/shared/hooks/useLayout";
import { cn } from "@/lib/utils";

export function TopBar({ title, showBack = false }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const { isMinMd, isMinLg, showSidebar } = useLayout();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : null;

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
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent tap-highlight-none relative">
            <AppIcon icon={Bell} color="soft" size="sm" />
          </button>
        )}

        {!showSidebar && (
          <button
            onClick={() => navigate("/settings")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold tap-highlight-none",
              !initials && "bg-muted icon-muted"
            )}
          >
            {initials || <AppIcon icon={User} color="inherit" size="sm" />}
          </button>
        )}
      </div>
    </header>
  );
}

export default TopBar;
