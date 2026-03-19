import React from "react";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 md:py-16 lg:py-20 px-6 text-center", className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-primary/10 p-4 md:p-5">
          <AppIcon icon={Icon} color="soft" size="xl" className="md:h-10 md:w-10" />
        </div>
      )}
      {title && <h3 className="text-lg md:text-xl font-semibold mb-1">{title}</h3>}
      {description && <p className="text-sm md:text-base text-muted-foreground mb-4 max-w-xs md:max-w-md">{description}</p>}
      {actionLabel && onAction && (
        <AppButton size="sm" onClick={onAction}>
          {actionLabel}
        </AppButton>
      )}
    </div>
  );
}

export default EmptyState;
