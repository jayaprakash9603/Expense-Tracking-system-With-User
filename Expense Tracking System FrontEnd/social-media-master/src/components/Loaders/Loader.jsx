import React from "react";

const PulseLoader = ({
  message = "Loading...",
  fullscreen = true,
  backdrop = true,
}) => {
  const containerClasses = [
    fullscreen ? "fixed inset-0" : "relative w-full h-full",
    "z-[9999] grid place-items-center",
  ]
    .filter(Boolean)
    .join(" ");

  const backdropStyle = backdrop ? {
    background: "linear-gradient(135deg, rgba(10, 10, 10, 0.85) 0%, rgba(26, 26, 26, 0.85) 100%)",
    backdropFilter: "blur(8px)",
  } : {};

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
              className="w-4 h-4 bg-teal-400 rounded-full animate-bounce shadow-lg shadow-teal-400/30"
              style={{
                animationDelay: `${index * 200}ms`,
                animationDuration: "1s",
                animationIterationCount: "infinite",
                animationTimingFunction: "ease-in-out",
              }}
            />
          ))}
        </div>
        {message && (
          <p className="mt-6 text-sm font-medium text-teal-100 select-none animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PulseLoader;