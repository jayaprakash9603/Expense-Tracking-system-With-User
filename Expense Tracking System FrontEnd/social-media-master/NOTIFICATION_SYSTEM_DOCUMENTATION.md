# Real-Time Notification System - Frontend Implementation

## Overview

This document describes the modular, reusable notification system implemented for the Expense Tracking System frontend. The system follows DRY (Don't Repeat Yourself) principles and provides real-time notifications via WebSocket.

## Architecture

### Components

```
src/
├── services/
│   └── notificationWebSocket.js     # WebSocket service (Singleton)
├── hooks/
│   └── useNotifications.js           # React hook for notifications
├── utils/
│   └── notificationUtils.js          # Helper utilities
└── components/
    └── common/
        └── NotificationsPanel.jsx    # UI component
```

## 1. NotificationWebSocket Service

**File:** `src/services/notificationWebSocket.js`

### Features

- **Singleton Pattern:** Single WebSocket connection shared across the app
- **Auto-Reconnection:** Automatically reconnects on disconnect
- **Subscription Management:** Handles multiple topic subscriptions
- **Resubscription:** Automatically resubscribes after reconnection
- **Type-Safe Topics:** Pre-defined topic patterns for different notification types

### Usage

```javascript
import notificationWebSocketService from "../services/notificationWebSocket";

// Connect to WebSocket
notificationWebSocketService.connect({
  token: "your-jwt-token",
  onConnect: () => console.log("Connected"),
  onError: (error) => console.error("Error:", error),
  onDisconnect: () => console.log("Disconnected"),
});

// Subscribe to friend requests
const subscription = notificationWebSocketService.subscribeToFriendRequests(
  userId,
  (notification) => {
    console.log("Friend request received:", notification);
  }
);

// Unsubscribe when done
subscription.unsubscribe();

// Disconnect
notificationWebSocketService.disconnect();
```

### Available Subscription Methods

```javascript
// Subscribe to all user notifications
subscribeToUserNotifications(userId, callback);

// Subscribe to friend requests
subscribeToFriendRequests(userId, callback);

// Subscribe to budget alerts
subscribeToBudgetAlerts(userId, callback);

// Subscribe to bill reminders
subscribeToBillReminders(userId, callback);

// Subscribe to expense updates
subscribeToExpenseUpdates(userId, callback);

// Custom subscription
subscribe(topic, callback, headers);
```

### Topic Patterns

```javascript
const NOTIFICATION_TOPICS = {
  USER_NOTIFICATIONS: (userId) => `/topic/notifications/user/${userId}`,
  FRIEND_REQUESTS: (userId) => `/topic/friend-requests/${userId}`,
  BUDGET_ALERTS: (userId) => `/topic/budget-alerts/${userId}`,
  BILL_REMINDERS: (userId) => `/topic/bill-reminders/${userId}`,
  EXPENSE_UPDATES: (userId) => `/topic/expense-updates/${userId}`,
};
```

## 2. useNotifications Hook

**File:** `src/hooks/useNotifications.js`

### Features

- **State Management:** Manages notification state automatically
- **Auto-Connect:** Connects on mount, disconnects on unmount
- **Auto-Subscribe:** Subscribes to all topics automatically
- **Browser Notifications:** Integrates with browser notification API
- **Unread Count:** Automatically calculates unread notifications

### Usage

```javascript
import useNotifications from "../hooks/useNotifications";

function MyComponent() {
  const {
    notifications, // Array of notifications
    isConnected, // WebSocket connection status
    unreadCount, // Number of unread notifications
    markAsRead, // Mark notification as read
    markAllAsRead, // Mark all as read
    deleteNotification, // Delete a notification
    clearAll, // Clear all notifications
    requestNotificationPermission, // Request browser permission
  } = useNotifications({
    userId: currentUser.id,
    autoConnect: true,
    onNewNotification: (notification) => {
      console.log("New notification:", notification);
    },
  });

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      {notifications.map((notif) => (
        <div key={notif.id}>
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>Mark Read</button>
        </div>
      ))}
    </div>
  );
}
```

### Hook Options

```javascript
{
  userId: number|string,              // User ID (required)
  autoConnect: boolean,               // Auto-connect on mount (default: true)
  onNewNotification: function,        // Callback for new notifications
}
```

### Returned Object

```javascript
{
  // State
  notifications: Array,               // All notifications
  isConnected: boolean,               // Connection status
  unreadCount: number,                // Unread count

  // Actions
  addNotification: function,          // Manually add notification
  markAsRead: function,               // Mark as read
  markAllAsRead: function,            // Mark all as read
  deleteNotification: function,       // Delete notification
  clearAll: function,                 // Clear all
  connect: function,                  // Manually connect
  disconnect: function,               // Manually disconnect
  requestNotificationPermission: function,  // Request permission

  // Service reference
  service: object,                    // Direct service access
}
```

## 3. Notification Utilities

**File:** `src/utils/notificationUtils.js`

### Available Utilities

```javascript
import {
  getNotificationConfig,
  formatNotification,
  formatRelativeTime,
  groupNotificationsByTime,
  filterNotifications,
  sortNotifications,
  playNotificationSound,
  requestBrowserNotificationPermission,
  showBrowserNotification,
  getUnreadCount,
  markNotificationsAsRead,
} from "../utils/notificationUtils";

// Get notification configuration
const config = getNotificationConfig("FRIEND_REQUEST_RECEIVED");
// Returns: { category: 'info', icon: 'person', priority: 'medium', sound: true }

// Format raw notification
const formatted = formatNotification(rawNotification);

// Format timestamp
const timeAgo = formatRelativeTime(notification.timestamp);
// Returns: "2h ago", "Yesterday", etc.

// Group notifications
const grouped = groupNotificationsByTime(notifications);
// Returns: { Today: [...], Yesterday: [...], Earlier: [...] }

// Filter notifications
const unread = filterNotifications(notifications, { read: false });
const highPriority = filterNotifications(notifications, { priority: "high" });

// Sort notifications
const sorted = sortNotifications(notifications, "timestamp", "desc");

// Play sound
playNotificationSound(true);

// Request permission
const granted = await requestBrowserNotificationPermission();

// Show browser notification
showBrowserNotification(notification);

// Get unread count
const count = getUnreadCount(notifications);

// Mark as read
const updated = markNotificationsAsRead(notifications, [1, 2, 3]);
```

### Notification Type Configurations

All notification types are pre-configured with:

- **category:** info, success, warning, error
- **icon:** person, money, bill, warning, category, report
- **priority:** low, medium, high
- **sound:** boolean

## 4. NotificationsPanel Component

**File:** `src/components/common/NotificationsPanel.jsx`

### Features

- Real-time notification display
- Connection status indicator
- Filter by read/unread
- Group by time period
- Mark as read/unread
- Delete notifications
- Clear all
- Browser notifications
- Sound notifications
- Responsive design
- Theme support

### Usage

```javascript
import NotificationsPanel from "./components/common/NotificationsPanel";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Notifications ({unreadCount})
      </button>

      <NotificationsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNotificationRead={setUnreadCount}
      />
    </>
  );
}
```

## Integration Guide

### Step 1: Install Dependencies

```bash
npm install @stomp/stompjs sockjs-client
```

### Step 2: Configure Backend URL

Update the WebSocket URL in `notificationWebSocket.js`:

```javascript
const NOTIFICATION_WS_URL = "http://localhost:6003/ws"; // Your Notification-Service URL
```

### Step 3: Get User ID

Ensure you have access to the current user's ID from your auth state:

```javascript
const user = useSelector((state) => state.auth?.user);
const userId = user?.id || user?.userId;
```

### Step 4: Use the Hook

```javascript
import useNotifications from "./hooks/useNotifications";

function MyApp() {
  const userId = useSelector((state) => state.auth?.user?.id);

  const { notifications, unreadCount, isConnected } = useNotifications({
    userId,
    autoConnect: true,
    onNewNotification: (notif) => {
      console.log("New notification:", notif);
    },
  });

  return (
    <div>
      <h1>My App</h1>
      <p>Notifications: {unreadCount}</p>
      <p>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
    </div>
  );
}
```

## Friend Request Notification Flow

### Backend (Notification-Service)

1. FriendShip-Service publishes friend request event to Kafka
2. Notification-Service consumes the event
3. Notification-Service creates notification in database
4. Notification-Service sends notification via WebSocket to user

### Frontend

1. User logs in, gets JWT token
2. `useNotifications` hook connects to WebSocket
3. Hook subscribes to `/topic/friend-requests/{userId}`
4. Friend request notification arrives via WebSocket
5. Hook adds notification to state
6. `NotificationsPanel` displays the notification
7. Browser notification is shown (if permitted)
8. Sound plays (if enabled)

### Example Friend Request Notification

```javascript
{
  id: 123,
  userId: 2,
  type: "FRIEND_REQUEST_RECEIVED",
  category: "info",
  icon: "person",
  priority: "medium",
  title: "New Friend Request",
  message: "John Doe sent you a friend request",
  timestamp: "2025-10-31T12:00:00Z",
  read: false,
  metadata: {
    requesterId: 5,
    requesterName: "John Doe",
    requestId: 456
  }
}
```

## Notification Types

### Friend & Social

- `FRIEND_REQUEST_RECEIVED` - New friend request
- `FRIEND_REQUEST_ACCEPTED` - Friend request accepted
- `FRIEND_REQUEST_REJECTED` - Friend request rejected

### Budget

- `BUDGET_EXCEEDED` - Budget limit exceeded
- `BUDGET_WARNING` - Budget limit approaching
- `BUDGET_LIMIT_APPROACHING` - 85% of budget reached

### Expense

- `EXPENSE_ADDED` - New expense added
- `EXPENSE_UPDATED` - Expense updated
- `UNUSUAL_SPENDING` - Unusual spending detected

### Bill

- `BILL_DUE_REMINDER` - Bill due soon
- `BILL_OVERDUE` - Bill is overdue
- `BILL_PAID` - Bill paid successfully

### Payment Method

- `PAYMENT_METHOD_ADDED` - Payment method added
- `PAYMENT_METHOD_UPDATED` - Payment method updated

### Category

- `CATEGORY_BUDGET_EXCEEDED` - Category budget exceeded

## Best Practices

### 1. Connection Management

```javascript
// ✅ Good: Use the hook
const { isConnected } = useNotifications({ userId });

// ❌ Bad: Manual connection management
useEffect(() => {
  notificationWebSocketService.connect();
  return () => notificationWebSocketService.disconnect();
}, []);
```

### 2. Subscription Management

```javascript
// ✅ Good: Hook handles subscriptions
const { notifications } = useNotifications({ userId });

// ❌ Bad: Manual subscriptions
useEffect(() => {
  const sub = notificationWebSocketService.subscribe(...);
  return () => sub.unsubscribe();
}, []);
```

### 3. State Management

```javascript
// ✅ Good: Use hook state
const { notifications, markAsRead } = useNotifications({ userId });

// ❌ Bad: Duplicate state
const [notifications, setNotifications] = useState([]);
```

### 4. Browser Notifications

```javascript
// ✅ Good: Request permission once
useEffect(() => {
  requestNotificationPermission();
}, []);

// ❌ Bad: Request on every notification
onNewNotification(() => {
  Notification.requestPermission();
});
```

## Troubleshooting

### WebSocket Not Connecting

1. Check backend URL in `notificationWebSocket.js`
2. Verify Notification-Service is running on port 6003
3. Check JWT token in localStorage
4. Verify CORS configuration on backend

### Notifications Not Appearing

1. Check WebSocket connection status
2. Verify user ID is correct
3. Check browser console for errors
4. Verify backend is publishing to correct topics

### Browser Notifications Not Showing

1. Check permission status: `Notification.permission`
2. Request permission: `requestNotificationPermission()`
3. Verify browser supports notifications
4. Check browser notification settings

## Performance Considerations

- **Single Connection:** Only one WebSocket connection per user
- **Auto-Reconnect:** Reconnects automatically on disconnect
- **Subscription Cleanup:** Unsubscribes on component unmount
- **Memory Management:** Limits notification history to prevent memory leaks
- **Lazy Loading:** Components load only when needed

## Security

- **JWT Authentication:** All WebSocket connections require valid JWT
- **User-Specific Topics:** Users can only subscribe to their own topics
- **Token Refresh:** Reconnects with new token if expired
- **XSS Protection:** Sanitizes notification content

## Testing

### Unit Tests

```javascript
import { render, waitFor } from "@testing-library/react";
import useNotifications from "./hooks/useNotifications";

test("should connect and receive notifications", async () => {
  const { result } = renderHook(() => useNotifications({ userId: 1 }));

  await waitFor(() => {
    expect(result.current.isConnected).toBe(true);
  });

  // Simulate notification
  act(() => {
    result.current.addNotification({
      title: "Test",
      message: "Test message",
    });
  });

  expect(result.current.notifications).toHaveLength(1);
});
```

## License

MIT License

## Support

For issues or questions, please contact the development team.
