# Unified Activity Event Architecture

## Overview

This document describes the unified event architecture that consolidates multiple Kafka event producers into a single unified system. Previously, each service action would produce 3 separate events to different topics. Now, a single unified event is produced that all consumers can process.

## Architecture Transformation

### Before (Old Architecture)

```
[Service Action (e.g., Create Expense)]
         │
         ├──► AuditEventProducer ──► audit-events topic ──► Audit Service
         │
         ├──► NotificationEventProducer ──► expense-events topic ──► Notification Service
         │
         └──► FriendActivityEventProducer ──► friend-activity-events topic ──► Notification Service
```

**Problems:**

- 3 separate Kafka messages for one action
- Duplicate data transmission
- Higher network overhead
- Complex event correlation
- Inconsistent event structures

### After (Unified Architecture)

```
[Service Action (e.g., Create Expense)]
         │
         └──► UnifiedActivityEventProducer ──► unified-activity-events topic
                                                      │
                                                      ├──► Notification Service (routes to appropriate processor)
                                                      │
                                                      └──► Audit Service (logs audit events)
```

**Benefits:**

- Single Kafka message per action
- Reduced network overhead (1 message instead of 3)
- Easy event correlation via `eventId`
- Consistent event structure across all services
- Simplified routing logic

## Components

### 1. UnifiedActivityEvent DTO

Located in each service's `kafka/events/` package.

**Key Fields:**

| Category            | Fields                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Core**            | `eventId`, `timestamp`                                                                                           |
| **Actor**           | `actorUserId`, `actorUserName`, `actorEmail`, `actorRole`, `actorUser`                                           |
| **Target**          | `targetUserId`, `targetUserName`, `targetUser`                                                                   |
| **Entity**          | `entityType`, `entityId`, `entityName`                                                                           |
| **Action**          | `action`, `description`, `amount`                                                                                |
| **Payloads**        | `oldValues`, `newValues`, `entityPayload`, `metadata`                                                            |
| **Source**          | `sourceService`, `serviceVersion`, `environment`                                                                 |
| **Request Context** | `ipAddress`, `userAgent`, `sessionId`, `correlationId`, `requestId`, `httpMethod`, `endpoint`, `executionTimeMs` |
| **Status**          | `status`, `errorMessage`, `responseCode`                                                                         |
| **Routing Flags**   | `isOwnAction`, `requiresAudit`, `requiresNotification`, `isFriendActivity`                                       |

### 2. UnifiedActivityEventProducer

Located in each service's `kafka/producer/` package.

**Features:**

- Auto-enriches events with service metadata
- Validates required fields
- Partitions by `targetUserId` for ordering
- Async and sync sending options

**Usage:**

```java
@Autowired
private UnifiedActivityEventProducer unifiedEventProducer;

UnifiedActivityEvent event = UnifiedActivityEvent.builder()
    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
    .entityId(expense.getId().longValue())
    .entityName(expense.getTitle())
    .action(UnifiedActivityEvent.Action.CREATE)
    .description("Created expense: " + expense.getTitle())
    .amount(expense.getAmount())
    .actorUserId(currentUser.getId())
    .targetUserId(targetUser.getId())
    .newValues(convertToMap(expense))
    .build();

unifiedEventProducer.sendEvent(event);
```

### 3. UnifiedActivityEventConsumer (Notification Service)

Located at `Notification-Service/src/main/java/com/jaya/service/UnifiedActivityEventConsumer.java`

**Routing Logic:**

1. If `isFriendActivity == true` OR `actorUserId != targetUserId` → Route to `FriendActivityEventProcessor`
2. If `isOwnAction == true` AND `requiresNotification == true` → Route to entity-specific processor based on `entityType`

### 4. UnifiedActivityEventConsumer (Audit Service)

Located at `Audit-Service/src/main/java/com/jaya/kafka/UnifiedActivityEventConsumer.java`

**Processing Logic:**

1. Check if `requiresAudit == true`
2. Convert to `AuditEvent` model
3. Store via `AuditExpenseService`

## Kafka Topic Configuration

### Topic: `unified-activity-events`

**Configuration:**

```yaml
kafka:
  topics:
    unified-activity-events: unified-activity-events
```

**Partitioning Strategy:**

- Partition key: `targetUserId`
- Ensures all events for a user go to the same partition
- Maintains event ordering per user

**Consumer Groups:**

- `notification-unified-batch-group` - Notification Service
- `audit-service-unified-group` - Audit Service

## Migration Guide

### Step 1: Add Unified Producer to Service

