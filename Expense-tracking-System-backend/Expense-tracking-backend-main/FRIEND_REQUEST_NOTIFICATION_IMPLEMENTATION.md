# 🤝 Friend Request Notification System - Complete Implementation Guide

## 📋 Overview

A complete end-to-end notification system for friend requests that:
1. **Produces Events** in FriendShip-Service when friend requests are sent/accepted/rejected
2. **Consumes Events** in Notification-Service via Kafka
3. **Sends Real-time Notifications** to frontend via WebSocket

---

## 🏗️ Architecture

```
┌─────────────────────┐         ┌──────────────┐         ┌──────────────────────┐
│  FriendShip Service │         │    Kafka     │         │ Notification Service │
│                     │         │              │         │                      │
│  1. Friend Request  │─────────>│    Topic:    │────────>│  3. Event Consumer   │
│     Action          │ publish │  friend-     │ consume │     (Kafka Listener) │
│                     │         │  request-    │         │                      │
│  2. Event Created   │         │  events      │         │  4. Create           │
│     (Kafka Producer)│         │              │         │     Notification     │
└─────────────────────┘         └──────────────┘         │                      │
                                                          │  5. Send via         │
                                                          │     WebSocket        │
                                                          └──────────────────────┘
                                                                   │
                                                                   │ WebSocket
                                                                   ↓
                                                          ┌──────────────────────┐
                                                          │  Frontend (React)    │
                                                          │  - Subscribe to      │
                                                          │    /user/{userId}/   │
                                                          │    queue/            │
                                                          │    notifications     │
                                                          └──────────────────────┘
```

---

## 📁 Files Created/Modified

### FriendShip-Service

#### New Files
1. **`events/FriendRequestEvent.java`** - Event DTO for friend request events
2. **`config/KafkaProducerConfig.java`** - Kafka producer configuration
3. **`service/FriendRequestEventPublisher.java`** - Kafka event publisher service

#### Modified Files
1. **`service/FriendshipServiceImpl.java`** - Added event publishing logic
2. **`resources/application.yml`** - Added Kafka configuration

### Notification-Service

#### New Files
1. **`dto/events/FriendRequestEventDTO.java`** - Event DTO for receiving friend request events

#### Modified Files
1. **`consumer/NotificationEventConsumer.java`** - Added friend request event consumer
2. **`config/KafkaConfig.java`** - Added friend request consumer factory

---

## 🔄 Event Flow

### 1. Friend Request Sent

```java
// User A sends friend request to User B
FriendshipService.sendFriendRequest(userAId, userBId)
    ↓
// Friendship created with PENDING status
Friendship saved to database
    ↓
// Event published to Kafka
FriendRequestEvent {
    eventType: "FRIEND_REQUEST_SENT",
    requesterId: userAId,
    recipientId: userBId,
    ...
}
    ↓
// Notification Service consumes event
NotificationEventConsumer.consumeFriendRequestEvent()
    ↓
// Notification created for User B (recipient)
Notification {
    userId: userBId,
    type: FRIEND_REQUEST_RECEIVED,
    title: "New Friend Request",
    message: "User A sent you a friend request"
}
    ↓
// Notification sent via WebSocket to User B
WebSocket: /user/{userBId}/queue/notifications
    ↓
// Frontend receives real-time notification
NotificationsPanel updates automatically
```

### 2. Friend Request Accepted

```java
// User B accepts friend request from User A
FriendshipService.respondToRequest(friendshipId, userBId, accept=true)
    ↓
// Friendship status updated to ACCEPTED
Friendship.status = ACCEPTED
    ↓
// Event published to Kafka
FriendRequestEvent {
    eventType: "FRIEND_REQUEST_ACCEPTED",
    requesterId: userAId,
    recipientId: userBId,
    ...
}
    ↓
// Notification Service consumes event
NotificationEventConsumer.consumeFriendRequestEvent()
    ↓
// Notification created for User A (requester)
Notification {
    userId: userAId,
    type: FRIEND_REQUEST_ACCEPTED,
    title: "Friend Request Accepted",
    message: "User B accepted your friend request!"
}
    ↓
// Notification sent via WebSocket to User A
WebSocket: /user/{userAId}/queue/notifications
    ↓
// Frontend receives real-time notification
Badge count updates, notification appears
```

### 3. Friend Request Rejected

