import React from "react";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { cn } from "@/lib/utils";

const DEFAULT_ICON_SHELL =
  "bg-violet-500/12 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300";

export function ReportHeroTitleBlock({
  title,
  subtitle,
  icon: Icon,
  iconShellClassName,
  leading = null,
  className,
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:max-w-[min(100%,24rem)]",
        className,
      )}
    >
      {leading}
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10",
          iconShellClassName ?? DEFAULT_ICON_SHELL,
        )}
      >
        <AppIcon icon={Icon} size="md" color="inherit" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="text-base font-bold leading-tight text-primary md:text-lg">{title}</h1>
        {subtitle ? (
          <span className="text-xs leading-snug text-muted-foreground text-balance">{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
}
