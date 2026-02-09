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

  // Flow page controls (visible on CashFlow, CategoryFlow, PaymentMethodFlow pages)
  "flow-week": {
    key: "W",
    labelKey: "keyboard.week",
    selector: '[data-shortcut="range-week"]',
  },
  "flow-month": {
    key: "M",
    labelKey: "keyboard.month",
    selector: '[data-shortcut="range-month"]',
  },
  "flow-year": {
    key: "Y",
    labelKey: "keyboard.year",
    selector: '[data-shortcut="range-year"]',
  },
  "flow-prev": {
    key: "[",
    labelKey: "keyboard.previous",
    selector: '[data-shortcut="range-prev"]',
  },
  "flow-next": {
    key: "]",
    labelKey: "keyboard.next",
    selector: '[data-shortcut="range-next"]',
  },
  "flow-toggle": {
    key: "O",
    labelKey: "keyboard.flowToggle",
    selector: '[data-shortcut="flow-toggle"]',
  },

  // Flow navigation bar shortcuts (visible on flow pages) - Sequential 1-7 based on position
  "flow-nav-item-1": {
    key: "1",
    labelKey: "keyboard.flowNav1",
    selector: '[data-shortcut="nav-flow-item-1"]',
  },
  "flow-nav-item-2": {
    key: "2",
    labelKey: "keyboard.flowNav2",
    selector: '[data-shortcut="nav-flow-item-2"]',
  },
  "flow-nav-item-3": {
    key: "3",
    labelKey: "keyboard.flowNav3",
    selector: '[data-shortcut="nav-flow-item-3"]',
  },
  "flow-nav-item-4": {
    key: "4",
    labelKey: "keyboard.flowNav4",
    selector: '[data-shortcut="nav-flow-item-4"]',
  },
  "flow-nav-item-5": {
    key: "5",
    labelKey: "keyboard.flowNav5",
    selector: '[data-shortcut="nav-flow-item-5"]',
  },
  "flow-nav-item-6": {
    key: "6",
    labelKey: "keyboard.flowNav6",
    selector: '[data-shortcut="nav-flow-item-6"]',
  },
  "flow-nav-item-7": {
    key: "7",
    labelKey: "keyboard.flowNav7",
    selector: '[data-shortcut="nav-flow-item-7"]',
  },

  // Actions - Header bar
  "action-theme": {
    key: "T",
    labelKey: "keyboard.toggleTheme",
    selector: '[data-shortcut="theme"]',
  },
  "action-masking": {
    key: "V",
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
  "action-notifications": {
    key: "N",
    labelKey: "keyboard.notifications",
    selector: '[data-shortcut="notifications"]',
  },
  "action-profile": {
    key: "U",
    labelKey: "keyboard.profile",
    selector: '[data-shortcut="profile"]',
  },
};

// Child shortcuts that appear when parent is active (notification panel or profile dropdown)
const CHILD_SHORTCUTS = {
  // Notification panel child shortcuts
  notifications: {
    "notifications-mark-read": {
      key: "R",
      labelKey: "keyboard.markAllRead",
      selector: '[data-shortcut="notifications-mark-read"]',
    },
    "notifications-clear": {
      key: "C",
      labelKey: "keyboard.clearAll",
      selector: '[data-shortcut="notifications-clear"]',
    },
    "notifications-close": {
      key: "X",
      labelKey: "keyboard.close",
      selector: '[data-shortcut="notifications-close"]',
    },
  },
  // Profile dropdown child shortcuts
  profile: {
    "profile-view": {
      key: "V",
      labelKey: "keyboard.viewProfile",
      selector: '[data-shortcut="profile-view"]',
    },
    "profile-settings": {
      key: "S",
      labelKey: "keyboard.settings",
      selector: '[data-shortcut="profile-settings"]',
    },
    "profile-switch-mode": {
      key: "W",
      labelKey: "keyboard.switchMode",
      selector: '[data-shortcut="profile-switch-mode"]',
    },
    "profile-logout": {
      key: "L",
      labelKey: "keyboard.logout",
      selector: '[data-shortcut="profile-logout"]',
      opensChild: "modal", // This indicates clicking logout opens a modal
    },
  },
  // Modal (logout confirmation, delete confirmation, etc.)
  modal: {
    "modal-approve": {
      key: "Y",
      labelKey: "keyboard.yes",
      selector: '[data-shortcut="modal-approve"]',
    },
    "modal-decline": {
      key: "N",
      labelKey: "keyboard.no",
      selector: '[data-shortcut="modal-decline"]',
    },
  },
};

/**
 * Single shortcut badge positioned directly on the icon of an element
 */
