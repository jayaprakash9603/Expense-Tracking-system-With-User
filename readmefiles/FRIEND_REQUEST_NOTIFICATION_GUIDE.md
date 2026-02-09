# Friend Request Notification System - Complete Implementation Guide

## 📋 Overview

This document explains the complete friend request notification flow from User 1 sending a friend request to User 2 receiving a real-time notification.

## 🔄 Complete Flow

### When User 1 Sends Friend Request to User 2:

```
1. Frontend: User 1 clicks "Send Friend Request" to User 2
   ↓
2. Frontend: POST /api/friendships/send-request
   Body: { recipientId: User2_ID }
   ↓
3. FriendShip-Service: sendFriendRequest() method
   - Creates Friendship entity (status: PENDING)
   - Saves to database
   ↓
4. FriendShip-Service: Publishes Kafka Event
   Topic: "friend-request-events"
   Event Type: "FRIEND_REQUEST_SENT"
   Data: {
     friendshipId, requesterId (User1),
     recipientId (User2), requesterName,
     recipientName, timestamp, message
   }
   ↓
5. Notification-Service: Kafka Consumer receives event
   ↓
6. Notification-Service: Creates Notification for User 2
   Type: FRIEND_REQUEST_RECEIVED
   Title: "New Friend Request"
   Message: "User 1 sent you a friend request"
   UserId: User2_ID
   ↓
7. Notification-Service: Saves Notification to database
   ↓
8. Notification-Service: Sends WebSocket Message
   Destination: /user/{User2_ID}/queue/notifications
   ↓
9. Frontend (User 2): WebSocket receives notification
   ↓
10. Frontend: Redux action dispatched
    Type: ADD_NOTIFICATION
    ↓
11. Frontend: NotificationsPanel updates
    - Unread count increases
    - Notification appears in dropdown
    - Browser notification shown (if permitted)
    ↓
12. User 2: Sees real-time notification!
```

## 🎯 Backend Implementation

### 1. FriendShip-Service

#### FriendshipServiceImpl.java

```java
public Friendship sendFriendRequest(Integer requesterId, Integer recipientId) throws Exception {
    // Validate users
    UserDto requester = helper.validateUser(requesterId);
    UserDto recipient = helper.validateUser(recipientId);

    // Create friendship
    Friendship friendship = new Friendship(
        null,
        requester.getId(),
        recipient.getId(),
        FriendshipStatus.PENDING,
        AccessLevel.NONE,
        AccessLevel.NONE
    );

    friendship = friendshipRepository.save(friendship);

    // Publish Kafka event → This triggers notification to User 2
    publishFriendRequestSentEvent(friendship, requester, recipient);

    return friendship;
}

private void publishFriendRequestSentEvent(
    Friendship friendship,
    UserDto requester,
    UserDto recipient
) {
    FriendRequestEvent event = FriendRequestEvent.builder()
        .eventType("FRIEND_REQUEST_SENT")
        .friendshipId(friendship.getId())
        .requesterId(requester.getId())
        .requesterName(requester.getFirstName() + " " + requester.getLastName())
        .recipientId(recipient.getId())
        .recipientName(recipient.getFirstName() + " " + recipient.getLastName())
        .timestamp(LocalDateTime.now())
        .message(requester.getFirstName() + " sent you a friend request")
        .build();

    friendRequestEventPublisher.publishFriendRequestEvent(event);
}
```

### 2. Notification-Service

#### NotificationEventConsumer.java

