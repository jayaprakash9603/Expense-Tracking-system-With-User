import { createTheme } from "@mui/material/styles";
import { createThemePalette } from "./palette";
import { createTypography } from "./typography";
import { getComponentOverrides } from "./components";
import shape from "./shape";

export const buildAppTheme = (mode = "dark", paletteId = "teal") => {
  const paletteConfig = createThemePalette(mode, paletteId);
  const {
    isDark,
    surfaces,
    accentColor,
    accentLight,
    accentDark,
    accentHover,
  } = paletteConfig._meta;

  const { _meta, ...palette } = paletteConfig;

  return createTheme({
    palette,
    typography: createTypography(surfaces),
    shape,
    components: getComponentOverrides({
      isDark,
      surfaces,
      accentColor,
      accentLight,
      accentDark,
      accentHover,
    }),
  });
};

export default buildAppTheme;
