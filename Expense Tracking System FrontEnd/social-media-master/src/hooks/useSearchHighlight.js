import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

/**
 * Custom hook to handle search-driven scroll and highlight functionality
 * Used when navigating to settings/notifications from universal search
 *
 * URL Parameters supported:
 * - section: The section ID to scroll to (e.g., appearance, preferences)
 * - highlight: The specific item ID to highlight (e.g., theme-settings, language-settings)
 * - service: For notification settings, the service to expand (e.g., expense_service)
 *
 * Example URLs:
 * - /settings?section=appearance&highlight=theme
 * - /settings?section=privacy_security&highlight=twoFactor
 * - /settings/notifications?service=budget_service&highlight=budget_exceeded
 */
export const useSearchHighlight = (options = {}) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [highlightedItem, setHighlightedItem] = useState(null);
  const [highlightedSection, setHighlightedSection] = useState(null);
  const highlightTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Configuration with defaults
  const {
    highlightDuration = 3000, // How long to show highlight (ms)
    scrollDelay = 100, // Delay before scrolling (ms)
    scrollBehavior = "smooth", // Scroll behavior
    scrollOffset = -100, // Offset from top when scrolling
  } = options;

  /**
   * Extract parameters from URL
   */
  const getParams = useCallback(() => {
    const section = searchParams.get("section");
    const highlight = searchParams.get("highlight");
    const service = searchParams.get("service");
    return { section, highlight, service };
  }, [searchParams]);

  /**
   * Scroll to a specific element by ID
   */
  const scrollToElement = useCallback(
    (elementId) => {
      if (!elementId) return;

      scrollTimeoutRef.current = setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset + scrollOffset;

          // First try scrollIntoView for better compatibility
          element.scrollIntoView({
            behavior: scrollBehavior,
            block: "center",
          });

          // Fallback: also scroll the parent container if needed
          const scrollContainer = element.closest(".custom-scrollbar");
          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const scrollTop =
              elementRect.top -
              containerRect.top +
              scrollContainer.scrollTop -
              containerRect.height / 2 +
              elementRect.height / 2;

            scrollContainer.scrollTo({
              top: Math.max(0, scrollTop),
              behavior: scrollBehavior,
            });
          }
        }
      }, scrollDelay);
    },
    [scrollBehavior, scrollDelay, scrollOffset],
  );

  /**
   * Apply highlight effect to an item
   */
  const applyHighlight = useCallback(
    (itemId) => {
      if (!itemId) return;

      setHighlightedItem(itemId);

      // Clear highlight after duration
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedItem(null);
      }, highlightDuration);
    },
    [highlightDuration],
  );

  /**
   * Process URL parameters and apply scroll/highlight
   */
  useEffect(() => {
    const { section, highlight, service } = getParams();

    // Set highlighted section for styling
    if (section) {
      setHighlightedSection(section);
    }

    // Determine what to scroll to
    const scrollTarget = highlight || section || service;

    if (scrollTarget) {
      // Scroll to the element
      scrollToElement(`setting-${scrollTarget}`);

      // Apply highlight if specific item is targeted
      if (highlight) {
        applyHighlight(highlight);
      }
    }

    // Cleanup on unmount or URL change
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [location.search, getParams, scrollToElement, applyHighlight]);

  /**
   * Check if an item should be highlighted
   */
  const isItemHighlighted = useCallback(
    (itemId) => {
      return highlightedItem === itemId;
    },
    [highlightedItem],
  );

  /**
   * Check if a section should be highlighted/expanded
   */
  const isSectionHighlighted = useCallback(
    (sectionId) => {
      return highlightedSection === sectionId;
    },
    [highlightedSection],
  );

  /**
   * Manually trigger highlight for an item
   * Useful for programmatic highlighting
   */
  const triggerHighlight = useCallback(
    (itemId) => {
      scrollToElement(`setting-${itemId}`);
      applyHighlight(itemId);
    },
    [scrollToElement, applyHighlight],
  );

  /**
   * Clear all highlights
   */
  const clearHighlights = useCallback(() => {
    setHighlightedItem(null);
    setHighlightedSection(null);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
  }, []);

  /**
   * Get highlight styles for an item
   * Returns inline styles object for the highlighted item
   */
  const getHighlightStyles = useCallback(
    (itemId, baseColors) => {
      if (highlightedItem !== itemId) return {};

      return {
        backgroundColor: `${baseColors?.primary_accent || "#14b8a6"}25`,
        boxShadow: `0 0 0 2px ${baseColors?.primary_accent || "#14b8a6"}`,
        borderRadius: "12px",
        transform: "scale(1.01)",
        transition: "all 0.3s ease-in-out",
      };
    },
    [highlightedItem],
  );

  /**
   * Get the current URL parameters
   */
  const currentParams = getParams();

  return {
    // State
    highlightedItem,
    highlightedSection,
    currentParams,

    // Checkers
    isItemHighlighted,
    isSectionHighlighted,

    // Actions
    triggerHighlight,
    clearHighlights,
    scrollToElement,

    // Helpers
    getHighlightStyles,
  };
};

/**
 * CSS keyframes for highlight animation
 * Add this to your global styles or component styles
 */
export const highlightAnimationStyles = `
  @keyframes settingHighlightPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(20, 184, 166, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(20, 184, 166, 0);
    }
  }
  
  .setting-item-highlighted {
    animation: settingHighlightPulse 1s ease-in-out 2;
    background-color: rgba(20, 184, 166, 0.15) !important;
    border-radius: 12px;
  }
  
  .setting-section-highlighted {
    animation: settingHighlightPulse 0.8s ease-in-out 1;
  }
`;

export default useSearchHighlight;
