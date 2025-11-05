# 🎯 Floating Notifications System

A comprehensive, production-ready floating notification system with modern UI/UX, Redux integration, and user preference support.

## ✨ Features

### 🎨 UI/UX Excellence

- **Smooth Animations**: Slide-in/slide-out with fade effects
- **Auto-dismiss**: Configurable duration with visual progress bar
- **Pause on Hover**: User can pause auto-dismiss by hovering
- **Priority-based Styling**: Visual hierarchy based on notification importance
- **Dark/Light Theme**: Full theme support matching app design
- **Mobile Responsive**: Optimized for all screen sizes
- **Interactive**: Click to navigate, hover to pause, close button

### 🔧 Technical Features

- **Redux Integration**: Seamlessly connected to notification store
- **User Preferences**: Respects notification settings
- **Queue System**: Manages overflow with max 5 visible at once
- **Sound Notifications**: Optional audio alerts for important notifications
- **Performance Optimized**: React.memo, efficient re-renders
- **Memory Management**: Automatic cleanup to prevent memory leaks
- **Accessibility**: ARIA labels and keyboard support

### 🎯 Notification Types Supported

#### Friends

- Friend Request Received
- Friend Request Accepted
- Friend Request Rejected
- Friendship Removed

#### Expenses

- Expense Added
- Expense Updated
- Expense Deleted
- Expense Shared

#### Budget

- Budget Threshold Warning
- Budget Exceeded
- Budget Created
- Budget Updated

#### Bills

- Bill Due Soon
- Bill Overdue
- Bill Paid
- Bill Reminder

#### Chat & Messaging

- New Message
- New Comment

#### System

- System Updates
- Achievements

## 📦 File Structure

```
src/components/common/FloatingNotifications/
├── index.js                           # Module exports
├── FloatingNotificationContainer.jsx  # Main container component
├── FloatingNotificationItem.jsx       # Individual notification component
└── constants/
    └── notificationTypes.js           # Type configurations
```

## 🚀 Usage

### Basic Setup

The floating notification system is already integrated into the `Home.jsx` component, making it globally available across all pages:

```jsx
import { FloatingNotificationContainer } from "../../components/common/FloatingNotifications";

function Home() {
  return (
    <div>
      <FloatingNotificationContainer />
      {/* Your other components */}
    </div>
  );
}
```

### Sending Notifications

Notifications automatically display when added to Redux store via WebSocket or manual dispatch:

```javascript
import { useDispatch } from "react-redux";
import { ADD_NOTIFICATION } from "../Redux/Notifications/notification.actionType";

const dispatch = useDispatch();

// Add a notification
dispatch({
  type: ADD_NOTIFICATION,
  payload: {
    id: Date.now(),
    type: "FRIEND_REQUEST_RECEIVED",
    title: "New Friend Request",
    message: "John Doe sent you a friend request",
    timestamp: new Date().toISOString(),
    isRead: false,
  },
});
```

### Notification Object Structure

```javascript
{
  id: number | string,           // Unique identifier
  type: string,                  // Notification type (see types below)
  title: string,                 // Bold title text
  message: string,               // Description text
  timestamp: string,             // ISO date string
  isRead: boolean,              // Read status
  duration?: number,            // Optional custom duration (ms)
  // Type-specific fields
  expenseId?: string,
  budgetId?: string,
  billId?: string,
  chatId?: string,
  friendId?: string,
}
```

## 🎨 Configuration

### Notification Type Configuration

Each notification type has predefined styling in `notificationTypes.js`:

```javascript
{
  icon: MUI Icon Component,
  color: string,                    // Primary color
  gradient: string,                 // CSS gradient
  bgColor: string,                  // Background color (with opacity)
  borderColor: string,              // Border color (with opacity)
  defaultDuration: number,          // Duration in milliseconds
  priority: string,                 // low, medium, high, critical
  sound: boolean,                   // Play sound on display
}
```

### User Preferences Integration

The system automatically respects user preferences from `NotificationSettings`:

- **Master Toggle**: Disables all notifications
- **Do Not Disturb**: Hides floating notifications
- **Floating Notifications**: Specific toggle for floating display
- **Notification Sound**: Controls audio alerts
- **Delivery Methods**: Checks if `in_app` is enabled for each type

### Constants

```javascript
// Max notifications visible at once
MAX_VISIBLE_NOTIFICATIONS = 5;

// Position (customizable)
NOTIFICATION_POSITION = {
  top: "24px",
  right: "24px",
};

// Mobile position
MOBILE_NOTIFICATION_POSITION = {
  top: "16px",
  right: "16px",
  left: "16px",
};
```

