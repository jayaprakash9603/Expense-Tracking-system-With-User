# Friendship Service Notification Implementation

## Overview
Implemented complete notification producer logic for the Friendship Service following the same SOLID and DRY principles used in Bill and Budget services. The system sends real-time notifications to users about friendship-related events through Kafka.

## Architecture

### Design Patterns Applied

#### 1. Template Method Pattern
- **NotificationEventProducer<T>**: Abstract base class defining the algorithm skeleton
- Concrete implementations (FriendshipNotificationProducer) provide specific behavior
- Promotes code reuse and consistency across all notification producers

#### 2. Builder Pattern
- FriendshipNotificationEvent uses Lombok @Builder for clean object construction
- Improves readability and maintainability

## SOLID Principles

### Single Responsibility Principle (SRP)
- **FriendshipNotificationEvent**: Only represents notification data
- **FriendshipNotificationProducer**: Only handles Kafka message production
- **FriendshipNotificationService**: Only handles notification business logic
- **KafkaConfig**: Only configures Kafka infrastructure

### Open/Closed Principle (OCP)
- NotificationEventProducer is open for extension (subclassing) but closed for modification
- New notification types can be added without changing existing code

### Liskov Substitution Principle (LSP)
- FriendshipNotificationProducer can replace NotificationEventProducer<FriendshipNotificationEvent>
- All subclasses maintain the contract of the base class

### Interface Segregation Principle (ISP)
- Focused interfaces for each responsibility
- No client is forced to depend on methods it doesn't use

### Dependency Inversion Principle (DIP)
- High-level modules (services) depend on abstractions (KafkaTemplate)
- Low-level modules (producers) implement those abstractions

## DRY Principle

### Code Reuse
1. **NotificationEventProducer** - All common Kafka logic in one place
2. **Helper Methods** - Common metadata building extracted to private methods
3. **getFullName()** - Single method to format user names consistently
4. **getAccessLevelString()** - Centralized AccessLevel to String conversion

## Components

### 1. FriendshipNotificationEvent
**Location**: `/kafka/events/FriendshipNotificationEvent.java`

**Purpose**: DTO for friendship notification events

**Action Types** (9 notification types):
- `FRIEND_REQUEST_SENT` - User sent a friend request (recipient notified)
- `FRIEND_REQUEST_RECEIVED` - User received a friend request
- `FRIEND_REQUEST_ACCEPTED` - Friend request was accepted (requester notified)
- `FRIEND_REQUEST_REJECTED` - Friend request was rejected (requester notified)
- `FRIEND_REQUEST_CANCELLED` - Friend request was cancelled (recipient notified)
- `FRIENDSHIP_REMOVED` - Friendship was terminated (other user notified)
- `ACCESS_LEVEL_CHANGED` - Expense sharing access modified (other user notified)
- `USER_BLOCKED` - User was blocked (typically not sent for privacy)
- `USER_UNBLOCKED` - User was unblocked

**Key Fields**:
```java
private Integer friendshipId;      // Friendship entity ID
private Integer userId;            // User receiving notification
private Integer actorId;           // User who performed action
private String action;             // Action type (see above)
private String actorName;          // Display name of actor
private String actorEmail;         // Email of actor
private String friendshipStatus;   // PENDING, ACCEPTED, REJECTED, BLOCKED
private String requesterAccess;    // Expense sharing access level
private String recipientAccess;    // Expense sharing access level
private LocalDateTime timestamp;   // Event timestamp
private Map<String, Object> metadata; // Additional context
```

**Features**:
- Validation method to ensure required fields
- Helper methods to check action type (`isFriendRequestSent()`, etc.)
- Implements Serializable for Kafka serialization

### 2. NotificationEventProducer<T>
**Location**: `/kafka/producer/NotificationEventProducer.java`

**Purpose**: Abstract base class for all notification producers (Template Method Pattern)

**Template Method**: `sendEvent(T event)`
```
1. validateEvent(event)       [Hook: override for custom validation]
2. getTopicName()             [Abstract: must implement]
3. generatePartitionKey()     [Hook: override for partitioning]
4. beforeSend(event)          [Hook: pre-send logic]
5. Send to Kafka asynchronously
6. afterSendSuccess()         [Hook: success callback]
7. afterSendFailure()         [Hook: error callback]
```

**Hook Methods** (optional overrides):
- `validateEvent()` - Custom validation
- `generatePartitionKey()` - Partitioning strategy
- `beforeSend()` - Pre-send logic
- `afterSendSuccess()` - Success callback
- `afterSendFailure()` - Error callback

**Abstract Methods** (must implement):
- `getTopicName()` - Kafka topic name
- `getEventTypeName()` - Event type for logging

### 3. FriendshipNotificationProducer
**Location**: `/kafka/producer/FriendshipNotificationProducer.java`

**Purpose**: Concrete Kafka producer for friendship notifications

**Kafka Configuration**:
- **Topic**: `friendship-events` (configurable via `kafka.topics.friendship-events`)
- **Partitioning**: By userId (maintains order per user)
- **Serialization**: JSON via JsonSerializer

