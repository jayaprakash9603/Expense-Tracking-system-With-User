/**
 * useComponentShortcuts - Easy shortcut integration for any component
 * 
 * This hook provides a simple way for any component to declare its shortcuts.
 * It handles registration/unregistration automatically based on component lifecycle.
 * 
 * Usage:
 * ```
 * function MyComponent() {
 *   const { registerAction, ShortcutHint } = useComponentShortcuts('MY_PAGE');
 * 
 *   // Register shortcuts for this component
 *   registerAction('SAVE', 'mod+s', handleSave, 'Save changes');
 *   registerAction('CANCEL', 'escape', handleCancel, 'Cancel');
 * 
 *   return (
 *     <button onClick={handleSave}>
 *       Save <ShortcutHint actionId="SAVE" />
 *     </button>
 *   );
 * }
 * ```
 */

import { useEffect, useCallback, useRef, useMemo } from "react";
import { useKeyboardShortcuts } from "./KeyboardShortcutProvider";
import { ShortcutHint as ShortcutHintComponent } from "./ShortcutHint";

/**
 * Hook for adding shortcuts to a component
 * @param {string} componentId - Unique identifier for this component
 * @param {string} scope - Scope of shortcuts ('GLOBAL', 'PAGE', 'MODAL', 'COMPONENT')
 * @param {string} category - Category for grouping in help modal
 */
export function useComponentShortcuts(componentId, scope = "COMPONENT", category = "General") {
  const { registerShortcut, unregisterShortcut, trackAction } = useKeyboardShortcuts();
  const registeredIdsRef = useRef([]);
  const actionsRef = useRef({});

  /**
   * Register an action with a shortcut
   */
  const registerAction = useCallback(
    (actionName, keys, action, description, options = {}) => {
      const fullId = `${componentId}_${actionName}`;

      // Store the action for later execution
      actionsRef.current[fullId] = action;

      // Skip if already registered with same config
      if (registeredIdsRef.current.includes(fullId)) {
        return fullId;
      }

      const result = registerShortcut({
        id: fullId,
        keys,
        description,
        category,
        scope,
        action: () => {
          const fn = actionsRef.current[fullId];
          if (fn && typeof fn === "function") {
            fn();
            trackAction(fullId, "shortcut");
          }
        },
        ...options,
      });

      if (result.success) {
        registeredIdsRef.current.push(fullId);
      }

      return fullId;
    },
    [componentId, scope, category, registerShortcut, trackAction]
  );

  /**
   * Unregister a specific action
   */
  const unregisterAction = useCallback(
    (actionName) => {
      const fullId = `${componentId}_${actionName}`;
      unregisterShortcut(fullId);
      
      const idx = registeredIdsRef.current.indexOf(fullId);
      if (idx !== -1) {
        registeredIdsRef.current.splice(idx, 1);
      }
      
      delete actionsRef.current[fullId];
    },
    [componentId, unregisterShortcut]
  );

  // Cleanup all registered shortcuts on unmount
  useEffect(() => {
    return () => {
      registeredIdsRef.current.forEach((id) => {
        unregisterShortcut(id);
      });
      registeredIdsRef.current = [];
      actionsRef.current = {};
    };
  }, [unregisterShortcut]);

  /**
   * Helper component for showing shortcut hints
   */
  const ComponentShortcutHint = useMemo(() => {
    return function ShortcutHint({ actionName, ...props }) {
      const fullId = `${componentId}_${actionName}`;
      return <ShortcutHintComponent actionId={fullId} {...props} />;
    };
  }, [componentId]);

  return {
    registerAction,
    unregisterAction,
    ShortcutHint: ComponentShortcutHint,
    componentId,
  };
}

/**
 * Hook for table/list navigation shortcuts
 * Provides common navigation patterns: j/k for up/down, enter to select, etc.
 */
