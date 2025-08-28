import React from "react";

// Modern, accessible loader with customization.
// Props:
// - message: optional text shown under the spinner.
// - fullscreen: render as full-screen overlay (default true).
// - backdrop: dim background with blur (default true).
// - size: diameter of the outer spinner in px (default 72).
const Loader = ({
  message = "Loading...",
  fullscreen = true,
  backdrop = true,
  size = 72,
}) => {
  const outerSize = Math.max(36, Number(size) || 72);
  const innerInset1 = Math.round(outerSize * 0.12); // 12%
  const innerInset2 = Math.round(outerSize * 0.28); // 28%
  const coreSize = Math.max(6, Math.round(outerSize * 0.12));

  const containerClasses = [
    fullscreen ? "fixed inset-0" : "relative w-full h-full",
    "z-[9999] grid place-items-center",
    backdrop ? "bg-gray-900/60 backdrop-blur-sm" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center p-6">
        {/* Triple-ring spinner */}
        <div
          className="relative"
          style={{ width: outerSize, height: outerSize }}
          aria-label={typeof message === "string" ? message : "Loading"}
        >
          {/* Outer ring */}
          <span
            className="absolute inset-0 rounded-full border-4 border-teal-400/20 border-t-teal-400 border-l-teal-400 animate-spin shadow-[0_0_20px_rgba(45,212,191,0.25)]"
            style={{ animationDuration: "1s" }}
          />

          {/* Middle ring (reverse) */}
          <span
            className="absolute rounded-full border-4 border-teal-500/20 border-t-teal-500 border-l-teal-500 animate-spin"
            style={{
              top: innerInset1,
              left: innerInset1,
              right: innerInset1,
              bottom: innerInset1,
              animationDuration: "1.5s",
              animationDirection: "reverse",
            }}
          />

          {/* Inner ring */}
          <span
            className="absolute rounded-full border-4 border-teal-300/20 border-t-teal-300 animate-spin"
            style={{
              top: innerInset2,
              left: innerInset2,
              right: innerInset2,
              bottom: innerInset2,
              animationDuration: "2s",
            }}
          />

          {/* Core pulse */}
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400 shadow-teal-400/40 shadow-md"
            style={{ width: coreSize, height: coreSize }}
          />
        </div>

        {message ? (
          <p className="mt-4 text-sm font-medium text-white/90 select-none">
            {message}
          </p>
        ) : (
          <span className="sr-only">Loading</span>
        )}
      </div>
    </div>
  );
};

export default Loader;
