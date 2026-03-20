import React from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { UserAvatar } from "@/shared/components/user/UserAvatar";
import { logoutAction } from "@/redux/auth/auth.actions";
import { SidebarAccountMenuItems } from "@/layouts/SidebarAccountMenuItems";
import { buildSidebarDisplayName } from "@/layouts/buildSidebarDisplayName";
import { cn } from "@/lib/utils";

export function SidebarAccountMenu({ user, collapsed }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const displayName = buildSidebarDisplayName(user);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  const items = (
    <SidebarAccountMenuItems
      displayName={displayName}
      email={user.email}
      profileLabel={t("navigation.profile")}
      logoutLabel={t("settings.logout")}
      onProfile={() => navigate("/profile")}
      onLogout={handleLogout}
    />
  );

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "rounded-lg outline-none ring-offset-background",
              "focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label={t("navigation.profile")}
          >
            <UserAvatar size="sm" showName={false} name={displayName} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-56">
          {items}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "rounded-md p-1.5 text-muted-foreground",
            "hover:bg-accent hover:text-foreground",
          )}
          aria-label={t("navigation.profile")}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-56">
        {items}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SidebarAccountMenu;
