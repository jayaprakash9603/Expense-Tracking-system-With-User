import React, { useState } from "react";
import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  className,
  inputClassName,
  disabled,
  autoComplete,
  onFocusExtra,
  onChangeExtra,
}) {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const hasError = meta.touched && meta.error;
  const isPasswordField = type === "password";
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

  const handleChange = (e) => {
    field.onChange(e);
    onChangeExtra?.(e);
  };

  const handleFocus = (e) => {
    onFocusExtra?.(e);
  };

  return (
    <div className={cn("space-y-1.5 md:space-y-2", className)}>
      {label ? (
        <Label htmlFor={name} className={cn("text-sm md:text-sm", hasError && "text-destructive")}>
          {label}
        </Label>
      ) : null}
      <div className="relative">
        <Input
          id={name}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={cn(
            "h-10 md:h-11",
            hasError && "border-destructive focus-visible:ring-destructive",
            isPasswordField && "pr-10",
            inputClassName
          )}
          {...field}
          onChange={handleChange}
          onFocus={handleFocus}
        />
        {isPasswordField ? (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {hasError ? (
        <p className="text-xs md:text-sm text-destructive">{meta.error}</p>
      ) : null}
    </div>
  );
}

export default FormField;
