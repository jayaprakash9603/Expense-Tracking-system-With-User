# 🚀 Friend Request Notification System - Quick Start Guide

## ⚡ Quick Setup (5 Minutes)

### 1. Start Required Services

```bash
# Start Kafka and Zookeeper
docker-compose up -d kafka zookeeper

# Verify Kafka is running
docker ps | grep kafka
```

### 2. Start Backend Services

```bash
# Terminal 1: Start FriendShip-Service
cd FriendShip-Service
./mvnw spring-boot:run

# Terminal 2: Start Notification-Service
cd Notification-Service
./mvnw spring-boot:run
```

### 3. Test the System

#### Send Friend Request (User 1 → User 2)

```bash
curl -X POST http://localhost:6009/api/friendships/send-request?requesterId=1&recipientId=2
```

**What happens:**

1. ✅ Friendship created in database (PENDING)
2. ✅ Event published to Kafka: `friend-request-events`
3. ✅ Notification-Service consumes event
4. ✅ Notification created for User 2 (recipient)
5. ✅ WebSocket sends notification to User 2's frontend
6. ✅ Frontend displays: "John Doe sent you a friend request"

#### Accept Friend Request (User 2 responds)

```bash
curl -X POST http://localhost:6009/api/friendships/respond?friendshipId=1&responderId=2&accept=true
```

**What happens:**

1. ✅ Friendship status updated to ACCEPTED
2. ✅ Event published to Kafka: `FRIEND_REQUEST_ACCEPTED`
3. ✅ Notification-Service consumes event
4. ✅ Notification created for User 1 (requester)
5. ✅ WebSocket sends notification to User 1's frontend
6. ✅ Frontend displays: "Jane Smith accepted your friend request!"

---

## 📝 Key Endpoints

### FriendShip-Service (Port: 6009)

| Method | Endpoint                            | Description           |
| ------ | ----------------------------------- | --------------------- |
| POST   | `/api/friendships/send-request`     | Send friend request   |
| POST   | `/api/friendships/respond`          | Accept/Reject request |
| GET    | `/api/friendships/pending/{userId}` | Get pending requests  |
| GET    | `/api/friendships/user/{userId}`    | Get user friendships  |

### Notification-Service (Port: 6004)

| Method | Endpoint                                  | Description              |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/notifications/user/{userId}`        | Get user notifications   |
| GET    | `/api/notifications/user/{userId}/unread` | Get unread notifications |
| PATCH  | `/api/notifications/{id}/read`            | Mark as read             |
| DELETE | `/api/notifications/{id}`                 | Delete notification      |
| WS     | `/ws-notifications`                       | WebSocket endpoint       |

---

## 🔌 Frontend Integration (React)

### 1. Install Dependencies

```bash
npm install sockjs-client @stomp/stompjs
```

### 2. Connect to WebSocket

```javascript
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const connectWebSocket = (userId) => {
  const socket = new SockJS("http://localhost:6004/ws-notifications");
  const stompClient = Stomp.over(socket);

  stompClient.connect({}, (frame) => {
    console.log("Connected:", frame);

    // Subscribe to user-specific notifications
    stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
      const notification = JSON.parse(message.body);

      // Handle notification
      console.log("New notification:", notification);
      addNotification(notification);
      updateBadgeCount();
      showToast(notification.title, notification.message);
    });
  });

  return stompClient;
};
```

### 3. Use in Component

```javascript
import React, { useEffect, useState } from "react";

