import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ArrowLeft, LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useUserSettings } from "@/shared/hooks/settings/useUserSettings";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { ExpenseNameAutocomplete } from "@/features/expenses/components/form/ExpenseNameAutocomplete";
import { FlowExpenseCards } from "./FlowExpenseCards";
import { EnhancedDataTable } from "@/shared/components/data/EnhancedDataTable";
import { normalizeFlowExpenseRecords } from "@/shared/utils/flow/normalizeFlowExpenseRecords";
import { matchFlowExpenseSearchQuery } from "@/shared/utils/flow/matchFlowExpenseSearchQuery";
import { buildFlowEntityExpenseTableColumns } from "./flowEntityExpenseTableColumns";
import { FLOW_INLINE_DRILLDOWN_MAX_HEIGHT_CLASS } from "@/config/chartConfig";
import { cn } from "@/lib/utils";

const SHEET_LIST_SCROLL =
  "flex flex-col min-h-0 gap-3 sm:gap-4 max-h-[min(58vh,520px)] sm:max-h-[min(62vh,560px)] overflow-y-auto overflow-x-hidden overscroll-contain theme-scrollbar pr-1 pb-2";
const INLINE_LIST_SCROLL =
  "flex flex-1 min-h-0 flex-col gap-3 sm:gap-4 overflow-y-auto overflow-x-hidden overscroll-contain theme-scrollbar pr-1 pb-2";
const TABLE_PAGE_SIZE = 5;
const TABLE_SCROLL_ROWS = 8;
const DRILLDOWN_TABLE_VIEWPORT_EXTRA_PX = 50;

