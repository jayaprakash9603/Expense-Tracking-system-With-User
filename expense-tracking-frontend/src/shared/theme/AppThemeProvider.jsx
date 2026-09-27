import React, { useEffect, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useSelector } from "react-redux";
import buildAppTheme from "./buildAppTheme";
import { injectThemeFromBuilt } from "../../utils/theme/themeInjector";
import { isFeatureEnabledInState, FEATURE_KEYS } from "../../config/featureCatalog";

const AppThemeProvider = ({ children }) => {
  const { mode, palette } = useSelector((state) => state.theme || {});
  const featureFlags = useSelector((state) => state.featureFlags);

  const themeLocked = !isFeatureEnabledInState(
    featureFlags,
    FEATURE_KEYS.THEME_CUSTOMIZATION,
  );

  const effectiveMode = themeLocked ? "dark" : mode || "dark";
  const effectivePalette = palette || "teal";

  const theme = useMemo(
    () => buildAppTheme(effectiveMode, effectivePalette),
    [effectiveMode, effectivePalette],
  );

  useEffect(() => {
    injectThemeFromBuilt(theme, true);
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
