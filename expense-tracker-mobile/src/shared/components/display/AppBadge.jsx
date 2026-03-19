import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AppBadge({ children, variant = "default", size = "default", className = "", ...props }) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0",
    default: "text-xs px-2.5 py-0.5",
    lg: "text-sm px-3 py-1",
  };

  return (
    <Badge variant={variant} className={cn(sizeClasses[size], className)} {...props}>
      {children}
    </Badge>
  );
}

export default AppBadge;