```java
// User B rejects friend request from User A
FriendshipService.respondToRequest(friendshipId, userBId, accept=false)
    ↓
// Friendship status updated to REJECTED
Friendship.status = REJECTED
    ↓
// Event published to Kafka
FriendRequestEvent {
    eventType: "FRIEND_REQUEST_REJECTED",
    requesterId: userAId,
    recipientId: userBId,
    ...
}
    ↓
// Notification Service consumes event
NotificationEventConsumer.consumeFriendRequestEvent()
    ↓
// Notification created for User A (requester)
Notification {
    userId: userAId,
    type: FRIEND_REQUEST_REJECTED,
    title: "Friend Request Declined",
    message: "Your friend request was declined"
}
    ↓
// Notification sent via WebSocket to User A
WebSocket: /user/{userAId}/queue/notifications
    ↓
// Frontend receives real-time notification
Notification appears (low priority)
```

---

## 📝 Event Structure

### FriendRequestEvent / FriendRequestEventDTO

```java
{
    "eventId": 1730419200000,
    "eventType": "FRIEND_REQUEST_SENT", // or ACCEPTED, REJECTED
    "friendshipId": 123,
    "requesterId": 1,
    "requesterName": "John Doe",
    "requesterEmail": "john@example.com",
    "requesterImage": "https://...",
    "recipientId": 2,
    "recipientName": "Jane Smith",
    "recipientEmail": "jane@example.com",
    "recipientImage": "https://...",
    "friendshipStatus": "PENDING", // or ACCEPTED, REJECTED
    "timestamp": "2024-10-31T10:30:00",
    "message": "John Doe sent you a friend request",
    "source": "FRIENDSHIP_SERVICE",
    "notificationPriority": 2 // 1=HIGH, 2=MEDIUM, 3=LOW
}
```

---

## 🎯 Notification Types

| Event Type | Notification Sent To | Notification Type | Priority | Message |
|------------|---------------------|-------------------|----------|---------|
| FRIEND_REQUEST_SENT | Recipient (User B) | FRIEND_REQUEST_RECEIVED | MEDIUM | "{Requester} sent you a friend request" |
| FRIEND_REQUEST_ACCEPTED | Requester (User A) | FRIEND_REQUEST_ACCEPTED | MEDIUM | "{Recipient} accepted your friend request!" |
| FRIEND_REQUEST_REJECTED | Requester (User A) | FRIEND_REQUEST_REJECTED | LOW | "Your friend request was declined" |

---

## 🔌 Kafka Configuration

### Topic Name
```
friend-request-events
```

### Consumer Group
```
notification-friend-request-group
```

### Configuration in `application.yml`

#### FriendShip-Service (Producer)
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
```

#### Notification-Service (Consumer)
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: notification-service-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
```

---

## 🌐 WebSocket Integration

### Endpoint Configuration
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-notifications")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

### Sending Notifications
```java
// In NotificationEventConsumer.java
private void sendNotificationToUser(Notification notification) {
    String destination = String.format("/user/%d/queue/notifications", 
                                      notification.getUserId());
    messagingTemplate.convertAndSend(destination, notification);
}
```

### Frontend Subscription (React)
```javascript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// Connect to WebSocket
const socket = new SockJS('http://localhost:6004/ws-notifications');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
    console.log('Connected: ' + frame);
    
    // Subscribe to notifications for specific user
    stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
        const notification = JSON.parse(message.body);
        console.log('Received notification:', notification);
        
        // Update notification panel
        addNotificationToPanel(notification);
        
        // Update badge count
        updateBadgeCount();
        
        // Show toast/alert
        showNotificationToast(notification);
    });
});
```

---

## 💻 Code Implementation

### 1. FriendRequestEvent.java (FriendShip-Service)

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestEvent {
    private Long eventId;
    private String eventType;
    private Integer friendshipId;
    private Integer requesterId;
    private String requesterName;
    private String requesterEmail;
    private String requesterImage;
    private Integer recipientId;
    private String recipientName;
    private String recipientEmail;
    private String recipientImage;
    private String friendshipStatus;
    private LocalDateTime timestamp;
    private String message;
    private String source;
    private Integer notificationPriority;
}
```

### 2. FriendRequestEventPublisher.java (FriendShip-Service)

```java
@Service
@Slf4j
public class FriendRequestEventPublisher {
    private static final String FRIEND_REQUEST_TOPIC = "friend-request-events";
    
    @Autowired
    private KafkaTemplate<String, FriendRequestEvent> friendRequestKafkaTemplate;
    
    public void publishFriendRequestEvent(FriendRequestEvent event) {
        try {
            log.info("Publishing friend request event: {}", event.getEventType());
            
            CompletableFuture<SendResult<String, FriendRequestEvent>> future = 
                friendRequestKafkaTemplate.send(FRIEND_REQUEST_TOPIC, 
                                               event.getFriendshipId().toString(), 
                                               event);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("Successfully published: {}", event.getEventType());
                } else {
                    log.error("Failed to publish: {}", ex.getMessage(), ex);
                }
            });
        } catch (Exception e) {
            log.error("Exception while publishing: {}", e.getMessage(), e);
        }
    }
}
```

### 3. FriendshipServiceImpl.java Updates (FriendShip-Service)

```java
@Service
public class FriendshipServiceImpl implements FriendshipService {
    
