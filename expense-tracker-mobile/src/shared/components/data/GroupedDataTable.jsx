import React, { useState, useMemo, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppDataTable } from "./AppDataTable";
import { NoDataPlaceholder } from "@/shared/components/feedback/NoDataPlaceholder";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function GroupedDataTable({
  groups = [],
  columns = [],
  loading = false,
  defaultOpen,
  groupKey = "key",
  groupLabel = "label",
  groupItems = "items",
  groupSummary,
  pageSize = 5,
  pageSizeOptions = [5, 10, 20],
  selectable = false,
  rowKey = "id",
  onRowClick,
  emptyMessage,
  className,
}) {
  const { t } = useLanguage();
  const [openGroup, setOpenGroup] = useState(
    defaultOpen != null ? String(defaultOpen) : undefined
  );

  const resolvedGroups = useMemo(
    () =>
      groups.map((g, idx) => ({
        key: String(g[groupKey] ?? idx),
        label: g[groupLabel] ?? `Group ${idx + 1}`,
        items: g[groupItems] || [],
        raw: g,
      })),
    [groups, groupKey, groupLabel, groupItems]
  );

  const handleAccordionChange = useCallback((val) => {
    setOpenGroup(val);
  }, []);

  if (!loading && resolvedGroups.length === 0) {
    return (
      <NoDataPlaceholder
        message={emptyMessage || t("common.noData") || "No groups available"}
        size="md"
      />
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={openGroup}
      onValueChange={handleAccordionChange}
      className={cn("space-y-2", className)}
    >
      {resolvedGroups.map((group) => (
        <AccordionItem
          key={group.key}
          value={group.key}
          className="border rounded-lg overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3 flex-1 text-left">
              <span className="font-semibold text-sm">{group.label}</span>
              <Badge variant="secondary" className="text-xs">
                {group.items.length}
              </Badge>
              {groupSummary && (
                <span className="ml-auto text-sm text-muted-foreground mr-2">
                  {groupSummary(group.raw)}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-3">
            <AppDataTable
              columns={columns}
              data={group.items}
              loading={loading}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              selectable={selectable}
              rowKey={rowKey}
              onRowClick={onRowClick}
              page={0}
              totalPages={Math.ceil(group.items.length / pageSize)}
              totalItems={group.items.length}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default GroupedDataTable;
