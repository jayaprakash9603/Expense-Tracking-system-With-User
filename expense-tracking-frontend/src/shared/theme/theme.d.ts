import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    custom: {
      paletteId: string;
      mode: string;
      surfaceMuted: string;
      surfaceElevated: string;
      inputBackground: string;
      borderStrong: string;
      borderLight: string;
      overlay: string;
      contrastOnPrimary: string;
      chart: {
        primary: string;
        secondary: string;
        accent: string;
        grid: string;
        tooltipBg: string;
        tooltipText: string;
      };
      finance: Record<string, unknown>;
      financeWeekend: Record<string, unknown>;
      scrollbar: { thumb: string; track: string; hover: string };
      skeleton: { base: string; highlight: string };
      semantic: { success: string; warning: string; error: string; info: string };
      legacy: Record<string, string>;
    };
  }
  interface PaletteOptions {
    custom?: Palette["custom"];
  }
}
