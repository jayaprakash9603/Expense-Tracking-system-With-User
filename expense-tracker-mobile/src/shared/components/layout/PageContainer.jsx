import React from "react";
import { cn } from "@/lib/utils";

const WIDTH_MAP = {
  xs: "max-w-md",
  sm: "max-w-lg",
  md: "max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl",
  default: "max-w-full",
  lg: "max-w-full",
  xl: "max-w-full",
  full: "max-w-full",
};

const PADDING_MAP = {
  none: "",
  compact: "p-3 md:p-4 lg:p-5",
  default: "p-4 md:p-6 lg:p-6 xl:p-8",
  spacious: "p-6 md:p-8 lg:p-10 xl:p-12",
};

export function PageContainer({
  children,
  className,
  maxWidth = "default",
  padding = "default",
  centered = true,
}) {
  const widthClass = WIDTH_MAP[maxWidth] || WIDTH_MAP.default;
  const paddingClass = PADDING_MAP[padding] || PADDING_MAP.default;

  return (
    <div className={cn("flex-1 overflow-y-auto pb-6 md:pb-8 no-scrollbar", paddingClass, className)}>
      <div className={cn("w-full", centered && "mx-auto", widthClass)}>
        {children}
      </div>
    </div>
  );
}

export default PageContainer;
