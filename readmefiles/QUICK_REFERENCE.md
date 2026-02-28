# Settings Component - Quick Reference Card

## 🚀 Quick Start

```jsx
import { Settings } from "./pages/Landingpage/Settings";

// That's it! Use it in your app
<Settings />;
```

---

## 📋 File Structure Quick Map

```
Settings/
├── components/     → UI Components
├── hooks/          → Business Logic
├── constants/      → Configuration
└── utils/          → Helper Functions
```

---

## 🎯 Adding a New Setting (3 Steps)

### 1. Open `constants/settingsConfig.js`

### 2. Find the right section (or create new)

```javascript
NOTIFICATIONS: {
  items: [
    // Add here ↓
  ];
}
```

### 3. Add your setting

```javascript
{
  id: "yourSettingId",
  icon: YourIcon,
  title: "Your Setting",
  description: "Description text",
  type: "switch",  // or "select", "button", "navigation"
  stateKey: "settingName",
  settingsKey: "settingName",
}
```

✅ **Done!** Auto-rendered with full functionality.

---

## 🔧 Setting Types

### Switch (Toggle)

```javascript
{
  type: "switch",
  stateKey: "emailNotifications",
  settingsKey: "emailNotifications",
}
```

### Select (Dropdown)

```javascript
{
  type: "select",
  stateKey: "language",
  settingsKey: "language",
  options: [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" }
  ]
}
```

### Button (Action)

```javascript
{
  type: "button",
  buttonText: "Export",
  action: "exportData",  // Defined in useSettingsActions
}
```

### Navigation (Link)

```javascript
{
  type: "navigation",
  action: "helpCenter",  // Defined in useSettingsActions
}
```

---

## 🎨 Customization

### Add New Action

**File**: `hooks/useSettingsActions.js`

```javascript
const actionHandlers = {
  yourAction: () => {
    // Your action logic
  },
};
```

### Add New Option List

**File**: `constants/settingsConfig.js`

```javascript
export const YOUR_OPTIONS = [
  { value: "val1", label: "Label 1" },
  { value: "val2", label: "Label 2" },
];
```

### Customize Styling

**File**: `components/SettingItem.jsx`

- Modify the `sx` props
- Uses theme colors automatically

---

## 🧪 Testing Quick Reference

### Test Component

```javascript
import { SettingItem } from './Settings/components/SettingItem';

test('renders correctly', () => {
  render(<SettingItem icon={Icon} title="Test" ... />);
});
```

### Test Hook

```javascript
import { useSettingsState } from './Settings/hooks/useSettingsState';
import { renderHook } from '@testing-library/react-hooks';

test('updates state', () => {
  const { result } = renderHook(() => useSettingsState(...));
});
```

---

## 📝 Common Tasks

### Change Section Title

➡️ Edit `constants/settingsConfig.js` → `title` field

### Reorder Settings

➡️ Reorder items array in `settingsConfig.js`

### Add New Section

➡️ Add new key to `SETTINGS_SECTIONS` in config

### Change Icon

➡️ Import new icon, update `icon` field in config

### Modify Success Message

➡️ Edit message parameter in `updateSetting()` call

---

## 🔍 Find Things Fast

| What             | Where                         |
| ---------------- | ----------------------------- |
| Add/Edit Setting | `constants/settingsConfig.js` |
| Modify UI        | `components/SettingItem.jsx`  |
| Change Actions   | `hooks/useSettingsActions.js` |
| State Logic      | `hooks/useSettingsState.js`   |
| Helper Functions | `utils/settingsHelpers.js`    |
| Options Lists    | `constants/settingsConfig.js` |

---

## 🐛 Troubleshooting

### Setting Not Showing?

✅ Check config syntax
✅ Verify icon import
✅ Check type spelling

### State Not Updating?

✅ Check stateKey matches
✅ Verify Redux action
✅ Check settingsKey

### Action Not Working?

✅ Check action name in config
✅ Verify handler in useSettingsActions
✅ Check function name spelling

---

## 💡 Best Practices

✅ **Always** use configuration for new settings
✅ **Never** hardcode settings in JSX
✅ **Keep** components focused (SRP)
✅ **Reuse** existing patterns
✅ **Test** in isolation
✅ **Document** custom actions

---

## 📚 Documentation

- **README.md** - Full documentation
- **ARCHITECTURE.md** - Visual diagrams
- **BEFORE_AFTER.md** - Comparison
- **REFACTORING_SUMMARY.md** - Overview

---

## 🎓 Key Principles

**SOLID**

- **S** - Single Responsibility
- **O** - Open/Closed
- **L** - Liskov Substitution
- **I** - Interface Segregation
- **D** - Dependency Inversion

**DRY**

- Don't Repeat Yourself
- Centralize configuration
- Reuse components

---

## ⚡ Performance Tips

- Components use `React.memo`
- Handlers use `useCallback`
- Large lists are avoided
- Dialogs lazy-load

---

## 🔗 Quick Links

```javascript
// Import entire module
import * as Settings from "./Settings";

// Import specific parts
import { SettingItem } from "./Settings/components/SettingItem";
import { useSettingsState } from "./Settings/hooks/useSettingsState";
import { SETTINGS_SECTIONS } from "./Settings/constants/settingsConfig";
```

---

## 📞 Need Help?

1. Check inline documentation (JSDoc comments)
2. Read README.md for detailed guide
3. Review ARCHITECTURE.md for structure
4. Check examples in existing config

---

**Remember**: Configuration over Code! 🎯

When in doubt, check the config file first!
