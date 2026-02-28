import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTheme } from "../../hooks/useTheme";

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
  const { colors = {}, mode } = useTheme();
  const [errors, setErrors] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const copyTimeoutRef = useRef();
  const panelRef = useRef(null);
  const resolvedIsDark = typeof isDark === "boolean" ? isDark : mode === "dark";

  const accentColor = colors.primary_accent || "#2563eb";
  const borderColor =
    colors.border_color || (resolvedIsDark ? "#2a2a2a" : "#e5e7eb");
  const panelBackground =
    colors.secondary_bg || (resolvedIsDark ? "#1a1a1a" : "#ffffff");
  const headerBackground =
    colors.primary_bg || (resolvedIsDark ? "#121212" : "#f9fafb");
  const cardBackground =
    colors.primary_bg || (resolvedIsDark ? "#121212" : "#ffffff");
  const cardSurface =
    colors.card_bg || (resolvedIsDark ? "#1f1f1f" : "#ffffff");
  const textPrimary =
    colors.primary_text || (resolvedIsDark ? "#ffffff" : "#111827");
  const textSecondary =
    colors.secondary_text || (resolvedIsDark ? "#9ca3af" : "#6b7280");
  const listBackground =
    colors.secondary_bg || (resolvedIsDark ? "#1a1a1a" : "#f5f5f5");
  const accentTint = `${accentColor}20`;

  const getMethodStyles = (method = "") => {
    const normalized = method.toUpperCase();
    const palettes = {
      GET: { bg: "#065f46", tint: "rgba(16,185,129,0.15)", border: "#10b981" },
      POST: { bg: "#1d4ed8", tint: "rgba(59,130,246,0.15)", border: "#60a5fa" },
      PUT: { bg: "#92400e", tint: "rgba(251,191,36,0.18)", border: "#fbbf24" },
      DELETE: {
        bg: "#7f1d1d",
        tint: "rgba(239,68,68,0.18)",
        border: "#f87171",
      },
    };
    const palette = palettes[normalized] || {
      bg: resolvedIsDark ? "#374151" : "#d1d5db",
      tint: resolvedIsDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
      border: resolvedIsDark ? "#4b5563" : "#9ca3af",
    };
    return {
      backgroundColor: palette.tint,
      color: palette.border,
    };
  };

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

  const handleClosePanel = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setIsPanelOpen(false);
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
        className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
        title="System alerts"
        aria-label="System alerts"
        aria-expanded={isPanelOpen}
        style={{
          backgroundColor:
            colors.secondary_bg || (resolvedIsDark ? "#1f2937" : "#f3f4f6"),
          color: accentColor,
          boxShadow: "0 8px 18px rgba(15,23,42,0.12)",
        }}
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
            className="transition-colors"
            fontSize="small"
            style={{ color: resolvedIsDark ? "#f87171" : "#b91c1c" }}
          />
        </Badge>
      </button>

      {/* Improved panel with better spacing and modern design */}
      {isPanelOpen && (
        <div
          className="absolute right-0 mt-2 w-[min(380px,calc(100vw-24px))] rounded-xl shadow-2xl overflow-hidden z-50"
          style={{
            backgroundColor: panelBackground,
            boxShadow: resolvedIsDark
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
              : "0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 10px 10px -5px rgba(15, 23, 42, 0.04)",
          }}
        >
          {/* Header with gradient and improved typography */}
          <div
            className="px-4 py-3 border-b"
            style={{
              backgroundColor: headerBackground,
              borderColor,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  className="text-sm font-bold tracking-tight"
                  style={{ color: textPrimary }}
                >
                  System Alerts
                </p>
                <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                  {errors.length} active{" "}
                  {errors.length === 1 ? "issue" : "issues"}
                  {latestTimestamp && ` • ${formatTimestamp(latestTimestamp)}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleClosePanel}
                  className="p-1.5 rounded-full transition-colors"
                  style={{
                    color: textSecondary,
                    backgroundColor:
                      colors.secondary_bg ||
                      (resolvedIsDark ? "#1f2937" : "#f3f4f6"),
                  }}
                  aria-label="Close system alerts"
                >
                  <CloseIcon sx={{ fontSize: "16px" }} />
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: accentTint,
                    color: accentColor,
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Compact error list with reduced card size */}
          <div
            className="max-h-[360px] overflow-y-auto p-3 space-y-2.5"
            style={{
              backgroundColor: listBackground,
              scrollbarWidth: "thin",
              scrollbarColor: resolvedIsDark
                ? "#374151 #1f2937"
                : "#d1d5db #f9fafb",
            }}
          >
            {errors.map((error) => {
              const meta = getStatusMeta(error.status);
              return (
                <div
                  key={error.id}
                  className="relative w-full flex gap-2 rounded-2xl px-3 py-1.5 transition-all"
                  style={{
                    backgroundColor: cardSurface,
                    boxShadow: resolvedIsDark
                      ? "0 8px 18px rgba(0,0,0,0.45)"
                      : "0 8px 18px rgba(15,23,42,0.08)",
                  }}
                >
                  {/* Status indicator dot */}
                  <span
                    className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${meta.dot}`}
                    style={{
                      boxShadow: resolvedIsDark
                        ? "0 0 8px currentColor"
                        : "0 0 6px currentColor",
                    }}
                    aria-hidden="true"
                  />

                  {/* Content with improved spacing */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {/* Status badges and timestamp */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${meta.accent} ${meta.bg}`}
                        >
                          {meta.statusLabel}
                        </span>
                        {error.method && (
                          <span
                            className="text-[9px] font-semibold uppercase tracking-wide rounded-full px-1.5 py-0.5"
                            style={getMethodStyles(error.method)}
                          >
                            {error.method?.toUpperCase?.() || error.method}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <span
                          className="text-[10px] font-semibold whitespace-nowrap"
                          style={{ color: textSecondary }}
                        >
                          {formatTimestamp(error.timestamp)}
                        </span>
                        <button
                          onClick={() => handleDismiss(error.id)}
                          className="p-1 rounded-full transition-colors"
                          style={{
                            backgroundColor: resolvedIsDark
                              ? "#2a1313"
                              : "#fee2e2",
                            color: resolvedIsDark ? "#fca5a5" : "#b91c1c",
                          }}
                          aria-label="Dismiss notification"
                        >
                          <CloseIcon sx={{ fontSize: "12px" }} />
                        </button>
                      </div>
                    </div>

                    {/* Error message */}
                    <p
                      className="text-[12px] font-semibold leading-snug break-words"
                      style={{ color: textPrimary }}
                    >
                      {error.message}
                    </p>

                    {/* Path (if available) */}
                    {error.path && (
                      <p
                        className="text-[10px] font-mono break-words leading-tight"
                        style={{ color: textSecondary, opacity: 0.85 }}
                      >
                        {error.path}
                      </p>
                    )}

                    {/* Action buttons - compact and aligned */}
                    <div className="flex items-center justify-end pt-0.5">
                      <button
                        onClick={() => handleCopy(error)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-semibold transition-all"
                        style={{
                          backgroundColor: cardSurface,
                          color:
                            copiedId === error.id ? accentColor : textSecondary,
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: "10px" }} />
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
