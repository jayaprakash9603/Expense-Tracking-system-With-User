/**
 * KeyboardShortcutProvider - Central Keyboard Shortcut Engine
 * 
 * This provider manages all keyboard shortcuts across the application.
 * Components NEVER manage keyboard listeners directly - they only declare
 * shortcuts via metadata, and this engine handles activation, conflicts,
 * and recommendations.
 * 
 * Architecture:
 * - Central registry for all shortcuts
 * - Scope hierarchy: MODAL > PAGE > COMPONENT > GLOBAL
 * - Smart input detection to prevent shortcuts while typing
 * - Sequential shortcut support (e.g., g → e)
 * - Long-press support
 * - Behavior tracking for recommendations
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { ShortcutRegistry } from "./ShortcutRegistry";
import { DEFAULT_SHORTCUTS, RESERVED_SHORTCUTS } from "./shortcutDefinitions";
import "./keyboard.css";

// Scope priority (higher number = higher priority)
export const SCOPE_PRIORITY = {
  GLOBAL: 0,
  COMPONENT: 1,
  PAGE: 2,
  MODAL: 3,
};

// Context for keyboard shortcuts
const KeyboardShortcutContext = createContext(null);

/**
 * Hook to access the keyboard shortcut system
 * @throws {Error} If used outside of KeyboardShortcutProvider
 */
export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error(
      "useKeyboardShortcuts must be used within a KeyboardShortcutProvider"
    );
  }
  return context;
}

/**
 * KeyboardShortcutProvider Component
 * Wrap your app root with this provider to enable the shortcut system.
 */
