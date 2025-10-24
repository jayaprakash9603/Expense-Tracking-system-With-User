# HeaderBar Component

## Overview

The `HeaderBar` component is a responsive header that displays when the user is **not** in friend view. It provides theme switching capabilities and a profile dropdown menu with navigation options.

## Features

### 1. **Dark/Light Mode Toggle**

- Visual toggle button with sun/moon icons
- Persists theme preference in `localStorage`
- Seamlessly switches between dark and light modes
- Smooth transitions and hover effects

### 2. **Profile Dropdown**

- Displays user avatar with fallback initials
- Shows user name and email
- Provides quick access to:
  - View Profile
  - Settings
  - Logout

### 3. **Responsive Design**

- Adapts to different screen sizes
- Touch-friendly on mobile devices
- Click-outside to close dropdown functionality

## Usage

```jsx
import HeaderBar from "../../components/common/HeaderBar";

// In your layout component
<HeaderBar />;
```

## Redux Integration

### State Dependencies

The component relies on the following Redux states:

1. **Auth State** (`state.auth`)

   - `user.firstName`
   - `user.lastName`
   - `user.email`
   - `user.image`

2. **Theme State** (`state.theme`)
   - `mode` - Current theme ('dark' or 'light')

### Actions Used

- `toggleTheme()` - Switches between dark and light modes
- `logoutAction()` - Logs out the user

## Theme Setup

### Redux Store Configuration

The theme reducer has been added to the Redux store:

```javascript
// store.js
import { themeReducer } from "./Theme/theme.reducer";

const rootreducers = combineReducers({
  // ...other reducers
  theme: themeReducer,
});
```

### Theme Persistence

- Theme preference is stored in `localStorage` with key `"theme"`
- Automatically loads saved theme on page refresh
- Defaults to `"dark"` mode if no preference is saved

## Styling

### Dark Mode Classes

```css
bg-[#1b1b1b]      /* Background */
border-gray-800    /* Border */
bg-gray-800        /* Button background */
text-gray-400      /* Text color */
```

### Light Mode Classes

```css
bg-white           /* Background */
border-gray-200    /* Border */
bg-gray-100        /* Button background */
text-gray-700      /* Text color */
```

## Component Structure

```
HeaderBar/
├── Theme Toggle Button
│   ├── Sun Icon (Dark → Light)
│   └── Moon Icon (Light → Dark)
│
└── Profile Dropdown
    ├── Avatar
    ├── Dropdown Arrow
    └── Menu Items
        ├── User Info Section
        ├── View Profile
        ├── Settings
        └── Logout
```

## Navigation Routes

The component navigates to the following routes:

- `/profile` - User profile page
- `/settings` - Application settings
- `/login` - After logout

## Props

This component does **not** accept any props. It uses Redux for state management.

## Events

### Click Outside Detection

The dropdown automatically closes when clicking anywhere outside the component.

### Logout Confirmation

Clicking logout opens a confirmation modal before proceeding with the logout action.

## Dependencies

### Required Packages

- `react`
- `react-redux`
- `react-router-dom`
- `@mui/material` (Avatar component)

### Internal Dependencies

- `Redux/Theme/theme.actions`
- `Redux/Auth/auth.action`
- `pages/Landingpage/Modal`

## Example Integration in Home.jsx

```jsx
import HeaderBar from "../../components/common/HeaderBar";

const Home = () => {
  const isFriendView = Boolean(friendId);

  return (
    <div className="flex">
      <Left />
      <div className="flex-1 flex flex-col">
        {isFriendView ? <FriendInfoBar {...props} /> : <HeaderBar />}
        <Outlet />
      </div>
    </div>
  );
};
```

## Accessibility

- Keyboard navigable
- Focus indicators on interactive elements
- ARIA-compliant (via MUI Avatar)
- Semantic HTML structure

## Future Enhancements

Potential improvements:

1. Add notification bell icon
2. Add search functionality
3. Add keyboard shortcuts (e.g., `Ctrl + D` for theme toggle)
4. Add theme preview before switching
5. Add more theme options (not just dark/light)

## Troubleshooting

### Theme not persisting

- Check if `localStorage` is available in the browser
- Verify Redux store configuration includes `themeReducer`

### Dropdown not closing

- Ensure `dropdownRef` is properly attached
- Check if click events are being prevented

### User avatar not showing

- Verify `user.image` URL is valid
- Check if Avatar component from MUI is properly installed

## Related Components

- `FriendInfoBar` - Alternative header for friend view
- `Left` - Sidebar navigation component
- `Modal` - Confirmation dialog component
