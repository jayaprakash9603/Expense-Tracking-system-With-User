# Real-Time Notifications - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- ✅ Notification-Service running on port 6003
- ✅ User authenticated with JWT token
- ✅ User ID available in Redux store

### Step 1: Install Dependencies (if not already installed)

```bash
npm install @stomp/stompjs sockjs-client
```

### Step 2: Import and Use

In any component where you want to display notifications:

```javascript
import { useState } from "react";
import NotificationsPanel from "./components/common/NotificationsPanel";
import useNotifications from "./hooks/useNotifications";
import { useSelector } from "react-redux";

function App() {
  const [showNotifications, setShowNotifications] = useState(false);
  const user = useSelector((state) => state.auth?.user);

  // Get real-time notifications
  const { unreadCount, isConnected } = useNotifications({
    userId: user?.id,
    autoConnect: true,
  });

  return (
    <div>
      {/* Notification Bell Icon */}
      <button onClick={() => setShowNotifications(true)}>
        🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
        {isConnected ? "🟢" : "🔴"}
      </button>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationRead={(count) => console.log("Unread:", count)}
      />
    </div>
  );
}
```

### Step 3: Test It!

1. **Start the backend services:**

   ```bash
   # Terminal 1: Start Notification-Service
   cd Notification-Service
   mvn spring-boot:run

   # Terminal 2: Start FriendShip-Service
   cd FriendShip-Service
   mvn spring-boot:run
   ```

2. **Start the frontend:**

   ```bash
   npm start
   ```

3. **Send a friend request:**
   - Login as User A
   - Send friend request to User B
   - Login as User B
   - You should see a real-time notification! 🎉

## 🎯 What You Get

### ✨ Features

1. **Real-Time Notifications** - Instant notifications via WebSocket
2. **Auto-Reconnect** - Automatically reconnects if connection drops
3. **Browser Notifications** - Native browser notifications support
4. **Sound Alerts** - Optional sound for important notifications
5. **Unread Count** - Badge showing unread notifications
6. **Connection Status** - Visual indicator (🟢/🔴)
7. **Filter & Sort** - Filter by read/unread, sort by time
8. **Time Grouping** - Today, Yesterday, Earlier
9. **Mark as Read** - Individual or bulk mark as read
10. **Delete & Clear** - Delete individual or clear all

### 📱 Notification Types

| Type           | Icon | Priority | Sound |
| -------------- | ---- | -------- | ----- |
| Friend Request | 👤   | Medium   | ✅    |
| Budget Alert   | ⚠️   | High     | ✅    |
| Bill Due       | 📄   | High     | ✅    |
| Expense Added  | 💰   | Low      | ❌    |
| Payment Method | 💳   | Medium   | ❌    |

## 🔧 Configuration

### Backend URL

Update in `src/services/notificationWebSocket.js`:

```javascript
const NOTIFICATION_WS_URL = "http://localhost:6003/ws";
```

### Notification Sound

Add `notification-sound.mp3` to your `public` folder.

### Browser Notification Icon

Add `notification-icon.png` to your `public` folder.

## 📊 Usage Examples

### Example 1: Simple Usage

```javascript
import useNotifications from "./hooks/useNotifications";

function MyComponent() {
  const { notifications, unreadCount } = useNotifications({
    userId: 123,
  });

  return (
    <div>
      <h2>You have {unreadCount} unread notifications</h2>
      {notifications.map((n) => (
        <div key={n.id}>
          {n.title}: {n.message}
        </div>
      ))}
    </div>
  );
}
```

### Example 2: With Callback

```javascript
import useNotifications from "./hooks/useNotifications";

function MyComponent() {
  const { notifications } = useNotifications({
    userId: 123,
    onNewNotification: (notification) => {
      console.log("New notification:", notification);
      // Show toast, play sound, etc.
    },
  });

  return <NotificationsList notifications={notifications} />;
}
```

### Example 3: Manual Control

```javascript
import useNotifications from "./hooks/useNotifications";

function MyComponent() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications({ userId: 123 });

  return (
    <div>
      <button onClick={markAllAsRead}>Mark All Read</button>
      <button onClick={clearAll}>Clear All</button>

      {notifications.map((n) => (
        <div key={n.id}>
          <span>{n.title}</span>
          <button onClick={() => markAsRead(n.id)}>Read</button>
          <button onClick={() => deleteNotification(n.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: With Filters

```javascript
import useNotifications from "./hooks/useNotifications";
import { filterNotifications } from "./utils/notificationUtils";

function MyComponent() {
  const { notifications } = useNotifications({ userId: 123 });

  // Filter unread notifications
  const unread = filterNotifications(notifications, { read: false });

  // Filter high priority
  const urgent = filterNotifications(notifications, { priority: "high" });

  // Filter friend requests
  const friendRequests = filterNotifications(notifications, {
    type: "FRIEND_REQUEST_RECEIVED",
  });

  return (
    <div>
      <h3>Unread: {unread.length}</h3>
      <h3>Urgent: {urgent.length}</h3>
      <h3>Friend Requests: {friendRequests.length}</h3>
    </div>
  );
}
```

### Example 5: Custom Topics

```javascript
import notificationWebSocketService from "./services/notificationWebSocket";
import { useEffect } from "react";

