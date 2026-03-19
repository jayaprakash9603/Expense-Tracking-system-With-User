import React from "react";
import { cn } from "@/lib/utils";

export function TwoColumnLayout({ left, right, className, sideWidth = "default" }) {
  const sideWidthClass = {
    narrow: "lg:w-72 xl:w-80",
    default: "lg:w-80 xl:w-96",
    wide: "lg:w-96 xl:w-[28rem]",
  };

  return (
    <div className={cn("flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8", className)}>
      <div className="flex-1 min-w-0">{left}</div>
      {right && (
        <aside className={cn("shrink-0 w-full", sideWidthClass[sideWidth] || sideWidthClass.default)}>
          {right}
        </aside>
      )}
    </div>
  );
}

export default TwoColumnLayout;