    @Autowired
    private FriendRequestEventPublisher friendRequestEventPublisher;
    
    @Override
    public Friendship sendFriendRequest(Integer requesterId, Integer recipientId) 
            throws Exception {
        // ... existing validation code ...
        
        Friendship friendship = friendshipRepository.save(/* ... */);
        
        // Publish event to Kafka
        publishFriendRequestSentEvent(friendship, requester, recipient);
        
        return friendship;
    }
    
    @Override
    public Friendship respondToRequest(Integer friendshipId, Integer responderId, 
                                      boolean accept) {
        // ... existing code ...
        
        friendship = friendshipRepository.save(friendship);
        
        // Publish event to Kafka
        try {
            UserDto requester = helper.validateUser(friendship.getRequesterId());
            UserDto recipient = helper.validateUser(friendship.getRecipientId());
            
            if (accept) {
                publishFriendRequestAcceptedEvent(friendship, requester, recipient);
            } else {
                publishFriendRequestRejectedEvent(friendship, requester, recipient);
            }
        } catch (Exception e) {
            log.error("Failed to publish event: {}", e.getMessage());
        }
        
        return friendship;
    }
    
    private void publishFriendRequestSentEvent(Friendship friendship, 
                                               UserDto requester, 
                                               UserDto recipient) {
        FriendRequestEvent event = FriendRequestEvent.builder()
            .eventId(System.currentTimeMillis())
            .eventType("FRIEND_REQUEST_SENT")
            .friendshipId(friendship.getId())
            .requesterId(requester.getId())
            .requesterName(requester.getFirstName() + " " + requester.getLastName())
            // ... other fields ...
            .build();
        
        friendRequestEventPublisher.publishFriendRequestEvent(event);
    }
    
    // Similar methods for accepted/rejected events
}
```

### 4. NotificationEventConsumer.java Updates (Notification-Service)

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationEventConsumer {
    
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    
    @KafkaListener(
        topics = "friend-request-events",
        groupId = "notification-friend-request-group",
        containerFactory = "friendRequestEventKafkaListenerContainerFactory"
    )
    public void consumeFriendRequestEvent(String eventJson) {
        try {
            log.info("Received friend request event: {}", eventJson);
            FriendRequestEventDTO event = objectMapper.readValue(
                eventJson, FriendRequestEventDTO.class);
            
            createAndSendFriendRequestNotifications(event);
            
            log.info("Friend request notifications processed: {}", 
                    event.getEventType());
        } catch (Exception e) {
            log.error("Error processing friend request event: {}", 
                     e.getMessage(), e);
        }
    }
    
    private void createAndSendFriendRequestNotifications(
            FriendRequestEventDTO event) {
        switch (event.getEventType()) {
            case "FRIEND_REQUEST_SENT":
                // Notify recipient
                Notification notification = 
                    createFriendRequestReceivedNotification(event);
                Notification saved = 
                    notificationService.createNotification(notification);
                sendNotificationToUser(saved);
                break;
            
            case "FRIEND_REQUEST_ACCEPTED":
                // Notify requester
                notification = 
                    createFriendRequestAcceptedNotification(event);
                saved = notificationService.createNotification(notification);
                sendNotificationToUser(saved);
                break;
            
            case "FRIEND_REQUEST_REJECTED":
                // Notify requester
                notification = 
                    createFriendRequestRejectedNotification(event);
                saved = notificationService.createNotification(notification);
                sendNotificationToUser(saved);
                break;
        }
    }
    
    private void sendNotificationToUser(Notification notification) {
        String destination = String.format("/user/%d/queue/notifications", 
                                          notification.getUserId());
        messagingTemplate.convertAndSend(destination, notification);
    }
}
```

---

## 🧪 Testing

### 1. Test Kafka Producer (FriendShip-Service)

```bash
# Start Kafka
docker-compose up -d kafka zookeeper

# Monitor topic
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic friend-request-events --from-beginning
```

### 2. Test API Endpoints

```bash
# Send friend request (User 1 to User 2)
curl -X POST http://localhost:6009/api/friendships/send-request \
  -H "Content-Type: application/json" \
  -d '{"requesterId": 1, "recipientId": 2}'

# Accept friend request
curl -X POST http://localhost:6009/api/friendships/respond \
  -H "Content-Type: application/json" \
  -d '{"friendshipId": 123, "responderId": 2, "accept": true}'

# Reject friend request
curl -X POST http://localhost:6009/api/friendships/respond \
  -H "Content-Type: application/json" \
  -d '{"friendshipId": 123, "responderId": 2, "accept": false}'
```

