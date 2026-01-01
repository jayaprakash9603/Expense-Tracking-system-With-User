import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const MAX_ERRORS = 10;

const statusPalette = {
  NETWORK: {
    label: "Network",
    accent: "text-orange-500",
    bg: "bg-orange-500/10",
    dot: "bg-orange-400",
    border: "border-orange-500/30",
  },
  401: {
    label: "Unauthorized",
    accent: "text-yellow-500",
    bg: "bg-yellow-500/10",
    dot: "bg-yellow-400",
    border: "border-yellow-500/30",
  },
  403: {
    label: "Forbidden",
    accent: "text-red-500",
    bg: "bg-red-500/10",
    dot: "bg-red-500",
    border: "border-red-500/30",
  },
  404: {
    label: "Not Found",
    accent: "text-blue-500",
    bg: "bg-blue-500/10",
    dot: "bg-blue-500",
    border: "border-blue-500/30",
  },
  default: {
    label: "Server",
    accent: "text-red-500",
    bg: "bg-red-500/10",
    dot: "bg-red-500",
    border: "border-red-500/30",
  },
};

const formatTimestamp = (value) => {
  if (!value) {
    return "";
  }
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    return "";
  }
};

const getStatusMeta = (status) => {
  if (statusPalette[status]) {
    return {
      ...statusPalette[status],
      statusLabel: statusPalette[status].label,
    };
  }
  if (typeof status === "number") {
    return {
      ...statusPalette.default,
      statusLabel: `HTTP ${status}`,
    };
  }
  return {
    ...statusPalette.default,
    statusLabel: status || "Unknown",
  };
};

const SystemErrorIndicator = ({ isDark }) => {
  const [errors, setErrors] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const copyTimeoutRef = useRef();
  const panelRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleSystemError = (event) => {
      const detail = event?.detail;
      if (!detail) {
        return;
      }
      setErrors((prev = []) => {
        const next = [
          {
            id:
              detail.id ||
              `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            status: detail.status,
            message: detail.message || "An unexpected error occurred.",
            method: detail.method,
            path: detail.path,
            timestamp: detail.timestamp || Date.now(),
          },
          ...prev,
        ].slice(0, MAX_ERRORS);

        return next.filter(
          (item, index, array) =>
            array.findIndex((entry) => entry.id === item.id) === index
        );
      });
    };

    window.addEventListener("systemError", handleSystemError);
    return () => {
      window.removeEventListener("systemError", handleSystemError);
    };
  }, []);

  useEffect(() => {
    if (!isPanelOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPanelOpen]);

  const handleClearAll = () => {
    setErrors([]);
    setIsPanelOpen(false);
  };

  const handleDismiss = (id) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  };

  const handleCopy = async (error) => {
    const meta = getStatusMeta(error.status);
    const messageSegments = [
      `(${meta.statusLabel}) ${error.message}`,
      error.method,
      error.path,
    ].filter(Boolean);
    const message = messageSegments.join(" ");

    try {
      await navigator?.clipboard?.writeText(message);
      setCopiedId(error.id);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn("Clipboard copy failed", err);
    }
  };

  useEffect(
    () => () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    },
    []
  );

  if (!errors.length) {
    return null;
  }

  const latestTimestamp = errors[0]?.timestamp;

  return (
    <div className="relative" ref={panelRef}>
      {/* Enhanced trigger button with smooth transitions */}
      <button
        onClick={() => setIsPanelOpen((prev) => !prev)}
        className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${
          isDark
            ? "bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm"
            : "bg-white hover:bg-gray-50 border border-gray-200"
        }`}
        title="System alerts"
        aria-label="System alerts"
        aria-expanded={isPanelOpen}
      >
        <Badge
          badgeContent={Math.min(errors.length, 99)}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.625rem",
              height: "17px",
              minWidth: "17px",
              padding: "0 5px",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
            },
          }}
        >
          <InfoOutlinedIcon
            className={`w-5 h-5 transition-colors ${
              isDark ? "text-red-400" : "text-red-600"
            }`}
          />
        </Badge>
      </button>

      {/* Improved panel with better spacing and modern design */}
      {isPanelOpen && (
        <div
          className={`absolute right-0 mt-2 w-[min(380px,calc(100vw-24px))] rounded-xl shadow-2xl overflow-hidden z-50 ${
            isDark
              ? "bg-[#1b1b1b] border border-[#2a2a2a]"
              : "bg-[#f5f5f5]"
          }`}
          style={{
            boxShadow: isDark
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
              : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Header with gradient and improved typography */}
          <div
            className={`px-4 py-3 ${
              isDark
                ? "border-b border-[#2a2a2a] bg-[#121212]"
                : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  className={`text-sm font-bold tracking-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  System Alerts
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {errors.length} active{" "}
                  {errors.length === 1 ? "issue" : "issues"}
                  {latestTimestamp &&
                    ` • ${formatTimestamp(latestTimestamp)}`}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleClearAll}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                    isDark
                      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      : "text-red-600 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
                    isDark
                      ? "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Compact error list with reduced card size */}
          <div
            className={`max-h-[360px] overflow-y-auto p-3 space-y-2.5 ${
              isDark ? "bg-[#1b1b1b]" : "bg-[#f5f5f5]"
            }`}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: isDark
                ? "#374151 #1f2937"
                : "#d1d5db #f9fafb",
            }}
          >
            {errors.map((error) => {
              const meta = getStatusMeta(error.status);
              return (
                <div
                  key={error.id}
                  className={`relative w-full flex gap-3 rounded-lg px-3 py-2.5 transition-all hover:shadow-lg ${
                    isDark
                      ? `border border-[#2a2a2a] bg-[#121212] hover:bg-[#1a1a1a] hover:border-[#00dac6]/40`
                      : `bg-white hover:bg-gray-50`
                  }`}
                >
                  {/* Status indicator dot */}
                  <span
                    className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${meta.dot}`}
                    style={{
                      boxShadow: isDark
                        ? "0 0 8px currentColor"
                        : "0 0 6px currentColor",
                    }}
                    aria-hidden="true"
                  />

                  {/* Content with improved spacing */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {/* Status badges and timestamp */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.accent} ${meta.bg}`}
                        >
                          {meta.statusLabel}
                        </span>
                        {error.method && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 ${
                              isDark
                                ? "bg-gray-700/70 text-gray-300"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {error.method}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-medium whitespace-nowrap ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {formatTimestamp(error.timestamp)}
                      </span>
                    </div>

                    {/* Error message */}
                    <p
                      className={`text-xs font-medium leading-snug break-words ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {error.message}
                    </p>

                    {/* Path (if available) */}
                    {error.path && (
                      <p
                        className={`text-[10px] font-mono break-words leading-tight ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {error.path}
                      </p>
                    )}

                    {/* Action buttons - compact and aligned */}
                    <div className="flex gap-1.5 pt-0.5">
                      <button
                        onClick={() => handleDismiss(error.id)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${
                          isDark
                            ? "bg-gray-700/70 text-gray-200 hover:bg-gray-600/70 active:bg-gray-600"
                            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 active:bg-gray-300"
                        }`}
                      >
                        <CloseIcon sx={{ fontSize: "11px" }} />
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleCopy(error)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${
                          isDark
                            ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 active:bg-gray-600"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        <ContentCopyIcon sx={{ fontSize: "11px" }} />
                        {copiedId === error.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Screen reader announcement */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {errors.length} active system{" "}
            {errors.length === 1 ? "alert" : "alerts"}.
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemErrorIndicator;
