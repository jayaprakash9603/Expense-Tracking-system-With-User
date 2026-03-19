import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchToolbar } from "@/shared/components/search/SearchToolbar";
import { AppButton } from "@/shared/components/form/AppButton";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function AccordionToolbar({
  showGroupSearch = false,
  groupSearch,
  onGroupSearchChange,
  showGroupSort = false,
  groupSort,
  onGroupSortChange,
  showClearSelection = false,
  onClearSelection,
  showSelectAll = false,
  isAllSelected = false,
  isSomeSelected = false,
  onSelectAll,
  totalItemsCount = 0,
  selectedCount = 0,
  className,
}) {
  const { t } = useLanguage();

  if (!showGroupSearch && !showGroupSort && !showClearSelection && !showSelectAll) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between gap-3 flex-wrap py-2", className)}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {showSelectAll && (
          <label className="flex items-center gap-2 shrink-0 px-2 py-1 rounded-lg bg-muted/50">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isSomeSelected && !isAllSelected}
              onCheckedChange={(checked) => onSelectAll?.(checked)}
            />
            <span className="text-xs font-medium whitespace-nowrap">
              {selectedCount > 0
                ? `${selectedCount} of ${totalItemsCount}`
                : t("common.selectAll") || "Select All"}
            </span>
          </label>
        )}

        {showGroupSearch && (
          <SearchToolbar
            value={groupSearch}
            onChange={onGroupSearchChange}
            placeholder={t("common.searchGroups") || "Search groups..."}
            className="flex-1 min-w-[200px] max-w-md"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        {showGroupSort && (
          <div className="flex items-center gap-2">
            <select
              value={groupSort?.key || "default"}
              onChange={(e) =>
                onGroupSortChange?.({
                  ...(groupSort || { direction: "desc" }),
                  key: e.target.value,
                })
              }
              className="h-8 rounded border border-input bg-background px-2 text-xs"
            >
              <option value="default">{t("common.default") || "Default"}</option>
              <option value="amount">{t("common.amount") || "Amount"}</option>
              <option value="count">{t("common.count") || "Count"}</option>
              <option value="name">{t("common.name") || "Name"}</option>
            </select>
            <select
              value={groupSort?.direction || "desc"}
              onChange={(e) =>
                onGroupSortChange?.({
                  ...(groupSort || { key: "default" }),
                  direction: e.target.value,
                })
              }
              className="h-8 rounded border border-input bg-background px-2 text-xs"
            >
              <option value="desc">{t("common.desc") || "Desc"}</option>
              <option value="asc">{t("common.asc") || "Asc"}</option>
            </select>
          </div>
        )}

        {showClearSelection && (
          <AppButton variant="destructive" size="sm" onClick={onClearSelection}>
            {t("common.clear") || "Clear"}
          </AppButton>
        )}
      </div>
    </div>
  );
}

export default AccordionToolbar;
