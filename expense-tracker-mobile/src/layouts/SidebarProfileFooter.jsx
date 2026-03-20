import React from "react";
import { UserAvatar } from "@/shared/components/user/UserAvatar";
import { SidebarAccountMenu } from "@/layouts/SidebarAccountMenu";
import { buildSidebarDisplayName } from "@/layouts/buildSidebarDisplayName";

export function SidebarProfileFooter({ user, collapsed }) {
  if (!user) return null;
  const displayName = buildSidebarDisplayName(user);

  if (collapsed) {
    return (
      <div className="flex justify-center py-1">
        <SidebarAccountMenu user={user} collapsed />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 px-2 py-2">
      <div className="flex items-center gap-2">
        <UserAvatar size="sm" showName={false} name={displayName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          {user.email ? (
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          ) : null}
        </div>
        <SidebarAccountMenu user={user} collapsed={false} />
      </div>
    </div>
  );
}

export default SidebarProfileFooter;
