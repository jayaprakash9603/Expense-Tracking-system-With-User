import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/app-shadcn";
import {
  AppSegmentedTabsScroll,
  AppTabTriggerGlyph,
  SEGMENTED_TAB_LIST_CLASS,
  SEGMENTED_TAB_TRIGGER_CLASS,
} from "@/shared/components/display/AppTabs";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { getGroupedReportViewOptions } from "./groupedReportAccordionViewModes";

export function GroupedReportAccordionViewToolbar({ value, onValueChange, className }) {
  const { t } = useLanguage();
  const options = getGroupedReportViewOptions();

  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn("w-full", className)}>
      <AppSegmentedTabsScroll>
        <TabsList className={SEGMENTED_TAB_LIST_CLASS}>
          {options.map((opt) => (
            <TabsTrigger
              key={opt.value}
              value={opt.value}
              className={SEGMENTED_TAB_TRIGGER_CLASS}
            >
              <AppTabTriggerGlyph icon={opt.icon} />
              {t(opt.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </AppSegmentedTabsScroll>
    </Tabs>
  );
}

export default GroupedReportAccordionViewToolbar;
