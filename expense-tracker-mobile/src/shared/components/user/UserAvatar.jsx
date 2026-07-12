import React from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({ size = "default", className = "", src, name, showName = false }) {
  const user = useSelector((state) => state.auth?.user);
  const displayName = name || user?.name || user?.email || "";
  const imageUrl = src || user?.profileImage;
  const initials = getInitials(displayName);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    default: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className={sizeClasses[size] || sizeClasses.default}>
        <AvatarImage src={imageUrl} alt={displayName} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showName && displayName && (
        <span className="text-sm font-medium truncate">{displayName}</span>
      )}
    </div>
  );
}

export default UserAvatar;
