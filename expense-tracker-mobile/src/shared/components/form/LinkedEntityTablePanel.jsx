import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LINKED_CLOSED_PLACEHOLDER_SURFACE_CLASS,
  LINKED_ENTITY_TABLE_PANEL_RESERVE_MIN_HEIGHT_PX,
} from "@/shared/constants/linkedTableLayout";

export function LinkedEntityTablePanel({
  linkLabel,
  open,
  onOpenChange,
  error,
  children,
  closeAriaLabel,
  summaryWhenClosed,
}) {
  return (
    <>
      <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button type="button" className="w-full sm:w-auto" onClick={() => onOpenChange(true)}>
            {linkLabel}
          </Button>
        </div>
        {open ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="hidden sm:inline-flex"
            onClick={() => onOpenChange(false)}
            aria-label={closeAriaLabel}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {!open && summaryWhenClosed ? (
        <div
          className={cn("mt-4", LINKED_CLOSED_PLACEHOLDER_SURFACE_CLASS)}
          style={{ minHeight: LINKED_ENTITY_TABLE_PANEL_RESERVE_MIN_HEIGHT_PX }}
          role="status"
        >
          {summaryWhenClosed}
        </div>
      ) : null}

      {open ? (
        <div className="relative mt-4 w-full overflow-x-auto overflow-y-visible rounded-lg border border-border/60 bg-card/50">
          <div className="mb-2 flex justify-end px-1 pt-1 sm:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label={closeAriaLabel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full min-w-0">{children}</div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
    </>
  );
}