```java
@KafkaListener(
    topics = "friend-request-events",
    groupId = "notification-friend-request-group"
)
public void consumeFriendRequestEvent(Object eventData) {
    FriendRequestEventDTO event = convertEventData(eventData, FriendRequestEventDTO.class);

    // Create notification for recipient (User 2)
    if (event.getEventType().equals("FRIEND_REQUEST_SENT")) {
        Notification notification = createFriendRequestReceivedNotification(event);
        Notification saved = notificationService.createNotification(notification);

        // Send via WebSocket to User 2
        sendNotificationToUser(saved);
    }
}

private Notification createFriendRequestReceivedNotification(FriendRequestEventDTO event) {
    Notification notification = new Notification();
    notification.setUserId(event.getRecipientId()); // User 2
    notification.setType(NotificationType.FRIEND_REQUEST_RECEIVED);
    notification.setTitle("New Friend Request");
    notification.setMessage(event.getRequesterName() + " sent you a friend request");
    notification.setIsRead(false);
    notification.setMetadata(JSON.stringify({
        friendshipId: event.getFriendshipId(),
        requesterId: event.getRequesterId(),
        requesterName: event.getRequesterName()
    }));
    return notification;
}

private void sendNotificationToUser(Notification notification) {
    String destination = String.format(
        "/user/%d/queue/notifications",
        notification.getUserId()
    );
    messagingTemplate.convertAndSend(destination, notification);
}
```

#### NotificationController.java - REST Endpoints

```java
// Get all notifications for current user
@GetMapping
public ResponseEntity<List<Notification>> getAllNotifications(
    @RequestHeader("Authorization") String jwt,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
) {
    UserDto user = userService.getuserProfile(jwt);
    Page<Notification> notifications = notificationRepository
        .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size));
    return ResponseEntity.ok(notifications.getContent());
}

// Get unread count
@GetMapping("/count/unread")
public ResponseEntity<Map<String, Long>> getUnreadCount(
    @RequestHeader("Authorization") String jwt
) {
    UserDto user = userService.getuserProfile(jwt);
    Long count = notificationRepository.countUnreadNotifications(user.getId());
    return ResponseEntity.ok(Map.of("unreadCount", count));
}

// Mark as read
@PutMapping("/{notificationId}/read")
public ResponseEntity<String> markAsRead(
    @RequestHeader("Authorization") String jwt,
    @PathVariable Integer notificationId
) {
    // ... validation ...
    notification.setIsRead(true);
    notificationRepository.save(notification);
    return ResponseEntity.ok("Notification marked as read");
}
```

## 🎨 Frontend Implementation

### 1. Redux Structure

#### Directory: `src/Redux/Notifications/`

**notification.actionType.js** - Action type constants
**notification.action.js** - Redux actions with API calls
**notification.reducer.js** - State management

### 2. Redux Actions

#### notification.action.js

```javascript
import axios from "axios";

const NOTIFICATION_API_BASE_URL = "http://localhost:6003/api/notifications";

// Fetch all notifications for current user
export const fetchNotifications =
  (page = 0, size = 20) =>
  async (dispatch) => {
    dispatch({ type: "FETCH_NOTIFICATIONS_REQUEST" });

    try {
      const response = await axios.get(NOTIFICATION_API_BASE_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        params: { page, size },
      });

      dispatch({
        type: "FETCH_NOTIFICATIONS_SUCCESS",
        payload: response.data,
      });

      return response.data;
    } catch (error) {
      dispatch({
        type: "FETCH_NOTIFICATIONS_FAILURE",
        payload: error.message,
      });
      throw error;
    }
  };

// Fetch unread count
export const fetchUnreadCount = () => async (dispatch) => {
  const response = await axios.get(
    `${NOTIFICATION_API_BASE_URL}/count/unread`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    }
  );

  dispatch({
    type: "FETCH_UNREAD_COUNT_SUCCESS",
    payload: response.data.unreadCount,
  });
};

// Mark notification as read
export const markNotificationAsRead = (notificationId) => async (dispatch) => {
  await axios.put(
    `${NOTIFICATION_API_BASE_URL}/${notificationId}/read`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } }
  );

  dispatch({
    type: "MARK_NOTIFICATION_READ_SUCCESS",
    payload: notificationId,
  });

  dispatch(fetchUnreadCount());
};

// Add notification (from WebSocket)
export const addNotification = (notification) => (dispatch) => {
  dispatch({
    type: "ADD_NOTIFICATION",
    payload: notification,
  });

  dispatch(fetchUnreadCount());
};
```

### 3. Redux Store Integration

#### store.js