function FlowDrilldownViewModeToggle({
  viewMode,
  onViewCards,
  onViewTable,
  viewCardsLabel,
  viewTableLabel,
}) {
  return (
    <div className="flex shrink-0 gap-1 rounded-lg border border-primary/25 bg-muted/30 p-0.5">
      <Button
        type="button"
        variant={viewMode === "cards" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary [&_svg]:text-primary"
        aria-pressed={viewMode === "cards"}
        aria-label={viewCardsLabel}
        onClick={onViewCards}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={viewMode === "table" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary [&_svg]:text-primary"
        aria-pressed={viewMode === "table"}
        aria-label={viewTableLabel}
        onClick={onViewTable}
      >
        <Table2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function FlowEntityDrilldownToolbar({
  layout,
  onCancel,
  backLabel,
  title,
  summaryLine,
  searchQuery,
  onSearchChange,
  expenseNames,
  viewMode,
  onViewCards,
  onViewTable,
  viewCardsLabel,
  viewTableLabel,
  searchPlaceholder,
  noSearchMatchesText,
}) {
  const isSheet = layout === "sheet";

  return (
    <div className="flex shrink-0 flex-col gap-2">
      {isSheet ? (
        <>
          <div className="w-full space-y-1 px-2 pr-12 text-center sm:px-4 sm:pr-14">
            <h2 className="text-base font-semibold leading-tight text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{summaryLine}</p>
          </div>
          <div className="flex w-full min-w-0 items-center gap-2">
            <div className="min-w-0 flex-1">
              <ExpenseNameAutocomplete
                options={expenseNames}
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                noDataText={noSearchMatchesText}
                maxWidth="100%"
                inputHeight="36px"
                className="w-full min-w-0 max-w-none px-2 text-xs font-normal"
              />
            </div>
            <FlowDrilldownViewModeToggle
              viewMode={viewMode}
              onViewCards={onViewCards}
              onViewTable={onViewTable}
              viewCardsLabel={viewCardsLabel}
              viewTableLabel={viewTableLabel}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary [&_svg]:text-primary"
                aria-label={backLabel}
                onClick={onCancel}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : null}
            <div className="min-w-0 space-y-1">
              <h2 className="text-base font-semibold leading-tight text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground">{summaryLine}</p>
            </div>
          </div>
          <div className="flex w-full shrink-0 items-center justify-end gap-2 lg:w-auto">
            <ExpenseNameAutocomplete
              options={expenseNames}
              value={searchQuery}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              noDataText={noSearchMatchesText}
              maxWidth="220px"
              inputHeight="36px"
              className="w-full max-w-[200px] px-2 text-xs font-normal sm:max-w-[220px] lg:w-48"
            />
            <FlowDrilldownViewModeToggle
              viewMode={viewMode}
              onViewCards={onViewCards}
              onViewTable={onViewTable}
              viewCardsLabel={viewCardsLabel}
              viewTableLabel={viewTableLabel}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function FlowEntityExpenseDrilldownContent({
  entityName,
  expenses,
  entityVariant = "category",
  flowTab = "all",
  onExpenseNavigate,
  onCancel,
  layout = "sheet",
}) {
  const { t } = useLanguage();
  const { settings } = useUserSettings();
  const { format: formatMoney } = useMoneyFormatter();
  const [viewMode, setViewMode] = useState("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const isInline = layout === "inline";

  useEffect(() => {
    setViewMode("cards");
  }, [entityName, expenses]);

  useEffect(() => {
    setSearchQuery("");
  }, [entityName]);

  const rows = useMemo(() => normalizeFlowExpenseRecords(expenses), [expenses]);

  const expenseNames = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const r of rows) {
      const n = (r.name || "").trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
    out.sort((a, b) => a.localeCompare(b));
    return out;
  }, [rows]);

  const totals = useMemo(() => {
    const count = rows.length;
    const sum = rows.reduce((acc, r) => acc + Math.abs(Number(r.amount) || 0), 0);
    return { count, sum };
  }, [rows]);

  const tableColumns = useMemo(
    () =>
      buildFlowEntityExpenseTableColumns({
        t,
        variant: entityVariant,
        formatMoney,
        dateFormat: settings.dateFormat,
      }),
    [t, entityVariant, formatMoney, settings.dateFormat],
  );

  const handleCardClick = useCallback(
    (expense) => {
      const id = expense?.id;
      if (id != null) onExpenseNavigate?.(id);
    },
    [onExpenseNavigate],
  );

  const filterRowGlobalFn = useCallback((row, _columnId, filterValue) => {
    return matchFlowExpenseSearchQuery(row.original, String(filterValue ?? ""));
  }, []);

  const hideCategory = entityVariant === "category";
  const hidePaymentMethod = entityVariant === "paymentMethod";
  const title = t("flows.expensesTable.entityTitle", { name: entityName || "—" });
  const listScrollClass = isInline ? INLINE_LIST_SCROLL : SHEET_LIST_SCROLL;
  const sheetTableMaxH = "max-h-[min(52vh,480px)]";

  const summaryLine = t("flows.expensesTable.summary", {
    count: totals.count,
    total: formatMoney(totals.sum),
  });

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col gap-3",
        !isInline && "min-h-0 flex-1",
        isInline &&
          cn(
            "overflow-hidden rounded-lg border bg-card p-3 md:p-4",
            FLOW_INLINE_DRILLDOWN_MAX_HEIGHT_CLASS,
          ),
      )}
    >
      <FlowEntityDrilldownToolbar
        layout={layout}
        onCancel={onCancel}
        backLabel={t("flows.expensesTable.backToList")}
        title={title}
        summaryLine={summaryLine}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        expenseNames={expenseNames}
        viewMode={viewMode}
        onViewCards={() => setViewMode("cards")}
        onViewTable={() => setViewMode("table")}
        viewCardsLabel={t("flows.expensesTable.viewCards")}
        viewTableLabel={t("flows.expensesTable.viewTable")}
        searchPlaceholder={t("common.search")}
        noSearchMatchesText={t("flows.expensesTable.nameSearchNoMatches")}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {viewMode === "cards" ? (
          <FlowExpenseCards
            data={rows}
            loading={false}
            flowTab={flowTab}
            hideCategory={hideCategory}
            hidePaymentMethod={hidePaymentMethod}
            searchQuery={searchQuery}
            listContainerClassName={listScrollClass}
            className="min-h-0 flex flex-1 flex-col"
            onCardClick={handleCardClick}
          />
        ) : (
          <EnhancedDataTable
            className="flex min-h-0 flex-1 flex-col gap-3"
            columns={tableColumns}
            data={rows}
            searchable
            hideSearchToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            filterRowGlobalFn={filterRowGlobalFn}
            showPagination
            defaultPageSize={TABLE_PAGE_SIZE}
            pageSizeOptions={[5, 10, 20]}
            scrollBodyMaxRows={TABLE_SCROLL_ROWS}
            scrollBodyAlwaysSized
            scrollBodyHeightExtraPx={DRILLDOWN_TABLE_VIEWPORT_EXTRA_PX}
            emptyMessage={t("flows.expensesTable.empty")}
            emptySubMessage={t("flows.expensesTable.emptyHint")}
            emptyPlaceholderSize={isInline ? "fill" : "sm"}
            tableSectionClassName={isInline ? "min-h-0 flex-1" : undefined}
            tableContainerClassName={isInline ? "min-h-0" : sheetTableMaxH}
            onRowClick={
              onExpenseNavigate ? (original) => onExpenseNavigate(original?.id) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
