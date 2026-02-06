import { useSelector, useDispatch } from "react-redux";
import { useMemo, useCallback, useEffect } from "react";
import { generateThemeTokens } from "../config/themeTokens";
import { COLOR_PALETTES, getPaletteOptions } from "../config/colorPalettes";
import { 
  getIconFilter, 
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
} from "../utils/themeInjector";

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
  
  const currentMode = mode || "dark";
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

  // Watch system preference changes when enabled
  useEffect(() => {
    if (!useSystemPreference) return;
    
    const cleanup = watchSystemPreference((newMode) => {
      dispatch(setTheme(newMode));
    });
    
    return cleanup;
  }, [useSystemPreference, dispatch]);

  // Action callbacks - memoized
  const setMode = useCallback(
    (newMode) => dispatch(setTheme(newMode)),
    [dispatch]
  );

  const setPaletteId = useCallback(
    (paletteId) => dispatch(setPalette(paletteId)),
    [dispatch]
  );

  const toggle = useCallback(
    () => dispatch(toggleTheme()),
    [dispatch]
  );

  const setFull = useCallback(
    (newMode, paletteId) => dispatch(setThemeFull(newMode, paletteId)),
    [dispatch]
  );

  const setUseSystem = useCallback(
    (useSystem) => dispatch(setSystemPreference(useSystem)),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetTheme()),
    [dispatch]
  );

  return {
    // State
    mode: currentMode,
    palette: currentPalette,
    colors,
    useSystemPreference: Boolean(useSystemPreference),
    
    // Palette info
    paletteInfo,
    availablePalettes,
    
    // Utilities (backward compatible)
    getIconFilter: (isActive = false) => getIconFilter(currentMode, isActive),
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
