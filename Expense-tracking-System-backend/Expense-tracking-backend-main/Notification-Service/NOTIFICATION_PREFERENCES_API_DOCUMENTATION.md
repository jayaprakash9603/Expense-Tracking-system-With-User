# Notification Preferences API Documentation

## Overview

The Notification Preferences API provides endpoints for managing user notification settings. It supports comprehensive multi-level configuration including global settings, service-level toggles, and individual notification preferences.

## Base URL

```
/api/notification-preferences
```

## Authentication

All endpoints require authentication via JWT token. The user ID is extracted from the `X-User-Id` header.

---

## Endpoints

### 1. Get Notification Preferences

Retrieves the current user's notification preferences. If no preferences exist, default preferences are automatically created.

**Endpoint:** `GET /api/notification-preferences`

**Headers:**

- `X-User-Id: Integer` (Required) - User ID from JWT token

**Response:** `200 OK`

```json
{
  "userId": 123,
  "masterEnabled": true,
  "doNotDisturb": false,
  "notificationSound": true,
  "browserNotifications": true,
  "expenseServiceEnabled": true,
  "budgetServiceEnabled": true,
  "billServiceEnabled": true,
  "paymentMethodServiceEnabled": true,
  "friendServiceEnabled": true,
  "analyticsServiceEnabled": true,
  "systemNotificationsEnabled": true,
  "expenseAddedEnabled": true,
  "expenseUpdatedEnabled": true,
  "expenseDeletedEnabled": false,
  "largeExpenseAlertEnabled": true,
  "budgetExceededEnabled": true,
  "budgetWarningEnabled": true,
  "budgetLimitApproachingEnabled": true,
  "budgetCreatedEnabled": false,
  "budgetUpdatedEnabled": false,
  "billDueReminderEnabled": true,
  "billOverdueEnabled": true,
  "billPaidEnabled": true,
  "paymentMethodAddedEnabled": false,
  "paymentMethodUpdatedEnabled": false,
  "paymentMethodRemovedEnabled": true,
  "friendRequestReceivedEnabled": true,
  "friendRequestAcceptedEnabled": true,
  "friendRequestRejectedEnabled": false,
  "weeklySummaryEnabled": true,
  "monthlyReportEnabled": true,
  "spendingTrendAlertEnabled": true,
  "securityAlertEnabled": true,
  "appUpdateEnabled": false,
  "maintenanceNoticeEnabled": true,
  "notificationPreferencesJson": "{\"quietHours\":{\"start\":\"22:00\",\"end\":\"08:00\"}}",
  "budgetAlertsEnabled": true,
  "dailyRemindersEnabled": false,
  "weeklyReportsEnabled": true,
  "monthlySummaryEnabled": true,
  "goalNotificationsEnabled": true,
  "unusualSpendingAlerts": true,
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "inAppNotifications": true,
  "budgetWarningThreshold": 80.0
}
```

**Use Cases:**

- Initial load of notification settings page
- Checking current notification status
- Verifying preferences after update

---

### 2. Update Notification Preferences

Updates notification preferences for the current user. Supports partial updates - only provided fields are modified.

**Endpoint:** `PUT /api/notification-preferences`

**Headers:**

- `X-User-Id: Integer` (Required) - User ID from JWT token
- `Content-Type: application/json`

**Request Body:** (All fields optional)

```json
{
  "masterEnabled": false,
  "doNotDisturb": true,
  "expenseServiceEnabled": false,
  "budgetExceededEnabled": true,
  "notificationPreferencesJson": "{\"quietHours\":{\"start\":\"23:00\",\"end\":\"07:00\"}}"
}
```

**Response:** `200 OK`

```json
{
  "userId": 123,
  "masterEnabled": false,
  "doNotDisturb": true,
  "expenseServiceEnabled": false,
  "budgetExceededEnabled": true,
  ...
}
```

**Use Cases:**

- User toggles master notification switch
- User enables/disables specific notification types
- User configures delivery methods or frequency
- Bulk preference updates

**Examples:**

_Example 1: Disable all notifications_

```json
{
  "masterEnabled": false
}
```

_Example 2: Enable Do Not Disturb_

```json
{
  "doNotDisturb": true
}
```

_Example 3: Configure expense notifications only_

```json
{
  "expenseServiceEnabled": true,
  "expenseAddedEnabled": true,
  "expenseUpdatedEnabled": false,
  "largeExpenseAlertEnabled": true
}
```

_Example 4: Update quiet hours via JSON_

```json
{
  "notificationPreferencesJson": "{\"quietHours\":{\"enabled\":true,\"start\":\"22:00\",\"end\":\"08:00\"},\"frequency\":{\"budgetExceeded\":\"instant\",\"billDueReminder\":\"daily\"}}"
}
```

