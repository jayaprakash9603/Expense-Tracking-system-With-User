# 🚀 Floating Notifications - Quick Start Guide

## ✅ What's Already Done

The floating notification system is **fully integrated and ready to use**! Here's what's been implemented:

### ✨ Components Created

- ✅ `FloatingNotificationContainer.jsx` - Main container with Redux integration
- ✅ `FloatingNotificationItem.jsx` - Individual notification component
- ✅ `notificationTypes.js` - 20+ pre-configured notification types
- ✅ Integration with `Home.jsx` for global visibility

### 🎯 Features Included

- ✅ Real-time WebSocket notifications
- ✅ Redux state management integration
- ✅ User preference support (from NotificationSettings)
- ✅ Auto-dismiss with progress bar
- ✅ Pause on hover
- ✅ Click to navigate
- ✅ Queue system (max 5 visible)
- ✅ Sound notifications
- ✅ Dark/Light theme support
- ✅ Mobile responsive
- ✅ 20+ notification types with custom icons/colors

## 🎬 How to Test

### Method 1: Using NotificationSettings (Recommended)

1. Navigate to Settings → Notification Settings
2. The settings page should already have a test notification feature
3. Click "Send Test Notification" button

### Method 2: Manually Dispatch (For Development)

Open browser console and run:

```javascript
// Get Redux store from window (if Redux DevTools is enabled)
const event = new CustomEvent("ADD_NOTIFICATION", {
  detail: {
    id: Date.now(),
    type: "FRIEND_REQUEST_RECEIVED",
    title: "Test Notification",
    message: "This is a test floating notification! 🎉",
    timestamp: new Date().toISOString(),
    isRead: false,
  },
});

// Dispatch through Redux (you'll need access to dispatch)
// Or trigger through WebSocket
```

### Method 3: Trigger Real Notifications

The floating notifications will automatically appear when:

- Someone sends you a friend request
- A new expense is added/shared
- Budget threshold is reached
- Bill is due soon
- New messages arrive
- Any WebSocket notification is received

## 🎨 What You'll See

When a notification arrives:

1. **Slide In Animation**: Notification slides in from the right
2. **Icon Badge**: Colored icon matching notification type
3. **Progress Bar**: Bottom bar showing time remaining
4. **Hover Effect**: Pause auto-dismiss + scale effect
5. **Click**: Navigate to related page
6. **Auto-Dismiss**: Disappears after 3-8 seconds (based on priority)
7. **Queue Counter**: Shows "+X more notifications" if queue exists

### Example Appearance

```
┌─────────────────────────────────────┐
│ 🎯 [Icon]  Friend Request Received │
│            John sent you a request  │
│            2m ago                   │
│                              [✕]    │
└─────────────────────────────────────┘
  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  (Progress bar)
```

## 🔊 Audio Setup (Optional)

To enable notification sounds:

1. **Add Sound File**:

   - Place `notification-sound.mp3` in `/public/` folder
   - Use a short, pleasant sound (< 2 seconds)
   - Recommended format: MP3, 128kbps

2. **Enable in Settings**:
   - Go to Notification Settings
   - Enable "Notification Sound" toggle
   - Enable "Floating Notifications" toggle

**Where to get sounds**:

- [Notification Sounds](https://notificationsounds.com/)
- [Free Sound](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)

## 🎯 Notification Types Available

### High Priority (Sound Enabled)

- 🔵 Friend Request Received
- ⚠️ Budget Threshold Warning
- 🔴 Budget Exceeded
- ⚠️ Bill Due Soon
- 🔴 Bill Overdue
- 💬 New Message

### Medium Priority

- ✅ Friend Request Accepted
- 💰 Expense Shared
- 💵 Bill Paid
- 🎯 Budget/Expense Updates

### Low Priority

- ❌ Friend Request Rejected
- 📝 Expense Updated/Deleted
- 💬 New Comment

## 🎚️ User Preferences

Floating notifications respect these settings:

| Setting                    | Effect                                  |
| -------------------------- | --------------------------------------- |
| Master Toggle OFF          | No notifications                        |
| Do Not Disturb ON          | No floating notifications               |
| Floating Notifications OFF | No floating notifications               |
| Notification Sound OFF     | No audio                                |
| In-App delivery OFF        | No floating notifications for that type |

## 📱 Responsive Behavior

### Desktop

- Position: Top-right corner
- Width: 380px
- Max visible: 5

### Mobile

- Position: Top-center
- Width: Full width (minus 32px margins)
- Max visible: 5

## 🐛 Troubleshooting

### "Notifications not appearing"

**Check:**

1. ✅ Redux store has notifications: `state.notifications.notifications`
2. ✅ Notifications are unread: `isRead: false`
3. ✅ Master toggle enabled in settings
4. ✅ Floating notifications enabled
5. ✅ Browser console for errors

**Fix:**

```javascript
// Check Redux state in console
console.log(store.getState().notifications);

// Verify preferences
console.log(store.getState().notifications.preferences);
```

### "Sound not playing"

**Check:**

1. ✅ Sound file exists: `/public/notification-sound.mp3`
2. ✅ Sound enabled in preferences
3. ✅ Browser allows autoplay
4. ✅ Volume not muted

**Fix:**

- Check browser autoplay policy (chrome://flags)
- User must interact with page first (click anywhere)
- Test in incognito mode

### "Notifications stacking incorrectly"

**Check:**

1. ✅ Multiple duplicate IDs
2. ✅ Rapid notification bursts

**Fix:**

- System automatically handles queue
- Max 5 visible at once
- Duplicates filtered automatically

## 🎨 Customization

### Change Position

Edit `FloatingNotificationContainer.jsx`:

```javascript
const NOTIFICATION_POSITION = {
  top: "24px", // Change to "auto" for bottom
  right: "24px", // Change to "auto" for left
  bottom: "auto", // Change to "24px" for bottom
  left: "auto", // Change to "24px" for left
};
```

### Change Duration

Edit `notificationTypes.js`:

```javascript
FRIEND_REQUEST_RECEIVED: {
  defaultDuration: 8000, // Change from 6000 to 8000ms
  // ...
}
```

### Add Custom Type

1. Add to `notificationTypes.js`:

```javascript
MY_CUSTOM_TYPE: {
  icon: MyIcon,
  color: "#ff6b6b",
  gradient: "linear-gradient(135deg, #ff6b6b, #ee5a6f)",
  bgColor: "rgba(255, 107, 107, 0.1)",
  borderColor: "rgba(255, 107, 107, 0.3)",
  defaultDuration: 5000,
  priority: PRIORITY_LEVELS.MEDIUM,
  sound: true,
}
```

2. Add navigation in `FloatingNotificationContainer.jsx`:

```javascript
case "MY_CUSTOM_TYPE":
  navigate("/my-custom-page");
  break;
```

## 📊 Performance Notes

- **Memory**: System limits Redux to 500 notifications
- **Duplicate Check**: O(1) - only checks recent 50
- **Cleanup**: Automatic every 60 seconds
- **Rendering**: Optimized with React.memo
- **Animation**: Hardware-accelerated CSS transforms

## 🎉 You're All Set!

The floating notification system is:

- ✅ Fully integrated
- ✅ Connected to Redux
- ✅ Listening to WebSocket
- ✅ Respecting user preferences
- ✅ Mobile responsive
- ✅ Production ready

**Just send a notification through WebSocket or Redux, and it will automatically appear!**

## 🆘 Need Help?

1. Check the full `README.md` in the same folder
2. Review Redux notifications state
3. Check browser console for errors
4. Verify user preferences in NotificationSettings

---

**Happy notifying! 🎉**
