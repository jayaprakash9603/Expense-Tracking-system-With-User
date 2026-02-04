/**
 * useKeyboardShortcut - Hook for registering component shortcuts
 * 
 * Components use this hook to declare their shortcuts via metadata.
 * The component NEVER manages keyboard listeners - it only provides
 * the shortcut configuration, and the engine handles everything else.
 * 
 * Usage:
 * ```
 * useKeyboardShortcut({
 *   id: 'ADD_EXPENSE',
 *   keys: 'mod+n',
 *   description: 'Add new expense',
 *   category: 'Expenses',
 *   action: () => navigate('/expenses/new'),
 * });
 * ```
 */

import { useEffect, useCallback, useRef } from "react";
import { useKeyboardShortcuts } from "./KeyboardShortcutProvider";

/**
 * Hook to register a single shortcut
 * @param {Object} config - Shortcut configuration
 */
export function useKeyboardShortcut(config) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const registeredRef = useRef(false);
  const configRef = useRef(config);

  // Update config ref if it changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    if (!config?.id || !config?.action) return;

    // Register the shortcut
    const result = registerShortcut({
      ...config,
      action: () => configRef.current.action?.(),
    });

    if (result.success) {
      registeredRef.current = true;
    }

    // Cleanup on unmount
    return () => {
      if (registeredRef.current) {
        unregisterShortcut(config.id);
        registeredRef.current = false;
      }
    };
  }, [config?.id, registerShortcut, unregisterShortcut]);
}

/**
 * Hook to register multiple shortcuts at once
 * @param {Array} shortcuts - Array of shortcut configurations
 */
export function useMultipleShortcuts(shortcuts) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const registeredIdsRef = useRef([]);

  useEffect(() => {
    if (!shortcuts || !Array.isArray(shortcuts)) return;

    // Register all shortcuts
    const registeredIds = [];
    shortcuts.forEach((config) => {
      if (config?.id && config?.action) {
        const result = registerShortcut(config);
        if (result.success) {
          registeredIds.push(config.id);
        }
      }
    });

    registeredIdsRef.current = registeredIds;

    // Cleanup on unmount
    return () => {
      registeredIdsRef.current.forEach((id) => {
        unregisterShortcut(id);
      });
      registeredIdsRef.current = [];
    };
  }, [shortcuts, registerShortcut, unregisterShortcut]);
}

/**
 * Hook to update active scope when component mounts/unmounts
 * @param {string} scope - Scope to activate ('MODAL', 'PAGE', 'COMPONENT')
 */
export function useShortcutScope(scope) {
  const { updateScope } = useKeyboardShortcuts();
  const previousScopeRef = useRef(null);

  useEffect(() => {
    if (!scope) return;

    // Store previous scope
    previousScopeRef.current = scope;

    // Update to new scope
    updateScope(scope);

    // Restore to GLOBAL on unmount (or previous scope if we implement stack)
    return () => {
      updateScope("GLOBAL");
    };
  }, [scope, updateScope]);
}

/**
 * Hook to track user interactions for recommendations
 * @param {string} actionId - Action identifier
 * @param {string} source - Source of the action ('click', 'form', etc.)
 */
export function useActionTracking(actionId, source = "click") {
  const { trackAction } = useKeyboardShortcuts();

  const track = useCallback(() => {
    if (actionId) {
      trackAction(actionId, source);
    }
  }, [actionId, source, trackAction]);

  return track;
}

/**
 * Hook to create a shortcut-aware button/action handler
 * Automatically tracks the action for recommendation purposes
 * 
 * @param {string} actionId - Action identifier
 * @param {Function} handler - Click handler
 * @returns {Function} Wrapped handler that tracks the action
 */
export function useTrackedAction(actionId, handler) {
  const track = useActionTracking(actionId, "click");

  const trackedHandler = useCallback(
    (...args) => {
      track();
      return handler?.(...args);
    },
    [track, handler]
  );

  return trackedHandler;
}

/**
 * Hook to get shortcut display string for a given action
 * Useful for showing keyboard hints next to buttons
 * 
 * @param {string} actionId - Action identifier
 * @returns {Object} { keys, formatted } - Raw keys and formatted display string
 */
export function useShortcutHint(actionId) {
  const { getAllShortcuts } = useKeyboardShortcuts();

  const shortcuts = getAllShortcuts();
  const shortcut = shortcuts.find((s) => s.id === actionId);

  if (!shortcut) {
    return { keys: null, formatted: null };
  }

  // Format the keys for display
  const formatted = formatShortcutKeys(shortcut.keys);

  return {
    keys: shortcut.keys,
    formatted,
  };
}

/**
 * Format key combination for display
 * @param {string} keys - Key combination (e.g., "mod+n")
 * @returns {string} Formatted string (e.g., "⌘N" or "Ctrl+N")
 */
export function formatShortcutKeys(keys) {
  if (!keys) return "";

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

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

  return keys
    .split("+")
    .map((key) => {
      const mapped = keyMap[key.toLowerCase()];
      if (mapped) return mapped;
      return key.toUpperCase();
    })
    .join(isMac ? "" : "+");
}

/**
 * Hook to check if a specific shortcut is currently active
 * (based on current scope)
 * 
 * @param {string} actionId - Action identifier
 * @returns {boolean} Whether the shortcut is active
 */
export function useIsShortcutActive(actionId) {
  const { getAllShortcuts, activeScope } = useKeyboardShortcuts();

  const shortcuts = getAllShortcuts();
  const shortcut = shortcuts.find((s) => s.id === actionId);

  if (!shortcut) return false;

  // Check if shortcut's scope is <= active scope
  const SCOPE_PRIORITY = { GLOBAL: 0, COMPONENT: 1, PAGE: 2, MODAL: 3 };
  const shortcutPriority = SCOPE_PRIORITY[shortcut.scope] || 0;
  const activePriority = SCOPE_PRIORITY[activeScope] || 0;

  return shortcutPriority <= activePriority || shortcut.globalOverride;
}

export default useKeyboardShortcut;
