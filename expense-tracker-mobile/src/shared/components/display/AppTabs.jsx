import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function AppTabs({ tabs, defaultValue, value, onValueChange, className = "" }) {
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-fit">
            {tab.icon && <tab.icon className="h-4 w-4 mr-1.5" />}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default AppTabs;
