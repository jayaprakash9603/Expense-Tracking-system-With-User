import React from "react";
import { AppCard } from "@/shared/components/display/AppCard";
import { cn } from "@/lib/utils";

export function ChartCard({ title, description, children, className, actions, contentClassName }) {
  const hasHeader = title || description || actions;

  return (
    <AppCard className={cn(className)}>
      {hasHeader && (
        <AppCard.Header className="flex-row items-center justify-between pb-2">
          <div>
            {title && <AppCard.Title className="text-base">{title}</AppCard.Title>}
            {description && <AppCard.Description>{description}</AppCard.Description>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </AppCard.Header>
      )}
      <AppCard.Content className={cn(hasHeader ? "pt-0" : "", contentClassName)}>
        {children}
      </AppCard.Content>
    </AppCard>
  );
}
