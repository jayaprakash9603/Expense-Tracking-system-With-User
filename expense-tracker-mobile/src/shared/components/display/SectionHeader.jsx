import React from "react";
import { cn } from "@/lib/utils";
import { AppIcon } from "./AppIcon";

export function SectionHeader({ icon, title, children, className }) {
  return (
    <div className={cn("flex items-center justify-between mb-3 md:mb-4", className)}>
      <div className="flex items-center gap-2 min-w-0">
        {icon && <AppIcon icon={icon} color="primary" size="sm" />}
        <h3 className="text-sm md:text-base font-semibold truncate">{title}</h3>
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

export default SectionHeader;
