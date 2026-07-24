import { useSelector, useDispatch } from "react-redux";
import { useMemo, useCallback, useEffect } from "react";
import { generateThemeTokens } from "../config/themeTokens";
import { COLOR_PALETTES, getPaletteOptions, getIconFilterForPalette } from "../config/colorPalettes";
import { 
  BRAND_GRADIENT_COLORS 
} from "../config/themeConfig";
import { 
  toggleTheme, 
  setTheme, 
  setPalette, 
  setThemeFull,
  setSystemPreference,
  resetTheme 
} from "../Redux/Theme/theme.actions";
import { 
  injectTheme, 
  watchSystemPreference 
} from "../utils/theme/themeInjector";
import { isFeatureEnabledInState, FEATURE_KEYS } from "../config/featureCatalog";

/**
 * Custom hook for comprehensive theme access and control
 *
 * @returns {object} Theme utilities
 * @returns {string} mode - Current theme mode ('dark' or 'light')
 * @returns {string} palette - Current palette ID (e.g., 'teal', 'blue')
 * @returns {object} colors - Theme colors object (backward compatible)
 * @returns {function} getIconFilter - Function to get icon filter based on active state
 * @returns {object} brandColors - Brand gradient colors
 * @returns {object} paletteInfo - Current palette metadata
 * @returns {array} availablePalettes - List of available palette options
 * @returns {boolean} useSystemPreference - Whether system preference is enabled
 * @returns {function} setMode - Set theme mode
 * @returns {function} setPaletteId - Set palette
 * @returns {function} toggle - Toggle between light/dark
 * @returns {function} setUseSystem - Enable/disable system preference
 * @returns {function} reset - Reset to defaults
 *
 * @example
 * const { mode, palette, colors, setMode, setPaletteId } = useTheme();
 *
 * <div style={{ backgroundColor: colors.primary_bg }}>
 *   <button onClick={() => setPaletteId('blue')}>Blue Theme</button>
 * </div>
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  const { mode, palette, useSystemPreference } = useSelector(
    (state) => state.theme || {}
  );
  const featureFlags = useSelector((state) => state.featureFlags);

  // When theme customization is dormant (backend flag), lock the app to dark mode
  // regardless of any persisted/user-selected mode or system preference.
  const themeLocked = !isFeatureEnabledInState(
    featureFlags,
    FEATURE_KEYS.THEME_CUSTOMIZATION
  );

  const currentMode = themeLocked ? "dark" : (mode || "dark");
  const currentPalette = palette || "teal";

  // Generate theme tokens - memoized to prevent recalculation
  const colors = useMemo(
    () => generateThemeTokens(currentPalette, currentMode),
    [currentPalette, currentMode]
  );

  // Get current palette info
  const paletteInfo = useMemo(
    () => COLOR_PALETTES[currentPalette] || COLOR_PALETTES.teal,
    [currentPalette]
  );

  // Available palettes for UI
  const availablePalettes = useMemo(() => getPaletteOptions(), []);

  // Inject CSS variables when theme changes
  useEffect(() => {
    injectTheme(currentPalette, currentMode);
  }, [currentPalette, currentMode]);

  // Watch system preference changes when enabled (ignored while theme is locked)
  useEffect(() => {
    if (themeLocked || !useSystemPreference) return;
    
    const cleanup = watchSystemPreference((newMode) => {
      dispatch(setTheme(newMode));
    });
    
    return cleanup;
  }, [themeLocked, useSystemPreference, dispatch]);

  useEffect(() => {
    if (themeLocked && mode !== "dark") {
      dispatch(setTheme("dark"));
    }
  }, [themeLocked, mode, dispatch]);

  const setMode = useCallback(
    (newMode) => {
      if (themeLocked) return;
      dispatch(setTheme(newMode));
    },
    [dispatch, themeLocked],
  );

  const setPaletteId = useCallback(
    (paletteId) => {
      if (themeLocked) return;
      dispatch(setPalette(paletteId));
    },
    [dispatch, themeLocked],
  );

  const toggle = useCallback(() => {
    if (themeLocked) return;
    dispatch(toggleTheme());
  }, [dispatch, themeLocked]);

  const setFull = useCallback(
    (newMode, paletteId) => {
      if (themeLocked) return;
      dispatch(setThemeFull(newMode, paletteId));
    },
    [dispatch, themeLocked],
  );

  const setUseSystem = useCallback(
    (useSystem) => {
      if (themeLocked) return;
      dispatch(setSystemPreference(useSystem));
    },
    [dispatch, themeLocked],
  );

  const reset = useCallback(() => {
    if (themeLocked) return;
    dispatch(resetTheme());
  }, [dispatch, themeLocked]);

  return {
    // State
    mode: currentMode,
    palette: currentPalette,
    colors,
    useSystemPreference: Boolean(useSystemPreference),
    themeLocked,
    
    // Palette info
    paletteInfo,
    availablePalettes,
    
    // Utilities (backward compatible)
    getIconFilter: (isActive = false) => getIconFilterForPalette(currentPalette, currentMode, isActive),
    brandColors: BRAND_GRADIENT_COLORS,
    
    // Actions
    setMode,
    setPaletteId,
    toggle,
    setFull,
    setUseSystem,
    reset,
  };
};

export default useTheme;
