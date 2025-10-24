# Component Migration Example

## Before: Hardcoded Colors

```jsx
import React from "react";
import { Avatar } from "@mui/material";

const UserCard = ({ user, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg cursor-pointer transition-all duration-200
        ${isSelected ? "bg-[#29282b]" : "bg-[#1b1b1b]"}
        hover:bg-[#28282a]
      `}
    >
      {/* Avatar */}
      <Avatar
        sx={{ width: 60, height: 60, bgcolor: "#14b8a6" }}
        src={user.image}
      >
        {user.initials}
      </Avatar>

      {/* Name */}
      <h3
        className={`
          mt-2 font-bold text-lg
          ${isSelected ? "text-[#00DAC6]" : "text-white"}
        `}
      >
        {user.name}
      </h3>

      {/* Email */}
      <p className="text-[#666666] text-sm">{user.email}</p>

      {/* Status Badge */}
      <div
        className="mt-2 inline-block px-3 py-1 rounded-full text-xs"
        style={{
          backgroundColor: user.isActive ? "#00DAC6" : "#666666",
          color: "#1b1b1b",
        }}
      >
        {user.isActive ? "Active" : "Inactive"}
      </div>

      {/* Icon */}
      <img
        src="user-icon.png"
        alt="User"
        style={{
          filter: isSelected
            ? "invert(44%) sepia(97%) saturate(1671%) hue-rotate(160deg) brightness(92%) contrast(101%)"
            : "invert(100%)",
        }}
      />
    </div>
  );
};

export default UserCard;
```

---

## After: Theme-Aware

```jsx
import React from "react";
import { Avatar } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const UserCard = ({ user, isSelected, onClick }) => {
  const { colors, getIconFilter } = useTheme();

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-lg cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: isSelected ? colors.active_bg : colors.primary_bg,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = colors.hover_bg;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = colors.primary_bg;
        }
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 60,
          height: 60,
          bgcolor: colors.avatar_bg,
          color: colors.avatar_text,
        }}
        src={user.image}
      >
        {user.initials}
      </Avatar>

      {/* Name */}
      <h3
        className="mt-2 font-bold text-lg"
        style={{
          color: isSelected ? colors.active_text : colors.primary_text,
        }}
      >
        {user.name}
      </h3>

      {/* Email */}
      <p className="text-sm" style={{ color: colors.secondary_text }}>
        {user.email}
      </p>

      {/* Status Badge */}
      <div
        className="mt-2 inline-block px-3 py-1 rounded-full text-xs"
        style={{
          backgroundColor: user.isActive
            ? colors.primary_accent
            : colors.secondary_text,
          color: user.isActive ? colors.button_text : colors.primary_text,
        }}
      >
        {user.isActive ? "Active" : "Inactive"}
      </div>

      {/* Icon */}
      <img
        src="user-icon.png"
        alt="User"
        style={{
          filter: getIconFilter(isSelected),
        }}
      />
    </div>
  );
};

export default UserCard;
```

---

## Key Changes Explained

### 1. Import useTheme Hook

```jsx
import { useTheme } from "../../hooks/useTheme";
```

### 2. Destructure Theme Utilities

```jsx
const { colors, getIconFilter } = useTheme();
```

### 3. Replace Tailwind Color Classes with Inline Styles

```jsx
// Before
className="bg-[#1b1b1b] text-white"

// After
style={{ backgroundColor: colors.primary_bg, color: colors.primary_text }}
```

### 4. Use Theme Colors for Conditional Styling

```jsx
// Before
className={isSelected ? "bg-[#29282b]" : "bg-[#1b1b1b]"}

// After
style={{ backgroundColor: isSelected ? colors.active_bg : colors.primary_bg }}
```

### 5. Simplify Icon Filters

```jsx
// Before
style={{
  filter: isSelected
    ? "invert(44%) sepia(97%) saturate(1671%) hue-rotate(160deg)..."
    : "invert(100%)"
}}

// After
style={{ filter: getIconFilter(isSelected) }}
```

### 6. Update Material-UI Component Styling

```jsx
// Before
sx={{ bgcolor: "#14b8a6" }}

// After
sx={{ bgcolor: colors.avatar_bg, color: colors.avatar_text }}
```

### 7. Handle Hover States Programmatically

```jsx
onMouseEnter={(e) => {
  if (!isSelected) {
    e.currentTarget.style.backgroundColor = colors.hover_bg;
  }
}}
onMouseLeave={(e) => {
  if (!isSelected) {
    e.currentTarget.style.backgroundColor = colors.primary_bg;
  }
}}
```

---

## Alternative: Using CSS-in-JS

If you prefer, you can create a styled component:

```jsx
import React from "react";
import styled from "styled-components";
import { useTheme } from "../../hooks/useTheme";

const StyledCard = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.$isSelected ? props.$colors.active_bg : props.$colors.primary_bg};

  &:hover {
    background-color: ${(props) =>
      props.$isSelected ? props.$colors.active_bg : props.$colors.hover_bg};
  }
`;

const UserCard = ({ user, isSelected, onClick }) => {
  const { colors } = useTheme();

  return (
    <StyledCard onClick={onClick} $isSelected={isSelected} $colors={colors}>
      {/* Rest of component */}
    </StyledCard>
  );
};
```

---

## Another Example: Modal Component

### Before

```jsx
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50"
      onClick={onClose}
    >
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1b1b1b] rounded-lg p-6 min-w-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[#00DAC6] text-xl font-bold mb-4">Modal Title</h2>
        <div className="text-white">{children}</div>
        <button
          className="mt-4 px-4 py-2 bg-[#00DAC6] text-[#1b1b1b] rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
```