**Custom Behavior**:
- Validates events using event's own validation
- Partitions by userId to ensure ordering
- Comprehensive logging for debugging

### 4. FriendshipNotificationService
**Location**: `/service/FriendshipNotificationService.java`

**Purpose**: Business logic layer for sending friendship notifications

**Methods** (all @Async):

#### sendFriendRequestSentNotification
- **When**: User sends a friend request
- **Recipient**: The recipient of the friend request
- **Action**: FRIEND_REQUEST_RECEIVED
- **Contains**: Requester's name, email, friendship details

#### sendFriendRequestAcceptedNotification
- **When**: Friend request is accepted
- **Recipient**: The original requester
- **Action**: FRIEND_REQUEST_ACCEPTED
- **Contains**: Acceptor's name, access levels granted

#### sendFriendRequestRejectedNotification
- **When**: Friend request is rejected
- **Recipient**: The original requester
- **Action**: FRIEND_REQUEST_REJECTED
- **Contains**: Rejector's name

#### sendFriendRequestCancelledNotification
- **When**: Requester cancels their friend request
- **Recipient**: The original recipient
- **Action**: FRIEND_REQUEST_CANCELLED
- **Contains**: Canceller's name

#### sendFriendshipRemovedNotification
- **When**: User removes a friendship
- **Recipient**: The other user in the friendship
- **Action**: FRIENDSHIP_REMOVED
- **Contains**: Remover's name, friendship details

#### sendAccessLevelChangedNotification
- **When**: User changes expense sharing access level
- **Recipient**: The other user in the friendship
- **Action**: ACCESS_LEVEL_CHANGED
- **Contains**: Old/new access levels, changer's name

#### sendUserBlockedNotification
- **When**: User blocks another user
- **Recipient**: N/A (typically not sent for privacy)
- **Action**: USER_BLOCKED
- **Note**: Method exists but notification not sent by default

#### sendUserUnblockedNotification
- **When**: User unblocks another user
- **Recipient**: The unblocked user
- **Action**: USER_UNBLOCKED
- **Contains**: Unblocker's name

**Helper Methods**:
- `getFullName(UserDto)` - Formats user's full name (firstName + lastName or username)
- `getAccessLevelString(AccessLevel)` - Safely converts AccessLevel to String
- `buildXxxMetadata()` - Builds metadata for each notification type

### 5. KafkaConfig
**Location**: `/config/KafkaConfig.java`

**Purpose**: Kafka infrastructure configuration

**Configuration**:
- Bootstrap servers from application.yml
- Producer factory with JsonSerializer
- ObjectMapper with Java 8 time support
- Reliability settings (acks=all, retries=3, idempotence)
- Performance optimization (batching, compression)

### 6. FriendshipServiceImpl Integration
**Location**: `/service/FriendshipServiceImpl.java`

**Changes**:
- Added `@Autowired FriendshipNotificationService`
- Integrated notifications in all friendship operations

**Integration Points**:

#### sendFriendRequest()
```java
friendship = friendshipRepository.save(friendship);
friendshipNotificationService.sendFriendRequestSentNotification(friendship, requester);
```

#### respondToRequest()
```java
if (accept) {
    friendshipNotificationService.sendFriendRequestAcceptedNotification(friendship, recipient);
} else {
    friendshipNotificationService.sendFriendRequestRejectedNotification(friendship, recipient);
}
```

#### setAccessLevel()
```java
Friendship savedFriendship = friendshipRepository.save(friendship);
friendshipNotificationService.sendAccessLevelChangedNotification(
    savedFriendship, changer, otherUserId, oldAccess, accessLevel);
```

#### cancelFriendRequest()
```java
friendshipNotificationService.sendFriendRequestCancelledNotification(friendship, canceller);
friendshipRepository.delete(friendship);
```

#### removeFriendship()
```java
friendshipNotificationService.sendFriendshipRemovedNotification(friendship, remover, otherUserId);
friendshipRepository.delete(friendship);
```

#### unblockUser()
```java
friendshipNotificationService.sendUserUnblockedNotification(friendship.getId(), unblocker, unblockedId);
friendshipRepository.delete(friendship);
```

## Configuration

### application.yml
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        retry.backoff.ms: 1000
        max.in.flight.requests.per.connection: 5
        enable.idempotence: true
        spring.json.add.type.headers: false

kafka:
  topics:
    friendship-events: friendship-events
```

## Notification Flow

### Example: Friend Request Sent

```
1. User A sends friend request to User B
   ↓
2. FriendshipServiceImpl.sendFriendRequest()
   ↓
3. Friendship entity saved to database
   ↓
4. FriendshipNotificationService.sendFriendRequestSentNotification()
   ↓
5. Build FriendshipNotificationEvent
   - userId: User B (recipient)
   - actorId: User A (requester)
   - action: FRIEND_REQUEST_RECEIVED
   - actorName: "John Doe"
   - metadata: request details
   ↓
6. FriendshipNotificationProducer.sendEvent()
   ↓
7. Validate event
   ↓
