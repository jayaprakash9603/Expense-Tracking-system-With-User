# Modular Notification Consumer Architecture

## Overview

This document describes the modular, SOLID-principle based notification consumer system that processes events from various services and sends notifications based on user preferences.

## Architecture Diagram

```
Kafka Topics (expense-events, budget-events, etc.)
    ↓
NotificationEventConsumer (@KafkaListener methods)
    ↓
NotificationEventProcessor<T> (Interface)
    ↓
AbstractNotificationEventProcessor<T> (Template Method)
    ↓ ← Uses NotificationPreferencesChecker
Concrete Processors (Expense, Budget, Bill, etc.)
    ↓
Save to DB + WebSocket (Only if preferences allow)
```

## Design Principles Applied

### 1. SOLID Principles

#### Single Responsibility Principle (SRP)

- **NotificationPreferencesChecker**: Only responsible for checking if notifications should be sent
- **Each Processor**: Only handles one event type (Expense, Budget, Bill, etc.)
- **NotificationEventConsumer**: Only responsible for consuming Kafka messages and delegating to processors

#### Open/Closed Principle (OCP)

- **Open for extension**: Add new event types by creating new processors
- **Closed for modification**: No need to modify existing code when adding new event types
- Example: Adding a new "Group Expense" event type only requires creating `GroupExpenseEventProcessor`

#### Liskov Substitution Principle (LSP)

- All processors extend `AbstractNotificationEventProcessor<T>`
- Any processor can be used interchangeably where the base class is expected
- Polymorphic behavior through the `NotificationEventProcessor<T>` interface

#### Interface Segregation Principle (ISP)

- `NotificationEventProcessor<T>` interface has only 3 essential methods
- No client is forced to depend on methods it doesn't use
- Clean contract for event processing

#### Dependency Inversion Principle (DIP)

- High-level modules (consumer) depend on abstractions (interface)
- Not on concrete implementations (specific processors)
- Spring dependency injection manages all dependencies

### 2. DRY Principle (Don't Repeat Yourself)

#### Template Method Pattern

- `AbstractNotificationEventProcessor<T>.process()` method contains common logic
- Subclasses only implement event-specific `buildNotification()` method
- Eliminates code duplication across all processors

**Common Logic in Template Method:**

1. Check user preferences (via NotificationPreferencesChecker)
2. Build notification (delegated to subclass)
3. Save notification to database
4. Send real-time notification via WebSocket

## Component Details

### 1. NotificationPreferencesChecker

**Location**: `com.jaya.service.NotificationPreferencesChecker`

**Purpose**: Centralized service to check if notifications should be sent based on user preferences

**Key Method:**

```java
boolean shouldSendNotification(Integer userId, String notificationType)
```

**Checks Performed:**

- Master notification toggle (`allNotificationsEnabled`)
- Do Not Disturb mode (`doNotDisturbEnabled`)
- Service-level toggle (e.g., `expenseServiceEnabled`)
- Specific notification toggle (e.g., `expenseAddedEnabled`)

**Critical Notifications** (bypass DND):

- `budgetExceeded`
- `billOverdue`
- `securityAlert`

**40+ Notification Types Supported:**

- Expense: added, updated, deleted, large alert
- Budget: created, updated, exceeded, warning, limit approaching
- Bill: added, updated, paid, reminder, overdue
- Payment Method: added, updated, removed
- Friend: request sent/received/accepted/rejected, removed
- Analytics: weekly summary, monthly report, spending trend
- System: security alert, app update, maintenance

### 2. NotificationEventProcessor Interface

**Location**: `com.jaya.service.processor.NotificationEventProcessor`

**Purpose**: Define contract for all event processors

**Methods:**

```java
void process(T event);                    // Process the event
String getNotificationType(T event);      // Get notification type
Integer getUserId(T event);               // Extract user ID
```

### 3. AbstractNotificationEventProcessor

**Location**: `com.jaya.service.processor.AbstractNotificationEventProcessor`

**Purpose**: Base class implementing Template Method pattern

