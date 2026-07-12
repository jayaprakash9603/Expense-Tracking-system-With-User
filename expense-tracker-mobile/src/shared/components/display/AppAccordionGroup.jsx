import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

/**
 * AppAccordionGroup - Reusable accordion group for reports and layouts
 * Ported and adapted from old codebase to use shadcn/ui primitives.
 *
 * Usage:
 *   <AppAccordionGroup
 *     items={[
 *       { id: '1', summary: 'Panel 1', content: <div>Content 1</div> },
 *       { id: '2', summary: 'Panel 2', content: <div>Content 2</div> },
 *     ]}
 *     exclusive={true}
 *     defaultExpanded="1"
 *   />
 */
export function AppAccordionGroup({
  items = [],
  expanded,
  defaultExpanded,
  onChange,
  exclusive = true,
  variant = "rounded", // 'rounded' | 'square' | 'outlined' | 'ghost'
  dividers = false,
  className,
  ...rest
}) {
  const isControlled = expanded !== undefined;
  const type = exclusive ? "single" : "multiple";

  // Radix Accordion handles controlled vs uncontrolled via value/defaultValue
  // For 'multiple', value must be an array. For 'single', it must be a string.
  const normalizeValue = (val) => {
    if (val === undefined || val === null) return exclusive ? "" : [];
    if (exclusive) return Array.isArray(val) ? val[0] || "" : String(val);
    return Array.isArray(val) ? val.map(String) : [String(val)];
  };

  const valueProp = isControlled ? normalizeValue(expanded) : undefined;
  const defaultValueProp = !isControlled && defaultExpanded !== undefined ? normalizeValue(defaultExpanded) : undefined;

  const containerClass = cn(
    "flex flex-col w-full",
    !dividers && "gap-3",
    className
  );

  return (
    <Accordion
      type={type}
      collapsible={exclusive ? true : undefined}
      value={valueProp}
      defaultValue={defaultValueProp}
      onValueChange={onChange}
      className={containerClass}
      {...rest}
    >
      {items.map((item, index) => {
        const { id, summary, summaryComponent, content, disabled, className: itemClass, triggerClassName, contentClassName, ...itemRest } = item;
        const panelId = id || `panel-${index}`;
        const isLast = index === items.length - 1;

        return (
          <AccordionItem
            key={panelId}
            value={panelId}
            disabled={disabled}
            className={cn(
              "overflow-hidden transition-colors",
              variant === "rounded" && "rounded-xl border bg-card text-card-foreground shadow-sm",
              variant === "outlined" && "rounded-md border bg-transparent",
              variant === "square" && "border-b bg-transparent",
              variant === "ghost" && "border-none bg-transparent",
              dividers && !isLast && variant !== "rounded" && variant !== "outlined" && "border-b",
              itemClass
            )}
            {...itemRest}
          >
            <AccordionTrigger 
              className={cn(
                "px-4 py-3.5 hover:no-underline hover:bg-muted/40 transition-colors text-sm font-semibold",
                triggerClassName
              )}
            >
              {summaryComponent || summary}
            </AccordionTrigger>
            <AccordionContent className={cn("px-4 pb-4 pt-1 text-muted-foreground", contentClassName)}>
              {content}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export default AppAccordionGroup;
