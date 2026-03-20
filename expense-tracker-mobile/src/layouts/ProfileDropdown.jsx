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

export function ProfileDropdown() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const user = useSelector((state) => state.auth?.user);
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

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
    navigate(targetMode === "ADMIN" ? "/admin/dashboard" : "/dashboard");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold tap-highlight-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {user?.profileImage ? (
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
          <div className="bg-gradient-to-r from-primary/15 to-chart-2/10 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-10 w-10">
                {user?.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {displayName || t("header.user")}
                </p>
                {user?.email ? (
                  <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                ) : null}
                <span className="mt-1 inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10">
                  {currentMode}
                </span>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-accent"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80">
                <AppIcon icon={User} color="soft" size="sm" />
              </span>
              {t("profile.viewProfile")}
            </button>

            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-accent"
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
