# Notification Settings - Comprehensive Documentation

## 📋 Overview

A fully reusable, modular notification settings system that allows users to control their notification preferences at multiple levels:

- **Global Level**: Master toggle, Do Not Disturb, Sounds, Browser notifications
- **Service Level**: Enable/disable entire services (Expense, Budget, Bill, etc.)
- **Notification Level**: Fine-grained control over individual notification types
- **Delivery Method**: Choose how to receive notifications (In-App, Email, Push, SMS)
- **Frequency**: Control when notifications are sent (Instant, Hourly, Daily, Weekly, Never)

## 🏗️ Architecture

### Design Principles

- **SOLID Principles**: Each component has a single responsibility
- **DRY (Don't Repeat Yourself)**: Reusable components and hooks
- **Configuration-Driven**: All notification types defined in config
- **Scalable**: Easy to add new services and notification types

### File Structure

```
src/pages/Landingpage/
├── NotificationSettings.jsx                 # Main page component
└── Settings/
    ├── constants/
    │   └── notificationConfig.js            # Configuration for all notifications
    ├── hooks/
    │   ├── useNotificationSettings.js       # Custom hook for state management
    │   ├── useSnackbar.js                   # Toast notifications
    │   ├── useDialogState.js                # Dialog management
    │   └── useSettingsState.js              # General settings state
    └── components/
        ├── SettingsHeader.jsx               # Reusable header
        ├── SettingItem.jsx                  # Generic setting item
        ├── NotificationServiceCard.jsx      # Service-level card
        └── NotificationItem.jsx             # Individual notification item
```

## 🎨 Components

### 1. NotificationSettings (Main Page)

**Location**: `src/pages/Landingpage/NotificationSettings.jsx`

**Purpose**: Main container for the entire notification settings interface

**Features**:

- Master notification toggle
- Global settings (DND, Sound, Browser)
- Service-specific notification groups
- Collapsible service cards
- Auto-save functionality
- Toast notifications for feedback

**Usage**:

```jsx
import NotificationSettings from "./pages/Landingpage/NotificationSettings";

// In your router
<Route path="/settings/notifications" element={<NotificationSettings />} />;
```

### 2. NotificationServiceCard

**Location**: `src/pages/Landingpage/Settings/components/NotificationServiceCard.jsx`

**Purpose**: Displays a service with master toggle and collapsible notification list

**Props**:

```typescript
{
  service: ServiceConfig,              // Service configuration object
  serviceEnabled: boolean,             // Whether service is enabled
  onServiceToggle: (enabled) => void,  // Toggle callback
  expanded: boolean,                   // Expansion state
  onToggleExpand: () => void,          // Expansion toggle
  colors: ThemeColors,                 // Theme colors
  children: ReactNode,                 // Notification items
  notificationCount: number,           // Total notifications
  enabledCount: number                 // Enabled notifications count
}
```

**Features**:

- Service icon with gradient background
- Master enable/disable toggle
- Enabled/total notification count badge
- Smooth expand/collapse animation
- Hover effects

### 3. NotificationItem

**Location**: `src/pages/Landingpage/Settings/components/NotificationItem.jsx`

**Purpose**: Individual notification configuration with advanced options

**Props**:

```typescript
{
  notification: NotificationConfig,    // Notification configuration
  preferences: NotificationPreferences, // Current preferences
  onToggle: (enabled) => void,         // Enable/disable toggle
  onFrequencyChange: (freq) => void,   // Frequency change
  onMethodToggle: (method, enabled) => void, // Delivery method toggle
  colors: ThemeColors,                 // Theme colors
  serviceEnabled: boolean,             // Parent service state
  serviceColor: string                 // Service theme color
}
```

**Features**:

- Priority badge (Low, Medium, High, Critical)
- Enable/disable toggle
- Expandable configuration panel
- Frequency selector (Instant, Hourly, Daily, Weekly, Never)
- Delivery method checkboxes (In-App, Email, Push, SMS)
- Disabled state when parent service is off

## 🔧 Configuration

### Adding a New Service

Edit `src/pages/Landingpage/Settings/constants/notificationConfig.js`:

```javascript
NOTIFICATION_SERVICES: {
  YOUR_NEW_SERVICE: {
    id: "your_service_id",
    name: "Your Service Name",
    description: "Service description",
    icon: YourIcon,
    color: "#hexcolor",
    notifications: [
      {
        id: "notification_id",
        type: "NOTIFICATION_TYPE",
        title: "Notification Title",
        description: "What this notification is about",
        icon: NotificationIcon,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
    ],
  },
}
```

### Adding a New Notification Type

Add to an existing service's `notifications` array:

```javascript
{
  id: "new_notification",
  type: "NEW_NOTIFICATION_TYPE",
  title: "New Notification",
  description: "Description of what triggers this",
  icon: IconComponent,
  priority: NOTIFICATION_PRIORITY.HIGH,
  defaultEnabled: true,
  methods: {
    [NOTIFICATION_METHODS.IN_APP]: true,
    [NOTIFICATION_METHODS.EMAIL]: true,
    [NOTIFICATION_METHODS.PUSH]: false,
  },
}
```

## 🎣 Custom Hooks

### useNotificationSettings

**Location**: `src/pages/Landingpage/Settings/hooks/useNotificationSettings.js`

**Purpose**: Manages all notification preferences state and updates

**API**:

```javascript
const {
  notificationPreferences, // Current preferences object
  updateMasterToggle, // (enabled: boolean) => void
  updateGlobalSetting, // (key: string, value: any) => void
  updateServiceToggle, // (serviceId: string, enabled: boolean) => void
  updateNotificationToggle, // (serviceId, notificationId, enabled) => void
  updateNotificationFrequency, // (serviceId, notificationId, frequency) => void
  updateNotificationMethod, // (serviceId, notificationId, method, enabled) => void
  updateQuietHours, // (quietHoursSettings: object) => void
  resetToDefaults, // () => void
} = useNotificationSettings(userSettings, showSnackbar);
```

**Features**:

- Automatic Redux sync
- Error handling with rollback
- Toast notifications on updates
- Optimistic UI updates

## 💾 Data Structure

### Notification Preferences Object

```javascript
{
  masterEnabled: true,              // Global master toggle
  doNotDisturb: false,              // Do not disturb mode
  notificationSound: true,          // Sound enabled
  browserNotifications: false,      // Browser push enabled
  quietHours: {
    enabled: false,
    preset: "none",
    start: "22:00",
    end: "07:00"
  },
  services: {
    expense_service: {
      enabled: true,                // Service-level toggle
      notifications: {
        expense_added: {
          enabled: true,            // Notification-level toggle
          frequency: "instant",     // How often
          methods: {
            in_app: true,           // Delivery methods
            email: false,
            push: true
          }
        }
      }
    }
  }
}
```

## 🔌 Integration with Redux

### Required Actions

Create actions in `src/Redux/UserSettings/userSettings.action.js`:

```javascript
export const updateUserSettings = (settings) => async (dispatch) => {
  try {
    const response = await api.put("/user/settings", settings);
    dispatch({
      type: "UPDATE_USER_SETTINGS_SUCCESS",
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: "UPDATE_USER_SETTINGS_FAILURE",
      payload: error.message,
    });
  }
};
```

### Required Reducer

Update `src/Redux/UserSettings/userSettings.reducer.js`:

```javascript
case 'UPDATE_USER_SETTINGS_SUCCESS':
  return {
    ...state,
    settings: {
      ...state.settings,
      ...action.payload
    }
  };
```

## 🎨 Theming

The component uses the `useTheme` hook for consistent theming:

```javascript
const { colors, mode } = useTheme();
```

### Required Theme Colors

```javascript
{
  primary_bg: string,      // Main background
  secondary_bg: string,    // Secondary background
  tertiary_bg: string,     // Tertiary background
  card_bg: string,         // Card background
  border_color: string,    // Borders
  text_primary: string,    // Primary text
  text_muted: string,      // Muted text
  primary_accent: string,  // Accent color
  hover_bg: string         // Hover background
}
```

## 📱 Responsive Design

- **Desktop**: Full-width layout (calc(100vw - 370px))
- **Mobile**: Full viewport width
- **Breakpoint**: 768px using MUI's useMediaQuery

## 🚀 Usage Examples

### Basic Route Setup

```jsx
import { Routes, Route } from "react-router-dom";
import NotificationSettings from "./pages/Landingpage/NotificationSettings";

function App() {
  return (
    <Routes>
      <Route
        path="/settings/notifications"
        element={<NotificationSettings />}
      />
    </Routes>
  );
}
```

### Navigate from Settings Page

```jsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

<SettingItem
  icon={NotificationsIcon}
  title="Notification Preferences"
  description="Manage how you receive notifications"
  isNavigation
  onNavigationClick={() => navigate("/settings/notifications")}
  colors={colors}
/>;
```

### Access Preferences in Other Components

```javascript
import { useSelector } from 'react-redux';

const MyComponent = () => {
  const { settings } = useSelector(state => state.userSettings);
  const notificationPrefs = settings?.notificationPreferences;

  const isExpenseNotificationsEnabled =
    notificationPrefs?.masterEnabled &&
    notificationPrefs?.services?.expense_service?.enabled &&
    notificationPrefs?.services?.expense_service?.notifications?.expense_added?.enabled;

  return (
    // Your component
  );
};
```

## 🔄 Future Enhancements

### Planned Features

1. **Quiet Hours**: Schedule when to pause notifications
2. **Notification Grouping**: Group similar notifications
3. **Smart Notifications**: AI-powered notification priority
4. **Custom Sounds**: Choose different sounds per notification type
5. **Notification History**: View past notifications settings
6. **Import/Export**: Backup and restore preferences
7. **Templates**: Pre-configured notification profiles

### Easy to Extend

To add new features:

1. **Add to config** in `notificationConfig.js`
2. **Add state** in `useNotificationSettings.js`
3. **Add UI component** in `NotificationSettings.jsx`
4. **Update Redux** actions and reducers

## 📊 Performance

- **Lazy Loading**: Components load only when needed
- **Memoization**: Callbacks wrapped in useCallback
- **Optimistic Updates**: Instant UI feedback
- **Efficient Re-renders**: Only affected components update
- **Auto-save**: Changes saved immediately to backend

## 🐛 Error Handling

- **Network Errors**: Automatic rollback on failure
- **Toast Notifications**: User-friendly error messages
- **Console Logging**: Detailed error logs for debugging
- **Fallback Values**: Defaults when data is missing

## 🧪 Testing Checklist

- [ ] Master toggle disables all notifications
- [ ] Service toggle disables all notifications in that service
- [ ] Individual notification toggle works
- [ ] Frequency selector changes saved
- [ ] Delivery method checkboxes update correctly
- [ ] Toast notifications appear on success/error
- [ ] Settings persist across page reloads
- [ ] Mobile responsive design works
- [ ] Dark/light theme support
- [ ] Navigation back button works

## 📝 Best Practices

1. **Always use the hooks**: Don't directly modify Redux state
2. **Show feedback**: Always display toast on user actions
3. **Handle errors**: Wrap API calls in try-catch
4. **Test thoroughly**: Check all toggle combinations
5. **Document changes**: Update config when adding notifications
6. **Follow patterns**: Use existing components as templates
7. **Keep it DRY**: Don't duplicate code, extract to helpers

## 🤝 Contributing

When adding new notification types:

1. Add configuration to `notificationConfig.js`
2. Test with all combinations (enabled/disabled at all levels)
3. Ensure backend supports the new notification type
4. Update this documentation
5. Test mobile and desktop layouts
6. Test dark and light themes

## 📞 Support

For issues or questions:

- Check console logs for errors
- Verify Redux DevTools for state updates
- Ensure backend API is returning correct data
- Check browser console for network errors

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintainer**: Development Team