export function KeyboardShortcutProvider({ children }) {
  // User settings from Redux
  const userSettings = useSelector((state) => state.userSettings?.settings);
  const keyboardShortcutsEnabled = userSettings?.keyboardShortcuts ?? true;

  // Registry instance
  const registryRef = useRef(new ShortcutRegistry());

  // Current active scope
  const [activeScope, setActiveScope] = useState("GLOBAL");

  // Sequence tracking for multi-key shortcuts (e.g., g → e)
  const sequenceRef = useRef([]);
  const sequenceTimeoutRef = useRef(null);
  const SEQUENCE_TIMEOUT = 500; // ms to wait for next key in sequence

  // Long press tracking
  const longPressRef = useRef({});
  const LONG_PRESS_DURATION = 500; // ms to consider a long press

  // Help modal state
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Behavior tracking for recommendations
  const behaviorRef = useRef({
    actionCounts: {},
    lastActions: [],
    sessionStart: Date.now(),
  });

  /**
   * Check if we should ignore keyboard events (e.g., user is typing)
   */
  const shouldIgnoreEvent = useCallback((event) => {
    const target = event.target;
    const tagName = target.tagName?.toLowerCase();

    // Ignore if typing in input fields
    if (
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select" ||
      target.isContentEditable
    ) {
      // Allow certain shortcuts even in input fields
      const isEscapeKey = event.key === "Escape";
      const isModifierCombo = event.ctrlKey || event.metaKey || event.altKey;

      // Only process Escape or modifier combos in input fields
      if (!isEscapeKey && !isModifierCombo) {
        return true;
      }
    }

    return false;
  }, []);

  /**
   * Normalize key event to a consistent format
   */
  const normalizeKeyEvent = useCallback((event) => {
    const modifiers = [];
    if (event.ctrlKey || event.metaKey) modifiers.push("mod");
    if (event.altKey) modifiers.push("alt");
    if (event.shiftKey) modifiers.push("shift");

    const key = event.key.toLowerCase();
    return [...modifiers, key].join("+");
  }, []);

  /**
   * Check if a key combo conflicts with browser/OS reserved shortcuts
   */
  const isReservedShortcut = useCallback((keyCombo) => {
    return RESERVED_SHORTCUTS.some(
      (reserved) => reserved.toLowerCase() === keyCombo.toLowerCase()
    );
  }, []);

  /**
   * Track user behavior for recommendations
   */
  const trackAction = useCallback((actionId, source = "shortcut") => {
    const behavior = behaviorRef.current;

    // Increment action count
    behavior.actionCounts[actionId] = (behavior.actionCounts[actionId] || 0) + 1;

    // Track recent actions (keep last 50)
    behavior.lastActions.unshift({
      actionId,
      timestamp: Date.now(),
      source,
    });
    if (behavior.lastActions.length > 50) {
      behavior.lastActions.pop();
    }

    // Persist to localStorage periodically
    if (behavior.lastActions.length % 10 === 0) {
      try {
        localStorage.setItem(
          "shortcut_behavior",
          JSON.stringify({
            actionCounts: behavior.actionCounts,
            lastActions: behavior.lastActions.slice(0, 20),
          })
        );
      } catch (e) {
        console.warn("Failed to persist shortcut behavior:", e);
      }
    }
  }, []);

  /**
   * Find the best matching shortcut for a key combo
   */
  const findMatchingShortcut = useCallback(
    (keyCombo, sequence = []) => {
      const registry = registryRef.current;
      const allShortcuts = registry.getAllShortcuts();

      // Build full sequence string
      const fullSequence = [...sequence, keyCombo].join(" ");

      // Filter shortcuts that match and are in active scope
      const matches = allShortcuts.filter((shortcut) => {
        // Check if shortcut matches
        const shortcutKeys = shortcut.keys.toLowerCase();

        // Check for sequence match
        if (shortcutKeys.includes(" ")) {
          return shortcutKeys === fullSequence;
        }

        // Check for direct match
        if (shortcutKeys === keyCombo) {
          // Check scope
          const shortcutScopePriority = SCOPE_PRIORITY[shortcut.scope] || 0;
          const activeScopePriority = SCOPE_PRIORITY[activeScope] || 0;

          // Shortcut is valid if its scope is <= active scope priority
          // OR if it's marked as global override
          return (
            shortcutScopePriority <= activeScopePriority ||
            shortcut.globalOverride
          );
        }

        return false;
      });

      if (matches.length === 0) return null;

      // Sort by scope priority (highest first) and return best match
      matches.sort(
        (a, b) =>
          (SCOPE_PRIORITY[b.scope] || 0) - (SCOPE_PRIORITY[a.scope] || 0)
      );

      return matches[0];
    },
    [activeScope]
  );

  /**
   * Main keyboard event handler
   */
  const handleKeyDown = useCallback(
    (event) => {
      // Check if shortcuts are enabled
      if (!keyboardShortcutsEnabled) return;

      // Check if we should ignore this event
      if (shouldIgnoreEvent(event)) return;

      const keyCombo = normalizeKeyEvent(event);

      // Handle help modal toggle (Ctrl/Cmd + /)
      if (keyCombo === "mod+/" || keyCombo === "mod+?") {
        event.preventDefault();
        setIsHelpModalOpen((prev) => !prev);
        return;
      }

      // Check for reserved shortcuts
      if (isReservedShortcut(keyCombo)) return;

      // Clear sequence timeout and set new one
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }

      // Try to find matching shortcut (including sequences)
      const shortcut = findMatchingShortcut(keyCombo, sequenceRef.current);

      if (shortcut) {
        event.preventDefault();

        // Execute the shortcut action
        if (shortcut.action && typeof shortcut.action === "function") {
          shortcut.action();
          trackAction(shortcut.id, "shortcut");
        }

        // Clear sequence after successful match
        sequenceRef.current = [];
      } else {
        // Add to sequence for potential multi-key shortcut
        sequenceRef.current.push(keyCombo);

        // Set timeout to clear sequence
        sequenceTimeoutRef.current = setTimeout(() => {
          sequenceRef.current = [];
        }, SEQUENCE_TIMEOUT);
      }
    },
    [
      keyboardShortcutsEnabled,
      shouldIgnoreEvent,
      normalizeKeyEvent,
      isReservedShortcut,
      findMatchingShortcut,
      trackAction,
    ]
  );

  /**
   * Handle key up for long press detection
   */
  const handleKeyUp = useCallback((event) => {
    const keyCombo = event.key.toLowerCase();
    if (longPressRef.current[keyCombo]) {
      clearTimeout(longPressRef.current[keyCombo]);
      delete longPressRef.current[keyCombo];
    }
  }, []);

  // Set up global keyboard listeners
  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyboardShortcutsEnabled, handleKeyDown, handleKeyUp]);

  // Load behavior from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("shortcut_behavior");
      if (stored) {
        const parsed = JSON.parse(stored);
        behaviorRef.current.actionCounts = parsed.actionCounts || {};
        behaviorRef.current.lastActions = parsed.lastActions || [];
      }
    } catch (e) {
      console.warn("Failed to load shortcut behavior:", e);
    }
  }, []);

  /**
   * Register a shortcut
   */
  const registerShortcut = useCallback(
    (shortcutConfig) => {
      const registry = registryRef.current;
      return registry.register(shortcutConfig);
    },
    []
  );

  /**
   * Unregister a shortcut
   */
  const unregisterShortcut = useCallback((shortcutId) => {
    const registry = registryRef.current;
    registry.unregister(shortcutId);
  }, []);

  /**
   * Update active scope
   */
  const updateScope = useCallback((scope) => {
    setActiveScope(scope);
  }, []);

  /**
   * Get all registered shortcuts (for help modal)
   */
  const getAllShortcuts = useCallback(() => {
    return registryRef.current.getAllShortcuts();
  }, []);

  /**
   * Get shortcuts grouped by category
   */
  const getShortcutsByCategory = useCallback(() => {
    const shortcuts = registryRef.current.getAllShortcuts();
    const grouped = {};

    shortcuts.forEach((shortcut) => {
      const category = shortcut.category || "General";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(shortcut);
    });

    return grouped;
  }, []);

  /**
   * Get behavior data for recommendations
   */
  const getBehaviorData = useCallback(() => {
    return { ...behaviorRef.current };
  }, []);

  /**
   * Execute a shortcut action by ID (for UI triggers)
   */
  const executeAction = useCallback(
    (actionId) => {
      const shortcuts = registryRef.current.getAllShortcuts();
      const shortcut = shortcuts.find((s) => s.id === actionId);

      if (shortcut?.action && typeof shortcut.action === "function") {
        shortcut.action();
        trackAction(actionId, "ui");
        return true;
      }

      return false;
    },
    [trackAction]
  );

  // Context value
  const contextValue = useMemo(
    () => ({
      // Registration
      registerShortcut,
      unregisterShortcut,

      // Scope management
      activeScope,
      updateScope,

      // Shortcuts access
      getAllShortcuts,
      getShortcutsByCategory,

      // Behavior & recommendations
      getBehaviorData,
      trackAction,

      // Action execution
      executeAction,

      // Help modal
      isHelpModalOpen,
      openHelpModal: () => setIsHelpModalOpen(true),
      closeHelpModal: () => setIsHelpModalOpen(false),

      // State
      isEnabled: keyboardShortcutsEnabled,
    }),
    [
      registerShortcut,
      unregisterShortcut,
      activeScope,
      updateScope,
      getAllShortcuts,
      getShortcutsByCategory,
      getBehaviorData,
      trackAction,
      executeAction,
      isHelpModalOpen,
      keyboardShortcutsEnabled,
    ]
  );

  return (
    <KeyboardShortcutContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
}

export default KeyboardShortcutProvider;
