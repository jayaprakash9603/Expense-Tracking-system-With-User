import React from "react";

export default function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
  colors,
  labelWidth = "150px",
  layout = "horizontal",
}) {
  const isVertical = layout === "vertical";

  return (
    <div className="flex flex-col flex-1 w-full">
      <div
        className={
          isVertical
            ? "flex flex-col gap-2"
            : "flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-0"
        }
      >
        {label && (
          <label
            htmlFor={htmlFor}
            className={
              isVertical
                ? "w-full"
                : "w-full shrink-0"
            }
            style={{
              color: colors.primary_text,
              fontSize: "0.875rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              width: isVertical ? undefined : labelWidth,
              minWidth: isVertical ? undefined : labelWidth,
            }}
          >
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <div className="flex-1 w-full max-w-full lg:max-w-[300px]">
          {children}
        </div>
      </div>
      {error && (
        <span
          className="text-red-500 text-sm mt-1 lg:mt-0"
          style={{ marginLeft: isVertical ? undefined : labelWidth }}
        >
          {typeof error === "string" ? error : ""}
        </span>
      )}
    </div>
  );
}