function ShortcutBadge({ element, shortcutKey, isVisible }) {
  const { colors } = useTheme();
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [iconPosition, setIconPosition] = useState(null);

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

      // Try to find the icon element inside (svg, img, or icon container)
      const iconEl = element.querySelector(
        'svg, img, [class*="icon"], .MuiSvgIcon-root',
      );
      if (iconEl) {
        const iconRect = iconEl.getBoundingClientRect();
        setIconPosition({
          top: iconRect.top,
          left: iconRect.left,
          width: iconRect.width,
          height: iconRect.height,
        });
      } else {
        setIconPosition(null);
      }
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

  // Badge size
  const badgeSize = 24;

  // Calculate badge position - center on icon if found, otherwise on left side
  let badgeTop, badgeLeft;
  if (iconPosition) {
    // Center badge on the icon
    badgeTop = iconPosition.top + (iconPosition.height - badgeSize) / 2;
    badgeLeft = iconPosition.left + (iconPosition.width - badgeSize) / 2;
  } else {
    // Fallback: position on left side
    badgeTop = position.top + (position.height - badgeSize) / 2;
    badgeLeft = position.left + 8;
  }

  return (
    <>
      {/* Highlight border around entire element */}
      <Box
        sx={{
          position: "fixed",
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
          zIndex: 10000,
          pointerEvents: "none",
          backgroundColor: "rgba(0, 218, 198, 0.08)",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: colors.accent || "#00DAC6",
        }}
      />
      {/* Badge positioned directly on the icon */}
      <Fade in={isVisible} timeout={100}>
        <Box
          sx={{
            position: "fixed",
            top: badgeTop,
            left: badgeLeft,
            zIndex: 10001,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.accent || colors.button_bg || "#00DAC6",
            color: "#000",
            width: badgeSize,
            height: badgeSize,
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 800,
              fontFamily: '"SF Mono", "Monaco", "Menlo", monospace',
              textAlign: "center",
            }}
          >
            {shortcutKey}
          </Typography>
        </Box>
      </Fade>
    </>
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
  const showShortcutIndicators = userSettings?.showShortcutIndicators ?? true; // Control badge display
  const isDark = mode === "dark";
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [elements, setElements] = useState({});
  const [activeParent, setActiveParent] = useState(null); // Track which parent panel is active (e.g., 'notifications', 'profile')
  const [childElements, setChildElements] = useState({});

  // Ref to track if we're transitioning to child mode (to prevent click handler from closing overlay)
  const isTransitioningToChildRef = React.useRef(false);

  // Find all shortcut-enabled elements (main or child based on activeParent)
  const findElements = useCallback(() => {
    const found = {};
    const shortcuts =
      activeParent && CHILD_SHORTCUTS[activeParent]
        ? CHILD_SHORTCUTS[activeParent]
        : ALT_SHORTCUTS;

    Object.entries(shortcuts).forEach(([id, config]) => {
      const el = document.querySelector(config.selector);
      if (el) {
        found[id] = { element: el, ...config };
      }
    });
    setElements(found);
  }, [activeParent]);

  // Find child elements for active parent
  const findChildElements = useCallback(() => {
    if (!activeParent || !CHILD_SHORTCUTS[activeParent]) {
      setChildElements({});
      return;
    }

    const found = {};
    Object.entries(CHILD_SHORTCUTS[activeParent]).forEach(([id, config]) => {
      const el = document.querySelector(config.selector);
      if (el) {
        found[id] = { element: el, ...config };
      }
    });
    setChildElements(found);
  }, [activeParent]);

  // Re-find child elements when parent changes
  useEffect(() => {
    if (activeParent) {
      // Small delay to allow panel/dropdown to open and render
      const timer = setTimeout(() => {
        findChildElements();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeParent, findChildElements]);

  // Handle Alt key press/release - TOGGLE mode (click Alt to show, press letter to navigate)
  useEffect(() => {
    // Don't register event listeners if shortcuts are disabled
    if (!keyboardShortcutsEnabled) {
      setIsAltPressed(false);
      setActiveParent(null);
      return;
    }

    const handleKeyDown = (e) => {
      // Toggle on Alt key press (not hold)
      if (e.key === "Alt" && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (!isAltPressed) {
          setIsAltPressed(true);
          setActiveParent(null); // Reset to show main shortcuts
          findElements();
        } else {
          setIsAltPressed(false);
          setActiveParent(null);
        }
        return;
      }

      // If overlay is shown and a letter key is pressed, trigger the action
      if (isAltPressed && e.key.length === 1) {
        const pressedKey = e.key.toUpperCase();

        // Check if we're in child mode (panel/dropdown is open)
        if (activeParent && CHILD_SHORTCUTS[activeParent]) {
          const childMatch = Object.entries(CHILD_SHORTCUTS[activeParent]).find(
            ([_, config]) => config.key.toUpperCase() === pressedKey,
          );

          if (childMatch) {
            e.preventDefault();
            const element = document.querySelector(childMatch[1].selector);
            const childConfig = childMatch[1];

            if (element) {
              // Check if this child shortcut opens another child level (e.g., logout -> modal)
              if (
                childConfig.opensChild &&
                CHILD_SHORTCUTS[childConfig.opensChild]
              ) {
                // Mark that we're transitioning to prevent click handler from closing
                isTransitioningToChildRef.current = true;

                // Click to trigger the action (e.g., open logout modal)
                element.click();

                // Transition to the next child level
                setActiveParent(childConfig.opensChild);

                // Reset the transition flag after a short delay
                setTimeout(() => {
                  isTransitioningToChildRef.current = false;
                }, 300);

                return;
              }

              // Regular child action - click and close
              element.click();
            }
            setIsAltPressed(false);
            setActiveParent(null);
            return;
          }
        }

        // Find matching shortcut from main shortcuts
        const match = Object.entries(ALT_SHORTCUTS).find(
          ([_, config]) => config.key.toUpperCase() === pressedKey,
        );

        if (match) {
          e.preventDefault();
          const element = document.querySelector(match[1].selector);
          if (element) {
            // Check if this is a parent that has children (notifications or profile)
            const shortcutId = match[0];
            if (
              shortcutId === "action-notifications" ||
              shortcutId === "action-profile"
            ) {
              // Mark that we're transitioning to prevent click handler from closing
              isTransitioningToChildRef.current = true;

              // Click to open the panel/dropdown
              element.click();

              // Set the active parent for child shortcuts
              const parentKey =
                shortcutId === "action-notifications"
                  ? "notifications"
                  : "profile";
              setActiveParent(parentKey);

              // Reset the transition flag after a short delay
              setTimeout(() => {
                isTransitioningToChildRef.current = false;
              }, 200);

              // Keep overlay visible - don't close
              return;
            }

            // Regular shortcut - click and close
            element.click();
          }
          setIsAltPressed(false);
          setActiveParent(null);
        }
      }

      // Close on Escape
      if (e.key === "Escape" && isAltPressed) {
        e.preventDefault();
        setIsAltPressed(false);
        setActiveParent(null);
      }
    };

    // Close overlay on any click (except when activating a parent or in child mode)
    const handleClick = (e) => {
      // Don't close if we're transitioning to child mode
      if (isTransitioningToChildRef.current) {
        return;
      }
      // Don't close if we're in child mode (activeParent is set)
      if (activeParent) {
        return;
      }
      // Close only when in main mode and clicking outside
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
  }, [isAltPressed, activeParent, findElements, keyboardShortcutsEnabled]);

  // Get current shortcuts to display (main or child based on activeParent)
  const currentShortcuts = useMemo(() => {
    if (activeParent && CHILD_SHORTCUTS[activeParent]) {
      return CHILD_SHORTCUTS[activeParent];
    }
    return ALT_SHORTCUTS;
  }, [activeParent]);

  // Hint bar at bottom when Alt is pressed
  const hintBar = useMemo(() => {
    if (!isAltPressed) return null;

    const parentLabel =
      activeParent === "notifications"
        ? t("keyboard.notifications")
        : activeParent === "profile"
          ? t("keyboard.profile")
          : null;

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
          {/* Show parent context if in child mode */}
          {activeParent && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mr: 2,
                py: 0.5,
                px: 1.5,
                borderRadius: "6px",
                backgroundColor: colors.accent || "#00DAC6",
                color: "#000",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                📂 {parentLabel}
              </Typography>
            </Box>
          )}

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

          {Object.entries(currentShortcuts).map(([id, config]) => (
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
  }, [isAltPressed, activeParent, currentShortcuts, colors, isDark, t]);

  // Get current elements to display badges on
  const displayElements = useMemo(() => {
    if (activeParent && Object.keys(childElements).length > 0) {
      return childElements;
    }
    return elements;
  }, [activeParent, elements, childElements]);

  return (
    <Portal>
      {/* Overlay dim background - only show if indicators are enabled */}
      {isAltPressed && showShortcutIndicators && (
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

      {/* Shortcut badges on elements - only show if indicators are enabled */}
      {showShortcutIndicators &&
        Object.entries(displayElements).map(([id, config]) => (
          <ShortcutBadge
            key={id}
            element={config.element}
            shortcutKey={config.key}
            isVisible={isAltPressed}
          />
        ))}

      {/* Bottom hint bar - only show if indicators are enabled */}
      {showShortcutIndicators && hintBar}
    </Portal>
  );
}

export default AltKeyOverlay;
