# User Settings Redux Integration Guide

## Overview

Complete Redux integration for User Settings feature with automatic API synchronization on login and real-time updates.

## Implementation Summary

### 1. Redux Structure Created

#### Action Types (`UserSettings/userSettings.actionType.js`)

```javascript
-FETCH_USER_SETTINGS_REQUEST / SUCCESS / FAILURE -
  UPDATE_USER_SETTINGS_REQUEST / SUCCESS / FAILURE -
  CREATE_DEFAULT_SETTINGS_REQUEST / SUCCESS / FAILURE -
  RESET_USER_SETTINGS_REQUEST / SUCCESS / FAILURE -
  CHECK_SETTINGS_EXIST_REQUEST / SUCCESS / FAILURE -
  CLEAR_USER_SETTINGS;
```

#### Actions (`UserSettings/userSettings.action.js`)

- `getUserSettings()` - Fetch user settings from API
- `updateUserSettings(settingsData)` - Update settings (partial updates supported)
- `createDefaultSettings()` - Create default settings for new users
- `resetUserSettings()` - Reset to default settings
- `checkSettingsExist()` - Check if settings exist for user
- `fetchOrCreateUserSettings()` - Smart action: fetch existing or create defaults
- `clearUserSettings()` - Clear settings on logout

#### Reducer (`UserSettings/userSettings.reducer.js`)

State structure:

```javascript
{
  settings: null | SettingsObject,
  loading: boolean,
  error: null | string,
  exists: boolean
}
```

### 2. Integration Points

#### App.js - Login Flow

```javascript
useEffect(() => {
  if (jwt) {
    dispatch(getProfileAction(jwt))
      .then(() => dispatch(fetchOrCreateUserSettings()))
      .catch((error) => console.error("Error loading user data:", error))
      .finally(() => setLoading(false));
  }
}, [jwt, dispatch]);
```

**Flow:**

1. User logs in → JWT stored
2. Profile fetched from auth API
3. Settings fetched from settings API
4. If settings don't exist (404), default settings created automatically
5. Settings stored in Redux store for app-wide access

#### Settings.jsx - Real-time Sync

- **useEffect hook** syncs local state with Redux store on load
- **updateSettings()** helper function updates both local state and backend
- All switch/select handlers call `updateSettings()` to persist changes

**Connected Settings:**

- ✅ Email Notifications
- ✅ Budget Alerts
- ✅ Weekly Reports
- ✅ Push Notifications
- ✅ Friend Request Notifications
- ✅ Language
- ✅ Currency
- ✅ Date Format
- ✅ Theme Mode (via toggleTheme action)

### 3. API Configuration

**Base URL:** `http://localhost:8080`

**Endpoints Used:**

- `GET /api/settings` - Fetch user settings
- `PUT /api/settings` - Update settings (partial)
- `POST /api/settings/default` - Create defaults
- `POST /api/settings/reset` - Reset to defaults
- `GET /api/settings/exists` - Check existence

**Authentication:** JWT Bearer token from localStorage

### 4. Data Flow

```
Login
  ↓
Fetch Profile (Auth API)
  ↓
Fetch/Create Settings (Settings API)
  ↓
Store in Redux
  ↓
Settings Component Reads from Redux
  ↓
User Changes Setting
  ↓
Local State Updated (immediate UI feedback)
  ↓
API Called via Redux Action
  ↓
Redux Store Updated
  ↓
Success/Error Toast Notification
```

### 5. Features Implemented

#### Automatic Settings Initialization

- On first login, default settings created automatically
- No manual setup required for new users
- Seamless user experience

#### Real-time Synchronization

- Every setting change immediately saved to backend
- Optimistic UI updates for better UX
- Error handling with toast notifications

#### Partial Updates

- Only changed fields sent to API
- Efficient network usage
- Supports granular setting changes

#### State Management

- Redux store as single source of truth
- Settings available app-wide via `useSelector`
- Centralized state management

### 6. Usage Examples

#### Accessing Settings in Any Component

