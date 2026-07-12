import { useMemo, useCallback } from "react";
import { useUserSettings } from "./useUserSettings";
import { useMoneyFormatter } from "./useMoneyFormatter";
import { useSensitiveText } from "./useSensitiveText";

export function usePresentation() {
  const { settings, preferences } = useUserSettings();
  const { format, formatCompact, isMasked, currency } = useMoneyFormatter();
  const { mask } = useSensitiveText();

  const animation = useMemo(() => ({
    enabled: settings.enableAnimations && !settings.reduceMotion,
    reducedMotion: settings.reduceMotion,
    duration: settings.reduceMotion ? 0 : 200,
    springConfig: settings.reduceMotion
      ? { duration: 0 }
      : { duration: 300, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
  }), [settings.enableAnimations, settings.reduceMotion]);

  const layout = useMemo(() => ({
    compact: settings.compactMode,
    fontFamily: settings.fontFamily,
    fontSize: settings.fontSize,
    spacing: settings.compactMode ? 0.75 : 1,
  }), [settings.compactMode, settings.fontFamily, settings.fontSize]);

  const accessibility = useMemo(() => ({
    highContrast: settings.highContrastMode,
    enhancedFocus: settings.enhancedFocusIndicators,
    screenReader: settings.screenReaderSupport,
    keyboardShortcuts: settings.keyboardShortcuts,
    showShortcutIndicators: settings.showShortcutIndicators,
  }), [
    settings.highContrastMode,
    settings.enhancedFocusIndicators,
    settings.screenReaderSupport,
    settings.keyboardShortcuts,
    settings.showShortcutIndicators,
  ]);

  const transitionClass = useCallback(
    (base = "transition-all") => {
      if (!animation.enabled) return "";
      return `${base} duration-${animation.duration}`;
    },
    [animation.enabled, animation.duration]
  );

  const hoverClass = useCallback(
    (effect = "hover:-translate-y-0.5 hover:shadow-md") => {
      if (!animation.enabled) return "";
      return effect;
    },
    [animation.enabled]
  );

  return {
    format,
    formatCompact,
    mask,
    isMasked,
    currency,
    animation,
    layout,
    accessibility,
    transitionClass,
    hoverClass,
    preferences,
  };
}

export default usePresentation;