---

### 3. Reset to Default Preferences

Resets all notification preferences to default values.

**Endpoint:** `POST /api/notification-preferences/reset`

**Headers:**

- `X-User-Id: Integer` (Required) - User ID from JWT token

**Response:** `200 OK`

```json
{
  "userId": 123,
  "masterEnabled": true,
  "doNotDisturb": false,
  "notificationSound": true,
  "browserNotifications": true,
  ...
}
```

**Use Cases:**

- User clicks "Reset to Defaults" button
- Recovering from misconfigured settings
- Testing default configuration

**Default Values:**

- **Global Settings:** Master enabled, sound on, browser notifications on, DND off
- **Service Toggles:** All services enabled
- **High Priority Notifications:** Enabled (budget exceeded, bill overdue, security alerts)
- **Medium Priority Notifications:** Enabled (expense tracking, summaries)
- **Low Priority Notifications:** Disabled (created/updated events)

---

### 4. Delete Notification Preferences

Deletes notification preferences for the current user.

**Endpoint:** `DELETE /api/notification-preferences`

**Headers:**

- `X-User-Id: Integer` (Required) - User ID from JWT token

**Response:** `204 No Content`

**Use Cases:**

- User account deletion
- Testing/cleanup
- Privacy compliance (data removal)

---

### 5. Check Preferences Existence

Checks if notification preferences exist for the current user.

**Endpoint:** `GET /api/notification-preferences/exists`

**Headers:**

- `X-User-Id: Integer` (Required) - User ID from JWT token

**Response:** `200 OK`

```json
true
```

**Use Cases:**

- Pre-flight checks before creating preferences
- Conditional UI rendering
- Migration scripts

---

### 6. Create Default Preferences

Explicitly creates default notification preferences. Returns existing preferences if already created.

**Endpoint:** `POST /api/notification-preferences/default`

**Headers:**

- `X-User-Id: Integer` (Required) - User ID from JWT token

**Response:** `201 Created` or `200 OK` (if already exists)

```json
{
  "userId": 123,
  "masterEnabled": true,
  "doNotDisturb": false,
  ...
}
```

**Use Cases:**

- User registration workflow
- First-time setup
- Explicit preference initialization

---

## Data Model

### Notification Preference Structure

#### Global Settings

| Field                  | Type    | Default | Description                         |
| ---------------------- | ------- | ------- | ----------------------------------- |
| `masterEnabled`        | Boolean | true    | Master toggle for all notifications |
| `doNotDisturb`         | Boolean | false   | Do Not Disturb mode                 |
| `notificationSound`    | Boolean | true    | Sound notifications enabled         |
| `browserNotifications` | Boolean | true    | Browser notifications enabled       |

#### Service Level Toggles

| Field                         | Type    | Default | Description                      |
| ----------------------------- | ------- | ------- | -------------------------------- |
| `expenseServiceEnabled`       | Boolean | true    | All expense notifications        |
| `budgetServiceEnabled`        | Boolean | true    | All budget notifications         |
| `billServiceEnabled`          | Boolean | true    | All bill notifications           |
| `paymentMethodServiceEnabled` | Boolean | true    | All payment method notifications |
| `friendServiceEnabled`        | Boolean | true    | All friend notifications         |
| `analyticsServiceEnabled`     | Boolean | true    | All analytics notifications      |
| `systemNotificationsEnabled`  | Boolean | true    | All system notifications         |

#### Individual Notification Types

**Expense Service (4 types)**

- `expenseAddedEnabled` (true) - New expense created
- `expenseUpdatedEnabled` (true) - Expense modified
- `expenseDeletedEnabled` (false) - Expense removed
- `largeExpenseAlertEnabled` (true) - Large expense alert

**Budget Service (5 types)**

- `budgetExceededEnabled` (true) - Budget limit exceeded
- `budgetWarningEnabled` (true) - Budget warning threshold
- `budgetLimitApproachingEnabled` (true) - Approaching limit
- `budgetCreatedEnabled` (false) - New budget created
- `budgetUpdatedEnabled` (false) - Budget modified

**Bill Service (3 types)**

- `billDueReminderEnabled` (true) - Bill due reminder
- `billOverdueEnabled` (true) - Overdue bill alert
- `billPaidEnabled` (true) - Bill paid confirmation

**Payment Method Service (3 types)**

- `paymentMethodAddedEnabled` (false) - Payment method added
- `paymentMethodUpdatedEnabled` (false) - Payment method updated
- `paymentMethodRemovedEnabled` (true) - Payment method removed

