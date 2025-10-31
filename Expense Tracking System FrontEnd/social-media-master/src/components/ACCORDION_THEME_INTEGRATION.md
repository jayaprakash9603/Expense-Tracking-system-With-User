# GenericAccordionGroup Theme Integration

## Overview

The `GenericAccordionGroup` component now supports light and dark themes using the `useTheme` hook from `src/hooks/useTheme.js`.

## Implementation Details

### 1. Theme Hook Integration

```jsx
import { useTheme } from "../hooks/useTheme";

const { colors } = useTheme();
```

### 2. CSS Custom Properties (Variables)

The component uses CSS variables that can be dynamically overridden:

```css
--pm-bg-primary: Primary background color
--pm-bg-secondary: Secondary background color
--pm-bg-tertiary: Tertiary background color
--pm-border-color: Border color
--pm-text-primary: Primary text color
--pm-text-secondary: Secondary text color
--pm-text-tertiary: Tertiary text color
--pm-accent-color: Accent/highlight color
--pm-scrollbar-thumb: Scrollbar thumb color
--pm-scrollbar-track: Scrollbar track color
```

### 3. Theme Mapping

The component maps theme colors to CSS variables:

```jsx
const themeStyles = {
  accordionGroup: {
    "--pm-bg-primary": colors.primary_bg,
    "--pm-bg-secondary": colors.secondary_bg,
    "--pm-bg-tertiary": colors.tertiary_bg,
    "--pm-border-color": colors.border_color,
    "--pm-text-primary": colors.primary_text,
    "--pm-text-secondary": colors.secondary_text,
    "--pm-text-tertiary": colors.tertiary_text,
    "--pm-accent-color": colors.accent_color,
    "--pm-scrollbar-thumb": colors.accent_color,
    "--pm-scrollbar-track": colors.secondary_bg,
  },
};
```

## Updated Components

### React Component

- **File**: `GenericAccordionGroup.jsx`
- **Changes**:
  - Added `useTheme` hook import
  - Created `themeStyles` object with CSS variables
  - Applied styles to root element via inline styles

### CSS Stylesheet

- **File**: `PaymentMethodAccordion.css`
- **Changes**:
  - Defined CSS custom properties with default values
  - Replaced all hardcoded colors with `var(--pm-*)` references
  - Updated 50+ color references to use theme variables

## Theme-Aware Elements

### Backgrounds

- Accordion items: `--pm-bg-primary`
- Table headers: `--pm-bg-secondary`
- Tabs container: `--pm-bg-tertiary`
- Metric boxes: `--pm-bg-secondary`

### Borders

- All borders: `--pm-border-color`
- Table cell borders: `--pm-border-color`
- Pagination borders: `--pm-border-color`

### Text Colors

- Primary text (headers, active tabs): `--pm-text-primary`
- Secondary text (labels, sort buttons): `--pm-text-secondary`
- Tertiary text (counts, indicators): `--pm-text-tertiary`

### Accent Colors

- Amount displays: `--pm-accent-color`
- Tab indicators: `--pm-accent-color`
- Active sort icons: `--pm-accent-color`
- Focus outlines: `--pm-accent-color`

### Scrollbars

- Thumb: `--pm-scrollbar-thumb`
- Track: `--pm-scrollbar-track`
- Works on both webkit and Firefox

## Usage Example

```jsx
import { GenericAccordionGroup } from "./GenericAccordionGroup";

// The component automatically adapts to the current theme
<GenericAccordionGroup
  groups={paymentMethods}
  currencySymbol="$"
  columns={columnConfig}
  tabs={tabConfig}
/>;
```

## Benefits

### 1. **Automatic Theme Switching**

- Component responds to Redux theme state changes
- No manual color management needed
- Consistent with app-wide theme system

### 2. **Maintainability**

- Single source of truth for colors (useTheme hook)
- Easy to update theme colors globally
- CSS variables provide fallback values

### 3. **Performance**

- CSS variables are hardware-accelerated
- Minimal JavaScript overhead
- Smooth theme transitions

### 4. **Accessibility**

- Proper contrast ratios maintained
- Theme-aware focus indicators
- Consistent visual hierarchy

## Default Color Scheme (Dark Mode)

```css
--pm-bg-primary: #141414
--pm-bg-secondary: #1d1d1f
--pm-bg-tertiary: #1b1b1b
--pm-border-color: #2a2a2a
--pm-text-primary: #fff
--pm-text-secondary: #ccc
--pm-text-tertiary: #bbb
--pm-accent-color: #14b8a6
```

## Light Mode Support

When `useTheme` returns light mode colors:

- Backgrounds become lighter
- Text becomes darker
- Borders adjust contrast
- Accent color remains vibrant

## Testing

To verify theme integration:

1. **Switch Theme**: Change theme in settings
2. **Check Elements**: Verify all accordion elements update
3. **Test Interactions**: Ensure hover states adapt
4. **Verify Scrollbars**: Check scrollbar colors change
5. **Check Contrast**: Ensure readability in both modes

## Future Enhancements

- [ ] Add smooth color transitions on theme change
- [ ] Support custom color overrides per instance
- [ ] Add high-contrast theme variant
- [ ] Implement theme-aware animations

## Related Files

- `src/hooks/useTheme.js` - Theme hook implementation
- `src/Redux/Theme/theme.actions.js` - Theme actions
- `src/Redux/Theme/theme.reducer.js` - Theme state management
- `src/components/Settings/Settings.jsx` - Theme settings UI

## Migration Notes

If you have existing instances of `GenericAccordionGroup`:

- No code changes required
- Theme support is automatic
- Default colors preserved as fallbacks
- Custom CSS can still override if needed

---

**Last Updated**: January 2025  
**Component Version**: 2.0 (Theme-Aware)  
**Compatibility**: React 17+, Redux, Material-UI v5
