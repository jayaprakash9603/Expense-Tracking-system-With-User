export const ACCORDION_GROUP_ROW_MIN_CLASS = "min-h-[3.5rem]";

export const ACCORDION_GROUP_ROW_REM = 3.5;

export const ACCORDION_GROUP_GAP_REM = 0.375;

export const ACCORDION_GROUP_TRIGGER_PADDING_CLASS = "px-3 py-2 sm:px-3.5 sm:py-2.5";

export const ACCORDION_GROUP_LIST_GAP_CLASS = "space-y-1.5";

export const ACCORDION_GROUP_EMPTY_MAX_REM = 24;

export const ACCORDION_GROUP_VISIBLE_ROW_COUNT = 8;

export const ACCORDION_GROUP_DEFAULT_PAGE_SIZE = 8;

export const ACCORDION_GROUP_VIEWPORT_BUFFER_REM = 0.625;

export function getAccordionGroupViewportMaxHeightRem() {
  const n = ACCORDION_GROUP_VISIBLE_ROW_COUNT;
  return n * ACCORDION_GROUP_ROW_REM + Math.max(0, n - 1) * ACCORDION_GROUP_GAP_REM;
}

export function getAccordionGroupListScrollMaxHeightRem() {
  return getAccordionGroupViewportMaxHeightRem() + ACCORDION_GROUP_VIEWPORT_BUFFER_REM;
}

export function getAccordionGroupEmptyMinHeightRem(pageSize) {
  const rows = Math.max(0, pageSize);
  const raw = rows * ACCORDION_GROUP_ROW_REM + Math.max(0, rows - 1) * ACCORDION_GROUP_GAP_REM;
  const capped = Math.min(raw, ACCORDION_GROUP_EMPTY_MAX_REM);
  const scrollCap = getAccordionGroupListScrollMaxHeightRem();
  if (rows >= ACCORDION_GROUP_VISIBLE_ROW_COUNT) {
    return scrollCap;
  }
  return Math.min(capped, scrollCap);
}
