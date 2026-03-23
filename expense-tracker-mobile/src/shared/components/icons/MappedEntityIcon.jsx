import React from "react";
import { cn } from "@/lib/utils";
import { getEntityIconComponent } from "@/shared/icons";

function resolveIconKey(value) {
  if (value && typeof value === "object") {
    return value.icon || value.value || value.name || value.label || "";
  }
  return value;
}

export function MappedEntityIcon({
  variant = "category",
  value,
  color,
  className,
  iconClassName,
  renderMode = "badge",
}) {
  const iconKey = resolveIconKey(value);
  const Icon = getEntityIconComponent(variant, iconKey);

  if (renderMode === "bare") {
    return <Icon className={cn("h-3.5 w-3.5 shrink-0", iconClassName)} />;
  }

  const badgeStyle = color
    ? {
        backgroundColor: `${color}20`,
        color,
      }
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
        className,
      )}
      style={badgeStyle}
    >
      <Icon className={cn("h-3.5 w-3.5", iconClassName)} />
    </span>
  );
}

export default MappedEntityIcon;
