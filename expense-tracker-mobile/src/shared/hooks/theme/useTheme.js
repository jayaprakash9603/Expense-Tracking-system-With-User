import { useSelector, useDispatch } from "react-redux";
import { useMemo, useCallback, useEffect } from "react";
import { generateLegacyTokens } from "@/config/themeTokens";
import { COLOR_PALETTES, getPaletteOptions } from "@/config/colorPalettes";
import {
  toggleTheme,
  setTheme,
  setPalette,
  setThemeFull,
  setSystemPreference,
  resetTheme,
} from "@/redux/theme/theme.actions";
import { injectTheme, watchSystemPreference } from "@/shared/utils/themeInjector";

export const useTheme = () => {
  const dispatch = useDispatch();
  const { mode, palette, useSystemPreference: useSystemPref } = useSelector(
    (state) => state.theme || {}
  );

  const currentMode = mode || "dark";
  const currentPalette = palette || "teal";

  const colors = useMemo(
    () => generateLegacyTokens(currentPalette, currentMode),
    [currentPalette, currentMode]
  );

  const paletteInfo = useMemo(
    () => COLOR_PALETTES[currentPalette] || COLOR_PALETTES.teal,
    [currentPalette]
  );

  const availablePalettes = useMemo(() => getPaletteOptions(), []);

  useEffect(() => {
    injectTheme(currentPalette, currentMode);
  }, [currentPalette, currentMode]);

  useEffect(() => {
    if (!useSystemPref) return;
    return watchSystemPreference((newMode) => dispatch(setTheme(newMode)));
  }, [useSystemPref, dispatch]);

  const setMode = useCallback((m) => dispatch(setTheme(m)), [dispatch]);
  const setPaletteId = useCallback((p) => dispatch(setPalette(p)), [dispatch]);
  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);
  const setFull = useCallback((m, p) => dispatch(setThemeFull(m, p)), [dispatch]);
  const setUseSystem = useCallback((v) => dispatch(setSystemPreference(v)), [dispatch]);
  const reset = useCallback(() => dispatch(resetTheme()), [dispatch]);

  return {
    mode: currentMode,
    palette: currentPalette,
    colors,
    useSystemPreference: Boolean(useSystemPref),
    paletteInfo,
    availablePalettes,
    setMode,
    setPaletteId,
    toggle,
    setFull,
    setUseSystem,
    reset,
  };
};

export default useTheme;
