import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const appButtonVariants = cva("", {
  variants: {
    intent: {
      primary: "",
      secondary: "",
      accent: "",
      ghost: "",
      destructive: "",
    },
    density: {
      compact: "h-8 px-3 text-xs",
      comfortable: "h-9 px-4 text-sm",
      spacious: "h-10 px-5 text-sm",
    },
    responsive: {
      true: "w-full md:w-auto",
      false: "",
    },
  },
  defaultVariants: {
    intent: "primary",
    density: "comfortable",
    responsive: false,
  },
});

const intentToVariant = {
  primary: "default",
  secondary: "secondary",
  accent: "outline",
  ghost: "ghost",
  destructive: "destructive",
};

export function AppButton({
  children,
  isLoading = false,
  fullWidth = true,
  responsive = false,
  intent = "primary",
  density = "comfortable",
  className,
  disabled,
  ...props
}) {
  return (
    <Button
      variant={intentToVariant[intent] || "default"}
      className={cn(
        fullWidth && "w-full",
        appButtonVariants({ intent, density, responsive }),
        className,
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
