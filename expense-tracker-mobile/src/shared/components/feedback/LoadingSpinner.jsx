import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, size = 32 }) {
  return (
    <div className={cn("flex items-center justify-center min-h-[200px]", className)}>
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
    </div>
  );
}

export default LoadingSpinner;
