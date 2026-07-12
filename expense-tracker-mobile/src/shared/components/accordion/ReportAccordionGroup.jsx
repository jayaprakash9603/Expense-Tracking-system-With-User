import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function ReportAccordionGroup({
  items,
  type = "multiple",
  defaultValue,
  className,
  itemClassName,
}) {
  return (
    <Accordion type={type} defaultValue={defaultValue} className={cn("space-y-3", className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className={cn("overflow-hidden rounded-xl border border-border bg-card", itemClassName)}
        >
          <AccordionTrigger className="px-3 py-3 hover:no-underline sm:px-4">{item.trigger}</AccordionTrigger>
          <AccordionContent className="border-t border-border/60 px-0 pb-3 pt-0 sm:px-1">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
