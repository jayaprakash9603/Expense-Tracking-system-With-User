import React from "react";
import { useTheme } from "../../hooks/useTheme";

const PulseLoader = ({
  message = "Loading...",
  fullscreen = true,
  backdrop = true,
}) => {
  const { colors } = useTheme();

  const containerClasses = [
    fullscreen ? "fixed inset-0" : "relative w-full h-full",
    "z-[9999] grid place-items-center",
  ]
    .filter(Boolean)
    .join(" ");

  const backdropStyle = backdrop
    ? {
        background: `${colors.primary_bg}dd`,
        backdropFilter: "blur(8px)",
      }
    : {};

  return (
    <div
      className={containerClasses}
      style={backdropStyle}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center p-6">
        <div className="flex space-x-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-full animate-bounce shadow-lg"
              style={{
                backgroundColor: colors.primary_accent,
                boxShadow: `0 0 12px ${colors.primary_accent}30`,
                animationDelay: `${index * 200}ms`,
                animationDuration: "1s",
                animationIterationCount: "infinite",
                animationTimingFunction: "ease-in-out",
              }}
            />
          ))}
        </div>
        {message && (
          <p
            className="mt-6 text-sm font-medium select-none animate-pulse"
            style={{ color: colors.primary_text }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PulseLoader;