**Template Method Flow:**

```java
public void process(T event) {
    1. Get notification type
    2. Get user ID
    3. Check preferences → shouldSendNotification()
    4. If NO → log and return
    5. If YES → buildNotification() [abstract - subclass implements]
    6. Save notification to database
    7. Send via WebSocket
}
```

**Abstract Method** (implemented by subclasses):

```java
protected abstract Notification buildNotification(T event);
```

**Utility Methods:**

- `createBaseNotification()`: Creates notification with common fields
- `sendRealTimeNotification()`: Sends via WebSocket to `/user/{userId}/notifications`

### 4. Concrete Event Processors

#### ExpenseEventProcessor

**Events**: CREATE, UPDATE, DELETE
**Special Logic**: Detects large expenses (≥₹5000)
**Notification Types**: expenseAdded, expenseUpdated, expenseDeleted, largeExpenseAlert

#### BudgetEventProcessor

**Events**: CREATE, UPDATE, EXCEEDED, WARNING, LIMIT_APPROACHING
**Priorities**: CRITICAL (exceeded), HIGH (warning), MEDIUM (approaching), LOW (create/update)
**Notification Types**: budgetCreated, budgetUpdated, budgetExceeded, budgetWarning, budgetLimitApproaching

#### BillEventProcessor

**Events**: CREATE, UPDATE, PAID, REMINDER, OVERDUE
**Special Logic**: Calculates days until due / days overdue
**Notification Types**: billAdded, billUpdated, billPaid, billReminder, billOverdue

#### PaymentMethodEventProcessor

**Events**: CREATE, UPDATE, DELETE
**Special Logic**: Uses custom icons from event or defaults
**Notification Types**: paymentMethodAdded, paymentMethodUpdated, paymentMethodRemoved

#### FriendEventProcessor

**Events**: REQUEST_SENT, REQUEST_RECEIVED, REQUEST_ACCEPTED, REQUEST_REJECTED, FRIEND_REMOVED
**Special Logic**: Handles both FriendEventDTO and FriendRequestEventDTO
**Notification Types**: friendRequestSent/Received/Accepted/Rejected, friendRemoved

### 5. NotificationEventConsumer

**Location**: `com.jaya.service.NotificationEventConsumer`

**Purpose**: Main Kafka consumer that receives events and delegates to processors

**Kafka Listeners:**

1. `consumeExpenseEvent()` → topic: `expense-events`
2. `consumeBudgetEvent()` → topic: `budget-events`
3. `consumeBillEvent()` → topic: `bill-events`
4. `consumePaymentMethodEvent()` → topic: `payment-method-events`
5. `consumeFriendEvent()` → topics: `friend-events`, `friendship-events`
6. `consumeFriendRequestEvent()` → topic: `friend-request-events`

**Error Handling**: Try-catch blocks with detailed logging

**Group ID**: `notification-service-group`

## Configuration

### Kafka Topics (application.yaml)

```yaml
kafka:
  topics:
    expense-events: expense-events
    budget-events: budget-events
    bill-events: bill-events
    payment-method-events: payment-method-events
    friend-events: friend-events
    friendship-events: friendship-events
    friend-request-events: friend-request-events
  consumer:
    group-id: notification-service-group
```

### Spring Kafka Configuration