```javascript
import { notificationReducer } from "./Notifications/notification.reducer";

const rootreducers = combineReducers({
  auth: authReducer,
  // ... other reducers
  notifications: notificationReducer, // ✅ Added
});
```

### 4. WebSocket Integration

#### useNotifications.js Hook

```javascript
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../Redux/Notifications/notification.action";
import notificationWebSocketService from "../services/notificationWebSocket";

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.id) return;

    // Connect to WebSocket
    notificationWebSocketService.connect();

    // Subscribe to user notifications
    const subscription =
      notificationWebSocketService.subscribeToUserNotifications(
        user.id,
        (notification) => {
          console.log("Received notification:", notification);

          // Add to Redux store
          dispatch(addNotification(notification));

          // Show browser notification
          if (Notification.permission === "granted") {
            new Notification(notification.title, {
              body: notification.message,
              icon: "/logo.png",
            });
          }
        }
      );

    return () => {
      subscription?.unsubscribe();
      notificationWebSocketService.disconnect();
    };
  }, [user, dispatch]);

  return {
    isConnected: notificationWebSocketService.isConnected,
  };
};
```

### 5. NotificationsPanel Component

#### NotificationsPanelRedux.jsx

```javascript
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
} from "../../Redux/Notifications/notification.action";
import { useNotifications } from "../../hooks/useNotifications";

const NotificationsPanel = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(
    (state) => state.notifications
  );
  const { user } = useSelector((state) => state.auth);
  const { isConnected } = useNotifications();

  // Fetch notifications on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, user]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification.id));
    }

    // Navigate based on notification type
    if (notification.type === "FRIEND_REQUEST_RECEIVED") {
      navigate("/friends", { state: { tab: "requests" } });
    }
  };

  return (
    <div className="notifications-panel">
      {/* Bell Icon with Badge */}
      <button className="notification-bell">
        <BellIcon />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={notification.isRead ? "read" : "unread"}
          >
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <span>{formatTime(notification.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 📡 API Endpoints

### Notification Service (Port 6003)

| Method | Endpoint                          | Description                    | Response               |
| ------ | --------------------------------- | ------------------------------ | ---------------------- |
| GET    | `/api/notifications`              | Get all notifications for user | `List<Notification>`   |
| GET    | `/api/notifications/unread`       | Get unread notifications       | `List<Notification>`   |
| GET    | `/api/notifications/count/unread` | Get unread count               | `{ unreadCount: 5 }`   |
| PUT    | `/api/notifications/{id}/read`    | Mark notification as read      | `"Marked as read"`     |
| PUT    | `/api/notifications/read-all`     | Mark all as read               | `"All marked as read"` |
| DELETE | `/api/notifications/{id}`         | Delete notification            | `"Deleted"`            |
| DELETE | `/api/notifications/all`          | Delete all notifications       | `"All deleted"`        |

**Authentication:** All endpoints require JWT token in `Authorization: Bearer <token>` header

### Example API Calls

```javascript
// Get all notifications
const response = await axios.get("http://localhost:6003/api/notifications", {
  headers: { Authorization: `Bearer ${jwt}` },
  params: { page: 0, size: 20 },
});

// Get unread count
const count = await axios.get(
  "http://localhost:6003/api/notifications/count/unread",
  {
    headers: { Authorization: `Bearer ${jwt}` },
  }
);

// Mark as read
await axios.put(
  `http://localhost:6003/api/notifications/${notificationId}/read`,
  {},
  { headers: { Authorization: `Bearer ${jwt}` } }
);
```

## 🧪 Testing Guide

### 1. Test Friend Request Flow

**Step 1: Login as User 1**

```bash
# Start frontend
cd "Expense Tracking System FrontEnd/social-media-master"
npm start
```

**Step 2: Send Friend Request**

- Navigate to Friends page
- Search for User 2
- Click "Send Friend Request"

**Expected Backend Logs:**

```
FriendShip-Service: Publishing friend request event: FRIEND_REQUEST_SENT
Notification-Service: Received friend request event
Notification-Service: Friend request received notification sent to user: {User2_ID}
```

**Step 3: Login as User 2 (different browser/incognito)**

- Open application
- Login as User 2
- Check notifications bell

**Expected Results:**

- ✅ Unread badge shows "1"
- ✅ Notification panel shows "New Friend Request from User 1"
- ✅ Browser notification appears (if permitted)
- ✅ Notification appears instantly (real-time)

### 2. Verify Redux State

Open Redux DevTools:

```javascript
// Initial state
state.notifications = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

