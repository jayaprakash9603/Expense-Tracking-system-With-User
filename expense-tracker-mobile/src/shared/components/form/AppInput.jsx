import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const inputVariants = cva("", {
  variants: {
    density: {
      sm: "h-9",
      default: "h-10 md:h-11",
      lg: "h-11 md:h-12 text-base",
    },
    intent: {
      default: "",
      danger: "border-destructive/60 focus-visible:ring-destructive",
      ghost: "border-transparent bg-muted/40",
    },
  },
  defaultVariants: {
    density: "default",
    intent: "default",
  },
});

export function AppInput({ className, size = "default", density, intent = "default", ...props }) {
  const resolvedDensity = density || size;

  return (
    <Input
      className={cn(inputVariants({ density: resolvedDensity, intent }), className)}
      {...props}
    />
  );
}

export default AppInput;
