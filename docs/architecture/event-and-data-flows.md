# Event and Data Flows

This document consolidates Kafka, pipeline, and runtime event flow documentation.

## Unified Activity Event Model

The architecture converged from multiple per-action events to a unified activity event pattern.

```mermaid
flowchart LR
  serviceAction[ServiceAction] --> unifiedProducer[UnifiedActivityEventProducer]
  unifiedProducer --> unifiedTopic[Kafka topic: unified-activity-events]
  unifiedTopic --> notifConsumer[NotificationUnifiedConsumer]
  unifiedTopic --> auditConsumer[AuditUnifiedConsumer]
  notifConsumer --> notifProcessors[DomainProcessors]
  notifProcessors --> notifDb[notifications table]
  notifProcessors --> wsPush[WebSocket push to user channel]
  auditConsumer --> auditDb[audit log storage]
```

## Notification Processing Pipeline

```mermaid
flowchart TD
  kafkaTopics[expense-events budget-events bill-events payment-method-events friend-events] --> notifConsumer[NotificationEventConsumer]
  notifConsumer --> abstractProcessor[AbstractNotificationEventProcessor]
  abstractProcessor --> prefCheck[NotificationPreferencesChecker]
  prefCheck -->|allowed| buildNotif[BuildNotification]
  prefCheck -->|blocked| dropFlow[SkipAndLog]
  buildNotif --> persistNotif[SaveNotification]
  persistNotif --> realtimePush[SendWebSocketMessage]
```

## Template Method Execution

```mermaid
sequenceDiagram
  participant C as Consumer
  participant P as AbstractProcessor
  participant PC as PreferencesChecker
  participant R as NotificationRepository
  participant W as WebSocketTemplate
  C->>P: process(event)
  P->>PC: shouldSendNotification(userId, type)
  alt blocked
    PC-->>P: false
    P-->>C: return
  else allowed
    PC-->>P: true
    P->>P: buildNotification(event)
    P->>R: save(notification)
    P->>W: convertAndSend(userChannel, payload)
  end
```

## Budget/Bill/Expense Event Semantics

Domain events are mapped to user-facing notification types with priority tiers:

- Expense: create, update, delete, large-expense alert
- Budget: created, updated, warning, exceeded, limit approaching
- Bill: reminder, overdue, paid, updated
- Friendship: request and relationship lifecycle events

## Batch and Throughput Considerations

Legacy batch architecture docs introduced:

- batch-oriented consumer handling for notification workloads
- optimization for reduced processing overhead under high event throughput
- quick-reference operational checks for lag and consumer behavior

## CI/CD Event Flow

Jenkins pipeline docs were standardized as operational documentation. The canonical runbook is now:

- `docs/operations/deployment-and-runbooks.md`

## Legacy Sources Consolidated

Key source documents merged into this page:

- `UNIFIED_EVENT_ARCHITECTURE.md`
- `ARCHITECTURE_DIAGRAMS.md`
- `MODULAR_NOTIFICATION_ARCHITECTURE.md`
- `BATCH_PROCESSING_ARCHITECTURE.md`
- `BATCH_PROCESSING_QUICK_REFERENCE.md`
- `PAYMENT_METHOD_ARCHITECTURE.md` (event-flow portions)
