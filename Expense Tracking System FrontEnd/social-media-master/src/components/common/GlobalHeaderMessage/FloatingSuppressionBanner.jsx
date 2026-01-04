import React, { useEffect, useMemo, useState } from "react";
import NotificationsPausedIcon from "@mui/icons-material/NotificationsPaused";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const FloatingSuppressionBanner = ({
  suppressUntil,
  title = "Floating alerts paused",
  description = "",
  onResume,
  showResumeAction = false,
}) => {
  const [remainingMs, setRemainingMs] = useState(() => {
    if (!suppressUntil) return 0;
    return clamp(suppressUntil - Date.now(), 0, Number.MAX_SAFE_INTEGER);
  });

  useEffect(() => {
    if (!suppressUntil) {
      setRemainingMs(0);
      return undefined;
    }

    const updateRemaining = () => {
      setRemainingMs(
        clamp(suppressUntil - Date.now(), 0, Number.MAX_SAFE_INTEGER)
      );
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [suppressUntil]);

  const seconds = useMemo(() => Math.ceil(remainingMs / 1000), [remainingMs]);

  if (!suppressUntil || seconds <= 0) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2 text-xs font-semibold"
      aria-live="polite"
      aria-label={`${title}. Resumes in ${seconds} seconds`}
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        background: "rgba(99, 102, 241, 0.18)",
        color: "#1f2937",
      }}
    >
      <NotificationsPausedIcon sx={{ fontSize: 16 }} />
      <div className="flex flex-col leading-tight">
        <span className="uppercase tracking-wide text-[10px] text-gray-600">
          {title}
        </span>
        <span className="text-[11px] font-semibold text-gray-800">
          Resumes in {seconds}s{description ? ` · ${description}` : ""}
        </span>
      </div>
      {showResumeAction && onResume && (
        <button
          type="button"
          onClick={onResume}
          className="text-[10px] font-bold uppercase tracking-wide ml-2 px-2 py-1 rounded-full border border-white/60 hover:bg-white/20"
          style={{ backgroundColor: "transparent" }}
        >
          Resume
        </button>
      )}
    </div>
  );
};

export default FloatingSuppressionBanner;
