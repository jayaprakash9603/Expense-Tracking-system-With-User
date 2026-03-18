import React from "react";

export default function FormRow({
  children,
  className = "",
  first = false,
}) {
  const base = first
    ? "mt-2 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 w-full"
    : "mt-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 w-full";

  return <div className={`${base} ${className}`}>{children}</div>;
}
