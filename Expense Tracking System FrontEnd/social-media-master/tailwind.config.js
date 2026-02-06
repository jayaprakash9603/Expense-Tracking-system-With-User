/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        'theme-accent': 'var(--color-primary-accent, #14b8a6)',
        'theme-accent-dark': 'var(--color-primary-accent-dark, #0d9488)',
        'theme-accent-hover': 'var(--color-primary-accent-hover, #0d9488)',
        'theme-primary': 'var(--color-primary, #14b8a6)',
        'theme-secondary': 'var(--color-secondary-accent, #00DAC6)',
      },
      ringColor: {
        'theme-accent': 'var(--color-primary-accent, #14b8a6)',
      },
    },
  },
  plugins: [],
};
