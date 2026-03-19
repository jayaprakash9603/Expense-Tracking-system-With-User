import React from "react";
import { AppCard } from "@/shared/components/AppCard";
import { cn } from "@/lib/utils";

export function ChartCard({ title, description, children, className, actions }) {
  return (
    <AppCard className={cn("overflow-hidden", className)}>
      <AppCard.Header className="flex-row items-center justify-between pb-2">
        <div>
          {title && <AppCard.Title className="text-base">{title}</AppCard.Title>}
          {description && <AppCard.Description>{description}</AppCard.Description>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </AppCard.Header>
      <AppCard.Content className="pt-0">
        {children}
      </AppCard.Content>
    </AppCard>
  );
}
