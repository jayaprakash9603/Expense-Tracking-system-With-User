# Floating Notifications Implementation Guide

## Overview

This document describes the implementation of the **Floating Notifications** feature, which allows users to enable or disable popup-style notifications that appear on their screen.

## Features

### 1. Global Setting

- **Setting Name**: Floating Notifications
- **Description**: Show notifications as floating popups on screen
- **Default Value**: `true` (enabled)
- **Location**: Global Settings section in Notification Settings page

### 2. User Control

- Users can toggle floating notifications on/off from the notification settings page
- When disabled, notifications will still be stored in the database but won't appear as floating popups
- Works in conjunction with the master notification toggle

## Technical Implementation

### Frontend Changes

#### 1. Configuration (`notificationConfig.js`)

```javascript
FLOATING_NOTIFICATIONS: {
  id: "floating_notifications",
  title: "Floating Notifications",
  description: "Show notifications as floating popups on screen",
  icon: NotificationsIcon,
  defaultEnabled: true,
}
```

#### 2. UI Component (`NotificationSettings.jsx`)

- Added new toggle in Global Settings section
- Positioned after Browser Notifications
- Follows the same pattern as other global settings
- Respects the master toggle (disabled when master is off)

```jsx
<SettingItem
  icon={GLOBAL_NOTIFICATION_SETTINGS.FLOATING_NOTIFICATIONS.icon}
  title={GLOBAL_NOTIFICATION_SETTINGS.FLOATING_NOTIFICATIONS.title}
  description={GLOBAL_NOTIFICATION_SETTINGS.FLOATING_NOTIFICATIONS.description}
  isSwitch
  switchChecked={preferences?.floatingNotifications || false}
  onSwitchChange={(e) =>
    updateGlobalSetting("floatingNotifications", e.target.checked)
  }
  colors={colors}
  disabled={!preferences?.masterEnabled}
/>
```

### Backend Changes

#### 1. Database Schema

**Table**: `notification_preferences`

**New Column**:

```sql
floating_notifications BOOLEAN NOT NULL DEFAULT true
```

**Migration Script**: `V7__Add_Floating_Notifications_Column.sql`

- Adds the column with default value `true`
- Adds comment for documentation
- Creates optional index for performance

#### 2. Entity Model (`NotificationPreferences.java`)

```java
@Builder.Default
@Column(name = "floating_notifications", nullable = false)
private Boolean floatingNotifications = true;
```

#### 3. DTOs

**NotificationPreferencesResponseDTO**:

```java
private Boolean floatingNotifications;
```

**UpdateNotificationPreferencesRequest**:

```java
private Boolean floatingNotifications;
```

#### 4. Service Layer (`NotificationPreferencesServiceImpl.java`)

**Default Value Creation**:

```java
.floatingNotifications(true)
```

**Reset to Defaults**:

```java
preferences.setFloatingNotifications(true);
```

**Partial Update Support**:

```java
if (request.getFloatingNotifications() != null)
    preferences.setFloatingNotifications(request.getFloatingNotifications());
```

**DTO Mapping**:

```java
.floatingNotifications(preferences.getFloatingNotifications())
```

## API Endpoints

### Get Notification Preferences

```http
GET /api/notifications/preferences
Authorization: Bearer <token>
```

**Response**:

```json
{
  "userId": 1,
  "masterEnabled": true,
  "doNotDisturb": false,
  "notificationSound": true,
  "browserNotifications": true,
  "floatingNotifications": true,
  ...
}
```

### Update Notification Preferences

```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "floatingNotifications": false
}
```

**Response**:

```json
{
  "userId": 1,
  "floatingNotifications": false,
  ...
}
```

### Reset to Defaults

```http
POST /api/notifications/preferences/reset
Authorization: Bearer <token>
```

**Response** (floatingNotifications will be `true`):

```json
{
  "userId": 1,
  "floatingNotifications": true,
  ...
}
```

## Usage Flow

### 1. User Enables Floating Notifications

1. User navigates to Notification Settings
2. Toggles "Floating Notifications" switch to ON
3. Frontend calls API to update preferences
4. Backend saves `floatingNotifications = true`
5. Future notifications will appear as floating popups

### 2. User Disables Floating Notifications

1. User toggles "Floating Notifications" switch to OFF
2. Frontend calls API to update preferences
3. Backend saves `floatingNotifications = false`
4. Notifications are still received but won't show as popups
5. Notifications remain accessible in the notification center

### 3. Integration with Notification Display

