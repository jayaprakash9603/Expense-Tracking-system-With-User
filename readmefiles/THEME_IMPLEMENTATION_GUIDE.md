# Theme Configuration Guide

## Overview

This project implements a comprehensive theming system that supports both **Dark** and **Light** modes with the primary brand color `#14b8a6` (Teal/Cyan).

## File Structure

```
src/
├── config/
│   └── themeConfig.js          # Main theme configuration with all color definitions
├── hooks/
│   └── useTheme.js              # Custom React hook for easy theme access
└── Redux/
    └── Theme/
        ├── theme.reducer.js     # Redux reducer for theme state management
        ├── theme.actions.js     # Theme actions (toggle, set)
        └── theme.actionTypes.js # Action type constants
```

---

## Quick Start

### 1. Using the `useTheme` Hook (Recommended)

The simplest way to use theming in your components:

```jsx
import { useTheme } from "../../hooks/useTheme";

const MyComponent = () => {
  const { mode, colors, getIconFilter, brandColors } = useTheme();

  return (
    <div
      style={{ backgroundColor: colors.primary_bg, color: colors.primary_text }}
    >
      <h1 style={{ color: colors.active_text }}>Hello World</h1>
      <img src="icon.png" style={{ filter: getIconFilter(isActive) }} />
    </div>
  );
};
```

### 2. Direct Import Method

For more control, import directly from config:

```jsx
import { useSelector } from "react-redux";
import { getThemeColors, getIconFilter } from "../../config/themeConfig";

const MyComponent = () => {
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);

  return (
    <div style={{ backgroundColor: themeColors.primary_bg }}>
      {/* Your content */}
    </div>
  );
};
```

---

## Theme Colors Reference

### Dark Theme Colors

| Variable           | Color     | Usage                             |
| ------------------ | --------- | --------------------------------- |
| `primary_bg`       | `#1b1b1b` | Main sidebar/container background |
| `secondary_bg`     | `#121212` | Darker background for contrast    |
| `tertiary_bg`      | `#0b0b0b` | Even darker for headers           |
| `active_bg`        | `#29282b` | Active menu item background       |
| `hover_bg`         | `#28282a` | Hover state background            |
| `primary_text`     | `#ffffff` | Main text color                   |
| `secondary_text`   | `#666666` | Muted text, disabled states       |
| `active_text`      | `#00DAC6` | Active menu item text             |
| `brand_text`       | `#14b8a6` | Brand color text                  |
| `primary_accent`   | `#14b8a6` | Primary brand color               |
| `secondary_accent` | `#00DAC6` | Lighter teal for highlights       |
| `avatar_bg`        | `#14b8a6` | Avatar background                 |
| `border_color`     | `#333333` | Default border                    |

### Light Theme Colors

| Variable           | Color     | Usage                             |
| ------------------ | --------- | --------------------------------- |
| `primary_bg`       | `#ffffff` | Main sidebar/container background |
| `secondary_bg`     | `#f5f5f5` | Light gray for contrast           |
| `tertiary_bg`      | `#e8e8e8` | Lighter gray for headers          |
| `active_bg`        | `#e0f7f5` | Light teal background for active  |
| `hover_bg`         | `#f0f0f0` | Light hover state                 |
| `primary_text`     | `#1a1a1a` | Main text color (dark gray)       |
| `secondary_text`   | `#737373` | Muted text, disabled states       |
| `active_text`      | `#14b8a6` | Active menu item text             |
| `brand_text`       | `#14b8a6` | Brand color text                  |
| `primary_accent`   | `#14b8a6` | Primary brand color               |
| `secondary_accent` | `#0d9488` | Darker teal for contrast          |
| `avatar_bg`        | `#14b8a6` | Avatar background                 |
| `border_color`     | `#e0e0e0` | Default border                    |

---

## Icon Color Transformation

Icons are transformed using CSS filters to match the theme. Use the `getIconFilter()` function:

```jsx
const { getIconFilter } = useTheme();

<img src="icon.png" style={{ filter: getIconFilter(isActive) }} />;
```

The function automatically applies the correct filter based on:

- Current theme mode (dark/light)
- Active state (true/false)

---

## Converting Existing Components

### Before (Hardcoded Colors)

