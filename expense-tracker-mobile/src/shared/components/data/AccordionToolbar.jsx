import React, { useCallback } from "react";
import { SearchToolbar } from "@/shared/components/search/SearchToolbar";
import { AppButton } from "@/shared/components/form/AppButton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";
import { ACCORDION_SELECTION_CHECKBOX_CLASS } from "./accordionSelectionCheckboxClass";

const SELECT_BTN_CLASS =
  "h-6 min-h-6 shrink-0 px-1.5 text-[0.625rem] font-medium leading-none sm:px-2 sm:text-[0.6875rem]";

const CLEAR_ALL_BTN_CLASS =
  "border-destructive/55 text-destructive hover:bg-destructive/10 hover:text-destructive";

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
  onSelectAll,
  isAllSelected = false,
  selectedCount = 0,
  className,
}) {
  const { t } = useLanguage();

  const showSelectionRow = showSelectAll || showClearSelection;
  const showFilterRow = showGroupSearch || showGroupSort;
  const showBothRows = showFilterRow && showSelectionRow;

  const masterChecked =
    isAllSelected ? true : selectedCount > 0 ? "indeterminate" : false;

  const handleMasterCheckboxChange = useCallback(
    (checked) => {
      if (checked === true) onSelectAll?.();
      else onClearSelection?.();
    },
    [onSelectAll, onClearSelection],
  );

  if (!showFilterRow && !showSelectionRow) {
    return null;
  }

  const searchBlock = showGroupSearch ? (
    <SearchToolbar
      compact
      value={groupSearch}
      onChange={onGroupSearchChange}
      placeholder={t("common.searchGroups") || "Search groups..."}
      className="w-full min-w-[8rem] max-w-full flex-1 sm:min-w-[10rem] lg:w-[12rem] lg:max-w-[14rem] lg:flex-none lg:shrink-0"
    />
  ) : null;

  const sortBlock = showGroupSort ? (
    <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
      <Select
        value={groupSort?.key || "default"}
        onValueChange={(val) =>
          onGroupSortChange?.({
            ...(groupSort || { direction: "desc" }),
            key: val,
          })
        }
      >
        <SelectTrigger className="h-8 w-[5.5rem] text-xs sm:w-[6.25rem]">
          <SelectValue placeholder={t("common.default") || "Default"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">{t("common.default") || "Default"}</SelectItem>
          <SelectItem value="amount">{t("common.amount") || "Amount"}</SelectItem>
          <SelectItem value="count">{t("common.count") || "Count"}</SelectItem>
          <SelectItem value="name">{t("common.name") || "Name"}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={groupSort?.direction || "desc"}
        onValueChange={(val) =>
          onGroupSortChange?.({
            ...(groupSort || { key: "default" }),
            direction: val,
          })
        }
      >
        <SelectTrigger className="h-8 w-[4.25rem] text-xs sm:w-[5rem]">
          <SelectValue placeholder={t("common.desc") || "Desc"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">{t("common.desc") || "Desc"}</SelectItem>
          <SelectItem value="asc">{t("common.asc") || "Asc"}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ) : null;

  const filterCluster = (
    <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:min-w-0 lg:flex-1">
      {searchBlock}
      {sortBlock}
    </div>
  );

  const selectionCluster = showSelectionRow ? (
    <div
      className={cn(
        "flex w-full min-w-0 items-center gap-2 lg:w-auto lg:shrink-0",
        showSelectAll && showClearSelection && "justify-between lg:justify-start lg:gap-3",
        showSelectAll && !showClearSelection && "justify-start",
        !showSelectAll && showClearSelection && "justify-end",
        "lg:ml-auto",
      )}
    >
      {showSelectAll ? (
        <div className="flex min-w-0 items-center gap-1.5">
          <Checkbox
            className={ACCORDION_SELECTION_CHECKBOX_CLASS}
            checked={masterChecked}
            onCheckedChange={handleMasterCheckboxChange}
          />
          <AppButton
            type="button"
            fullWidth={false}
            variant="outline"
            size="sm"
            density="compact"
            className={SELECT_BTN_CLASS}
            onClick={onSelectAll}
            disabled={isAllSelected}
          >
            {t("common.selectAll") || "Select All"}
          </AppButton>
        </div>
      ) : null}

      {showClearSelection ? (
        <AppButton
          type="button"
          fullWidth={false}
          variant="outline"
          size="sm"
          density="compact"
          className={cn(SELECT_BTN_CLASS, CLEAR_ALL_BTN_CLASS, "shrink-0")}
          onClick={onClearSelection}
          disabled={selectedCount === 0}
        >
          {t("common.clearAll") || "Clear all"}
        </AppButton>
      ) : null}
    </div>
  ) : null;

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 py-1.5 sm:gap-2 sm:py-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2 lg:py-2",
        className,
      )}
    >
      {showFilterRow ? filterCluster : null}
      {showSelectionRow ? (
        <div
          className={cn(
            "w-full min-w-0 lg:w-auto lg:shrink-0",
            showBothRows &&
              "mt-2 border-t border-border/50 pt-4 lg:mt-0 lg:border-t-0 lg:pt-0",
          )}
        >
          {selectionCluster}
        </div>
      ) : null}
    </div>
  );
}

export default AccordionToolbar;
