import React from "react";
import { CircularProgress } from "@mui/material";

export default function SubmitButton({
  onClick,
  label,
  loadingLabel,
  isSubmitting = false,
  disabled = false,
  colors,
  fullWidth = false,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      disabled={isSubmitting || disabled}
      className={`px-6 py-2 font-semibold rounded transition-all duration-200 ${
        fullWidth ? "w-full" : "w-full sm:w-auto"
      } ${className}`}
      style={{
        backgroundColor: colors.button_bg,
        color: colors.button_text,
        whiteSpace: "nowrap",
        opacity: isSubmitting || disabled ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isSubmitting ? 10 : 0,
        cursor: isSubmitting || disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!isSubmitting && !disabled) {
          e.target.style.backgroundColor = colors.button_hover;
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = colors.button_bg;
      }}
    >
      {isSubmitting ? (
        <>
          <CircularProgress
            size={20}
            sx={{ color: colors.button_text }}
          />
          {loadingLabel && <span>{loadingLabel}</span>}
        </>
      ) : (
        label
      )}
    </button>
  );
}
