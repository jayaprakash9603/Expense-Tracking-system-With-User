import React from "react";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function SidebarAccountMenuItems({
  displayName,
  email,
  profileLabel,
  logoutLabel,
  onProfile,
  onLogout,
}) {
  return (
    <>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          {email ? (
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          ) : null}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={onProfile}>
        <User className="h-4 w-4" />
        {profileLabel}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onSelect={onLogout}
      >
        <LogOut className="h-4 w-4" />
        {logoutLabel}
      </DropdownMenuItem>
    </>
  );
}
