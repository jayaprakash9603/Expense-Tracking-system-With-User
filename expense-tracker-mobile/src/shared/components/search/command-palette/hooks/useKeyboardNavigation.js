import { useEffect, useState } from "react";

export function useKeyboardNavigation({
  isOpen,
  query,
  flatResults,
  canGoBack,
  onSelect,
  onClose,
  onGoBack,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, flatResults.length]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isMetaK) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key === "Backspace" && !query.trim() && canGoBack) {
        event.preventDefault();
        onGoBack?.();
        return;
      }

      if (!flatResults.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatResults.length);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const action = flatResults[selectedIndex];
        if (action) onSelect?.(action);
      }

      if (event.key === "Tab") {
        event.preventDefault();
        const action = flatResults[selectedIndex];
        if (action) onSelect?.(action);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, query, flatResults, selectedIndex, canGoBack, onClose, onGoBack, onSelect]);

  return {
    selectedIndex,
    setSelectedIndex,
  };
}

export default useKeyboardNavigation;
