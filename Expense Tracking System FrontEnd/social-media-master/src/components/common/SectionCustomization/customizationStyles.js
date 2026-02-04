/**
 * Centralized styling functions for Section Customization components.
 * Follows DRY: All theme-aware styles defined once and reused.
 * Responsive breakpoints: xs (<600px), sm (600-900px), md (900px+)
 */

// Breakpoint values for responsive design
export const breakpoints = {
  xs: 600, // Mobile
  sm: 900, // Tablet
  md: 1200, // Desktop
};

export const getDialogStyles = (colors, isDark) => ({
  paper: {
    backgroundColor: colors.cardBackground || colors.secondary_bg,
    color: colors.primary_text,
    borderRadius: { xs: 0, sm: 3, md: 4 },
    border: { xs: "none", sm: `1px solid ${colors.border_color}` },
    boxShadow: isDark
      ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    backgroundImage: isDark
      ? "linear-gradient(135deg, rgba(20, 184, 166, 0.03) 0%, rgba(6, 182, 212, 0.03) 100%)"
      : "linear-gradient(135deg, rgba(20, 184, 166, 0.02) 0%, rgba(6, 182, 212, 0.02) 100%)",
    maxWidth: { xs: "100%", sm: "95%", md: "1400px", lg: "1600px" },
    width: { xs: "100%", sm: "auto", md: "98%" },
    height: { xs: "100%", sm: "auto" },
    maxHeight: { xs: "100%", sm: "90vh" },
    margin: { xs: 0, sm: 2 },
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
  },
  backdrop: {
    backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
  },
});