- **Consumer Group**: notification-service-group
- **Auto Offset Reset**: earliest (don't miss messages)
- **Concurrency**: 3 concurrent consumers per topic
- **Ack Mode**: batch
- **Trusted Packages**: "\*" (allow all for JSON deserialization)

## Usage Flow Example

### Scenario: User creates a large expense

1. **User creates expense** in Expense-Service: ₹10,000 for "New Laptop"

2. **Expense-Service publishes** to `expense-events` topic:

   ```json
   {
     "expenseId": 123,
     "userId": 456,
     "action": "CREATE",
     "amount": 10000.0,
     "description": "New Laptop",
     "category": "Electronics"
   }
   ```

3. **NotificationEventConsumer** receives event via `@KafkaListener`

   - Logs: "Received expense event for user 456: CREATE - New Laptop"

4. **ExpenseEventProcessor** processes:

   - Gets notification type: "expenseAdded" (normal) + "largeExpenseAlert" (>=5000)

5. **For expenseAdded notification:**

   - Checks preferences: `shouldSendNotification(456, "expenseAdded")`
   - NotificationPreferencesChecker queries database:
     - User 456 has `allNotificationsEnabled` = true
     - User 456 has `expenseServiceEnabled` = true
     - User 456 has `expenseAddedEnabled` = true
     - User 456 has `doNotDisturbEnabled` = false
   - Returns: **true** ✅

6. **Build notification:**

   ```java
   title: "💸 Expense Added"
   message: "Added expense: New Laptop - ₹10,000.00 (Electronics)"
   priority: "LOW"
   type: "expenseAdded"
   ```

7. **For largeExpenseAlert notification:**
   - Checks preferences: `shouldSendNotification(456, "largeExpenseAlertEnabled")`
   - Returns: **true** ✅
8. **Build large expense notification:**

   ```java
   title: "🚨 Large Expense Alert"
   message: "Large expense detected: New Laptop - ₹10,000.00"
   priority: "HIGH"
   type: "largeExpenseAlert"
   ```

9. **Save both notifications** to database

10. **Send real-time notifications** via WebSocket:

    - Destination: `/user/456/notifications`
    - Both notifications sent

11. **User sees** two notifications in their app immediately

### Scenario: User has expense notifications disabled

**Same expense event, but user preferences:**

- `expenseAddedEnabled` = false
- `largeExpenseAlertEnabled` = true

**Result:**

- expenseAdded notification: ❌ NOT SENT (preference disabled)
- largeExpenseAlert notification: ✅ SENT (still enabled)

### Scenario: User is in Do Not Disturb mode

**Budget exceeded event + DND mode:**

- `doNotDisturbEnabled` = true
- `budgetExceeded` = CRITICAL notification

**Result:**

- budgetExceeded notification: ✅ SENT (bypasses DND because it's critical)

## Adding a New Event Type

### Example: Add "Category" events

**Step 1:** Create CategoryEventDTO

```java
@Data
@Builder
public class CategoryEventDTO {
    private Integer categoryId;
    private Integer userId;
    private String action; // CREATE, UPDATE, DELETE
    private String categoryName;
}
```

**Step 2:** Create CategoryEventProcessor

```java
@Component
public class CategoryEventProcessor
    extends AbstractNotificationEventProcessor<CategoryEventDTO> {

    @Override
    public String getNotificationType(CategoryEventDTO event) {
        switch (event.getAction()) {
            case "CREATE": return "categoryCreated";
            case "UPDATE": return "categoryUpdated";
            case "DELETE": return "categoryDeleted";
            default: return "categoryCreated";
        }
    }

    @Override
    public Integer getUserId(CategoryEventDTO event) {
        return event.getUserId();
    }

    @Override
    protected Notification buildNotification(CategoryEventDTO event) {
        // Build notification based on action
        return createBaseNotification(...);
    }
}
```

**Step 3:** Add Kafka listener in NotificationEventConsumer

```java
@KafkaListener(topics = "category-events", ...)
public void consumeCategoryEvent(CategoryEventDTO event) {
    categoryEventProcessor.process(event);
}
```

**Step 4:** Update NotificationPreferencesChecker

- Add cases for: categoryCreated, categoryUpdated, categoryDeleted

**Step 5:** Update application.yaml

```yaml
kafka:
  topics:
    category-events: category-events
```

**That's it!** ✅ No modification to existing code, only new code added.

## Testing

### Unit Test Example for ExpenseEventProcessor

```java
@Test
void testLargeExpenseDetection() {
    // Given
    ExpenseEventDTO event = ExpenseEventDTO.builder()
        .userId(1)
        .action("CREATE")
        .amount(10000.0)
        .build();

    when(preferencesChecker.shouldSendNotification(1, "largeExpenseAlert"))
        .thenReturn(true);

    // When
    processor.process(event);

    // Then
    verify(notificationRepository, times(2)).save(any()); // 2 notifications
    verify(messagingTemplate, times(2)).convertAndSend(anyString(), any());
}
```

### Integration Test with Embedded Kafka

```java
@SpringBootTest
@EmbeddedKafka
class NotificationConsumerIntegrationTest {
    @Test
    void testExpenseEventConsumption() {
        // Publish to kafka
        kafkaTemplate.send("expense-events", expenseEvent);

        // Wait and verify
        await().atMost(5, SECONDS)
            .untilAsserted(() -> {
                verify(notificationRepository).save(any());
            });
    }
}
```

## Monitoring & Logging

### Key Log Messages

- **Consumer**: "Received {eventType} event for user {userId}: {action}"
- **Preferences Check**: "User {userId} has {notificationType} disabled"
- **Sent**: "Notification sent to user {userId}: {title}"
- **Error**: "Error processing {eventType} event for user {userId}: {error}"

### Metrics to Monitor

- Kafka consumer lag per topic
- Notification processing rate (events/second)
- Preference check hit rate
- Notification delivery success rate
- Average processing time per event type

## Database Schema

### notification_preferences Table

- `user_id` (PK)
- `all_notifications_enabled` (boolean)
- `do_not_disturb_enabled` (boolean)
- `expense_service_enabled` (boolean)
- `expense_added_enabled` (boolean)
- ... (40+ boolean fields)
- `notification_preferences_json` (JSON - delivery methods, frequencies)

### notifications Table

- `notification_id` (PK)
- `user_id` (FK)
- `type` (VARCHAR)
- `title` (VARCHAR)
- `message` (TEXT)
- `priority` (ENUM: LOW, MEDIUM, HIGH, CRITICAL)
- `is_read` (boolean)
- `related_entity_type` (VARCHAR)
- `related_entity_id` (INT)
- `created_at` (TIMESTAMP)
- `read_at` (TIMESTAMP)

## WebSocket Real-Time Notifications

### Endpoint

```
/user/{userId}/notifications
```

### Message Format

```json
{
  "notificationId": 123,
  "type": "expenseAdded",
  "title": "💸 Expense Added",
  "message": "Added expense: Coffee - ₹150.00",
  "priority": "LOW",
  "createdAt": "2024-01-15T10:30:00",
  "isRead": false,
  "relatedEntityType": "EXPENSE",
  "relatedEntityId": 456
}
```

### Frontend Subscription

```javascript
const stompClient = Stomp.over(new SockJS("/ws"));
stompClient.subscribe(`/user/${userId}/notifications`, (message) => {
  const notification = JSON.parse(message.body);
  displayNotification(notification);
});
```

## Benefits of This Architecture

✅ **Maintainable**: Each class has a single, well-defined responsibility
✅ **Extensible**: Add new event types without modifying existing code
✅ **Testable**: Easy to unit test each component in isolation
✅ **Scalable**: Kafka consumer concurrency = 3, can process multiple events in parallel
✅ **User-Centric**: Respects user preferences for every notification
✅ **Type-Safe**: Strong typing with generics prevents runtime errors
✅ **DRY**: Template method eliminates code duplication
✅ **Consistent**: All notifications follow the same processing flow

## Future Enhancements

1. **Analytics Events**: Add processor for weekly/monthly summaries
2. **System Events**: Security alerts, maintenance notifications
3. **Retry Mechanism**: Dead letter queue for failed notifications
4. **Batch Processing**: Group similar notifications (e.g., daily digest)
5. **Notification Channels**: Email, SMS, Push notifications
6. **Priority Queue**: Process CRITICAL notifications first
7. **Rate Limiting**: Prevent notification spam (max X per hour)
8. **Notification Templates**: Externalize message formatting
9. **Multi-language Support**: i18n for notification messages
10. **Read Receipts**: Track when users view notifications