// After receiving notification
state.notifications = {
  notifications: [
    {
      id: 1,
      userId: 2,
      type: "FRIEND_REQUEST_RECEIVED",
      title: "New Friend Request",
      message: "John Doe sent you a friend request",
      isRead: false,
      createdAt: "2025-10-31T10:30:00",
    },
  ],
  unreadCount: 1,
  loading: false,
};
```

### 3. Test API Endpoints

```bash
# Set JWT token
$jwt = "your_jwt_token_here"

# Get all notifications
Invoke-RestMethod -Uri "http://localhost:6003/api/notifications" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $jwt" }

# Get unread count
Invoke-RestMethod -Uri "http://localhost:6003/api/notifications/count/unread" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $jwt" }

# Mark as read
Invoke-RestMethod -Uri "http://localhost:6003/api/notifications/1/read" `
  -Method PUT `
  -Headers @{ Authorization = "Bearer $jwt" }
```

## 🐛 Troubleshooting

### Issue 1: User 2 doesn't receive notification

**Check:**

1. Is Notification-Service running? `netstat -ano | findstr :6003`
2. Is Kafka running and topic created?
3. Check backend logs for errors
4. Is WebSocket connected? (Green indicator in UI)

**Debug:**

```bash
# Check Kafka topic
kafka-console-consumer --bootstrap-server localhost:9092 --topic friend-request-events --from-beginning
```

### Issue 2: Notification appears but unread count doesn't update

**Solution:** The `fetchUnreadCount()` action should be dispatched after adding notification:

```javascript
export const addNotification = (notification) => (dispatch) => {
  dispatch({ type: "ADD_NOTIFICATION", payload: notification });
  dispatch(fetchUnreadCount()); // ✅ This updates the count
};
```

### Issue 3: API returns 401 Unauthorized

**Check:**

1. JWT token is valid and not expired
2. Token is correctly set in Authorization header
3. User is authenticated

### Issue 4: Notification doesn't navigate correctly

**Check metadata parsing:**

```javascript
const metadata = JSON.parse(notification.metadata);
console.log("Friendship ID:", metadata.friendshipId);
console.log("Requester ID:", metadata.requesterId);
```

## 📊 Database Schema

### Notification Table

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  channel VARCHAR(50),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## 🚀 Deployment Checklist

- [ ] Backend services running (FriendShip, Notification)
- [ ] Kafka and Zookeeper running
- [ ] WebSocket endpoint configured correctly
- [ ] CORS configured for frontend origin
- [ ] JWT authentication working
- [ ] Redux store configured with notification reducer
- [ ] WebSocket hook integrated in App component
- [ ] NotificationsPanel added to header/navbar
- [ ] Browser notification permission requested
- [ ] API endpoints tested
- [ ] Real-time notification flow tested

## 📚 Related Files

### Backend Files:

- `FriendshipServiceImpl.java` - Publishes friend request events
- `FriendRequestEventPublisher.java` - Kafka publisher
- `NotificationEventConsumer.java` - Consumes events and creates notifications
- `NotificationController.java` - REST API endpoints
- `WebSocketConfig.java` - WebSocket configuration

### Frontend Files:

- `Redux/Notifications/notification.action.js` - Redux actions
- `Redux/Notifications/notification.actionType.js` - Action types
- `Redux/Notifications/notification.reducer.js` - Redux reducer
- `Redux/store.js` - Redux store configuration
- `hooks/useNotifications.js` - WebSocket hook
- `services/notificationWebSocket.js` - WebSocket service
- `components/common/NotificationsPanelRedux.jsx` - UI component

---

**Status:** ✅ Complete Implementation
**Last Updated:** October 31, 2025
