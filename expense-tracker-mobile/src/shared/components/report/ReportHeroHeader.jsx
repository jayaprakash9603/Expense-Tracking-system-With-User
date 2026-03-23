import { cn } from "@/lib/utils";

export const REPORT_HERO_HEADER_ROOT_CLASS =
  "sticky top-0 z-20 mb-6 rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5 backdrop-blur-sm md:px-4 md:py-3";

export function ReportHeroHeader({
  titleSlot,
  centerSlot = null,
  desktopEndSlot = null,
  mobileTopEndSlot = null,
  mobileFooterSlot = null,
  className,
}) {
  const centerColumn =
    centerSlot != null ? (
      <div className="flex w-full min-w-0 flex-1 flex-wrap items-center justify-center gap-2 lg:justify-center">
        {centerSlot}
      </div>
    ) : null;

  return (
    <div className={cn(REPORT_HERO_HEADER_ROOT_CLASS, className)}>
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex min-w-0 items-start justify-between gap-2">
          {titleSlot}
          {mobileTopEndSlot}
        </div>
        {centerSlot}
        {mobileFooterSlot}
      </div>

      <div className="hidden min-w-0 flex-col gap-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-4 lg:gap-y-2">
        {titleSlot}
        {centerColumn}
        {desktopEndSlot}
      </div>
    </div>
  );
}