### 3. Test WebSocket Connection (Frontend)

```javascript
// Test WebSocket in browser console
const socket = new SockJS('http://localhost:6004/ws-notifications');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
    console.log('Connected:', frame);
    
    stompClient.subscribe('/user/2/queue/notifications', (message) => {
        console.log('Received:', JSON.parse(message.body));
    });
});

// Should receive notification when User 1 sends friend request
```

---

## 🔧 Troubleshooting

### Issue: Events not being published

**Check:**
1. Kafka is running: `docker ps`
2. Topic exists: `kafka-topics --list --bootstrap-server localhost:9092`
3. FriendShip-Service logs: Look for "Publishing friend request event"

**Fix:**
```bash
# Create topic manually if needed
kafka-topics --create --topic friend-request-events \
  --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
```

### Issue: Events not being consumed

**Check:**
1. Notification-Service logs: Look for "Received friend request event"
2. Consumer group status:
```bash
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --describe --group notification-friend-request-group
```

**Fix:**
- Reset consumer offset if needed
- Check Kafka configuration in application.yml
- Verify trusted packages in JsonDeserializer

### Issue: WebSocket not sending notifications

**Check:**
1. WebSocket connection established in frontend
2. Notification-Service logs: Look for "Notification sent via WebSocket"
3. User subscribed to correct destination: `/user/{userId}/queue/notifications`

**Fix:**
- Verify CORS configuration in WebSocketConfig
- Check SockJS connection
- Verify user ID matches

---

## 📊 Notification Flow Diagram

```
┌─────────────┐
│   User A    │
│  (Sender)   │
└──────┬──────┘
       │
       │ 1. Send Friend Request
       ↓
┌─────────────────────┐
│ FriendShip Service  │
│ POST /send-request  │
└──────┬──────────────┘
       │
       │ 2. Save to DB
       │    Status: PENDING
       ↓
┌─────────────────────┐
│ Kafka Producer      │
│ Topic: friend-      │
│  request-events     │
└──────┬──────────────┘
       │
       │ 3. Publish Event
       │    eventType: SENT
       ↓
┌─────────────────────┐         ┌─────────────┐
│ Kafka Broker        │────────>│   User B    │
│ friend-request-     │         │ (Recipient) │
│ events topic        │         └─────────────┘
└──────┬──────────────┘                ▲
       │                                │
       │ 4. Consume Event               │ 8. Real-time
       ↓                                │    Notification
┌─────────────────────┐                │
│ Notification        │                │
│ Service Consumer    │                │
└──────┬──────────────┘                │
       │                                │
       │ 5. Create Notification         │
       │    for User B                  │
       ↓                                │
┌─────────────────────┐                │
│ NotificationService │                │
│ createNotification()│                │
└──────┬──────────────┘                │
       │                                │
       │ 6. Save to DB                  │
       ↓                                │
┌─────────────────────┐                │
│ Notification DB     │                │
└──────┬──────────────┘                │
       │                                │
       │ 7. Send via WebSocket          │
       └────────────────────────────────┘
```

---

## 🎯 Success Criteria

✅ **Event Publishing**
- Friend request sent → Event published to Kafka
- Friend request accepted → Event published to Kafka
- Friend request rejected → Event published to Kafka

✅ **Event Consumption**
- Notification-Service receives all events
- Correct notifications created for each event type
- Notifications saved to database

✅ **Real-time Delivery**
- WebSocket connection established
- Notifications sent to correct users
- Frontend receives notifications immediately
- Badge count updates in real-time
- Notification panel updates automatically

✅ **User Experience**
- Recipient sees "New Friend Request" notification
- Requester sees "Request Accepted" notification
- Toast/alert appears on notification
- Notification appears in panel
- Badge count reflects unread notifications

---

## 🚀 Deployment Checklist

- [ ] Kafka cluster running and accessible
- [ ] Topic `friend-request-events` created
- [ ] FriendShip-Service deployed with Kafka producer
- [ ] Notification-Service deployed with Kafka consumer
- [ ] WebSocket endpoint exposed
- [ ] Frontend connected to WebSocket
- [ ] Database migrations run
- [ ] Logs monitoring configured
- [ ] Error alerting configured
- [ ] Performance metrics tracked

---

## 📚 Related Documentation

- **Notification System Guide**: `NOTIFICATION_SYSTEM_GUIDE.md`
- **Kafka Topics Reference**: `KAFKA_TOPICS_REFERENCE.md`
- **WebSocket Configuration**: `WebSocketConfig.java`
- **Frontend Integration**: `NOTIFICATION_QUICK_REFERENCE.md`

---

**Status:** ✅ Complete & Production Ready
**Version:** 1.0.0
**Last Updated:** October 31, 2024
