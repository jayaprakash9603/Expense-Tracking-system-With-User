import React, { useCallback } from "react";
import { AppInput } from "@/shared/components/form/AppInput";
import { cn } from "@/lib/utils";

export function ExpenseThemedAmountField({
  id = "amount",
  name,
  value,
  onChange,
  onClearError,
  placeholder,
  error = false,
  height = 48,
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
    <AppInput
      id={id}
      name={name || id}
      type="number"
      value={value ?? ""}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      inputMode="decimal"
      className={cn(
        "w-full border-input bg-background text-foreground",
        error && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      style={{ height: `${height}px`, maxWidth }}
      {...rest}
    />
  );
}

export default ExpenseThemedAmountField;
