import React from "react";
import { Textarea } from "@/components/ui/textarea";
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
        "w-full bg-background text-foreground resize-y",
        error && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      style={{ maxWidth, minHeight: `${Math.max(minRows, 2) * 22}px`, maxHeight: `${maxRows * 30}px` }}
      {...rest}
    />
  );
}

export default ExpenseThemedCommentField;
