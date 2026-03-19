import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppButton({
  children,
  isLoading = false,
  fullWidth = true,
  responsive = false,
  className,
  disabled,
  ...props
}) {
  return (
    <Button
      className={cn(
        fullWidth && "w-full",
        responsive && "w-full md:w-auto",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}

export default AppButton;
