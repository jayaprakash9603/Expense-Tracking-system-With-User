/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "theme-accent": "var(--color-primary-accent, #14b8a6)",
        "theme-accent-dark": "var(--color-primary-accent-dark, #0d9488)",
        "theme-accent-hover": "var(--color-primary-accent-hover, #0d9488)",
        "theme-primary": "var(--color-primary, #14b8a6)",
        "theme-secondary": "var(--color-secondary-accent, #00DAC6)",
        "theme-bg": "var(--color-secondary-bg, #121212)",
        "theme-paper": "var(--color-primary-bg, #1b1b1b)",
        "theme-text": "var(--color-primary-text, #ffffff)",
        "theme-muted": "var(--color-secondary-text, #9ca3af)",
        "theme-border": "var(--color-border-color, #2a2a2a)",
        "theme-error": "var(--color-error, #ef4444)",
        "theme-success": "var(--color-success, #22c55e)",
        "theme-warning": "var(--color-warning, #f59e0b)",
      },
      spacing: {
        "ds-1": "4px",
        "ds-2": "8px",
        "ds-3": "12px",
        "ds-4": "16px",
        "ds-5": "20px",
        "ds-6": "24px",
      },
      borderRadius: {
        "ds-sm": "8px",
        "ds-md": "12px",
        "ds-lg": "16px",
      },
      ringColor: {
        "theme-accent": "var(--color-primary-accent, #14b8a6)",
      },
    },
  },
  plugins: [],
};
