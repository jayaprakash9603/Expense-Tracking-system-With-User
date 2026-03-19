import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AppInput({ className, size = "default", ...props }) {
  const sizeMap = {
    sm: "h-9",
    default: "h-10 md:h-11",
    lg: "h-11 md:h-12 text-base",
  };

  return <Input className={cn(sizeMap[size] || sizeMap.default, className)} {...props} />;
}

export default AppInput;
