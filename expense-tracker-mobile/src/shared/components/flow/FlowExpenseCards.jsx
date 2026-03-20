import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { ArrowDown, ArrowUp, CalendarDays, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FlowExpenseCard } from "./FlowExpenseCard";
import { FlowExpenseCardsSkeleton } from "./skeletons";
import { getFuzzyMatchIndices } from "@/features/expenses/utils/expenseFuzzyUtils";
import { cn } from "@/lib/utils";

function toInputDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

function toDateKey(value) {
  const date = toInputDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateDisplay(dateInput) {
  const d = toInputDate(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateCompact(dateInput) {
  const d = toInputDate(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function extractMonthKey(dateKey) {
  if (!dateKey || dateKey.length < 7) return "";
  return dateKey.slice(0, 7);
}

function formatMonthLabel(monthKey, compact = false) {
  if (!monthKey) return "";
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return "";
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", {
    month: compact ? "short" : "long",
    year: "numeric",
  });
}

function groupExpensesByDate(expenses, sortOrder) {
  const groups = {};

  expenses.forEach((exp) => {
    const dateKey = toDateKey(exp.date || "");
    if (!dateKey) return;
    if (!groups[dateKey]) {
      groups[dateKey] = {
        displayDate: formatDateDisplay(dateKey),
        expenses: [],
      };
    }
    groups[dateKey].expenses.push(exp);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) =>
    sortOrder === "desc" ? b.localeCompare(a) : a.localeCompare(b),
  );

  return sortedKeys.map((key) => ({
    dateKey: key,
    ...groups[key],
  }));
}

function buildMonthGroups(dateGroups) {
  const monthMap = new Map();

  dateGroups.forEach((group) => {
    const monthKey = extractMonthKey(group.dateKey);
    if (!monthKey) return;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        monthKey,
        label: formatMonthLabel(monthKey),
        dateKeys: [],
      });
    }

    monthMap.get(monthKey).dateKeys.push(group.dateKey);
  });

  return Array.from(monthMap.values());
}

function expenseMatchesSearchQuery(expense, rawQuery) {
  const q = (rawQuery || "").trim();
  if (!q) return true;
  const blob = [
    expense.name,
    expense.description,
    expense.comments,
    expense.categoryName,
    expense.paymentMethod,
    String(expense.amount),
    expense.type,
  ]
    .filter(Boolean)
    .join(" ");
  return getFuzzyMatchIndices(blob, q) != null;
}

const DEFAULT_LIST_SCROLL_CLASS =
  "flex flex-col min-h-0 gap-3 sm:gap-4 max-h-[280px] sm:max-h-[320px] md:max-h-[360px] lg:max-h-[390px] overflow-y-auto overflow-x-hidden overscroll-contain theme-scrollbar pr-1 pb-2";

