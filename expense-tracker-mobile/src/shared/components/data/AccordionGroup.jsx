import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AppSegmentedTabsScroll,
  AppTabTriggerGlyph,
  SEGMENTED_TAB_LIST_CLASS,
  SEGMENTED_TAB_TRIGGER_CLASS,
} from "@/shared/components/display/AppTabs";
import { AccordionToolbar } from "./AccordionToolbar";
import { NoDataPlaceholder } from "@/shared/components/feedback/NoDataPlaceholder";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { AppPagination } from "@/shared/components/data/AppPagination";
import { cn } from "@/lib/utils";
import {
  ACCORDION_GROUP_DEFAULT_PAGE_SIZE,
  ACCORDION_GROUP_LIST_GAP_CLASS,
  ACCORDION_GROUP_ROW_MIN_CLASS,
  ACCORDION_GROUP_TRIGGER_PADDING_CLASS,
  ACCORDION_GROUP_VISIBLE_ROW_COUNT,
  getAccordionGroupEmptyMinHeightRem,
  getAccordionGroupListScrollMaxHeightRem,
} from "./accordionGroupLayout";

export function useAccordionGroup({
  groups = [],
  tabs = [],
  classify,
  getGroupKey,
  defaultPageSize = ACCORDION_GROUP_DEFAULT_PAGE_SIZE,
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

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  useEffect(() => {
    setPageIndex(0);
  }, [groups, groupSearch, activeTab]);

  const sortedGroups = useMemo(() => {
    if (groupSort.key === "default") return filteredBySearch;
    return [...filteredBySearch].sort((a, b) => {
      let cmp = 0;
      if (groupSort.key === "name") cmp = String(a.label || "").localeCompare(String(b.label || ""));
      else if (groupSort.key === "amount")
        cmp = (Number(a.totalAmount) || Number(a.total) || 0) - (Number(b.totalAmount) || Number(b.total) || 0);
      else if (groupSort.key === "count")
        cmp = (Number(a.count) || a.items?.length || 0) - (Number(b.count) || b.items?.length || 0);
      return groupSort.direction === "asc" ? cmp : -cmp;
    });
  }, [filteredBySearch, groupSort]);

  const paginatedGroups = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedGroups.slice(start, start + pageSize);
  }, [sortedGroups, pageIndex, pageSize]);

  return {
    activeTab,
    setActiveTab,
    openGroupKey,
    setOpenGroupKey,
    groupSearch,
    setGroupSearch,
    groupSort,
    setGroupSort,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    totalGroups: sortedGroups.length,
    processedGroups: paginatedGroups,
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
  allSelectableIds = [],
  selectedGlobalIds = [],
  onSelectionChange,
  enablePagination = true,
  defaultPageSize = ACCORDION_GROUP_DEFAULT_PAGE_SIZE,
  pageSizeOptions = [5, 8, 10, 20, 50],
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
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    totalGroups,
    processedGroups,
  } = useAccordionGroup({ groups, tabs, classify, getGroupKey, defaultPageSize });

  const selectableIdSet = useMemo(
    () => new Set(allSelectableIds.map((id) => String(id))),
    [allSelectableIds],
  );

  const selectedInScopeCount = useMemo(
    () => selectedGlobalIds.filter((id) => selectableIdSet.has(String(id))).length,
    [selectedGlobalIds, selectableIdSet],
  );

  const isAllSelected =
    allSelectableIds.length > 0 && selectedInScopeCount === allSelectableIds.length;

  const handleSelectAllClick = useCallback(() => {
    if (!onSelectionChange) return;
    onSelectionChange([...new Set(allSelectableIds)]);
  }, [onSelectionChange, allSelectableIds]);

  const handleClearSelectionClick = useCallback(() => {
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const pageCount = Math.ceil(totalGroups / pageSize);
  const isLastPage = pageIndex === Math.max(0, pageCount - 1);
  const pageRemainder = pageSize - processedGroups.length;
  let padRowCount = 0;
  if (enablePagination && isLastPage && processedGroups.length > 0 && pageRemainder > 0) {
    const maxBlanksToReachTarget = Math.max(0, defaultPageSize - processedGroups.length);
    padRowCount = Math.min(pageRemainder, maxBlanksToReachTarget);
  }

  const emptyListMinRem = getAccordionGroupEmptyMinHeightRem(pageSize);
  const listScrollMaxRem = getAccordionGroupListScrollMaxHeightRem();
  const rowsRenderedOnPage = processedGroups.length + padRowCount;
  const shouldClampAccordionList =
    pageSize > ACCORDION_GROUP_VISIBLE_ROW_COUNT ||
    rowsRenderedOnPage > ACCORDION_GROUP_VISIBLE_ROW_COUNT;

  return (
    <div className={cn("space-y-3", className)}>
      {tabs.length > 1 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <AppSegmentedTabsScroll>
            <TabsList className={SEGMENTED_TAB_LIST_CLASS}>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className={SEGMENTED_TAB_TRIGGER_CLASS}
                >
                  <AppTabTriggerGlyph icon={tab.icon} />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </AppSegmentedTabsScroll>
        </Tabs>
      )}

      <AccordionToolbar
        showGroupSearch={enableGroupSearch}
        groupSearch={groupSearch}
        onGroupSearchChange={setGroupSearch}
        showGroupSort={enableGroupSort}
        groupSort={groupSort}
        onGroupSortChange={setGroupSort}
        showSelectAll={enableSelection && allSelectableIds.length > 0}
        showClearSelection={enableSelection && allSelectableIds.length > 0}
        onSelectAll={handleSelectAllClick}
        onClearSelection={handleClearSelectionClick}
        isAllSelected={isAllSelected}
        selectedCount={selectedInScopeCount}
      />

      {processedGroups.length === 0 ? (
        <div
          className="flex min-h-0 flex-col rounded-lg border border-border bg-card"
          style={{
            minHeight: `min(${emptyListMinRem}rem, 90dvh)`,
          }}
        >
          <NoDataPlaceholder
            message={t("common.noData") || "No data available"}
            dense
            size="xs"
            className="flex-1 justify-center border-0 rounded-none bg-transparent py-3 sm:py-4"
          />
        </div>
      ) : (
        <div
          className={cn(
            "min-h-0 overflow-x-auto pr-1.5",
            shouldClampAccordionList
              ? "overflow-y-auto overscroll-contain theme-scrollbar"
              : "overflow-y-visible",
          )}
          style={
            shouldClampAccordionList ? { maxHeight: `${listScrollMaxRem}rem` } : undefined
          }
        >
          <Accordion
            type="single"
            collapsible
            value={openGroupKey}
            onValueChange={setOpenGroupKey}
            className={ACCORDION_GROUP_LIST_GAP_CLASS}
          >
            {processedGroups.map((group) => (
              <AccordionItem
                key={group._key}
                value={group._key}
                className="border rounded-lg overflow-hidden bg-card"
              >
                <AccordionTrigger
                  className={cn(
                    "hover:no-underline",
                    ACCORDION_GROUP_TRIGGER_PADDING_CLASS,
                    ACCORDION_GROUP_ROW_MIN_CLASS,
                    "items-start sm:items-center",
                  )}
                >
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
                <AccordionContent className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
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
            {padRowCount > 0 &&
              Array.from({ length: padRowCount }).map((_, idx) => (
                <div
                  key={`pad-${idx}`}
                  className={cn(
                    ACCORDION_GROUP_ROW_MIN_CLASS,
                    "rounded-lg border border-border/40 bg-muted/10 pointer-events-none shrink-0",
                  )}
                  aria-hidden="true"
                />
              ))}
          </Accordion>
        </div>
      )}

      {enablePagination && (
        <AppPagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalItems={totalGroups}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          pageSizeOptions={pageSizeOptions}
          pageSummaryText={t("common.tablePageStatus", {
            current: pageIndex + 1,
            total: Math.max(1, Math.ceil(totalGroups / pageSize)),
          })}
          rowsPerPageLabel={t("common.rowsPerPage") || "Rows per page"}
          className="mt-4"
        />
      )}
    </div>
  );
}

export default AccordionGroup;
