# Theme Colors Quick Reference

## Import Statement

```jsx
import { useTheme } from "../../hooks/useTheme";
```

## Basic Usage

```jsx
const { mode, colors, getIconFilter } = useTheme();
```

---

## Common Color Mappings

### Dark Theme → Light Theme Equivalents

| Purpose                    | Dark Mode             | Light Mode |
| -------------------------- | --------------------- | ---------- |
| **Main Background**        | `#1b1b1b`             | `#ffffff`  |
| **Secondary Background**   | `#121212`             | `#f5f5f5`  |
| **Active Item Background** | `#29282b`             | `#e0f7f5`  |
| **Hover Background**       | `#28282a`             | `#f0f0f0`  |
| **Primary Text**           | `#ffffff`             | `#1a1a1a`  |
| **Muted Text**             | `#666666`             | `#737373`  |
| **Active/Accent Text**     | `#00DAC6` / `#14b8a6` | `#14b8a6`  |
| **Border**                 | `#333333`             | `#e0e0e0`  |

---

## Quick Replacements

### Replace This (Hardcoded):

```jsx
className = "bg-[#1b1b1b] text-white";
```

### With This (Theme-Aware):

```jsx
style={{ backgroundColor: colors.primary_bg, color: colors.primary_text }}
```

---

### Replace This (Hardcoded Active):

```jsx
className={isActive ? "bg-[#29282b] text-[#00DAC6]" : "text-white"}
```

### With This (Theme-Aware):

```jsx
style={{
  backgroundColor: isActive ? colors.active_bg : 'transparent',
  color: isActive ? colors.active_text : colors.primary_text
}}
```

---

### Replace This (Hardcoded Icon Filter):

```jsx
style={{
  filter: isActive
    ? "invert(44%) sepia(97%) saturate(1671%) hue-rotate(160deg) brightness(92%) contrast(101%)"
    : "invert(100%)"
}}
```

### With This (Theme-Aware):

```jsx
style={{ filter: getIconFilter(isActive) }}
```

---

## All Available Colors

### `colors.primary_bg` - Main backgrounds

### `colors.secondary_bg` - Secondary backgrounds

### `colors.tertiary_bg` - Header backgrounds

### `colors.active_bg` - Active state background

### `colors.hover_bg` - Hover state background

### `colors.overlay_bg` - Modal overlay background

### `colors.primary_text` - Main text

### `colors.secondary_text` - Muted text

### `colors.active_text` - Active/highlighted text

### `colors.brand_text` - Brand color text

### `colors.primary_accent` - Primary brand color (#14b8a6)

### `colors.secondary_accent` - Secondary accent

### `colors.tertiary_accent` - Tertiary accent

### `colors.border_color` - Default borders

### `colors.border_light` - Light borders

### `colors.button_bg` - Button background

### `colors.button_text` - Button text

### `colors.button_hover` - Button hover state

### `colors.avatar_bg` - Avatar background

### `colors.avatar_text` - Avatar text

### `colors.modal_bg` - Modal background

### `colors.modal_overlay` - Modal backdrop

---

## Copy-Paste Templates

### Sidebar/Panel

```jsx
const { colors } = useTheme();
<div style={{ backgroundColor: colors.primary_bg, color: colors.primary_text }}>
  {/* content */}
</div>;
```

### Active Menu Item

```jsx
const { colors } = useTheme();
<div
  style={{
    backgroundColor: isActive ? colors.active_bg : "transparent",
    color: isActive ? colors.active_text : colors.primary_text,
  }}
>
  {/* content */}
</div>;
```

### Button

```jsx
const { colors } = useTheme();
<button
  style={{
    backgroundColor: colors.button_bg,
    color: colors.button_text,
  }}
>
  Click Me
</button>;
```

### Icon

```jsx
const { getIconFilter } = useTheme();
<img src="icon.png" style={{ filter: getIconFilter(isActive) }} />;
```

### Modal/Dialog

```jsx
const { colors } = useTheme();
<div
  style={{
    backgroundColor: colors.modal_bg,
    color: colors.primary_text,
  }}
>
  {/* modal content */}
</div>;
```

### Card

```jsx
const { colors } = useTheme();
<div
  style={{
    backgroundColor: colors.primary_bg,
    borderColor: colors.border_color,
    borderWidth: "1px",
    borderStyle: "solid",
  }}
>
  {/* card content */}
</div>;
```

---

## Remember:

✅ Use inline `style` for theme-dependent properties  
✅ Keep Tailwind classes for layout (flex, grid, padding, etc.)  
✅ Test in both dark and light modes  
✅ Icons should be single-color (white or black) for filters to work
