import { useEffect } from "react";

/**
 * @param {{enabled?: boolean, bindings: Record<string, (event: KeyboardEvent) => void>}} params
 */
export function useKeyboardShortcuts({ enabled = true, bindings = {} }) {
  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (event) => {
      const parts = [];
      if (event.ctrlKey || event.metaKey) parts.push("mod");
      if (event.shiftKey) parts.push("shift");
      if (event.altKey) parts.push("alt");
      parts.push(event.key.toLowerCase());
      const hotkey = parts.join("+");

      const handler = bindings[hotkey];
      if (!handler) return;

      event.preventDefault();
      handler(event);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, bindings]);
}

export default useKeyboardShortcuts;