1. Copy `UnifiedActivityEvent.java` to `kafka/events/`
2. Copy `UnifiedActivityEventProducer.java` to `kafka/producer/`
3. Add topic configuration to `application.yml`:
   ```yaml
   kafka:
     topics:
       unified-activity-events: unified-activity-events
   ```

### Step 2: Update Controller/Service

**Old Code:**

```java
// Send 3 separate events
auditEventProducer.sendEvent(buildAuditEvent(...));
notificationProducer.sendEvent(buildNotificationEvent(...));
friendActivityProducer.sendEvent(buildFriendActivityEvent(...));
```

**New Code:**

```java
// Send single unified event
UnifiedActivityEvent event = UnifiedActivityEvent.builder()
    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
    .entityId(expense.getId().longValue())
    .action(UnifiedActivityEvent.Action.CREATE)
    .actorUserId(currentUser.getId())
    .targetUserId(targetUser.getId())
    // ... other fields
    .build();

unifiedEventProducer.sendEvent(event);
```

### Step 3: Determine Routing Flags

Set these flags based on the use case:

```java
// Own action - regular notification
.isOwnAction(true)
.isFriendActivity(false)
.requiresNotification(true)
.requiresAudit(true)

// Friend action - friend activity notification
.isOwnAction(false)
.isFriendActivity(true)
.requiresNotification(true)
.requiresAudit(true)

// Silent action - audit only
.isOwnAction(true)
.isFriendActivity(false)
.requiresNotification(false)
.requiresAudit(true)
```

## Entity Types

| Entity Type    | Constant                                         |
| -------------- | ------------------------------------------------ |
| Expense        | `UnifiedActivityEvent.EntityType.EXPENSE`        |
| Budget         | `UnifiedActivityEvent.EntityType.BUDGET`         |
| Bill           | `UnifiedActivityEvent.EntityType.BILL`           |
| Category       | `UnifiedActivityEvent.EntityType.CATEGORY`       |
| Payment Method | `UnifiedActivityEvent.EntityType.PAYMENT_METHOD` |
| Friendship     | `UnifiedActivityEvent.EntityType.FRIENDSHIP`     |
| User           | `UnifiedActivityEvent.EntityType.USER`           |

## Action Types

| Action | Constant                             |
| ------ | ------------------------------------ |
| Create | `UnifiedActivityEvent.Action.CREATE` |
| Update | `UnifiedActivityEvent.Action.UPDATE` |
| Delete | `UnifiedActivityEvent.Action.DELETE` |
| View   | `UnifiedActivityEvent.Action.VIEW`   |

## Services with Unified Event Support

| Service                    | UnifiedActivityEvent | UnifiedActivityEventProducer |
| -------------------------- | -------------------- | ---------------------------- |
| social-media-app (Expense) | ✅                   | ✅                           |
| Budget-Service             | ✅                   | ✅                           |
| Bill-Service               | ✅                   | ✅                           |
| Category-Service           | ✅                   | ✅                           |
| Payment-method-Service     | ✅                   | ✅                           |
| Notification-Service       | ✅ (Consumer)        | N/A                          |
| Audit-Service              | ✅ (Consumer)        | N/A                          |

## Backward Compatibility

The existing separate event consumers are still active and can process old-format events. The unified consumer runs in parallel with a different consumer group. This allows for gradual migration:

1. Deploy unified consumer alongside existing consumers
2. Update producers one by one to send unified events
3. Monitor both systems
4. Deprecate old consumers once migration is complete

## Monitoring

### Key Metrics to Track

1. **Event Count**: Messages processed per consumer group
2. **Processing Time**: Average time to process events
3. **Error Rate**: Failed event processing
4. **Lag**: Consumer lag per partition

### Logging

Events are logged at INFO level with key fields:

```
eventId={}, entityType={}, action={}, targetUserId={}, isOwnAction={}
```

## Troubleshooting

### Event Not Processed

1. Check `requiresAudit` and `requiresNotification` flags
2. Verify `entityType` matches expected values
3. Check consumer group offset

### Friend Activity Not Triggered

1. Verify `isOwnAction=false` or `actorUserId != targetUserId`
2. Check `isFriendActivity=true`
3. Verify target user exists

### Audit Not Logged

1. Verify `requiresAudit=true`
2. Check Audit Service consumer is running
3. Verify event can be converted to `AuditEvent`

## Future Enhancements

1. **Event Schema Registry**: Add Avro/Protobuf schema for type safety
2. **Dead Letter Queue**: Route failed events for manual review
3. **Event Replay**: Support replaying events for reprocessing
4. **Metrics Dashboard**: Grafana dashboard for event monitoring
