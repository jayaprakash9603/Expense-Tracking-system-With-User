import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { User, Settings, LogOut, ArrowRightLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { logoutAction, switchUserModeAction } from "@/redux/auth/auth.actions";
import { ConfirmDialog } from "@/shared/components/overlay/ConfirmDialog";
import { getActiveJwt } from "@/shared/utils/authStorage";

export function ProfileDropdown() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const user = useSelector((state) => state.auth?.user);
  const authLoading = useSelector((state) => state.auth?.loading);
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const sessionActive = Boolean(getActiveJwt());
  const isAccountLoading = sessionActive && !user && authLoading;

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : null;

  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
    setIsLogoutOpen(false);
  };

  const hasAdminRole =
    user?.role === "ADMIN" ||
    user?.roles?.includes?.("ADMIN") ||
    user?.roles?.includes?.("ROLE_ADMIN");

  const handleModeSwitch = async () => {
    const targetMode = currentMode === "ADMIN" ? "USER" : "ADMIN";
    const result = await dispatch(switchUserModeAction(targetMode));
    if (!result?.success) return;
    navigate(targetMode === "ADMIN" ? "/admin/dashboard" : "/dashboard", { replace: true });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold tap-highlight-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-busy={isAccountLoading}
            aria-label={isAccountLoading ? t("sidebar.loadingAccount") : undefined}
          >
            {isAccountLoading ? (
              <span className="block h-5 w-5 animate-pulse rounded-full bg-primary-foreground/40" />
            ) : user?.profileImage ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImage} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            ) : (
              initials || <AppIcon icon={User} color="inherit" size="sm" />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-[min(17.5rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-border/70 bg-card/95 p-0 shadow-2xl backdrop-blur"
        >
          <div className="border-b border-border bg-card px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                {user?.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                {isAccountLoading ? (
                  <p className="text-sm font-medium text-foreground">{t("sidebar.loadingAccount")}</p>
                ) : (
                  <>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {displayName || t("header.user")}
                    </p>
                    {user?.email ? (
                      <p className="truncate text-xs font-medium text-foreground/80">{user.email}</p>
                    ) : null}
                    <span className="mt-1.5 inline-flex rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                      {currentMode}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              type="button"
              disabled={isAccountLoading}
              onClick={() => navigate("/profile")}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80">
                <AppIcon icon={User} color="soft" size="sm" />
              </span>
              {t("profile.viewProfile")}
            </button>

            <button
              type="button"
              disabled={isAccountLoading}
              onClick={() => navigate("/settings")}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80">
                <AppIcon icon={Settings} color="soft" size="sm" />
              </span>
              {t("navigation.settings")}
            </button>

            {hasAdminRole ? (
              <>
                <DropdownMenuSeparator className="my-2" />
                <button
                  type="button"
                  onClick={handleModeSwitch}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                    <AppIcon icon={ArrowRightLeft} color="primary" size="sm" />
                  </span>
                  {currentMode === "ADMIN"
                    ? t("header.switchToUserMode")
                    : t("header.switchToAdminMode")}
                </button>
              </>
            ) : null}

            <DropdownMenuSeparator className="my-2" />

            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <AppIcon icon={LogOut} color="error" size="sm" />
              </span>
              {t("settings.logout")}
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        title={t("modals.logoutTitle") || "Logout"}
        description={t("modals.logoutPrompt") || "Are you sure you want to logout?"}
        onConfirm={handleLogout}
        confirmLabel={t("settings.logout") || "Logout"}
        cancelLabel={t("common.cancel") || "Cancel"}
        variant="destructive"
      />
    </>
  );
}

export default ProfileDropdown;
