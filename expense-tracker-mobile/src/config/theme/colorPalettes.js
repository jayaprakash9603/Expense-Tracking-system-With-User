export const COLOR_PALETTES = {
  teal: {
    id: "teal",
    name: "Teal",
    description: "Default theme - calm and professional",
    primary: "#14b8a6",
    secondary: "#06b6d4",
    accent: "#00DAC6",
  },
  blue: {
    id: "blue",
    name: "Blue",
    description: "Trust and reliability",
    primary: "#2196f3",
    secondary: "#1976d2",
    accent: "#64b5f6",
  },
  purple: {
    id: "purple",
    name: "Purple",
    description: "Creative and premium",
    primary: "#9c27b0",
    secondary: "#7b1fa2",
    accent: "#ce93d8",
  },
  indigo: {
    id: "indigo",
    name: "Indigo",
    description: "Deep and sophisticated",
    primary: "#5b7fff",
    secondary: "#3f51b5",
    accent: "#7986cb",
  },
  orange: {
    id: "orange",
    name: "Orange",
    description: "Energy and warmth",
    primary: "#ff9800",
    secondary: "#f57c00",
    accent: "#ffb74d",
  },
  pink: {
    id: "pink",
    name: "Pink",
    description: "Modern and bold",
    primary: "#e91e63",
    secondary: "#c2185b",
    accent: "#f48fb1",
  },
  green: {
    id: "green",
    name: "Green",
    description: "Growth and finance",
    primary: "#4caf50",
    secondary: "#388e3c",
    accent: "#81c784",
  },
  red: {
    id: "red",
    name: "Red",
    description: "Bold and energetic",
    primary: "#f44336",
    secondary: "#d32f2f",
    accent: "#ef5350",
  },
  amber: {
    id: "amber",
    name: "Amber",
    description: "Warm and inviting",
    primary: "#ffc107",
    secondary: "#ffa000",
    accent: "#ffd54f",
  },
  cyan: {
    id: "cyan",
    name: "Cyan",
    description: "Fresh and clean",
    primary: "#00bcd4",
    secondary: "#0097a7",
    accent: "#4dd0e1",
  },
};

export const SEMANTIC_COLORS = {
  success: { main: "#22c55e", light: "#4ade80", dark: "#16a34a" },
  warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
  error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
  info: { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
};

export const getPaletteOptions = () =>
  Object.values(COLOR_PALETTES).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    primary: p.primary,
    secondary: p.secondary,
  }));

export const getAvailablePalettes = () => Object.keys(COLOR_PALETTES);