```jsx
const MenuItem = ({ name, isActive }) => {
  return (
    <div
      className={`menu-item ${
        isActive ? "bg-[#29282b] text-[#00DAC6]" : "text-white"
      }`}
    >
      {name}
    </div>
  );
};
```

### After (Theme-Aware)

```jsx
import { useTheme } from "../../hooks/useTheme";

const MenuItem = ({ name, isActive }) => {
  const { colors } = useTheme();

  return (
    <div
      className="menu-item"
      style={{
        backgroundColor: isActive ? colors.active_bg : "transparent",
        color: isActive ? colors.active_text : colors.primary_text,
      }}
    >
      {name}
    </div>
  );
};
```

---

## Available Theme Functions

### `getThemeColors(mode)`

Returns the color palette for the specified theme mode.

```jsx
import { getThemeColors } from "../config/themeConfig";

const colors = getThemeColors("dark");
console.log(colors.primary_bg); // '#1b1b1b'
```

### `getIconFilter(mode, isActive)`

Returns the CSS filter string for icon color transformation.

```jsx
import { getIconFilter } from "../config/themeConfig";

const filter = getIconFilter("dark", true);
// Returns: 'invert(44%) sepia(97%) saturate(1671%)...'
```

---

## Redux Theme Actions

### Toggle Theme

```jsx
import { useDispatch } from "react-redux";
import { toggleTheme } from "../../Redux/Theme/theme.actions";

const ThemeToggle = () => {
  const dispatch = useDispatch();

  return <button onClick={() => dispatch(toggleTheme())}>Toggle Theme</button>;
};
```

### Set Specific Theme

```jsx
import { setTheme } from "../../Redux/Theme/theme.actions";

dispatch(setTheme("light")); // or 'dark'
```

---

## Best Practices

### ✅ DO:

- Use the `useTheme` hook for cleaner, more maintainable code
- Use semantic color variables (e.g., `primary_bg`) instead of hex codes
- Test your components in both light and dark modes
- Use inline styles for theme-dependent properties
- Keep Tailwind classes for layout/spacing

### ❌ DON'T:

- Hardcode color values like `#1b1b1b` or `#ffffff`
- Mix Tailwind color classes with theme colors (e.g., avoid `bg-gray-900`)
- Override theme colors with `!important`
- Forget to import theme dependencies

---

## Example: Complete Component

```jsx
import React from "react";
import { useTheme } from "../../hooks/useTheme";

const Card = ({ title, content, isHighlighted }) => {
  const { colors, getIconFilter } = useTheme();

  return (
    <div
      className="rounded-lg p-4 transition-all duration-200"
      style={{
        backgroundColor: isHighlighted ? colors.active_bg : colors.primary_bg,
        borderColor: colors.border_color,
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      <h3
        style={{
          color: isHighlighted ? colors.active_text : colors.primary_text,
        }}
      >
        {title}
      </h3>
      <p style={{ color: colors.secondary_text }}>{content}</p>
      <img
        src="icon.png"
        alt="Card icon"
        style={{ filter: getIconFilter(isHighlighted) }}
      />
    </div>
  );
};

export default Card;
```

---

## Troubleshooting

### Issue: Theme colors not updating

**Solution:** Ensure your component is wrapped in Redux Provider and subscribes to theme state:

```jsx
const { mode } = useSelector((state) => state.theme || {});
```

### Issue: Icons not changing color

**Solution:** Verify icon is a single-color SVG or PNG. Complex multi-color images won't work with CSS filters.

### Issue: Light theme looks wrong

**Solution:** Check if you're using the `getThemeColors(mode)` function with the correct mode parameter.

---

## Migration Checklist

When converting an existing component to use themes:

- [ ] Import `useTheme` hook or theme functions
- [ ] Replace hardcoded background colors with `colors.primary_bg` / `colors.secondary_bg`
- [ ] Replace hardcoded text colors with `colors.primary_text` / `colors.active_text`
- [ ] Replace icon filters with `getIconFilter(isActive)`
- [ ] Remove Tailwind color classes (keep layout classes)
- [ ] Test component in both dark and light modes
- [ ] Check hover and active states

---

## Need Help?

- Check `src/config/themeConfig.js` for all available colors
- See `src/hooks/useTheme.js` for hook usage
- Reference `Left.jsx` and `MenuItem.jsx` for complete implementation examples

---

**Last Updated:** December 2024  
**Version:** 1.0.0