function MyComponent({ userId }) {
  useEffect(() => {
    // Connect
    notificationWebSocketService.connect({
      token: localStorage.getItem("jwt"),
    });

    // Subscribe to custom topic
    const subscription = notificationWebSocketService.subscribe(
      `/topic/custom/${userId}`,
      (data) => {
        console.log("Custom notification:", data);
      }
    );

    // Cleanup
    return () => {
      subscription?.unsubscribe();
      notificationWebSocketService.disconnect();
    };
  }, [userId]);

  return <div>Custom Notifications</div>;
}
```

## 🐛 Troubleshooting

### ❌ "WebSocket connection failed"

**Solution:**

1. Check if Notification-Service is running: `curl http://localhost:6003/actuator/health`
2. Verify WebSocket endpoint: `http://localhost:6003/ws`
3. Check JWT token in localStorage: `localStorage.getItem('jwt')`

### ❌ "Not receiving notifications"

**Solution:**

1. Check connection status: Look for 🟢 indicator
2. Check browser console for errors
3. Verify user ID is correct
4. Check backend logs for published events

### ❌ "Browser notifications not showing"

**Solution:**

1. Check permission: `Notification.permission` should be "granted"
2. Request permission: Click "Allow" when prompted
3. Check browser settings: Notifications should be enabled

### ❌ "Notifications disappear after page refresh"

**Solution:**
This is expected behavior. Notifications are stored in React state.
To persist notifications, implement localStorage or backend persistence.

```javascript
// Save to localStorage
useEffect(() => {
  localStorage.setItem("notifications", JSON.stringify(notifications));
}, [notifications]);

// Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem("notifications");
  if (saved) {
    setNotifications(JSON.parse(saved));
  }
}, []);
```

## 📚 API Reference

### useNotifications Hook

```javascript
const {
  notifications,              // Array<Notification>
  isConnected,               // boolean
  unreadCount,               // number
  markAsRead,                // (id: number) => void
  markAllAsRead,             // () => void
  deleteNotification,        // (id: number) => void
  clearAll,                  // () => void
  connect,                   // () => void
  disconnect,                // () => void
  requestNotificationPermission,  // () => Promise<boolean>
} = useNotifications({
  userId: number,            // Required
  autoConnect: boolean,      // Optional, default: true
  onNewNotification: function,  // Optional
});
```

### NotificationWebSocketService

```javascript
import notificationWebSocketService from "./services/notificationWebSocket";

// Connect
notificationWebSocketService.connect(options);

// Subscribe to topics
notificationWebSocketService.subscribeToUserNotifications(userId, callback);
notificationWebSocketService.subscribeToFriendRequests(userId, callback);
notificationWebSocketService.subscribeToBudgetAlerts(userId, callback);
notificationWebSocketService.subscribeToBillReminders(userId, callback);
notificationWebSocketService.subscribeToExpenseUpdates(userId, callback);

// Custom subscription
notificationWebSocketService.subscribe(topic, callback, headers);

// Send message
notificationWebSocketService.send(destination, body, headers);

// Disconnect
notificationWebSocketService.disconnect();

// Check connection
notificationWebSocketService.isWebSocketConnected();
```

### Notification Utilities

```javascript
import {
  formatNotification,
  formatRelativeTime,
  groupNotificationsByTime,
  filterNotifications,
  sortNotifications,
  playNotificationSound,
  requestBrowserNotificationPermission,
  showBrowserNotification,
  getUnreadCount,
} from "./utils/notificationUtils";
```

## 🎨 Customization

### Custom Notification Type

1. Add to `NOTIFICATION_TYPE_CONFIG` in `notificationUtils.js`:

```javascript
export const NOTIFICATION_TYPE_CONFIG = {
  // ...existing types...

  MY_CUSTOM_TYPE: {
    category: "info",
    icon: "custom",
    priority: "high",
    sound: true,
  },
};
```

2. Add icon case in `NotificationsPanel.jsx`:

```javascript
case "custom":
  return <CustomIcon {...iconProps} style={style} />;
```

### Custom Sound

Replace `notification-sound.mp3` in `public` folder with your sound file.

### Custom Styling

Update colors in `NotificationsPanel.jsx` using your theme:

```javascript
const { colors } = useTheme();
// Use colors.primary_accent, colors.secondary_bg, etc.
```

## 🚀 Next Steps

1. **Implement Persistence** - Save notifications to backend/localStorage
2. **Add Pagination** - Lazy load old notifications
3. **Add Search** - Search notifications by text
4. **Add Actions** - Add action buttons (Accept, Reject, etc.)
5. **Add Settings** - Allow users to configure notification preferences

## 📞 Support

For detailed documentation, see `NOTIFICATION_SYSTEM_DOCUMENTATION.md`

For issues or questions:

- Check backend logs: `Notification-Service/logs`
- Check browser console for errors
- Verify WebSocket connection in Network tab

---

**Happy Coding! 🎉**
