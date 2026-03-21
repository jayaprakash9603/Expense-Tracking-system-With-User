import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";
import { UserAvatar } from "@/shared/components/user/UserAvatar";
import { SidebarAccountMenu } from "@/layouts/SidebarAccountMenu";
import { SidebarProfileFooterSkeleton } from "@/layouts/SidebarProfileFooterSkeleton";
import { buildSidebarDisplayName } from "@/layouts/buildSidebarDisplayName";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { logoutAction } from "@/redux/auth/auth.actions";
import { cn } from "@/lib/utils";

export function SidebarProfileFooter({ user, collapsed, sessionActive, profileLoading }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!sessionActive) return null;

  if (profileLoading) {
    return (
      <SidebarProfileFooterSkeleton collapsed={collapsed} label={t("sidebar.loadingAccount")} />
    );
  }

  if (user) {
    const displayName = buildSidebarDisplayName(user);
    if (collapsed) {
      return (
        <div className="flex justify-center py-1">
          <SidebarAccountMenu user={user} collapsed />
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-border bg-muted/50 px-2 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <UserAvatar size="sm" showName={false} name={displayName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            {user.email ? (
              <p className="truncate text-xs text-foreground/80">{user.email}</p>
            ) : null}
          </div>
          <SidebarAccountMenu user={user} collapsed={false} />
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/50 px-2 py-2",
        collapsed && "flex justify-center py-1.5",
      )}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive transition hover:bg-destructive/25"
          aria-label={t("settings.logout")}
        >
          <LogOut className="h-4 w-4" />
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold text-foreground">
            {t("header.user")}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
          >
            {t("settings.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

export default SidebarProfileFooter;
