/**
 * AltKeyOverlay - Word/Excel-style keyboard shortcut overlay
 *
 * When user presses Alt key, shows shortcut badges on all interactive
 * elements in the UI (like MS Word/Excel ribbon shortcuts).
 *
 * Usage: Include <AltKeyOverlay /> in your main layout.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Fade, Portal } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { useSelector } from "react-redux";

// Mapping of element selectors to shortcut keys (Alt + key)
// Labels use translation keys
const ALT_SHORTCUTS = {
  // Navigation - Left sidebar (matching data-shortcut attributes from MenuItem.jsx)
  "nav-dashboard": {
    key: "D",
    labelKey: "navigation.home",
    selector: '[data-shortcut="dashboard"]',
  },
  "nav-expenses": {
    key: "E",
    labelKey: "navigation.expenses",
    selector: '[data-shortcut="expenses"]',
  },
  "nav-budgets": {
    key: "B",
    labelKey: "navigation.budgets",
    selector: '[data-shortcut="budgets"]',
  },
  "nav-bills": {
    key: "I",
    labelKey: "navigation.bill",
    selector: '[data-shortcut="bills"]',
  },
  "nav-categories": {
    key: "C",
    labelKey: "navigation.categories",
    selector: '[data-shortcut="categories"]',
  },
  "nav-payments": {
    key: "P",
    labelKey: "navigation.payments",
    selector: '[data-shortcut="payments"]',
  },
  "nav-friends": {
    key: "F",
    labelKey: "navigation.friends",
    selector: '[data-shortcut="friends"]',
  },
  "nav-groups": {
    key: "G",
    labelKey: "navigation.groups",
    selector: '[data-shortcut="groups"]',
  },
  "nav-reports": {
    key: "R",
    labelKey: "navigation.reports",
    selector: '[data-shortcut="reports"]',
  },
  "nav-settings": {
    key: "S",
    labelKey: "navigation.settings",
    selector: '[data-shortcut="settings"]',
  },
  "nav-calendar": {
    key: "L",
    labelKey: "keyboard.calendar",
    selector: '[data-shortcut="calendar"]',
  },

  // Actions - Header bar
  "action-theme": {
    key: "T",
    labelKey: "keyboard.toggleTheme",
    selector: '[data-shortcut="theme"]',
  },
  "action-masking": {
    key: "M",
    labelKey: "keyboard.toggleMasking",
    selector: '[data-shortcut="masking"]',
  },
  "action-search": {
    key: "K",
    labelKey: "keyboard.search",
    selector: '[data-shortcut="search"]',
  },
  "action-help": {
    key: "/",
    labelKey: "keyboard.help",
    selector: '[data-shortcut="help"]',
  },
};

/**
 * Single shortcut badge positioned on an element
 */
function ShortcutBadge({ element, shortcutKey, isVisible }) {
  const { colors } = useTheme();
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!element || !isVisible) return;

    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [element, isVisible]);

  if (!element || !isVisible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
        zIndex: 10000,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 218, 198, 0.15)",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: colors.accent || "#00DAC6",
      }}
    >
      <Fade in={isVisible} timeout={100}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.accent || colors.button_bg || "#00DAC6",
            color: "#000",
            width: 28,
            height: 28,
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 800,
              fontFamily: '"SF Mono", "Monaco", "Menlo", monospace',
              textAlign: "center",
            }}
          >
            {shortcutKey}
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
}

/**
 * Main Alt Key Overlay Component
 */
