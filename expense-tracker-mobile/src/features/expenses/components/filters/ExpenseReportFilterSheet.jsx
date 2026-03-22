import React from "react";
import { Button } from "@/shared/components/app-shadcn";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/app-shadcn";
import { Separator } from "@/shared/components/app-shadcn";
import { ScrollArea } from "@/shared/components/app-shadcn";
import { useIsDesktop } from "@/shared/hooks/theme/useMediaQuery";
import { cn } from "@/lib/utils";

export function ExpenseReportFilterSheet({
  open,
  onOpenChange,
  title,
  description,
  doneLabel,
  children,
}) {
  const isDesktop = useIsDesktop();
  const side = isDesktop ? "left" : "bottom";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "flex flex-col gap-0 p-0 sm:max-w-md",
          side === "bottom" && "max-h-[88vh] rounded-t-2xl border-t",
          side === "left" && "h-full",
        )}
      >
        <SheetHeader className="border-b border-border px-4 pb-3 pt-4 text-left sm:px-6">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="max-h-[min(72vh,40rem)] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 pr-3">{children}</div>
        </ScrollArea>
        <Separator />
        <div className="p-4">
          <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
            {doneLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