### After

```jsx
import { useTheme } from "../../hooks/useTheme";

const Modal = ({ isOpen, onClose, children }) => {
  const { colors } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: colors.modal_overlay }}
      onClick={onClose}
    >
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 min-w-[400px]"
        style={{ backgroundColor: colors.modal_bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: colors.active_text }}
        >
          Modal Title
        </h2>
        <div style={{ color: colors.primary_text }}>{children}</div>
        <button
          className="mt-4 px-4 py-2 rounded-lg"
          style={{
            backgroundColor: colors.button_bg,
            color: colors.button_text,
          }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
```

---

## Example: Form Component

### Before

```jsx
const LoginForm = () => {
  return (
    <div className="bg-[#1b1b1b] p-6 rounded-lg">
      <h2 className="text-[#00DAC6] text-2xl mb-4">Login</h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-2 bg-[#29282b] text-white border border-[#333333] rounded-lg mb-3"
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-2 bg-[#29282b] text-white border border-[#333333] rounded-lg mb-4"
      />

      <button className="w-full py-2 bg-[#00DAC6] text-[#1b1b1b] rounded-lg font-bold">
        Login
      </button>

      <p className="text-[#666666] text-sm mt-3 text-center">
        Forgot password?
      </p>
    </div>
  );
};
```

### After

```jsx
import { useTheme } from "../../hooks/useTheme";

const LoginForm = () => {
  const { colors } = useTheme();

  return (
    <div
      className="p-6 rounded-lg"
      style={{ backgroundColor: colors.primary_bg }}
    >
      <h2 className="text-2xl mb-4" style={{ color: colors.active_text }}>
        Login
      </h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-2 rounded-lg mb-3"
        style={{
          backgroundColor: colors.secondary_bg,
          color: colors.primary_text,
          borderColor: colors.border_color,
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-2 rounded-lg mb-4"
        style={{
          backgroundColor: colors.secondary_bg,
          color: colors.primary_text,
          borderColor: colors.border_color,
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      />

      <button
        className="w-full py-2 rounded-lg font-bold"
        style={{
          backgroundColor: colors.button_bg,
          color: colors.button_text,
        }}
      >
        Login
      </button>

      <p
        className="text-sm mt-3 text-center"
        style={{ color: colors.secondary_text }}
      >
        Forgot password?
      </p>
    </div>
  );
};
```

---

## Migration Checklist

When converting a component:

### ✅ Imports

- [ ] Add `import { useTheme } from '../../hooks/useTheme';`
- [ ] Remove unused Tailwind color utilities if needed

### ✅ Hook Usage

- [ ] Add `const { colors, getIconFilter } = useTheme();`
- [ ] Destructure only what you need

### ✅ Background Colors

- [ ] Replace `bg-[#hex]` with `style={{ backgroundColor: colors.xxx }}`
- [ ] Use `primary_bg`, `secondary_bg`, `active_bg`, etc.

### ✅ Text Colors

- [ ] Replace `text-[#hex]` or `text-white` with `style={{ color: colors.xxx }}`
- [ ] Use `primary_text`, `secondary_text`, `active_text`

### ✅ Borders

- [ ] Replace border colors with `colors.border_color`
- [ ] Use inline styles for borders

### ✅ Icons

- [ ] Replace complex filter strings with `getIconFilter(isActive)`

### ✅ Conditional Styles

- [ ] Convert ternary operators in classNames to inline styles
- [ ] Example: `isActive ? colors.active_bg : colors.primary_bg`

### ✅ Material-UI Components

- [ ] Update `sx` prop to use theme colors
- [ ] Example: `sx={{ bgcolor: colors.avatar_bg }}`

### ✅ Testing

- [ ] Test in dark mode
- [ ] Test in light mode
- [ ] Check hover states
- [ ] Verify active states
- [ ] Test on mobile

---

## Pro Tips

1. **Keep Layout Classes:** Don't replace `flex`, `p-4`, `rounded-lg`, etc. Only replace color-related classes.

2. **Use Inline Styles for Colors:** It's more reliable than trying to dynamically generate Tailwind classes.

3. **Group Related Styles:** Keep style objects readable by grouping related properties.

4. **Test Both Themes:** Always toggle to light mode and verify everything looks good.

5. **Reuse Patterns:** If you have multiple similar components, create a shared styled component or utility function.

---

## Common Mistakes to Avoid

❌ **Don't mix Tailwind color classes with theme colors**

```jsx
<div className="bg-gray-900" style={{ color: colors.primary_text }}>
```

❌ **Don't forget to handle hover states**

```jsx
// Missing hover state
<button style={{ backgroundColor: colors.button_bg }}>
```

✅ **Do use proper hover handling**

```jsx
<button
  style={{ backgroundColor: colors.button_bg }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.button_hover}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.button_bg}
>
```

❌ **Don't use mode directly for styling**

```jsx
<div style={{ backgroundColor: mode === 'dark' ? '#1b1b1b' : '#ffffff' }}>
```

✅ **Do use theme colors**

```jsx
<div style={{ backgroundColor: colors.primary_bg }}>
```

---

## Questions?

Refer to:

- `THEME_IMPLEMENTATION_GUIDE.md` for detailed documentation
- `THEME_QUICK_REFERENCE.md` for quick copy-paste templates
- `themeConfig.js` for all available colors
- `Left.jsx` and `MenuItem.jsx` for real-world examples
