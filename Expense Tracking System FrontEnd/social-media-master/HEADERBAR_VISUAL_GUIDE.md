# HeaderBar Visual Guide

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        HeaderBar (50px)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                          [☀️] [👤 ▼]   │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## When NOT in Friend View:

```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar  │            HeaderBar with Theme + Profile        │
│           │                                                   │
│           │  ┌─────────────────────────────────────────────┐ │
│  [ Menu ] │  │                        [☀️] [👤 ▼]         │ │
│           │  └─────────────────────────────────────────────┘ │
│  [ Home ] │                                                   │
│           │              Main Content Area                    │
│  [ Exp. ] │                                                   │
│           │                                                   │
└──────────────────────────────────────────────────────────────┘
```

## When IN Friend View:

```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar  │            FriendInfoBar                         │
│           │  (Friend name, balance, actions)                 │
│           │  ┌─────────────────────────────────────────────┐ │
│  [ Menu ] │  │  👤 John Doe  |  Balance: $150  | [Actions]│ │
│           │  └─────────────────────────────────────────────┘ │
│  [ Home ] │                                                   │
│           │              Friend Content Area                  │
│  [ Exp. ] │                                                   │
│           │                                                   │
└──────────────────────────────────────────────────────────────┘
```

## Profile Dropdown (Open State)

```
┌─────────────────────────────────────────────────────────────┐
│                                          [☀️] [👤 ▲]        │
│                                              ┌─────────────┐ │
│                                              │ John Doe    │ │
│                                              │ john@...    │ │
│                                              ├─────────────┤ │
│                                              │ 👤 Profile  │ │
│                                              │ ⚙️ Settings │ │
│                                              ├─────────────┤ │
│                                              │ 🚪 Logout   │ │
│                                              └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Theme Toggle States

### Dark Mode (Current)

```
┌──────────────┐
│    [☀️]     │  ← Sun icon (click to switch to light)
└──────────────┘
Background: #1b1b1b
Text: white
```

### Light Mode

```
┌──────────────┐
│    [🌙]     │  ← Moon icon (click to switch to dark)
└──────────────┘
Background: white
Text: #1f2937
```

## Color Scheme

### Dark Theme

```
Background:  ████  #1b1b1b
Card BG:     ████  #29282b
Border:      ████  rgba(20, 184, 166, 0.3)
Primary:     ████  #14b8a6 (Teal)
Text:        ████  #ffffff
Secondary:   ████  #9ca3af
```

### Light Theme

```
Background:  ████  #ffffff
Card BG:     ████  #f9fafb
Border:      ████  #e5e7eb
Primary:     ████  #14b8a6 (Teal)
Text:        ████  #1f2937
Secondary:   ████  #6b7280
```

## Responsive Breakpoints

### Mobile (< 768px)

- Compact 32px avatar
- Smaller gap between elements
- Full-width dropdown

### Desktop (≥ 768px)

- Larger 40px avatar
- Spacious layout
- Right-aligned dropdown

## User Flow Diagram

```
User lands on app
       ↓
   Is logged in?
       ↓ Yes
   Load theme from localStorage
       ↓
   Apply theme to app
       ↓
   Render HeaderBar (if not friend view)
       ↓
   User clicks theme toggle
       ↓
   Dispatch toggleTheme()
       ↓
   Update Redux state
       ↓
   Save to localStorage
       ↓
   Re-render with new theme
```

## Component Hierarchy

```
Home
├── Left (Sidebar)
└── Main Content Area
    ├── HeaderBar (if NOT friend view)
    │   ├── Theme Toggle Button
    │   │   ├── Sun Icon (dark mode)
    │   │   └── Moon Icon (light mode)
    │   └── Profile Dropdown
    │       ├── Avatar
    │       ├── Dropdown Arrow
    │       └── Dropdown Menu
    │           ├── User Info
    │           ├── View Profile Link
    │           ├── Settings Link
    │           └── Logout Button
    │
    ├── FriendInfoBar (if friend view)
    │
    └── Outlet (Page Content)
```

## State Flow

```
┌─────────────────┐
│  Redux Store    │
├─────────────────┤
│  theme: {       │
│    mode: 'dark' │
│  }              │
│  auth: {        │
│    user: {...}  │
│  }              │
└─────────────────┘
        ↓
        ↓ (useSelector)
        ↓
┌─────────────────┐
│   HeaderBar     │
├─────────────────┤
│ - Reads theme   │
│ - Reads user    │
│ - Dispatches    │
│   actions       │
└─────────────────┘
        ↓
        ↓ (onClick)
        ↓
┌─────────────────┐
│  toggleTheme()  │
├─────────────────┤
│ - Toggle state  │
│ - Save to       │
│   localStorage  │
└─────────────────┘
```

## Interaction States

### Theme Toggle

```
Normal:    [☀️]  (hover)   [☀️]  (active)  [☀️]
           Gray bg         Lighter        Scale 1.1
```

### Profile Button

```
Normal:    [👤 ▼]  (hover)  [👤 ▼]  (open)  [👤 ▲]
           No bg            Scale           Dropdown
```

### Dropdown Menu Items

```
Normal:    Profile     (hover)     Profile
           White text              Teal bg + highlight
```

## localStorage Schema

```javascript
{
  "theme": "dark",          // or "light"
  "jwt": "eyJhbG...",       // auth token
  // ... other app data
}
```

## Quick Reference

| Feature        | Shortcut         | Result                |
| -------------- | ---------------- | --------------------- |
| Toggle Theme   | Click ☀️/🌙      | Switch theme          |
| Open Profile   | Click avatar     | Show menu             |
| View Profile   | Click "Profile"  | Navigate to /profile  |
| Settings       | Click "Settings" | Navigate to /settings |
| Logout         | Click "Logout"   | Show modal → logout   |
| Close Dropdown | Click outside    | Hide menu             |

## File Structure

```
src/
├── components/
│   └── common/
│       ├── HeaderBar.jsx         ← Main component
│       └── HeaderBar.README.md   ← Documentation
│
├── Redux/
│   └── Theme/
│       ├── theme.actionTypes.js  ← Constants
│       ├── theme.actions.js      ← Actions
│       └── theme.reducer.js      ← Reducer
│
├── pages/
│   └── Landingpage/
│       ├── Home.jsx              ← Uses HeaderBar
│       ├── Settings.jsx          ← Settings page
│       └── Profile.jsx           ← Profile page
│
└── App.js                        ← Theme wrapper
```

## Testing Scenarios

✅ 1. Theme toggle works
✅ 2. Theme persists on refresh
✅ 3. Profile dropdown opens
✅ 4. Click outside closes dropdown
✅ 5. Navigation works
✅ 6. Logout confirmation appears
✅ 7. Avatar shows image or initials
✅ 8. Responsive on mobile
✅ 9. Dark mode styles apply
✅ 10. Light mode styles apply

---

This visual guide helps understand the HeaderBar component structure and behavior at a glance! 🎨