**Friend Service (3 types)**

- `friendRequestReceivedEnabled` (true) - Friend request received
- `friendRequestAcceptedEnabled` (true) - Friend request accepted
- `friendRequestRejectedEnabled` (false) - Friend request rejected

**Analytics Service (3 types)**

- `weeklySummaryEnabled` (true) - Weekly expense summary
- `monthlyReportEnabled` (true) - Monthly report
- `spendingTrendAlertEnabled` (true) - Spending trend alert

**System Notifications (3 types)**

- `securityAlertEnabled` (true) - Security alerts
- `appUpdateEnabled` (false) - App update notifications
- `maintenanceNoticeEnabled` (true) - Maintenance notices

#### JSON Configuration Field

The `notificationPreferencesJson` field stores complex preferences as JSON:

```json
{
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  },
  "frequency": {
    "budgetExceeded": "instant",
    "billDueReminder": "daily",
    "weeklySummary": "weekly",
    "monthlyReport": "monthly"
  },
  "deliveryMethods": {
    "budgetExceeded": ["inApp", "email", "push"],
    "billDueReminder": ["inApp", "email"],
    "friendRequestReceived": ["inApp", "push"]
  }
}
```

**Frequency Options:**

- `instant` - Real-time delivery
- `hourly` - Batched hourly digest
- `daily` - Daily summary
- `weekly` - Weekly summary
- `never` - Disabled

**Delivery Methods:**

- `inApp` - In-app notification panel
- `email` - Email notification
- `push` - Push notification (mobile/browser)
- `sms` - SMS notification

---

## Error Responses

### 400 Bad Request

Invalid request data or malformed JSON.

```json
{
  "timestamp": "2024-01-20T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request body",
  "path": "/api/notification-preferences"
}
```

### 401 Unauthorized

Missing or invalid authentication token.

```json
{
  "timestamp": "2024-01-20T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required",
  "path": "/api/notification-preferences"
}
```

### 404 Not Found

Resource not found (rare, as GET auto-creates).

```json
{
  "timestamp": "2024-01-20T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Preferences not found",
  "path": "/api/notification-preferences"
}
```

### 500 Internal Server Error

Server-side error.

```json
{
  "timestamp": "2024-01-20T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An error occurred while processing your request",
  "path": "/api/notification-preferences"
}
```

---

## Usage Examples

### Frontend Integration (React/Redux)

#### 1. Fetch Preferences

```javascript
const fetchPreferences = async () => {
  try {
    const response = await axios.get("/api/notification-preferences", {
      headers: {
        "X-User-Id": userId,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching preferences:", error);
  }
};
```

#### 2. Update Preferences (Partial)

```javascript
const updatePreference = async (field, value) => {
  try {
    const response = await axios.put(
      "/api/notification-preferences",
      {
        [field]: value,
      },
      {
        headers: {
          "X-User-Id": userId,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating preference:", error);
  }
};
```

#### 3. Reset to Defaults

```javascript
const resetPreferences = async () => {
  try {
    const response = await axios.post(
      "/api/notification-preferences/reset",
      null,
      {
        headers: {
          "X-User-Id": userId,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error resetting preferences:", error);
  }
};
```

---

## Best Practices

### 1. Auto-Save

Implement auto-save functionality with debouncing to reduce API calls:

```javascript
const debouncedUpdate = debounce(updatePreference, 500);
```

### 2. Optimistic Updates

Update UI immediately, then sync with backend:

```javascript
setLocalState(newValue);
updatePreference(field, newValue).catch(() => {
  setLocalState(oldValue); // Rollback on error
});
```

### 3. Batch Updates

For multiple field changes, batch them in a single request:

```javascript
const batchUpdate = async (updates) => {
  await axios.put("/api/notification-preferences", updates);
};
```

### 4. Error Handling

Always provide user feedback on errors:

```javascript
try {
  await updatePreference(field, value);
  showToast("Preferences updated", "success");
} catch (error) {
  showToast("Failed to update preferences", "error");
}
```

---

## Testing

### Postman Collection

Import the provided Postman collection for testing all endpoints.

### Test Scenarios

1. **Initial Load:** GET preferences (should auto-create defaults)
2. **Partial Update:** PUT with single field change
3. **Bulk Update:** PUT with multiple fields
4. **Master Toggle:** Toggle masterEnabled field
5. **Service Toggle:** Toggle service-level preference
6. **Reset Flow:** POST reset, verify defaults returned
7. **Delete & Recreate:** DELETE, then GET (auto-create), verify defaults

---

## Database Schema

### Table: `notification_preferences`

