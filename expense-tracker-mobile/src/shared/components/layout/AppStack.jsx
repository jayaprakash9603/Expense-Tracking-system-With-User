import React from "react";
import { cn } from "@/lib/utils";

const GAP_MAP = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-3 md:gap-4",
  lg: "gap-4 md:gap-5",
  xl: "gap-6",
};

/**
 * @param {{children: React.ReactNode, direction?: 'vertical'|'horizontal', gap?: 'xs'|'sm'|'md'|'lg'|'xl', wrap?: boolean, className?: string}} props
 */
export function AppStack({
  children,
  direction = "vertical",
  gap = "md",
  wrap = false,
  className,
}) {
  return (
    <div
      className={cn(
        "flex",
        direction === "horizontal" ? "flex-row items-center" : "flex-col",
        wrap && "flex-wrap",
        GAP_MAP[gap],
        className,
      )}
    >
      {children}
    </div>
  );
}

export default AppStack;