export function useTableShortcuts(componentId, options = {}) {
  const {
    items = [],
    selectedIndex = 0,
    onSelect,
    onNavigate,
    onDelete,
    onEdit,
    onSelectAll,
    multiSelect = false,
  } = options;

  const { registerAction, ShortcutHint } = useComponentShortcuts(
    componentId,
    "COMPONENT",
    "Table Navigation"
  );

  // Register table navigation shortcuts
  useEffect(() => {
    // Navigate down
    registerAction("NAV_DOWN", "j", () => {
      if (onNavigate && selectedIndex < items.length - 1) {
        onNavigate(selectedIndex + 1);
      }
    }, "Move to next item");

    // Navigate up
    registerAction("NAV_UP", "k", () => {
      if (onNavigate && selectedIndex > 0) {
        onNavigate(selectedIndex - 1);
      }
    }, "Move to previous item");

    // Select current item
    registerAction("SELECT", "enter", () => {
      if (onSelect && items[selectedIndex]) {
        onSelect(items[selectedIndex], selectedIndex);
      }
    }, "Select item");

    // Toggle selection (for multi-select)
    if (multiSelect) {
      registerAction("TOGGLE_SELECT", "x", () => {
        if (onSelect && items[selectedIndex]) {
          onSelect(items[selectedIndex], selectedIndex, true);
        }
      }, "Toggle selection");

      if (onSelectAll) {
        registerAction("SELECT_ALL", "mod+shift+a", () => {
          onSelectAll();
        }, "Select all items");
      }
    }

    // Edit
    if (onEdit) {
      registerAction("EDIT", "e", () => {
        if (items[selectedIndex]) {
          onEdit(items[selectedIndex], selectedIndex);
        }
      }, "Edit item");
    }

    // Delete
    if (onDelete) {
      registerAction("DELETE", "mod+backspace", () => {
        if (items[selectedIndex]) {
          onDelete(items[selectedIndex], selectedIndex);
        }
      }, "Delete item", { destructive: true });
    }

    // First item
    registerAction("GO_FIRST", "g g", () => {
      if (onNavigate && items.length > 0) {
        onNavigate(0);
      }
    }, "Go to first item");

    // Last item
    registerAction("GO_LAST", "shift+g", () => {
      if (onNavigate && items.length > 0) {
        onNavigate(items.length - 1);
      }
    }, "Go to last item");

  }, [
    registerAction,
    items,
    selectedIndex,
    onSelect,
    onNavigate,
    onDelete,
    onEdit,
    onSelectAll,
    multiSelect,
  ]);

  return { ShortcutHint };
}

/**
 * Hook for form shortcuts
 * Provides common form patterns: submit, cancel, reset
 */
export function useFormShortcuts(componentId, options = {}) {
  const { onSubmit, onCancel, onReset } = options;

  const { registerAction, ShortcutHint } = useComponentShortcuts(
    componentId,
    "COMPONENT",
    "Forms"
  );

  useEffect(() => {
    // Submit form
    if (onSubmit) {
      registerAction("SUBMIT", "mod+enter", () => {
        onSubmit();
      }, "Submit form", { globalOverride: true });
    }

    // Cancel/close
    if (onCancel) {
      registerAction("CANCEL", "escape", () => {
        onCancel();
      }, "Cancel");
    }

    // Reset form
    if (onReset) {
      registerAction("RESET", "mod+shift+backspace", () => {
        onReset();
      }, "Reset form");
    }
  }, [registerAction, onSubmit, onCancel, onReset]);

  return { ShortcutHint };
}

/**
 * Hook for modal shortcuts
 * Provides common modal patterns: close on escape, confirm on enter
 */
export function useModalShortcuts(componentId, options = {}) {
  const { onClose, onConfirm, isOpen = true } = options;

  const { registerAction, unregisterAction, ShortcutHint } = useComponentShortcuts(
    componentId,
    "MODAL",
    "Modals & Dialogs"
  );

  useEffect(() => {
    if (!isOpen) {
      // Unregister when modal is closed
      unregisterAction("CLOSE");
      unregisterAction("CONFIRM");
      return;
    }

    // Close modal
    if (onClose) {
      registerAction("CLOSE", "escape", () => {
        onClose();
      }, "Close modal", { globalOverride: true });
    }

    // Confirm action
    if (onConfirm) {
      registerAction("CONFIRM", "enter", () => {
        onConfirm();
      }, "Confirm");
    }
  }, [registerAction, unregisterAction, onClose, onConfirm, isOpen]);

  return { ShortcutHint };
}

export default useComponentShortcuts;
