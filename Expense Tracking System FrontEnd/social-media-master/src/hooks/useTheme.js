import { useSelector } from "react-redux";
import {
  getThemeColors,
  getIconFilter,
  BRAND_GRADIENT_COLORS,
} from "../config/themeConfig";

/**
 * Custom hook for easy access to theme colors and utilities
 *
 * @returns {object} Theme utilities
 * @returns {string} mode - Current theme mode ('dark' or 'light')
 * @returns {object} colors - Theme colors object
 * @returns {function} getIconFilter - Function to get icon filter based on active state
 * @returns {object} brandColors - Brand gradient colors
 *
 * @example
 * const { mode, colors, getIconFilter, brandColors } = useTheme();
 *
 * <div style={{ backgroundColor: colors.primary_bg }}>
 *   <img style={{ filter: getIconFilter(isActive) }} />
 * </div>
 */
export const useTheme = () => {
  const { mode } = useSelector((state) => state.theme || {});
  const currentMode = mode || "dark";
  const colors = getThemeColors(currentMode);

  return {
    mode: currentMode,
    colors,
    getIconFilter: (isActive = false) => getIconFilter(currentMode, isActive),
    brandColors: BRAND_GRADIENT_COLORS,
  };
};

export default useTheme;