8. Generate partition key (User B's ID)
   ↓
9. Send to Kafka topic: friendship-events
   ↓
10. Notification Service consumes event
   ↓
11. Create notification for User B
   ↓
12. Frontend displays: "John Doe sent you a friend request"
```

## Error Handling

### Graceful Degradation
- Notifications are @Async - don't block main business logic
- Errors are logged but don't fail the friendship operation
- Try-catch blocks protect all notification calls

### Logging
- **DEBUG**: Detailed event preparation logs
- **INFO**: Successful notification sends with key details
- **ERROR**: Failed notifications with full context
- **WARN**: JSON serialization issues

### Example Error Handling
```java
try {
    UserDto remover = helper.validateUser(userId);
    friendshipNotificationService.sendFriendshipRemovedNotification(
        friendship, remover, otherUserId);
} catch (Exception e) {
    System.err.println("Failed to send friendship removed notification: " + e.getMessage());
}
// Continue with friendship removal regardless of notification success
friendshipRepository.delete(friendship);
```

## Testing Scenarios

### Scenario 1: Friend Request Flow
1. User A sends friend request to User B
   - **Expected**: User B receives FRIEND_REQUEST_RECEIVED notification
2. User B accepts the request
   - **Expected**: User A receives FRIEND_REQUEST_ACCEPTED notification
3. User B changes access level for User A
   - **Expected**: User A receives ACCESS_LEVEL_CHANGED notification

### Scenario 2: Friend Request Rejection
1. User A sends friend request to User B
   - **Expected**: User B receives notification
2. User B rejects the request
   - **Expected**: User A receives FRIEND_REQUEST_REJECTED notification

### Scenario 3: Friend Request Cancellation
1. User A sends friend request to User B
   - **Expected**: User B receives notification
2. User A cancels the request before User B responds
   - **Expected**: User B receives FRIEND_REQUEST_CANCELLED notification

### Scenario 4: Friendship Termination
1. User A and User B are friends
2. User A removes the friendship
   - **Expected**: User B receives FRIENDSHIP_REMOVED notification

### Scenario 5: Block/Unblock
1. User A blocks User B
   - **Expected**: No notification sent (privacy)
2. User A unblocks User B
   - **Expected**: User B receives USER_UNBLOCKED notification

## Benefits

### 1. Maintainability
- Clear separation of concerns
- Self-documenting code with comprehensive comments
- Consistent patterns across all notification types

### 2. Scalability
- Asynchronous processing (@Async)
- Kafka partitioning for parallel processing
- Idempotent producers prevent duplicates

### 3. Reliability
- Retry mechanism (3 retries)
- Acknowledgment from all replicas (acks=all)
- Graceful error handling

### 4. Extensibility
- Easy to add new notification types
- Hook methods for custom behavior
- Template method pattern promotes reuse

### 5. Testability
- Each component has a single responsibility
- Mock-friendly dependencies
- Clear input/output contracts

## Comparison with Bill/Budget Services

### Similarities (Consistent Patterns)
1. Same Template Method Pattern base class
2. Same Builder Pattern for events
3. Same Kafka configuration structure
4. Same @Async service layer
5. Same error handling approach

### Differences (Domain-Specific)
1. **More notification types**: 9 vs 6 (Budget) vs 6 (Bill)
2. **Bi-directional relationships**: Friendship involves two users
3. **Privacy considerations**: Block notifications typically not sent
4. **Access level tracking**: Old/new values for changes
5. **Actor-centric**: Always identifies who performed the action

## Future Enhancements

### 1. Notification Preferences
- User-configurable notification settings
- Opt-in/opt-out for specific notification types
- Email/SMS integration

### 2. Notification Aggregation
- Group multiple friend requests into digest
- "5 pending friend requests" instead of 5 separate notifications

### 3. Real-time WebSocket Updates
- Push notifications to connected clients
- Live updates without polling

### 4. Notification History
- Store notification history in database
- Mark as read/unread functionality
- Notification analytics

### 5. Rich Notifications
- Include profile pictures in notifications
- Add action buttons (Accept/Reject directly in notification)
- Deep linking to relevant UI screens

## Files Created

1. **FriendshipNotificationEvent.java** - Event DTO (9 action types)
2. **NotificationEventProducer.java** - Abstract base class
3. **FriendshipNotificationProducer.java** - Concrete Kafka producer
4. **FriendshipNotificationService.java** - Business logic (8 methods + 10 helpers)
5. **KafkaConfig.java** - Kafka infrastructure configuration

## Files Modified

1. **FriendshipServiceImpl.java** - Integrated notifications in 6 methods
2. **application.yml** - Added Kafka topic configuration

## Conclusion

The Friendship Service notification system is now fully integrated and production-ready. It follows the same high-quality patterns used in Bill and Budget services, ensuring consistency across the entire application. The implementation is modular, maintainable, and extensible, making it easy to add new features or modify existing behavior without breaking changes.

All notifications are sent asynchronously to avoid impacting user experience, and comprehensive error handling ensures the system gracefully handles edge cases. The use of Kafka provides scalability and reliability, while SOLID and DRY principles ensure long-term maintainability.
