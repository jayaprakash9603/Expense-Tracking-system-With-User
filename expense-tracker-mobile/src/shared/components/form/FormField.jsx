import React, { useState } from "react";
import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  className,
  inputClassName,
  disabled,
  autoComplete,
  inputMode,
  onFocusExtra,
  onChangeExtra,
  onBlurExtra,
}) {
  const { t } = useLanguage();
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

  const handleBlur = (e) => {
    field.onBlur(e);
    onBlurExtra?.(e);
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
          inputMode={inputMode}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className={cn(
            "h-10 md:h-11",
            hasError && "border-destructive focus-visible:ring-destructive",
            isPasswordField && "pr-10",
            inputClassName
          )}
          {...field}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
      {hasError && meta.error ? (
        <span id={`${name}-error`} className="sr-only">
          {meta.error?.includes(".") ? t(meta.error) : meta.error}
        </span>
      ) : null}
    </div>
  );
}

export default FormField;
