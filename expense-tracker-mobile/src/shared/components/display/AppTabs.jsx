import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const SEGMENTED_TAB_LIST_CLASS = cn(
  "-space-x-px mb-3 inline-flex h-auto w-max min-w-full max-w-full flex-nowrap items-stretch justify-start",
  "bg-background p-0 shadow-xs rtl:space-x-reverse",
);

export const SEGMENTED_TAB_TRIGGER_CLASS = cn(
  "relative shrink-0 overflow-hidden rounded-none border border-border px-3 py-2 text-sm font-medium",
  "transition-colors after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5",
  "first:rounded-s-md last:rounded-e-md",
  "data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:after:bg-primary",
  "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

export function AppTabTriggerGlyph({ icon: Icon }) {
  if (!Icon) return null;
  return <Icon aria-hidden className="me-1.5 -ms-0.5 size-4 shrink-0 opacity-60" />;
}

export function AppSegmentedTabsScroll({ children, className }) {
  return (
    <ScrollArea className={cn("w-full", className)}>
      {children}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function AppTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  scrollClassName,
  contentClassName,
}) {
  const first = tabs[0]?.value;
  const resolvedDefault = defaultValue ?? first;
  const isControlled = value !== undefined;

  return (
    <Tabs
      className={cn("w-full", className)}
      defaultValue={isControlled ? undefined : resolvedDefault}
      value={isControlled ? value : undefined}
      onValueChange={onValueChange}
    >
      <AppSegmentedTabsScroll className={scrollClassName}>
        <TabsList className={SEGMENTED_TAB_LIST_CLASS}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(SEGMENTED_TAB_TRIGGER_CLASS, tab.triggerClassName)}
            >
              <AppTabTriggerGlyph icon={tab.icon} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </AppSegmentedTabsScroll>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("mt-0 ring-offset-0 focus-visible:ring-0", contentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default AppTabs;
