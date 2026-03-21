import React from "react";
import { Textarea } from "@/shared/components/app-shadcn";
import { cn } from "@/lib/utils";

export function ExpenseThemedCommentField({
  id = "comments",
  name,
  value,
  onChange,
  placeholder,
  error = false,
  minRows = 3,
  maxRows = 5,
  maxWidth = "920px",
  className,
  ...rest
}) {
  return (
    <Textarea
      id={id}
      name={name || id}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={minRows}
      className={cn(
        "w-full resize-y rounded-lg border-2 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-[border-color,box-shadow]",
        "placeholder:text-muted-foreground focus-visible:outline-none",
        error
          ? "border-destructive focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/30"
          : "border-primary/55 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25",
        className,
      )}
      style={{ maxWidth, minHeight: `${Math.max(minRows, 2) * 22}px`, maxHeight: `${maxRows * 30}px` }}
      {...rest}
    />
  );
}

export default ExpenseThemedCommentField;
