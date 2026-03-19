import React, { useState, useMemo, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccordionToolbar } from "./AccordionToolbar";
import { NoDataPlaceholder } from "@/shared/components/feedback/NoDataPlaceholder";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function useAccordionGroup({
  groups = [],
  tabs = [],
  classify,
  getGroupKey,
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || "all");
  const [openGroupKey, setOpenGroupKey] = useState(null);
  const [groupSearch, setGroupSearch] = useState("");
  const [groupSort, setGroupSort] = useState({ key: "default", direction: "desc" });

  const normalizedGroups = useMemo(
    () =>
      groups.map((g, idx) => ({
        ...g,
        _key: getGroupKey ? getGroupKey(g, idx) : g.key || g.label || String(idx),
      })),
    [groups, getGroupKey]
  );

  const filteredByTab = useMemo(() => {
    if (!classify || activeTab === "all") return normalizedGroups;
    return normalizedGroups.filter((g) => classify(g) === activeTab);
  }, [normalizedGroups, activeTab, classify]);

  const filteredBySearch = useMemo(() => {
    if (!groupSearch.trim()) return filteredByTab;
    const lower = groupSearch.toLowerCase();
    return filteredByTab.filter((g) =>
      String(g.label || "").toLowerCase().includes(lower)
    );
  }, [filteredByTab, groupSearch]);

  const sortedGroups = useMemo(() => {
    if (groupSort.key === "default") return filteredBySearch;
    return [...filteredBySearch].sort((a, b) => {
      let cmp = 0;
      if (groupSort.key === "name") cmp = String(a.label || "").localeCompare(String(b.label || ""));
      else if (groupSort.key === "amount") cmp = (a.total || 0) - (b.total || 0);
      else if (groupSort.key === "count") cmp = (a.items?.length || 0) - (b.items?.length || 0);
      return groupSort.direction === "asc" ? cmp : -cmp;
    });
  }, [filteredBySearch, groupSort]);

  return {
    activeTab,
    setActiveTab,
    openGroupKey,
    setOpenGroupKey,
    groupSearch,
    setGroupSearch,
    groupSort,
    setGroupSort,
    processedGroups: sortedGroups,
  };
}

export function AccordionGroup({
  groups = [],
  tabs = [],
  columns = [],
  classify,
  getGroupKey,
  headerRender,
  contentRender,
  enableGroupSearch = false,
  enableGroupSort = false,
  enableSelection = false,
  className,
}) {
  const { t } = useLanguage();
  const {
    activeTab,
    setActiveTab,
    openGroupKey,
    setOpenGroupKey,
    groupSearch,
    setGroupSearch,
    groupSort,
    setGroupSort,
    processedGroups,
  } = useAccordionGroup({ groups, tabs, classify, getGroupKey });

  return (
    <div className={cn("space-y-3", className)}>
      {tabs.length > 1 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <AccordionToolbar
        showGroupSearch={enableGroupSearch}
        groupSearch={groupSearch}
        onGroupSearchChange={setGroupSearch}
        showGroupSort={enableGroupSort}
        groupSort={groupSort}
        onGroupSortChange={setGroupSort}
      />

      {processedGroups.length === 0 ? (
        <NoDataPlaceholder
          message={t("common.noData") || "No data available"}
          size="md"
        />
      ) : (
        <Accordion
          type="single"
          collapsible
          value={openGroupKey}
          onValueChange={setOpenGroupKey}
          className="space-y-2"
        >
          {processedGroups.map((group) => (
            <AccordionItem
              key={group._key}
              value={group._key}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                {headerRender ? (
                  headerRender(group)
                ) : (
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <span className="font-semibold text-sm">{group.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {group.items?.length || 0}
                    </Badge>
                  </div>
                )}
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                {contentRender
                  ? contentRender(group)
                  : (
                    <p className="text-sm text-muted-foreground">
                      {group.items?.length || 0} {t("common.items") || "items"}
                    </p>
                  )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

export default AccordionGroup;
