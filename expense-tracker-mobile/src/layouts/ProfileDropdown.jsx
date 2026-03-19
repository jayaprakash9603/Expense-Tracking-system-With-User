import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { User, Settings, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { logoutAction } from "@/redux/auth/auth.actions";

export function ProfileDropdown() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const user = useSelector((state) => state.auth?.user);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : null;

  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  return (
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

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2 cursor-pointer">
          <AppIcon icon={User} color="soft" size="sm" />
          {t("profile.viewProfile")}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2 cursor-pointer">
          <AppIcon icon={Settings} color="soft" size="sm" />
          {t("navigation.settings")}
        </DropdownMenuItem>

        {user?.role === "ADMIN" && (
          <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="gap-2 cursor-pointer">
            <AppIcon icon={Shield} color="soft" size="sm" />
            {t("navigation.adminPanel")}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
          <AppIcon icon={LogOut} color="error" size="sm" />
          {t("settings.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropdown;