export function AltKeyOverlay() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { mode } = useSelector((state) => state.theme || {});
  const userSettings = useSelector((state) => state.userSettings?.settings);
  const keyboardShortcutsEnabled = userSettings?.keyboardShortcuts ?? true;
  const isDark = mode === "dark";
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [elements, setElements] = useState({});

  // Find all shortcut-enabled elements
  const findElements = useCallback(() => {
    const found = {};
    Object.entries(ALT_SHORTCUTS).forEach(([id, config]) => {
      const el = document.querySelector(config.selector);
      if (el) {
        found[id] = { element: el, ...config };
      }
    });
    setElements(found);
  }, []);

  // Handle Alt key press/release - TOGGLE mode (click Alt to show, press letter to navigate)
  useEffect(() => {
    // Don't register event listeners if shortcuts are disabled
    if (!keyboardShortcutsEnabled) {
      setIsAltPressed(false);
      return;
    }

    const handleKeyDown = (e) => {
      // Toggle on Alt key press (not hold)
      if (e.key === "Alt" && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (!isAltPressed) {
          setIsAltPressed(true);
          findElements();
        } else {
          setIsAltPressed(false);
        }
        return;
      }

      // If overlay is shown and a letter key is pressed, trigger the action
      if (isAltPressed && e.key.length === 1) {
        const pressedKey = e.key.toUpperCase();

        // Find matching shortcut
        const match = Object.entries(ALT_SHORTCUTS).find(
          ([_, config]) => config.key.toUpperCase() === pressedKey,
        );

        if (match) {
          e.preventDefault();
          const element = document.querySelector(match[1].selector);
          if (element) {
            element.click();
          }
          setIsAltPressed(false);
        }
      }

      // Close on Escape
      if (e.key === "Escape" && isAltPressed) {
        e.preventDefault();
        setIsAltPressed(false);
      }
    };

    // Close overlay on any click
    const handleClick = () => {
      if (isAltPressed) {
        setIsAltPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClick);
    };
  }, [isAltPressed, findElements, keyboardShortcutsEnabled]);

  // Hint bar at bottom when Alt is pressed
  const hintBar = useMemo(() => {
    if (!isAltPressed) return null;

    return (
      <Fade in={isAltPressed} timeout={100}>
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark
              ? "rgba(0,0,0,0.95)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(8px)",
            borderTop: `1px solid ${colors.border || (isDark ? "#3a3a3c" : "#e5e7eb")}`,
            py: 1.5,
            px: 3,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
            boxShadow: isDark
              ? "0 -4px 20px rgba(0,0,0,0.3)"
              : "0 -4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            sx={{
              color: colors.secondary_text || (isDark ? "#9ca3af" : "#6b7280"),
              fontSize: "0.8rem",
              fontWeight: 500,
              mr: 2,
            }}
          >
            🎹 {t("keyboard.pressLetter")}
          </Typography>

          {Object.entries(ALT_SHORTCUTS).map(([id, config]) => (
            <Box
              key={id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.accent || "#00DAC6",
                  color: "#000",
                  width: 24,
                  height: 24,
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {config.key}
              </Box>
              <Typography
                sx={{
                  color: colors.primary_text || (isDark ? "#fff" : "#1f2937"),
                  fontSize: "0.7rem",
                }}
              >
                {t(config.labelKey)}
              </Typography>
            </Box>
          ))}

          <Typography
            sx={{
              color: colors.secondary_text || (isDark ? "#9ca3af" : "#6b7280"),
              fontSize: "0.7rem",
              ml: 2,
            }}
          >
            {t("keyboard.escToCancel")}
          </Typography>
        </Box>
      </Fade>
    );
  }, [isAltPressed, colors, isDark, t]);

  return (
    <Portal>
      {/* Overlay dim background */}
      {isAltPressed && (
        <Fade in={isAltPressed} timeout={150}>
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)",
              zIndex: 9998,
              pointerEvents: "none",
            }}
          />
        </Fade>
      )}

      {/* Shortcut badges on elements */}
      {Object.entries(elements).map(([id, config]) => (
        <ShortcutBadge
          key={id}
          element={config.element}
          shortcutKey={config.key}
          isVisible={isAltPressed}
        />
      ))}

      {/* Bottom hint bar */}
      {hintBar}
    </Portal>
  );
}

export default AltKeyOverlay;
