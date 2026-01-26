/**
 * ShortcutGuideModal - Keyboard Shortcuts Help Modal
 *
 * Displays all available keyboard shortcuts in a searchable, categorized modal.
 * Inspired by VS Code, Linear, and Notion shortcut guides.
 *
 * Features:
 * - Searchable shortcuts list
 * - Grouped by category
 * - Shows active/inactive state based on scope
 * - Customization support (future)
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  Tooltip,
  Fade,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Keyboard as KeyboardIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useKeyboardShortcuts } from "./KeyboardShortcutProvider";
import { formatShortcutKeys } from "./useKeyboardShortcut";
import { SHORTCUT_CATEGORIES } from "./shortcutDefinitions";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * Keyboard key display component
 */
function KeyboardKey({ children, size = "medium" }) {
  const { colors } = useTheme();

  const sizeStyles = {
    small: { px: 0.75, py: 0.25, fontSize: "0.7rem", minWidth: 20 },
    medium: { px: 1, py: 0.5, fontSize: "0.75rem", minWidth: 24 },
    large: { px: 1.5, py: 0.75, fontSize: "0.85rem", minWidth: 28 },
  };

  return (
    <Box
      component="kbd"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.active_bg || "#29282b",
        border: `1px solid ${colors.border || "#3a3a3c"}`,
        borderRadius: "6px",
        boxShadow: `0 2px 0 ${colors.border || "#3a3a3c"}`,
        fontFamily: '"SF Mono", "Monaco", "Menlo", monospace',
        fontWeight: 500,
        color: colors.primary_text || "#ffffff",
        textTransform: "capitalize",
        ...sizeStyles[size],
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Format and render shortcut keys with proper styling
 */
function ShortcutKeysDisplay({ keys, size = "medium" }) {
  if (!keys) return null;

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // Split by space for sequences, then by + for combos
  const sequences = keys.split(" ");

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {sequences.map((combo, seqIndex) => (
        <React.Fragment key={seqIndex}>
          {seqIndex > 0 && (
            <Typography variant="caption" sx={{ mx: 0.5, opacity: 0.5 }}>
              then
            </Typography>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
            {combo.split("+").map((key, keyIndex) => {
              let displayKey = key;

              // Map key names
              const keyMap = {
                mod: isMac ? "⌘" : "Ctrl",
                alt: isMac ? "⌥" : "Alt",
                shift: isMac ? "⇧" : "Shift",
                enter: "↵",
                escape: "Esc",
                backspace: "⌫",
                delete: "Del",
                arrowup: "↑",
                arrowdown: "↓",
                arrowleft: "←",
                arrowright: "→",
                space: "Space",
                tab: "Tab",
              };

              displayKey = keyMap[key.toLowerCase()] || key.toUpperCase();

              return (
                <React.Fragment key={keyIndex}>
                  {keyIndex > 0 && !isMac && (
                    <Typography
                      variant="caption"
                      sx={{ mx: 0.25, opacity: 0.3 }}
                    >
                      +
                    </Typography>
                  )}
                  <KeyboardKey size={size}>{displayKey}</KeyboardKey>
                </React.Fragment>
              );
            })}
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
}

/**
 * Single shortcut row
 */
function ShortcutRow({ shortcut, isActive = true }) {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.25,
        px: 1.5,
        borderRadius: "8px",
        opacity: isActive ? 1 : 0.5,
        transition: "all 0.15s ease",
        "&:hover": {
          backgroundColor: colors.hover_bg || "#28282a",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.primary_text || "#ffffff",
            fontWeight: 450,
          }}
        >
          {shortcut.description}
        </Typography>
        {shortcut.destructive && (
          <Chip
            label="Destructive"
            size="small"
            sx={{
              height: 18,
              fontSize: "0.65rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: colors.error_text || "#ef4444",
            }}
          />
        )}
      </Box>
      <ShortcutKeysDisplay keys={shortcut.keys} size="small" />
    </Box>
  );
}

/**
 * Shortcut category section
 */
function ShortcutCategory({ category, shortcuts }) {
  const { colors } = useTheme();

  if (!shortcuts || shortcuts.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="overline"
        sx={{
          color: colors.secondary_text || "#9ca3af",
          fontWeight: 600,
          letterSpacing: 1,
          fontSize: "0.7rem",
          px: 1.5,
          mb: 0.5,
          display: "block",
        }}
      >
        {category}
      </Typography>
      <Box>
        {shortcuts.map((shortcut) => (
          <ShortcutRow key={shortcut.id} shortcut={shortcut} />
        ))}
      </Box>
    </Box>
  );
}

/**
 * Main ShortcutGuideModal component
 */
export function ShortcutGuideModal() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    isHelpModalOpen,
    closeHelpModal,
    getShortcutsByCategory,
    activeScope,
    isEnabled,
  } = useKeyboardShortcuts();

  const [searchQuery, setSearchQuery] = useState("");

  // Get all shortcuts grouped by category
  const groupedShortcuts = useMemo(() => {
    return getShortcutsByCategory();
  }, [getShortcutsByCategory]);

  // Filter shortcuts based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedShortcuts;
    }

    const query = searchQuery.toLowerCase();
    const filtered = {};

    Object.entries(groupedShortcuts).forEach(([category, shortcuts]) => {
      const matchingShortcuts = shortcuts.filter(
        (s) =>
          s.description.toLowerCase().includes(query) ||
          s.keys.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query),
      );

      if (matchingShortcuts.length > 0) {
        filtered[category] = matchingShortcuts;
      }
    });

    return filtered;
  }, [groupedShortcuts, searchQuery]);

  // Count total shortcuts
  const totalShortcuts = useMemo(() => {
    return Object.values(groupedShortcuts).flat().length;
  }, [groupedShortcuts]);

  const filteredCount = useMemo(() => {
    return Object.values(filteredGroups).flat().length;
  }, [filteredGroups]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isHelpModalOpen) {
        closeHelpModal();
      }
    };

    if (isHelpModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHelpModalOpen, closeHelpModal]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isHelpModalOpen) {
      setSearchQuery("");
    }
  }, [isHelpModalOpen]);

  // Category order for display
  const categoryOrder = [
    SHORTCUT_CATEGORIES.NAVIGATION,
    SHORTCUT_CATEGORIES.EXPENSES,
    SHORTCUT_CATEGORIES.BUDGETS,
    SHORTCUT_CATEGORIES.BILLS,
    SHORTCUT_CATEGORIES.CATEGORIES,
    SHORTCUT_CATEGORIES.PAYMENTS,
    SHORTCUT_CATEGORIES.FRIENDS,
    SHORTCUT_CATEGORIES.SEARCH,
    SHORTCUT_CATEGORIES.TABLES,
    SHORTCUT_CATEGORIES.FORMS,
    SHORTCUT_CATEGORIES.MODALS,
    SHORTCUT_CATEGORIES.GENERAL,
    SHORTCUT_CATEGORIES.ADMIN,
  ];

  return (
    <Dialog
      open={isHelpModalOpen}
      onClose={closeHelpModal}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={200}
      PaperProps={{
        sx: {
          backgroundColor: colors.card_bg || colors.primary_bg || "#1b1b1b",
          borderRadius: "16px",
          maxHeight: "80vh",
          border: `1px solid ${colors.border || "#3a3a3c"}`,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <KeyboardIcon
            sx={{ color: colors.accent || colors.button_bg || "#00DAC6" }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t("keyboardShortcutsGuide", "Keyboard Shortcuts")}
          </Typography>
          <Chip
            label={`${totalShortcuts} shortcuts`}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              backgroundColor: "rgba(0, 218, 198, 0.1)",
              color: colors.accent || colors.button_bg || "#00DAC6",
            }}
          />
        </Box>
        <IconButton onClick={closeHelpModal} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Search */}
      <Box sx={{ px: 3, pt: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search shortcuts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: colors.secondary_text || "#9ca3af",
                    fontSize: 20,
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery("")}
                  sx={{ p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              backgroundColor: colors.active_bg || "#29282b",
              borderRadius: "10px",
              "& fieldset": {
                borderColor: colors.border || "#3a3a3c",
              },
            },
          }}
        />

        {searchQuery && (
          <Typography
            variant="caption"
            sx={{
              color: colors.secondary_text || "#9ca3af",
              mt: 1,
              display: "block",
            }}
          >
            Showing {filteredCount} of {totalShortcuts} shortcuts
          </Typography>
        )}
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 2, pt: 1 }}>
        {!isEnabled && (
          <Box
            sx={{
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              border: `1px solid rgba(245, 158, 11, 0.3)`,
              borderRadius: "8px",
              p: 2,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: colors.primary_text || "#ffffff" }}
            >
              ⚠️ Keyboard shortcuts are currently disabled. Enable them in{" "}
              <strong>Settings → Keyboard Shortcuts</strong>.
            </Typography>
          </Box>
        )}

        {/* Platform hint */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            px: 1.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text || "#9ca3af" }}
          >
            {navigator.platform.toUpperCase().indexOf("MAC") >= 0
              ? "Using ⌘ Command key"
              : "Using Ctrl key"}
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text || "#9ca3af" }}
          >
            Current scope: <strong>{activeScope}</strong>
          </Typography>
        </Box>

        {/* Shortcuts by category */}
        <Box sx={{ maxHeight: "55vh", overflow: "auto", pr: 1 }}>
          {Object.keys(filteredGroups).length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: colors.secondary_text || "#9ca3af",
              }}
            >
              <Typography variant="body2">
                No shortcuts found for "{searchQuery}"
              </Typography>
            </Box>
          ) : (
            categoryOrder.map((category) => {
              const shortcuts = filteredGroups[category];
              if (!shortcuts || shortcuts.length === 0) return null;

              return (
                <ShortcutCategory
                  key={category}
                  category={category}
                  shortcuts={shortcuts}
                />
              );
            })
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${colors.border || "#3a3a3c"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text || "#9ca3af" }}
          >
            Press <ShortcutKeysDisplay keys="mod+/" size="small" /> anytime to
            show this guide
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text || "#9ca3af" }}
          >
            Shortcuts are context-aware and may change based on active page
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ShortcutGuideModal;
