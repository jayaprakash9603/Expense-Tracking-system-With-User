import React from "react";
import { cn } from "@/lib/utils";

const WIDTH_MAP = {
  content: "max-w-5xl",
  page: "max-w-7xl",
  wide: "max-w-[1600px]",
  fluid: "max-w-full",
};

/**
 * @param {{children: React.ReactNode, width?: 'content'|'page'|'wide'|'fluid', className?: string}} props
 */
export function AppContainer({ children, width = "page", className }) {
  return (
    <div className={cn("mx-auto w-full px-3 md:px-4 lg:px-6", WIDTH_MAP[width], className)}>
      {children}
    </div>
  );
}

export default AppContainer;