export function FlowExpenseCards({
  data = [],
  loading,
  flowTab,
  onCardClick,
  className,
  hideCategory = false,
  hidePaymentMethod = false,
  listContainerClassName,
  searchQuery = "",
}) {
  const { t } = useLanguage();
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeDateKey, setActiveDateKey] = useState("");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isMonthSheetOpen, setIsMonthSheetOpen] = useState(false);
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const scrollRef = useRef(null);
  const activeDateKeyRef = useRef("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    return data.filter((exp) => expenseMatchesSearchQuery(exp, searchQuery));
  }, [data, searchQuery]);

  const dateGroups = useMemo(
    () => groupExpensesByDate(filteredData, sortOrder),
    [filteredData, sortOrder],
  );

  const dateGroupByKey = useMemo(() => (
    new Map(dateGroups.map((group) => [group.dateKey, group]))
  ), [dateGroups]);

  const orderedDateKeys = useMemo(
    () => dateGroups.map((group) => group.dateKey),
    [dateGroups],
  );

  const availableDateKeySet = useMemo(
    () => new Set(orderedDateKeys),
    [orderedDateKeys],
  );

  const monthGroups = useMemo(() => buildMonthGroups(dateGroups), [dateGroups]);

  useEffect(() => {
    activeDateKeyRef.current = activeDateKey;
  }, [activeDateKey]);

  useEffect(() => {
    if (!dateGroups.length) {
      setActiveDateKey("");
      activeDateKeyRef.current = "";
      return;
    }

    setActiveDateKey((prev) => {
      const resolved = prev && dateGroupByKey.has(prev) ? prev : dateGroups[0].dateKey;
      activeDateKeyRef.current = resolved;
      return resolved;
    });
  }, [dateGroups, dateGroupByKey]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !dateGroups.length) return undefined;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const sections = container.querySelectorAll("[data-date-key]");
        const threshold = container.getBoundingClientRect().top + 84;
        let nextDateKey = dateGroups[0].dateKey;

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const sectionDateKey = section.getAttribute("data-date-key");
          if (rect.top <= threshold && sectionDateKey) {
            nextDateKey = sectionDateKey;
          }
        });

        if (nextDateKey && nextDateKey !== activeDateKeyRef.current) {
          activeDateKeyRef.current = nextDateKey;
          setActiveDateKey(nextDateKey);
        }

        ticking = false;
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [dateGroups]);

  const scrollToDateKey = useCallback((dateKey, behavior = "auto") => {
    const container = scrollRef.current;
    if (!container || !dateKey) return;

    const target = container.querySelector(`[data-date-key="${dateKey}"]`);
    if (!target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const scrollOffset = targetRect.top - containerRect.top + container.scrollTop;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const targetScroll = Math.max(scrollOffset - 6, 0);

    container.scrollTo({
      top: Math.min(targetScroll, maxScroll),
      behavior,
    });

    activeDateKeyRef.current = dateKey;
    setActiveDateKey(dateKey);
  }, []);

  const currentDateGroup = useMemo(() => {
    if (!dateGroups.length) return null;
    return dateGroupByKey.get(activeDateKey) || dateGroups[0];
  }, [activeDateKey, dateGroupByKey, dateGroups]);

  const activeMonthKey = useMemo(
    () => currentDateGroup ? extractMonthKey(currentDateGroup.dateKey) : "",
    [currentDateGroup],
  );

  const currentMonth = useMemo(() => {
    if (!monthGroups.length) return "";
    const activeMonth = monthGroups.find((month) => month.monthKey === activeMonthKey);
    return activeMonth?.label || monthGroups[0].label;
  }, [activeMonthKey, monthGroups]);
  const currentMonthCompact = useMemo(
    () => formatMonthLabel(activeMonthKey, true) || currentMonth,
    [activeMonthKey, currentMonth],
  );

  const currentDate = currentDateGroup?.displayDate || "";
  const currentDateCompact = useMemo(
    () => formatDateCompact(currentDateGroup?.dateKey || ""),
    [currentDateGroup],
  );

  const activeDateIndex = orderedDateKeys.indexOf(currentDateGroup?.dateKey || "");
  const canGoPrevDate = activeDateIndex > 0;
  const canGoNextDate = activeDateIndex !== -1 && activeDateIndex < orderedDateKeys.length - 1;

  const activeMonthIndex = monthGroups.findIndex((month) => month.monthKey === activeMonthKey);
  const canGoPrevMonth = activeMonthIndex > 0;
  const canGoNextMonth = activeMonthIndex !== -1 && activeMonthIndex < monthGroups.length - 1;

  const selectedDate = useMemo(
    () => parseDateKey(currentDateGroup?.dateKey || ""),
    [currentDateGroup],
  );

  const toggleSort = useCallback(() => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    activeDateKeyRef.current = "";
    setActiveDateKey("");
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const navigateDate = useCallback((direction) => {
    if (activeDateIndex === -1) return;
    const nextIndex = direction === "prev" ? activeDateIndex - 1 : activeDateIndex + 1;
    if (nextIndex < 0 || nextIndex >= orderedDateKeys.length) return;
    scrollToDateKey(orderedDateKeys[nextIndex], "auto");
  }, [activeDateIndex, orderedDateKeys, scrollToDateKey]);

  const navigateMonth = useCallback((direction) => {
    if (activeMonthIndex === -1) return;
    const nextIndex = direction === "prev" ? activeMonthIndex - 1 : activeMonthIndex + 1;
    if (nextIndex < 0 || nextIndex >= monthGroups.length) return;
    const targetDateKey = monthGroups[nextIndex]?.dateKeys?.[0];
    if (!targetDateKey) return;
    scrollToDateKey(targetDateKey, "auto");
  }, [activeMonthIndex, monthGroups, scrollToDateKey]);

  const selectMonth = useCallback((monthKey) => {
    const month = monthGroups.find((item) => item.monthKey === monthKey);
    const targetDateKey = month?.dateKeys?.[0];
    if (!targetDateKey) return;
    scrollToDateKey(targetDateKey, "auto");
    setIsMonthPickerOpen(false);
    setIsMonthSheetOpen(false);
  }, [monthGroups, scrollToDateKey]);

  const selectDate = useCallback((selected) => {
    if (!selected) return;
    const dateKey = toDateKey(selected);
    if (!availableDateKeySet.has(dateKey)) return;
    scrollToDateKey(dateKey, "auto");
    setIsDatePickerOpen(false);
    setIsDateSheetOpen(false);
  }, [availableDateKeySet, scrollToDateKey]);

  const navigateMonthFromSheet = useCallback((direction) => {
    navigateMonth(direction);
    setIsMonthSheetOpen(false);
  }, [navigateMonth]);

  if (loading) {
    return <FlowExpenseCardsSkeleton count={5} className={className} />;
  }

  if (!data.length) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center sm:py-20",
          className,
        )}
      >
        <p className="text-base font-semibold text-foreground sm:text-lg">
          {t("flows.expensesTable.empty")}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("flows.expensesTable.emptyHint")}</p>
      </div>
    );
  }

  if (!filteredData.length) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center sm:py-20",
          className,
        )}
      >
        <p className="text-base font-semibold text-foreground sm:text-lg">{t("common.noResults")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("flows.expensesTable.filterNoResultsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col min-h-0 gap-2 sm:gap-3", className)}>
      <div className="rounded-lg bg-card border px-2.5 sm:px-3 py-1.5 sm:py-2 sticky top-0 z-10 backdrop-blur-sm">
        <div className="sm:hidden flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMonthSheetOpen(true)}
              className="w-[104px] text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full inline-flex items-center gap-1 hover:bg-primary/20 transition-colors"
            >
              <span className="truncate">{currentMonthCompact}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0" />
            </button>

            <div className="flex items-center gap-1 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => navigateDate("prev")}
                disabled={!canGoPrevDate}
                className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsDateSheetOpen(true)}
                className="min-w-0 flex-1 text-[11px] font-semibold text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded-full inline-flex items-center justify-center gap-1 hover:bg-primary/20 transition-colors"
                aria-label={t("common.selectDate") || "Select date"}
                title={currentDateCompact || currentDate}
              >
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{currentDateCompact || currentDate}</span>
              </button>

              <button
                type="button"
                onClick={() => navigateDate("next")}
                disabled={!canGoNextDate}
                className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={toggleSort}
              className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              aria-label={sortOrder === "desc" ? t("common.recentFirst") || "Recent first" : t("common.oldFirst") || "Old first"}
              title={sortOrder === "desc" ? t("common.recentFirst") || "Recent first" : t("common.oldFirst") || "Old first"}
            >
              {sortOrder === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5 shrink-0" />
              )}
            </button>
        </div>

        <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              disabled={!canGoPrevMonth}
              className="h-6 w-6 sm:h-7 sm:w-7 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>

            <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="max-w-[150px] sm:max-w-[190px] text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full inline-flex items-center gap-1 hover:bg-primary/20 transition-colors"
                >
                  <span className="truncate">{currentMonth}</span>
                  <ChevronsUpDown className="h-3.5 w-3.5 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={6} className="w-[220px] p-2">
                <div className="max-h-[240px] overflow-y-auto theme-scrollbar pr-1 space-y-1">
                  {monthGroups.map((month) => (
                    <button
                      key={month.monthKey}
                      type="button"
                      onClick={() => selectMonth(month.monthKey)}
                      className={cn(
                        "w-full text-left text-sm rounded-md px-2.5 py-2 transition-colors",
                        month.monthKey === activeMonthKey
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent",
                      )}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => navigateMonth("next")}
              disabled={!canGoNextMonth}
              className="h-6 w-6 sm:h-7 sm:w-7 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 justify-self-center">
            <button
              type="button"
              onClick={() => navigateDate("prev")}
              disabled={!canGoPrevDate}
              className="h-6 w-6 sm:h-7 sm:w-7 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>

            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="max-w-[140px] sm:max-w-[170px] text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full inline-flex items-center gap-1 hover:bg-primary/20 transition-colors"
                >
                  <span className="truncate">{currentDate}</span>
                  <ChevronsUpDown className="h-3.5 w-3.5 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="center" sideOffset={6} className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={selectDate}
                  defaultMonth={selectedDate || parseDateKey(orderedDateKeys[0]) || new Date()}
                  disabled={(date) => !availableDateKeySet.has(toDateKey(date))}
                />
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => navigateDate("next")}
              disabled={!canGoNextDate}
              className="h-6 w-6 sm:h-7 sm:w-7 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleSort}
            className="justify-self-end flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
          >
            {sortOrder === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5" />
            )}
            {sortOrder === "desc" ? t("common.recentFirst") || "RECENT FIRST" : t("common.oldFirst") || "OLD FIRST"}
          </button>
        </div>
      </div>

      <Sheet open={isMonthSheetOpen} onOpenChange={setIsMonthSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-safe-bottom">
          <SheetHeader>
            <SheetTitle>{t("common.selectMonth") || "Select month"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <button
                type="button"
                onClick={() => navigateMonthFromSheet("prev")}
                disabled={!canGoPrevMonth}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-primary">{currentMonthCompact}</span>
              <button
                type="button"
                onClick={() => navigateMonthFromSheet("next")}
                disabled={!canGoNextMonth}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto theme-scrollbar pr-1 space-y-1">
              {monthGroups.map((month) => (
                <button
                  key={month.monthKey}
                  type="button"
                  onClick={() => selectMonth(month.monthKey)}
                  className={cn(
                    "w-full text-left text-sm rounded-md px-3 py-2 transition-colors",
                    month.monthKey === activeMonthKey
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  {month.label}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isDateSheetOpen} onOpenChange={setIsDateSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-3 pb-safe-bottom">
          <SheetHeader>
            <SheetTitle>{t("common.selectDate") || "Select date"}</SheetTitle>
          </SheetHeader>
          <div className="mt-3 mb-2 flex items-center justify-between rounded-lg border px-3 py-2">
            <button
              type="button"
              onClick={() => navigateDate("prev")}
              disabled={!canGoPrevDate}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-primary">{currentDateCompact || currentDate}</span>
            <button
              type="button"
              onClick={() => navigateDate("next")}
              disabled={!canGoNextDate}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={selectDate}
              defaultMonth={selectedDate || parseDateKey(orderedDateKeys[0]) || new Date()}
              disabled={(date) => !availableDateKeySet.has(toDateKey(date))}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div
        ref={scrollRef}
        className={listContainerClassName || DEFAULT_LIST_SCROLL_CLASS}
      >
        {dateGroups.map((group, groupIdx) => (
          <div key={group.dateKey} data-date-key={group.dateKey}>
            <div className={cn("flex items-center gap-4", groupIdx === 0 ? "mb-3" : "my-4")}>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent to-primary/40" />
              <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full whitespace-nowrap">
                {group.displayDate}
              </span>
              <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent to-primary/40" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
              {group.expenses.map((expense) => (
                <FlowExpenseCard
                  key={expense.id || expense.expenseId}
                  expense={expense}
                  flowTab={flowTab}
                  hideCategory={hideCategory}
                  hidePaymentMethod={hidePaymentMethod}
                  onClick={() => onCardClick?.(expense)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
