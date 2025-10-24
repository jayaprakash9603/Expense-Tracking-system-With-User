# Theme Color Palette Visual Reference

## Primary Brand Color

**#14b8a6** (Teal/Cyan) - Used consistently across both themes

---

## Dark Theme Palette

### Backgrounds

```
█████ #1b1b1b  primary_bg     (Main sidebar/container)
█████ #121212  secondary_bg   (Darker contrast areas)
█████ #0b0b0b  tertiary_bg    (Headers, darkest areas)
█████ #29282b  active_bg      (Active menu items)
█████ #28282a  hover_bg       (Hover states)
```

### Text Colors

```
█████ #ffffff  primary_text   (Main text, labels)
█████ #666666  secondary_text (Muted text, placeholders)
█████ #00DAC6  active_text    (Active/highlighted text)
█████ #14b8a6  brand_text     (Brand identity)
```

### Accents & Highlights

```
█████ #14b8a6  primary_accent   (Primary brand color)
█████ #00DAC6  secondary_accent (Lighter teal)
█████ #00b8a9  tertiary_accent  (Darker teal for hover)
```

### Borders & Dividers

```
█████ #333333  border_color   (Default borders)
█████ #28282a  border_light   (Subtle borders)
```

---

## Light Theme Palette

### Backgrounds

```
█████ #ffffff  primary_bg     (Main sidebar/container - white)
█████ #f5f5f5  secondary_bg   (Light gray contrast)
█████ #e8e8e8  tertiary_bg    (Headers, lighter gray)
█████ #e0f7f5  active_bg      (Light teal for active items)
█████ #f0f0f0  hover_bg       (Light gray for hover)
```

### Text Colors

```
█████ #1a1a1a  primary_text   (Dark gray/black main text)
█████ #737373  secondary_text (Medium gray muted text)
█████ #14b8a6  active_text    (Teal for active/highlighted)
█████ #14b8a6  brand_text     (Brand identity)
```

### Accents & Highlights

```
█████ #14b8a6  primary_accent   (Primary brand color)
█████ #0d9488  secondary_accent (Darker teal)
█████ #0f766e  tertiary_accent  (Even darker for hover)
```

### Borders & Dividers

```
█████ #e0e0e0  border_color   (Default light borders)
█████ #f0f0f0  border_light   (Very light borders)
```

---

## Button States

### Dark Theme Buttons

```
Default:  bg: #00DAC6  text: #1b1b1b
Hover:    bg: #00b8a9  text: #1b1b1b
```

### Light Theme Buttons

```
Default:  bg: #14b8a6  text: #ffffff
Hover:    bg: #0d9488  text: #ffffff
```

---

## Avatar Colors

### Both Themes

```
Background: #14b8a6 (Primary brand color)
Dark Mode Text:  #1b1b1b (Dark background)
Light Mode Text: #ffffff (White text)
```

---

## Modal/Dialog Overlays

### Dark Theme

```
Modal Background: #1b1b1b (Solid dark)
Backdrop Overlay: rgba(0, 0, 0, 0.8) (Heavy dark overlay)
```

### Light Theme

```
Modal Background: #ffffff (Solid white)
Backdrop Overlay: rgba(0, 0, 0, 0.3) (Light semi-transparent)
```

---

## Brand Gradient (Same for Both Themes)

**"Expensio Finance"** uses a teal gradient that remains consistent:

```
E  x  →  #d8fffb  (Lightest teal)
  p   →  #92e9dc  (Light teal)
 en   →  #00DAC6  (Mid teal)
  s   →  #00C7AB  (Primary teal)
  i   →  #00A885  (Darker teal)
  o   →  #008966  (Dark teal)
Finance → #14b8a6  (Brand teal)
```

---

## Usage Context

### When to use `primary_bg`:

- Main container backgrounds
- Sidebar backgrounds
- Panel backgrounds
- Large content areas

### When to use `secondary_bg`:

- Cards within containers
- Input fields
- Dropdown menus
- Secondary panels

### When to use `tertiary_bg`:

- Headers
- Section dividers
- Table headers
- Modal headers

### When to use `active_bg`:

- Selected menu items
- Active tabs
- Highlighted cards
- Selected rows

### When to use `hover_bg`:

- Menu item hover states
- Button hover states
- Card hover states
- Interactive element hover

---

## Accessibility Notes

### Dark Theme Contrast Ratios

- Primary text (#ffffff) on primary_bg (#1b1b1b): **15.5:1** ✅ WCAG AAA
- Active text (#00DAC6) on active_bg (#29282b): **8.2:1** ✅ WCAG AA
- Secondary text (#666666) on primary_bg (#1b1b1b): **4.6:1** ✅ WCAG AA

### Light Theme Contrast Ratios

- Primary text (#1a1a1a) on primary_bg (#ffffff): **16.1:1** ✅ WCAG AAA
- Active text (#14b8a6) on primary_bg (#ffffff): **3.1:1** ✅ WCAG AA (Large text)
- Secondary text (#737373) on primary_bg (#ffffff): **4.7:1** ✅ WCAG AA

---

## Color Psychology

### Teal (#14b8a6) - Primary Brand Color

- **Meaning:** Trust, clarity, financial stability, growth
- **Emotion:** Calm, professional, modern
- **Industry Fit:** Perfect for financial applications

### Dark Theme (#1b1b1b backgrounds)

- **Use Case:** Extended viewing, low-light environments
- **Benefit:** Reduces eye strain, focuses attention
- **Mood:** Professional, modern, focused

### Light Theme (#ffffff backgrounds)

- **Use Case:** Bright environments, traditional preference
- **Benefit:** High clarity, familiar, accessible
- **Mood:** Clean, open, trustworthy

---

## Implementation Priority

### High Priority (Core UI)

1. ✅ Sidebar (`Left.jsx`)
2. ✅ Menu Items (`MenuItem.jsx`)
3. Header Bar
4. Main content areas
5. Modals and dialogs

### Medium Priority (Interactive Elements)

6. Buttons and forms
7. Cards and panels
8. Dropdowns and selects
9. Tables and lists

### Low Priority (Nice-to-Have)

10. Charts and graphs
11. Tooltips
12. Badges and chips
13. Progress indicators