```javascript
import { useSelector } from "react-redux";

const MyComponent = () => {
  const { settings, loading, error } = useSelector(
    (state) => state.userSettings
  );

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <p>Language: {settings?.language}</p>
      <p>Currency: {settings?.currency}</p>
    </div>
  );
};
```

#### Updating Settings from Any Component

```javascript
import { useDispatch } from "react-redux";
import { updateUserSettings } from "../Redux/UserSettings/userSettings.action";

const MyComponent = () => {
  const dispatch = useDispatch();

  const changeLanguage = async (lang) => {
    try {
      await dispatch(updateUserSettings({ language: lang }));
      console.log("Language updated!");
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return <button onClick={() => changeLanguage("es")}>Español</button>;
};
```

### 7. Error Handling

- **Network Errors:** Caught and displayed via toast notifications
- **404 on Fetch:** Automatically creates default settings
- **Validation Errors:** Backend validation messages shown to user
- **Graceful Degradation:** App remains functional even if settings API fails

### 8. Performance Optimizations

- **Partial Updates:** Only changed fields sent to server
- **Lazy Loading:** Settings fetched after profile load
- **Cached State:** Redux store prevents unnecessary re-fetches
- **Optimistic Updates:** UI updates immediately, API call in background

### 9. Testing Checklist

- [ ] Login flow fetches/creates settings automatically
- [ ] Settings component loads with correct initial values
- [ ] Toggle switches persist to backend
- [ ] Dropdown changes persist to backend
- [ ] Toast notifications show success/error messages
- [ ] Network errors handled gracefully
- [ ] New user gets default settings created
- [ ] Existing user settings loaded correctly
- [ ] Theme toggle updates settings
- [ ] Multiple rapid changes don't cause conflicts

### 10. Future Enhancements

**Potential Improvements:**

1. **Offline Support:** Queue updates when offline, sync on reconnect
2. **Real-time Sync:** WebSocket updates when settings change on another device
3. **Settings History:** Track changes and allow rollback
4. **Bulk Operations:** Update multiple settings in single API call
5. **Settings Validation:** Frontend validation before API call
6. **Settings Export/Import:** Backup and restore settings
7. **A/B Testing:** Feature flags via settings
8. **User Preferences Analytics:** Track popular settings

### 11. File Structure

```
src/
├── Redux/
│   ├── store.js (updated - userSettings reducer registered)
│   └── UserSettings/
│       ├── userSettings.actionType.js ✅ NEW
│       ├── userSettings.action.js ✅ NEW
│       └── userSettings.reducer.js ✅ NEW
├── App.js (updated - fetchOrCreateUserSettings on login)
└── pages/Landingpage/
    └── Settings.jsx (updated - Redux integration)
```

### 12. Dependencies

**Required:**

- `redux` - State management
- `react-redux` - React bindings
- `redux-thunk` - Async actions
- `axios` - HTTP client

**Installed:** ✅ All dependencies already present

### 13. Configuration

**Environment Variables (Optional):**

```javascript
// In userSettings.action.js
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
```

**Recommended `.env` setup:**

```
REACT_APP_API_BASE_URL=http://localhost:8080
```

## Troubleshooting

### Settings Not Loading

1. Check JWT token in localStorage
2. Verify backend is running on port 8080
3. Check browser console for errors
4. Verify user is authenticated

### Updates Not Persisting

1. Check network tab for API calls
2. Verify JWT token is valid
3. Check backend logs for errors
4. Ensure settings exist (created on login)

### Toast Notifications Not Showing

1. Verify ToastNotification component imported
2. Check snackbar state management
3. Ensure showSnackbar function called

## Conclusion

The User Settings feature is now fully integrated with Redux, providing:

- ✅ Automatic initialization on login
- ✅ Real-time backend synchronization
- ✅ App-wide settings access
- ✅ Seamless user experience
- ✅ Error handling and notifications
- ✅ Performance optimizations

All settings changes are automatically persisted to the database and available across the entire application through the Redux store.
