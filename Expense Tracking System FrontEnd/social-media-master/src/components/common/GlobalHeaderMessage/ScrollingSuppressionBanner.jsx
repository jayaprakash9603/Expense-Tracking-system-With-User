import React, { useEffect, useState } from "react";
import { useTheme } from "../../../hooks/useTheme";

const clamp = (value, min = 0) => Math.max(value, min);
const formatDuration = (ms) => {
  const totalSeconds = clamp(Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${seconds}s`;
};

const ScrollingSuppressionBanner = ({
  suppressUntil,
  suppressStartedAt,
  label = "Floating alerts paused",
  onResume,
  resumeLabel = "Resume",
  animationDuration = 16,
}) => {
  const { colors, mode } = useTheme();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!suppressUntil) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [suppressUntil]);

  if (!suppressUntil) {
    return null;
  }

  const remainingMs = clamp(suppressUntil - now);
  if (remainingMs <= 0) {
    return null;
  }

  const elapsedMs = suppressStartedAt ? clamp(now - suppressStartedAt) : 0;

  const totalDurationMs = suppressStartedAt
    ? clamp(suppressUntil - suppressStartedAt)
    : 0;
  const effectiveDurationMs =
    totalDurationMs > 0 ? totalDurationMs : 5 * 60 * 1000;
  const blinkThresholdMs = effectiveDurationMs * 0.05;
  const shouldBlink =
    remainingMs <= blinkThresholdMs || elapsedMs <= blinkThresholdMs;
  const isCriticalPhase = remainingMs <= blinkThresholdMs;

  const isDark = mode === "dark";
  const highlightColor = "#14b8a6";
  const textColor = highlightColor;
  const secondaryText = highlightColor;
  const background = isDark ? "#1b1b1b" : "#ffffff";

  return (
    <>
      <div
        className="global-suppression-banner"
        role="status"
        aria-live="polite"
        style={{
          background,
          color: textColor,
          margin: "0 auto",
          border: "none",
        }}
      >
        <div className="global-suppression-track-wrapper">
          <div className="global-suppression-track">
            <span
              className={`global-suppression-text${
                shouldBlink ? " blinking" : ""
              }`}
              style={{ color: secondaryText }}
            >
              <span>{label.toUpperCase()}</span>
              <span className="separator"> · </span>
              <span>Remaining </span>
              <span className={isCriticalPhase ? "critical-text" : ""}>
                {formatDuration(remainingMs)}
              </span>
              {elapsedMs > 0 && (
                <>
                  <span className="separator"> · </span>
                  <span>Paused for </span>
                  <span className={isCriticalPhase ? "critical-text" : ""}>
                    {formatDuration(elapsedMs)}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
        {onResume && (
          <button
            type="button"
            onClick={onResume}
            className="global-suppression-resume"
            style={{ borderColor: highlightColor, color: highlightColor }}
          >
            {resumeLabel}
          </button>
        )}
      </div>

      <style>{`
        .global-suppression-banner {
          width: 100%;
          min-height: 30px;
          border-radius: 999px;
          padding: 4px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: none;
        }

        .global-suppression-track-wrapper {
          overflow: hidden;
          flex: 1;
        }

        .global-suppression-track {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .global-suppression-text {
          font-size: 10px;
          letter-spacing: 0.12em;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .global-suppression-text .separator {
          opacity: 0.5;
        }

        .global-suppression-text .critical-text {
          color: #ef4444;
        }

        .global-suppression-text.blinking {
          animation: globalSuppressionBlink 0.8s ease-in-out infinite;
        }

        .global-suppression-resume {
          border-radius: 999px;
          border: 1px solid;
          padding: 2px 10px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .global-suppression-resume:hover {
          background: rgba(20, 184, 166, 0.15);
        }

        @keyframes globalSuppressionBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.25;
          }
        }
      `}</style>
    </>
  );
};

export default ScrollingSuppressionBanner;
