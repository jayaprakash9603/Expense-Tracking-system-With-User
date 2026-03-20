import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NUMBER_SPINNER_HIDE =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function ExpenseThemedAmountField({
  id = "amount",
  name,
  value,
  onChange,
  onClearError,
  placeholder,
  error = false,
  height,
  maxWidth = "300px",
  className,
  ...rest
}) {
  const handleChange = useCallback(
    (event) => {
      const inputValue = event.target.value;
      if (inputValue !== "" && (Number(inputValue) < 0 || inputValue.includes("-"))) {
        return;
      }
      onChange?.(event);
      onClearError?.();
    },
    [onChange, onClearError],
  );

  const handleKeyDown = useCallback((event) => {
    if (["-", "e", "E"].includes(event.key)) {
      event.preventDefault();
    }
  }, []);

  return (
    <Input
      id={id}
      name={name || id}
      type="number"
      value={value ?? ""}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      inputMode="decimal"
      className={cn(
        "h-12 rounded-lg border-2 bg-card px-3 py-2 text-sm font-medium shadow-sm transition-[border-color,box-shadow]",
        "placeholder:text-muted-foreground",
        NUMBER_SPINNER_HIDE,
        error
          ? "border-destructive focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/30"
          : "border-primary/55 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25",
        "focus-visible:outline-none",
        className,
      )}
      style={{
        maxWidth,
        ...(height != null
          ? { height: typeof height === "number" ? `${height}px` : height }
          : {}),
      }}
      {...rest}
    />
  );
}

export default ExpenseThemedAmountField;