## 🎬 Animation Details

### Entrance Animation

- Slide in from right
- Fade in effect
- Staggered timing for multiple notifications (50ms delay per item)

### Hover Effects

- Slight scale up (1.02x)
- Translate left (4px)
- Enhanced shadow
- Pause auto-dismiss timer

### Exit Animation

- Slide out to right
- Fade out effect
- 300ms duration

### Progress Bar

- Smooth linear animation
- Pauses on hover
- Color matches notification type

## 🔊 Sound System

Audio notifications play for high-priority types:

- Friend requests
- Budget warnings/exceeded
- Bill reminders/overdue
- Expense shared
- Messages

### Adding Custom Sound

1. Place sound file in `/public/notification-sound.mp3`
2. Adjust volume in `FloatingNotificationContainer.jsx`:

```javascript
audioRef.current.volume = 0.5; // 0.0 to 1.0
```

## 🎯 Navigation Integration

Clicking a notification automatically navigates to the relevant page:

| Notification Type | Destination                     |
| ----------------- | ------------------------------- |
| Friend requests   | `/friends`                      |
| Expenses          | `/expenses` or `/expenses/{id}` |
| Budget            | `/budget` or `/budget/{id}`     |
| Bills             | `/bills` or `/bills/{id}`       |
| Messages          | `/chat` or `/chat/{id}`         |
| Default           | `/notifications`                |

## 📱 Responsive Design

### Desktop (> 768px)

- Width: 380px
- Position: Top-right (24px margin)
- Max 5 visible

### Mobile (≤ 768px)

- Width: calc(100vw - 32px)
- Position: Top-center (16px margins)
- Max 5 visible

## ⚡ Performance Optimizations

1. **React.memo**: Components memoized to prevent unnecessary re-renders
2. **Duplicate Prevention**: Checks recent 50 notifications for duplicates (O(1))
3. **Memory Management**: Limits Redux store to 500 notifications
4. **Queue System**: Efficiently manages overflow notifications
5. **Periodic Cleanup**: Removes old processed IDs every minute
6. **Efficient Updates**: Progress bar uses 50ms intervals

## 🧪 Testing

### Manual Testing Checklist

- [ ] Notification appears with correct styling
- [ ] Auto-dismiss works after configured duration
- [ ] Hover pauses auto-dismiss
- [ ] Close button dismisses notification
- [ ] Click navigates to correct page
- [ ] Sound plays for high-priority notifications
- [ ] Queue system works when > 5 notifications
- [ ] Respects user preferences
- [ ] Works in dark and light themes
- [ ] Responsive on mobile and desktop

### Test Notification

Send a test notification from NotificationSettings page or dispatch manually:

```javascript
dispatch({
  type: "ADD_NOTIFICATION",
  payload: {
    id: Date.now(),
    type: "FRIEND_REQUEST_RECEIVED",
    title: "Test Notification",
    message: "This is a test notification",
    timestamp: new Date().toISOString(),
    isRead: false,
  },
});
```

## 🐛 Troubleshooting

### Notifications not appearing?

1. Check Redux store: `state.notifications.notifications`
2. Verify user preferences: `state.notifications.preferences.floatingNotifications`
3. Check browser console for errors
4. Ensure notifications have `isRead: false`
5. Verify notification type is valid

### Sound not playing?

1. Check user preferences: `preferences.notificationSound`
2. Verify sound file exists: `/public/notification-sound.mp3`
3. Check browser autoplay policies
4. Look for audio errors in console

### Navigation not working?

1. Check notification has required ID field (expenseId, budgetId, etc.)
2. Verify routes are configured in React Router
3. Check console for navigation errors

## 🔮 Future Enhancements

- [ ] Swipe to dismiss on mobile
- [ ] Grouped notifications (e.g., "3 new friend requests")
- [ ] Custom action buttons
- [ ] Rich media support (images, avatars)
- [ ] Notification history/archive
- [ ] Position customization
- [ ] Custom animation presets
- [ ] Batch operations (dismiss all, snooze)

## 🤝 Contributing

When adding new notification types:

1. Add type to `NOTIFICATION_TYPE_CONFIG` in `notificationTypes.js`
2. Define icon, colors, priority, and duration
3. Add navigation logic in `FloatingNotificationContainer.jsx`
4. Update this README with the new type

## 📄 License

Part of the Expense Tracking System project.

---

**Built with ❤️ following Material Design principles and React best practices**