function NotificationComponent({ userId }) {
  const [stompClient, setStompClient] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const client = connectWebSocket(userId);
    setStompClient(client);

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [userId]);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  return (
    <div>
      {notifications.map((n) => (
        <div key={n.id}>
          <h4>{n.title}</h4>
          <p>{n.message}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Testing Checklist

### Backend Testing

- [ ] **Kafka Running**

  ```bash
  docker ps | grep kafka  # Should show running container
  ```

- [ ] **Topic Created**

  ```bash
  kafka-topics --list --bootstrap-server localhost:9092
  # Should show: friend-request-events
  ```

- [ ] **Event Publishing**

  ```bash
  # Monitor events
  kafka-console-consumer --bootstrap-server localhost:9092 \
    --topic friend-request-events --from-beginning

  # Send friend request (another terminal)
  curl -X POST http://localhost:6009/api/friendships/send-request?requesterId=1&recipientId=2

  # Should see event in consumer terminal
  ```

- [ ] **Event Consumption**

  ```bash
  # Check Notification-Service logs
  tail -f Notification-Service/logs/application.log
  # Should see: "Received friend request event"
  ```

- [ ] **Database Check**

  ```sql
  -- Check friendship created
  SELECT * FROM friendships WHERE requester_id = 1 AND recipient_id = 2;

  -- Check notification created
  SELECT * FROM notifications WHERE user_id = 2
  ORDER BY created_at DESC LIMIT 1;
  ```

### Frontend Testing

- [ ] **WebSocket Connection**

  ```javascript
  // In browser console
  const socket = new SockJS("http://localhost:6004/ws-notifications");
  const stomp = Stomp.over(socket);
  stomp.connect({}, () => console.log("Connected!"));
  // Should see: "Connected!"
  ```

- [ ] **Receive Notification**

  ```javascript
  stomp.subscribe("/user/2/queue/notifications", (msg) => {
    console.log("Received:", JSON.parse(msg.body));
  });

  // In another tab, send friend request to user 2
  // Should see notification in console
  ```

- [ ] **Badge Update**

  - Send friend request to user
  - Check badge count increases
  - Mark as read
  - Check badge count decreases

- [ ] **Panel Update**
  - Open notifications panel
  - Send friend request
  - Notification should appear immediately
  - No page refresh needed

---

## 🎯 Event Types & Expected Behavior

### 1. FRIEND_REQUEST_SENT

**Trigger:** User A sends friend request to User B

**Event Published:**

```json
{
  "eventType": "FRIEND_REQUEST_SENT",
  "requesterId": 1,
  "recipientId": 2,
  "message": "John Doe sent you a friend request"
}
```

**Notification Created For:** User B (recipient)

**Frontend Display:**

- Badge count: +1
- Notification: "New Friend Request" from John Doe
- Panel: Shows new unread notification
- Priority: MEDIUM (yellow/amber icon)

---

### 2. FRIEND_REQUEST_ACCEPTED

**Trigger:** User B accepts friend request from User A

**Event Published:**

```json
{
  "eventType": "FRIEND_REQUEST_ACCEPTED",
  "requesterId": 1,
  "recipientId": 2,
  "message": "Jane Smith accepted your friend request!"
}
```

**Notification Created For:** User A (requester)

**Frontend Display:**

- Badge count: +1
- Notification: "Friend Request Accepted" by Jane Smith
- Panel: Shows new unread notification
- Priority: MEDIUM (green icon)
- Toast/Success message

---

### 3. FRIEND_REQUEST_REJECTED

**Trigger:** User B rejects friend request from User A

**Event Published:**

```json
{
  "eventType": "FRIEND_REQUEST_REJECTED",
  "requesterId": 1,
  "recipientId": 2,
  "message": "Your friend request was declined"
}
```

**Notification Created For:** User A (requester)

**Frontend Display:**

- Badge count: +1
- Notification: "Friend Request Declined"
- Panel: Shows new unread notification
- Priority: LOW (gray icon)
- Generic message (doesn't reveal who declined)

---

## 📊 Monitoring & Logs

### Kafka Monitoring

```bash
# Consumer lag
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --describe --group notification-friend-request-group

# Topic info
kafka-topics --describe --topic friend-request-events \
  --bootstrap-server localhost:9092
```

### Service Logs

**FriendShip-Service:**

```
Publishing friend request event: FRIEND_REQUEST_SENT for friendship ID: 123
Successfully published friend request event: FRIEND_REQUEST_SENT to topic: friend-request-events with offset: 42
```

**Notification-Service:**

```
Received friend request event: {"eventType":"FRIEND_REQUEST_SENT",...}
Friend request received notification sent to user: 2
Notification sent via WebSocket to user 2: /user/2/queue/notifications
Friend request notifications processed for event: FRIEND_REQUEST_SENT
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Event not published

**Symptoms:** No event in Kafka topic

**Check:**

```bash
# FriendShip-Service logs
grep "Publishing friend request event" friendship-service.log

# Kafka topic
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic friend-request-events --from-beginning
```

**Fix:**

- Verify Kafka running: `docker ps`
- Check Kafka config in `application.yml`
- Restart FriendShip-Service

---

### Issue 2: Event not consumed

**Symptoms:** Event in Kafka but no notification created

**Check:**

```bash
# Notification-Service logs
grep "Received friend request event" notification-service.log

# Consumer group status
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --describe --group notification-friend-request-group
```

**Fix:**

- Check consumer configuration
- Reset offset: `--reset-offsets --to-earliest`
- Verify trusted packages in JsonDeserializer

---

### Issue 3: WebSocket not sending

**Symptoms:** Notification created but frontend doesn't receive

**Check:**

```bash
# Notification-Service logs
grep "Notification sent via WebSocket" notification-service.log
```

**Fix:**

- Verify WebSocket connection in browser
- Check CORS configuration
- Verify subscription path: `/user/{userId}/queue/notifications`
- Check user ID matches

---

### Issue 4: Frontend not updating

**Symptoms:** WebSocket receives notification but UI doesn't update

**Fix:**

- Check state management (Redux/Context)
- Verify notification handler function
- Console log received notifications
- Check badge count update logic

---

## 🎨 Notification Icons & Colors

| Event Type              | Icon | Color   | Badge Color |
| ----------------------- | ---- | ------- | ----------- |
| FRIEND_REQUEST_SENT     | 👤   | Primary | Blue        |
| FRIEND_REQUEST_ACCEPTED | ✓    | Success | Green       |
| FRIEND_REQUEST_REJECTED | ℹ️   | Info    | Gray        |

---

## 📈 Performance Tips

### Kafka Optimization

```yaml
# FriendShip-Service application.yml
spring:
  kafka:
    producer:
      batch-size: 16384
      buffer-memory: 33554432
      compression-type: snappy
```

### WebSocket Optimization

```java
@Configuration
public class WebSocketConfig {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue")
              .setTaskScheduler(taskScheduler())  // Heartbeat
              .setHeartbeatValue(new long[]{10000, 10000});
    }
}
```

---

## ✅ Success Indicators

1. **Kafka Topic Has Messages**

   ```bash
   kafka-console-consumer --bootstrap-server localhost:9092 \
     --topic friend-request-events --from-beginning --max-messages 1
   ```

2. **Notification Created in Database**

   ```sql
   SELECT COUNT(*) FROM notifications
   WHERE type = 'FRIEND_REQUEST_RECEIVED';
   ```

3. **WebSocket Connection Established**

   - Browser console shows: "Connected: CONNECTED"
   - Network tab shows WebSocket connection

4. **Real-time Delivery Works**
   - Notification appears immediately (< 1 second)
   - Badge count updates
   - No page refresh needed

---

## 🎯 Next Steps

1. ✅ System is running
2. ✅ Test with real users
3. ✅ Monitor Kafka lag
4. ✅ Set up alerts for failures
5. ✅ Add notification preferences
6. ✅ Implement email notifications
7. ✅ Add push notifications

---

**Status:** ✅ Ready to Use
**Estimated Setup Time:** 5 minutes
**Last Updated:** October 31, 2024