export const getHeaderStyles = (colors, isDark) => ({
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    pb: 2.5,
    pt: 3,
    px: 3,
    borderBottom: `1px solid ${colors.border_color}`,
    background: isDark
      ? "linear-gradient(180deg, rgba(20, 184, 166, 0.05) 0%, transparent 100%)"
      : "linear-gradient(180deg, rgba(20, 184, 166, 0.03) 0%, transparent 100%)",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 2.5,
    background: isDark
      ? "linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)"
      : "linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${
      isDark ? "rgba(20, 184, 166, 0.3)" : "rgba(20, 184, 166, 0.2)"
    }`,
  },
  closeButton: {
    color: colors.secondary_text,
    width: 36,
    height: 36,
    backgroundColor: isDark
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.04)",
    "&:hover": {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.08)",
      color: colors.primary_text,
    },
  },
});

export const getDroppableStyles = (
  isDark,
  isDraggingOver,
  variant = "active"
) => {
  const isActive = variant === "active";
  const baseColor = isActive ? "20, 184, 166" : "156, 163, 175";

  return {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    height: "100%",
    minHeight: 200,
    overflowY: "auto",
    overflowX: "hidden",
    backgroundColor: isDraggingOver
      ? isDark
        ? `rgba(${baseColor}, 0.15)`
        : `rgba(${baseColor}, 0.12)`
      : isDark
      ? `rgba(${baseColor}, 0.03)`
      : `rgba(${baseColor}, 0.02)`,
    borderRadius: 3,
    padding: isDraggingOver ? 2 : 1.5,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: isDraggingOver
      ? `3px dashed ${isActive ? "#14b8a6" : isDark ? "#9ca3af" : "#6b7280"}`
      : `2px dashed ${
          isDark
            ? `rgba(${baseColor}, ${isActive ? "0.25" : "0.2"})`
            : `rgba(${baseColor}, ${isActive ? "0.2" : "0.15"})`
        }`,
    boxShadow: isDraggingOver
      ? isDark
        ? `inset 0 0 0 1px rgba(${baseColor}, ${
            isActive ? "0.4" : "0.3"
          }), 0 0 20px rgba(${baseColor}, ${isActive ? "0.25" : "0.2"})`
        : `inset 0 0 0 1px rgba(${baseColor}, ${
            isActive ? "0.3" : "0.25"
          }), 0 0 20px rgba(${baseColor}, ${isActive ? "0.2" : "0.15"})`
      : "none",
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-track": {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.05)",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: isDark
        ? `rgba(${baseColor}, 0.3)`
        : `rgba(${baseColor}, 0.4)`,
      borderRadius: "4px",
      "&:hover": {
        backgroundColor: isDark
          ? `rgba(${baseColor}, 0.5)`
          : `rgba(${baseColor}, 0.6)`,
      },
    },
  };
};

export const getDraggableItemStyles = (
  colors,
  isDark,
  isDragging,
  isActive = true
) => {
  const baseColor = isActive ? "20, 184, 166" : "156, 163, 175";
  const borderColor = isActive ? "#14b8a6" : isDark ? "#9ca3af" : "#6b7280";

  return {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    padding: "12px 14px",
    backgroundColor: isDragging
      ? isDark
        ? `rgba(${baseColor}, 0.12)`
        : `rgba(${baseColor}, 0.08)`
      : colors.cardBackground || colors.secondary_bg,
    border: `1.5px solid ${
      isDragging
        ? borderColor
        : isDark
        ? `rgba(${baseColor}, ${isActive ? "0.3" : "0.2"})`
        : `rgba(${baseColor}, ${isActive ? "0.25" : "0.15"})`
    }`,
    borderRadius: 2,
    transition: isDragging ? "none" : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: isActive ? 1 : 0.8,
    boxShadow: isDragging
      ? isDark
        ? `0 8px 16px -4px rgba(0, 0, 0, 0.4)${
            isActive ? ", 0 0 0 1px rgba(20, 184, 166, 0.3)" : ""
          }`
        : `0 8px 16px -4px rgba(0, 0, 0, 0.2)${
            isActive ? ", 0 0 0 1px rgba(20, 184, 166, 0.2)" : ""
          }`
      : "none",
    transform: "scale(1)",
    width: isDragging ? "auto" : "100%",
    maxWidth: isDragging ? "350px" : "100%",
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    "&:hover": {
      opacity: 1,
      borderColor: borderColor,
      boxShadow:
        isActive && !isDragging
          ? isDark
            ? "0 4px 12px -2px rgba(0, 0, 0, 0.2)"
            : "0 4px 12px -2px rgba(0, 0, 0, 0.1)"
          : "none",
    },
  };
};

export const getChipStyles = (isDark, variant = "type") => {
  if (variant === "active") {
    return {
      backgroundColor: isDark
        ? "rgba(74, 222, 128, 0.15)"
        : "rgba(34, 197, 94, 0.12)",
      color: isDark ? "#4ade80" : "#16a34a",
      fontWeight: 600,
      fontSize: "0.75rem",
      height: 28,
      border: `1px solid ${
        isDark ? "rgba(74, 222, 128, 0.3)" : "rgba(34, 197, 94, 0.2)"
      }`,
      "& .MuiChip-icon": { color: isDark ? "#4ade80" : "#16a34a" },
    };
  }

  if (variant === "available") {
    return {
      backgroundColor: isDark
        ? "rgba(156, 163, 175, 0.15)"
        : "rgba(107, 114, 128, 0.12)",
      color: isDark ? "#9ca3af" : "#6b7280",
      fontWeight: 600,
      fontSize: "0.75rem",
      height: 28,
      border: `1px solid ${
        isDark ? "rgba(156, 163, 175, 0.3)" : "rgba(107, 114, 128, 0.2)"
      }`,
      "& .MuiChip-icon": { color: isDark ? "#9ca3af" : "#6b7280" },
    };
  }

  // Type chip (Full, Half, Bottom)
  return {
    height: 18,
    fontSize: "0.6rem",
    fontWeight: 600,
    backgroundColor: isDark
      ? "rgba(99, 102, 241, 0.15)"
      : "rgba(99, 102, 241, 0.1)",
    color: isDark ? "#a5b4fc" : "#6366f1",
    "& .MuiChip-label": { px: 0.8 },
  };
};

export const getButtonStyles = (isDark, colors, variant = "primary") => {
  if (variant === "primary") {
    return {
      background: "linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)",
      color: "#fff",
      textTransform: "none",
      fontWeight: 700,
      px: 3.5,
      py: 1,
      borderRadius: 2,
      boxShadow: isDark
        ? "0 4px 12px -2px rgba(20, 184, 166, 0.4)"
        : "0 4px 12px -2px rgba(20, 184, 166, 0.3)",
      "&:hover": {
        background: "linear-gradient(135deg, #0d9488 0%, #06748c 100%)",
        boxShadow: isDark
          ? "0 6px 16px -4px rgba(20, 184, 166, 0.5)"
          : "0 6px 16px -4px rgba(20, 184, 166, 0.4)",
        transform: "translateY(-1px)",
      },
      "&:active": { transform: "translateY(0)" },
      transition: "all 0.2s ease",
    };
  }

  if (variant === "secondary") {
    return {
      color: colors.secondary_text,
      borderColor: colors.border_color,
      textTransform: "none",
      fontWeight: 600,
      px: 3,
      py: 1,
      borderRadius: 2,
      "&:hover": {
        borderColor: colors.secondary_text,
        backgroundColor: isDark
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.04)",
      },
    };
  }

  if (variant === "danger") {
    return {
      color: isDark ? "#f87171" : "#dc2626",
      borderColor: isDark
        ? "rgba(248, 113, 113, 0.5)"
        : "rgba(239, 68, 68, 0.4)",
      backgroundColor: isDark
        ? "rgba(248, 113, 113, 0.1)"
        : "rgba(239, 68, 68, 0.08)",
      textTransform: "none",
      fontWeight: 600,
      px: 2.5,
      py: 1,
      borderRadius: 2,
      "&:hover": {
        borderColor: isDark
          ? "rgba(248, 113, 113, 0.6)"
          : "rgba(239, 68, 68, 0.5)",
        backgroundColor: isDark
          ? "rgba(248, 113, 113, 0.15)"
          : "rgba(239, 68, 68, 0.12)",
        color: isDark ? "#f87171" : "#dc2626",
        transform: "translateY(-1px)",
      },
    };
  }

  return {};
};

export const getMoveButtonStyles = (
  isDark,
  colors,
  isEnabled,
  direction = "right"
) => {
  const isRight = direction === "right";
  const baseColor = isRight ? "20, 184, 166" : "156, 163, 175";
  const accentColor = isRight ? "#14b8a6" : isDark ? "#9ca3af" : "#6b7280";

  return {
    backgroundColor: isDark
      ? `rgba(${baseColor}, 0.1)`
      : `rgba(${baseColor}, 0.08)`,
    color: isRight ? "#14b8a6" : `${accentColor} !important`,
    width: 40,
    height: 40,
    border: isEnabled ? `2px solid ${accentColor}` : "none",
    "&:hover": {
      backgroundColor: isDark
        ? `rgba(${baseColor}, 0.2)`
        : `rgba(${baseColor}, 0.15)`,
      transform: "scale(1.1)",
      color: isRight ? "#14b8a6" : `${accentColor} !important`,
    },
    "&:disabled": {
      backgroundColor: "transparent",
      color: `${colors.secondary_text} !important`,
      opacity: 0.3,
      border: "none",
    },
    transition: "all 0.2s ease",
  };
};
