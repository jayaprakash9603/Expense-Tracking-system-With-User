import React from "react";
import { cn } from "@/lib/utils";

const COLOR_MAP = {
  primary: "icon-primary",
  secondary: "icon-secondary",
  accent: "icon-accent",
  soft: "icon-soft",
  muted: "icon-muted",
  foreground: "icon-foreground",
  success: "icon-success",
  warning: "icon-warning",
  error: "icon-error",
  info: "icon-info",
  inherit: "icon-inherit",
  destructive: "text-destructive",
};

const SIZE_MAP = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

export function AppIcon({
  icon: Icon,
  color = "primary",
  size = "sm",
  className,
  strokeWidth,
  ...props
}) {
  if (!Icon) return null;

  const colorClass = COLOR_MAP[color] || COLOR_MAP.primary;
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.sm;

  return (
    <Icon
      className={cn(sizeClass, colorClass, "shrink-0", className)}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

export function AppIconBox({
  icon: Icon,
  color = "primary",
  size = "sm",
  bg = true,
  className,
  ...props
}) {
  if (!Icon) return null;

  const bgMap = {
    primary: "bg-primary/10",
    secondary: "bg-[hsl(var(--theme-secondary)/0.1)]",
    accent: "bg-[hsl(var(--theme-accent)/0.1)]",
    soft: "bg-primary/5",
    muted: "bg-muted",
    success: "bg-[hsl(var(--icon-success)/0.1)]",
    warning: "bg-[hsl(var(--icon-warning)/0.1)]",
    error: "bg-[hsl(var(--icon-error)/0.1)]",
    info: "bg-[hsl(var(--icon-info)/0.1)]",
  };

  const boxSizeMap = {
    xs: "h-6 w-6 rounded",
    sm: "h-8 w-8 rounded-md",
    md: "h-9 w-9 rounded-lg",
    lg: "h-10 w-10 rounded-lg",
    xl: "h-12 w-12 rounded-xl",
  };

  const bgClass = bg ? (bgMap[color] || bgMap.primary) : "";
  const boxClass = boxSizeMap[size] || boxSizeMap.sm;

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0",
        boxClass,
        bgClass,
        className
      )}
    >
      <AppIcon icon={Icon} color={color} size={size} {...props} />
    </div>
  );
}

export default AppIcon;