```javascript
// In notification display logic
if (preferences.floatingNotifications && preferences.masterEnabled) {
  // Show floating notification popup
  showFloatingNotification(notification);
} else {
  // Just store in notification center
  addToNotificationCenter(notification);
}
```

## Business Logic

### Floating Notification Display Conditions

A floating notification should be displayed only when ALL of the following are true:

1. `masterEnabled = true` (Master toggle is ON)
2. `floatingNotifications = true` (Floating notifications enabled)
3. `doNotDisturb = false` (DND mode is OFF) - Optional
4. Specific notification type is enabled (e.g., `expenseAddedEnabled = true`)
5. Relevant service is enabled (e.g., `expenseServiceEnabled = true`)

### Precedence Rules

1. **Master Toggle** - Highest priority, disables everything when OFF
2. **Do Not Disturb** - Can be checked to pause floating notifications
3. **Floating Notifications Toggle** - Specific control for popup display
4. **Service Level Toggle** - Controls notifications for entire service
5. **Notification Type Toggle** - Controls specific notification types

## Testing

### Manual Testing Checklist

- [ ] Toggle floating notifications ON/OFF
- [ ] Verify API updates preferences correctly
- [ ] Check master toggle disables the setting
- [ ] Verify default value is `true` for new users
- [ ] Test reset to defaults functionality
- [ ] Confirm database migration runs successfully
- [ ] Validate floating notification display logic

### API Testing

```bash
# Get preferences
curl -X GET "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer <token>"

# Enable floating notifications
curl -X PUT "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"floatingNotifications": true}'

# Disable floating notifications
curl -X PUT "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"floatingNotifications": false}'

# Reset to defaults
curl -X POST "http://localhost:8080/api/notifications/preferences/reset" \
  -H "Authorization: Bearer <token>"
```

## Database Migration

### Pre-Migration

```sql
-- Check if column already exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'notification_preferences'
  AND column_name = 'floating_notifications';
```

### Migration Execution

```bash
# Using Flyway (automatic on service startup)
# The migration file V7__Add_Floating_Notifications_Column.sql will run automatically

# Or manually:
psql -U postgres -d expense_tracking -f V7__Add_Floating_Notifications_Column.sql
```

### Post-Migration Verification

```sql
-- Verify column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notification_preferences'
  AND column_name = 'floating_notifications';

-- Check default values were applied
SELECT user_id, floating_notifications
FROM notification_preferences
LIMIT 10;

-- Verify all existing records have the default value
SELECT COUNT(*)
FROM notification_preferences
WHERE floating_notifications = true;
```

## Future Enhancements

### 1. Floating Notification Positioning

- Add preference for notification position (top-right, bottom-right, etc.)
- Example: `floatingNotificationPosition: 'top-right'`

### 2. Auto-Dismiss Timer

- Add configurable auto-dismiss duration
- Example: `floatingNotificationDuration: 5000` (5 seconds)

### 3. Notification Stacking

- Control how many floating notifications can appear simultaneously
- Example: `maxFloatingNotifications: 3`

### 4. Animation Preferences

- Allow users to choose notification animation style
- Example: `floatingNotificationAnimation: 'slide'`

### 5. Sound Per Notification Type

- Different sounds for different notification types
- Respect both `notificationSound` and `floatingNotifications` settings

## Troubleshooting

### Issue: Setting not saving

**Solution**:

- Check backend logs for errors
- Verify API endpoint is being called with correct payload
- Ensure user authentication token is valid

### Issue: Migration fails

**Solution**:

- Check if column already exists
- Verify database connection
- Review Flyway migration history: `SELECT * FROM flyway_schema_history;`

### Issue: Floating notifications still showing when disabled

**Solution**:

- Clear frontend cache/local storage
- Verify frontend is checking the preference before showing popup
- Check if WebSocket is sending the correct preference state

## Security Considerations

1. **Authorization**: Only authenticated users can update their preferences
2. **Validation**: Backend validates all preference values before saving
3. **SQL Injection**: Using parameterized queries (JPA) prevents SQL injection
4. **XSS Protection**: Frontend sanitizes notification content before display

## Performance Considerations

1. **Index**: Optional index created on `floating_notifications` column for faster queries
2. **Caching**: Consider caching user preferences in Redis for high-traffic scenarios
3. **Lazy Loading**: Preferences loaded only when needed, not on every request
4. **Batch Updates**: Multiple preference changes sent in single API call

## Conclusion

The Floating Notifications feature provides users with fine-grained control over how they receive notifications. It follows the existing architecture patterns, maintains backward compatibility, and integrates seamlessly with the current notification system.

For questions or issues, refer to the main notification system documentation or contact the development team.