```sql
CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,

    -- Global Settings
    master_enabled BOOLEAN DEFAULT TRUE,
    do_not_disturb BOOLEAN DEFAULT FALSE,
    notification_sound BOOLEAN DEFAULT TRUE,
    browser_notifications BOOLEAN DEFAULT TRUE,

    -- Service Level Toggles
    expense_service_enabled BOOLEAN DEFAULT TRUE,
    budget_service_enabled BOOLEAN DEFAULT TRUE,
    bill_service_enabled BOOLEAN DEFAULT TRUE,
    payment_method_service_enabled BOOLEAN DEFAULT TRUE,
    friend_service_enabled BOOLEAN DEFAULT TRUE,
    analytics_service_enabled BOOLEAN DEFAULT TRUE,
    system_notifications_enabled BOOLEAN DEFAULT TRUE,

    -- Individual Notification Types (25+ columns)
    expense_added_enabled BOOLEAN DEFAULT TRUE,
    expense_updated_enabled BOOLEAN DEFAULT TRUE,
    expense_deleted_enabled BOOLEAN DEFAULT FALSE,
    large_expense_alert_enabled BOOLEAN DEFAULT TRUE,

    budget_exceeded_enabled BOOLEAN DEFAULT TRUE,
    budget_warning_enabled BOOLEAN DEFAULT TRUE,
    budget_limit_approaching_enabled BOOLEAN DEFAULT TRUE,
    budget_created_enabled BOOLEAN DEFAULT FALSE,
    budget_updated_enabled BOOLEAN DEFAULT FALSE,

    bill_due_reminder_enabled BOOLEAN DEFAULT TRUE,
    bill_overdue_enabled BOOLEAN DEFAULT TRUE,
    bill_paid_enabled BOOLEAN DEFAULT TRUE,

    payment_method_added_enabled BOOLEAN DEFAULT FALSE,
    payment_method_updated_enabled BOOLEAN DEFAULT FALSE,
    payment_method_removed_enabled BOOLEAN DEFAULT TRUE,

    friend_request_received_enabled BOOLEAN DEFAULT TRUE,
    friend_request_accepted_enabled BOOLEAN DEFAULT TRUE,
    friend_request_rejected_enabled BOOLEAN DEFAULT FALSE,

    weekly_summary_enabled BOOLEAN DEFAULT TRUE,
    monthly_report_enabled BOOLEAN DEFAULT TRUE,
    spending_trend_alert_enabled BOOLEAN DEFAULT TRUE,

    security_alert_enabled BOOLEAN DEFAULT TRUE,
    app_update_enabled BOOLEAN DEFAULT FALSE,
    maintenance_notice_enabled BOOLEAN DEFAULT TRUE,

    -- JSON field for complex preferences
    notification_preferences_json TEXT,

    -- Legacy fields
    budget_alerts_enabled BOOLEAN DEFAULT TRUE,
    daily_reminders_enabled BOOLEAN DEFAULT FALSE,
    weekly_reports_enabled BOOLEAN DEFAULT TRUE,
    monthly_summary_enabled BOOLEAN DEFAULT TRUE,
    goal_notifications_enabled BOOLEAN DEFAULT TRUE,
    unusual_spending_alerts BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    budget_warning_threshold DECIMAL(5,2) DEFAULT 80.0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);
```

---

## Migration Guide

### Adding New Notification Types

1. **Update Entity:** Add new field to `NotificationPreferences.java`
2. **Update DTOs:** Add field to response and request DTOs
3. **Update Service:** Add field to default preferences and update methods
4. **Update Frontend:** Add to `notificationConfig.js`
5. **Database Migration:** Add column with default value
6. **Test:** Verify CRUD operations work with new field

Example:

```java
// Entity
@Column(name = "expense_shared_enabled")
private Boolean expenseSharedEnabled;

// Default in service
.expenseSharedEnabled(true)

// Frontend config
{
  id: 'expense_shared',
  type: 'EXPENSE_SHARED',
  title: 'Expense Shared',
  description: 'When someone shares an expense with you',
  icon: 'Share',
  priority: 'medium',
  defaultEnabled: true,
  methods: ['inApp', 'email', 'push']
}
```

---

## Troubleshooting

### Preferences Not Saving

- Check JWT token validity
- Verify X-User-Id header is set
- Check backend logs for errors
- Verify database connection

### Defaults Not Applied

- Ensure repository has `findByUserId` method
- Verify service layer creates defaults on GET
- Check database constraints

### JSON Field Issues

- Validate JSON structure before saving
- Use proper JSON escaping in requests
- Check database TEXT column size

---

## Support

For issues or questions, contact the development team or open a ticket in the project's issue tracker.
