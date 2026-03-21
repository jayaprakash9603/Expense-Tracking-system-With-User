export const LINKED_TABLE_RESERVE_MIN_HEIGHT_CLASS = "min-h-[min(45vh,17rem)]";

const SCROLL_TABLE_HEADER_HEIGHT_PX = 41;
const SCROLL_BODY_MAX_ROWS = 5;
const SCROLL_BODY_ROW_HEIGHT_PX = 42;
const SCROLL_VIEWPORT_SLACK_PX = 10;
const TABLE_BODY_ROW_SEPARATOR_PX = 1;
const ENHANCED_TABLE_GAP_PX = 16;
const DATA_TABLE_PAGINATION_BLOCK_PX = 73.5;

const sizedBodyViewportHeightPx =
  SCROLL_BODY_MAX_ROWS * SCROLL_BODY_ROW_HEIGHT_PX +
  SCROLL_VIEWPORT_SLACK_PX +
  Math.max(0, SCROLL_BODY_MAX_ROWS - 1) * TABLE_BODY_ROW_SEPARATOR_PX;

const selectableTableStackHeightPx =
  SCROLL_TABLE_HEADER_HEIGHT_PX +
  sizedBodyViewportHeightPx +
  ENHANCED_TABLE_GAP_PX +
  DATA_TABLE_PAGINATION_BLOCK_PX;

export const LINKED_ENTITY_TABLE_PANEL_RESERVE_MIN_HEIGHT_PX = selectableTableStackHeightPx;

export const LINKED_CLOSED_PLACEHOLDER_SURFACE_CLASS =
  "flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 bg-muted/20 px-3 text-center text-xs text-muted-foreground sm:text-sm";
