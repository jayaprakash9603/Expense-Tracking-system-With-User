package com.jaya.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.events.*;
import com.jaya.modal.Notification;
import com.jaya.modal.NotificationPriority;
import com.jaya.modal.NotificationType;
import com.jaya.modal.NotificationPreferences;
import com.jaya.repository.NotificationPreferencesRepository;
import com.jaya.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Kafka Event Consumer for Notification Service
 * Listens to events from all services and creates notifications
 * Sends real-time notifications via WebSocket
 * Respects user notification preferences
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final NotificationPreferencesRepository preferencesRepository;

    // =========================
    // HELPER METHODS
    // =========================

    /**
     * Convert event data to specific type
     * Handles String JSON, LinkedHashMap, and ConsumerRecord objects
     */
    private <T> T convertEventData(Object eventData, Class<T> targetClass) throws Exception {
        // If it's a ConsumerRecord, extract the value first
        if (eventData instanceof ConsumerRecord) {
            ConsumerRecord<?, ?> record = (ConsumerRecord<?, ?>) eventData;
            eventData = record.value();
        }

        // Now convert the actual data
        if (eventData instanceof String) {
            return objectMapper.readValue((String) eventData, targetClass);
        } else {
            return objectMapper.convertValue(eventData, targetClass);
        }
    }

    // =========================
    // EXPENSE EVENTS
    // =========================

    /**
     * Listen to expense events from social-media-app service
     */
    @KafkaListener(topics = "expense-events", groupId = "notification-expense-group", containerFactory = "expenseEventKafkaListenerContainerFactory")
    public void consumeExpenseEvent(Object eventData) {
        try {
            log.info("Received expense event: {}", eventData);

            ExpenseEventDTO event = convertEventData(eventData, ExpenseEventDTO.class);

            Notification notification = createNotificationFromExpenseEvent(event);
            Notification savedNotification = notificationService.createNotification(notification);

            // Send real-time notification via WebSocket
            sendNotificationToUser(savedNotification);

            log.info("Expense notification created and sent: {}", savedNotification.getId());
        } catch (Exception e) {
            log.error("Error processing expense event: {}", e.getMessage(), e);
        }
    }

    /**
     * Create notification from expense event
     */
    private Notification createNotificationFromExpenseEvent(ExpenseEventDTO event) {
        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setChannel("IN_APP,PUSH");
        notification.setIsRead(false);
        notification.setIsSent(false);

        switch (event.getAction()) {
            case "CREATE":
                notification.setType(NotificationType.EXPENSE_ADDED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Expense Added Successfully");
                notification.setMessage(String.format("Your expense of $%.2f for %s has been recorded",
                        event.getAmount(), event.getDescription()));
                break;
            case "UPDATE":
                notification.setType(NotificationType.EXPENSE_UPDATED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Expense Updated");
                notification.setMessage(String.format("Your expense of $%.2f has been updated", event.getAmount()));
                break;
            case "DELETE":
                notification.setType(NotificationType.EXPENSE_DELETED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Expense Deleted");
                notification.setMessage("An expense has been deleted from your records");
                break;
            case "APPROVE":
                notification.setType(NotificationType.EXPENSE_APPROVED);
                notification.setPriority(NotificationPriority.MEDIUM);
                notification.setTitle("Expense Approved");
                notification.setMessage(String.format("Your expense of $%.2f has been approved", event.getAmount()));
                break;
            case "REJECT":
                notification.setType(NotificationType.EXPENSE_REJECTED);
                notification.setPriority(NotificationPriority.HIGH);
                notification.setTitle("Expense Rejected");
                notification.setMessage(String.format("Your expense of $%.2f has been rejected", event.getAmount()));
                break;
            default:
                notification.setType(NotificationType.CUSTOM_ALERT);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Expense Activity");
                notification.setMessage("An expense activity occurred");
        }

        notification.setMetadata(String.format("{\"expenseId\":%d,\"category\":\"%s\",\"paymentMethod\":\"%s\"}",
                event.getExpenseId(), event.getCategory(), event.getPaymentMethod()));

        return notification;
    }

    // =========================
    // BILL EVENTS
    // =========================

    /**
     * Listen to bill events from Bill-Service
     */
    @KafkaListener(topics = "bill-events", groupId = "notification-bill-group", containerFactory = "billEventKafkaListenerContainerFactory")
    public void consumeBillEvent(Object eventData) {
        try {
            log.info("Received bill event: {}", eventData);
            BillEventDTO event = convertEventData(eventData, BillEventDTO.class);

            Notification notification = createNotificationFromBillEvent(event);
            Notification savedNotification = notificationService.createNotification(notification);

            sendNotificationToUser(savedNotification);

            log.info("Bill notification created and sent: {}", savedNotification.getId());
        } catch (Exception e) {
            log.error("Error processing bill event: {}", e.getMessage(), e);
        }
    }

    /**
     * Create notification from bill event
     */
    private Notification createNotificationFromBillEvent(BillEventDTO event) {
        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setChannel("IN_APP,EMAIL,PUSH");
        notification.setIsRead(false);
        notification.setIsSent(false);

        switch (event.getAction()) {
            case "CREATE":
                notification.setType(NotificationType.BILL_CREATED);
                notification.setPriority(NotificationPriority.MEDIUM);
                notification.setTitle("New Bill Created");
                notification.setMessage(String.format("Bill '%s' for $%.2f has been created",
                        event.getName(), event.getAmount()));
                break;
            case "UPDATE":
                notification.setType(NotificationType.BILL_UPDATED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Bill Updated");
                notification.setMessage(String.format("Bill '%s' has been updated", event.getName()));
                break;
            case "DELETE":
                notification.setType(NotificationType.BILL_DELETED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Bill Deleted");
                notification.setMessage(String.format("Bill '%s' has been deleted", event.getName()));
                break;
            case "PAID":
                notification.setType(NotificationType.BILL_PAID);
                notification.setPriority(NotificationPriority.HIGH);
                notification.setTitle("Bill Paid Successfully");
                notification.setMessage(String.format("Bill '%s' of $%.2f has been marked as paid",
                        event.getName(), event.getAmount()));
                break;
            case "REMINDER":
                notification.setType(NotificationType.BILL_DUE_REMINDER);
                notification.setPriority(NotificationPriority.HIGH);
                notification.setTitle("Bill Payment Reminder");
                notification.setMessage(String.format("Reminder: Bill '%s' of $%.2f is due on %s",
                        event.getName(), event.getAmount(), event.getDueDate()));
                break;
            case "OVERDUE":
                notification.setType(NotificationType.BILL_OVERDUE);
                notification.setPriority(NotificationPriority.CRITICAL);
                notification.setTitle("Bill Overdue!");
                notification.setMessage(String.format("Bill '%s' of $%.2f is overdue! Please pay immediately",
                        event.getName(), event.getAmount()));
                break;
            default:
                notification.setType(NotificationType.PAYMENT_DUE);
                notification.setPriority(NotificationPriority.MEDIUM);
                notification.setTitle("Bill Activity");
                notification.setMessage("A bill activity occurred");
        }

        notification.setMetadata(String.format("{\"billId\":%d,\"dueDate\":\"%s\",\"category\":\"%s\"}",
                event.getBillId(), event.getDueDate(), event.getCategory()));

        return notification;
    }

    // =========================
    // BUDGET EVENTS
    // =========================

    /**
     * Listen to budget events from Budget-Service
     */
    @KafkaListener(topics = "budget-events", groupId = "notification-budget-group", containerFactory = "budgetEventKafkaListenerContainerFactory")
    public void consumeBudgetEvent(Object eventData) {
        try {
            log.info("Received budget event: {}", eventData);
            BudgetEventDTO event = convertEventData(eventData, BudgetEventDTO.class);

            Notification notification = createNotificationFromBudgetEvent(event);
            Notification savedNotification = notificationService.createNotification(notification);

            sendNotificationToUser(savedNotification);

            log.info("Budget notification created and sent: {}", savedNotification.getId());
        } catch (Exception e) {
            log.error("Error processing budget event: {}", e.getMessage(), e);
        }
    }

    /**
     * Create notification from budget event
     */
    private Notification createNotificationFromBudgetEvent(BudgetEventDTO event) {
        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setChannel("IN_APP,PUSH");
        notification.setIsRead(false);
        notification.setIsSent(false);

        switch (event.getAction()) {
            case "CREATE":
                notification.setType(NotificationType.BUDGET_CREATED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Budget Created");
                notification.setMessage(String.format("Budget '%s' of $%.2f has been created",
                        event.getBudgetName(), event.getAmount()));
                break;
            case "UPDATE":
                notification.setType(NotificationType.BUDGET_UPDATED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Budget Updated");
                notification.setMessage(String.format("Budget '%s' has been updated", event.getBudgetName()));
                break;
            case "DELETE":
                notification.setType(NotificationType.BUDGET_DELETED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Budget Deleted");
                notification.setMessage(String.format("Budget '%s' has been deleted", event.getBudgetName()));
                break;
            case "EXCEEDED":
                notification.setType(NotificationType.BUDGET_EXCEEDED);
                notification.setPriority(NotificationPriority.CRITICAL);
                notification.setTitle("Budget Exceeded!");
                notification.setMessage(String.format("You've exceeded your budget '%s' by $%.2f",
                        event.getBudgetName(), event.getSpentAmount() - event.getAmount()));
                break;
            case "WARNING":
                notification.setType(NotificationType.BUDGET_WARNING);
                notification.setPriority(NotificationPriority.HIGH);
                notification.setTitle("Budget Alert");
                notification.setMessage(String.format("You've reached %.0f%% of your '%s' budget",
                        event.getPercentageUsed(), event.getBudgetName()));
                break;
            case "LIMIT_APPROACHING":
                notification.setType(NotificationType.BUDGET_LIMIT_APPROACHING);
                notification.setPriority(NotificationPriority.MEDIUM);
                notification.setTitle("Budget Limit Approaching");
                notification.setMessage(String.format("You're approaching the limit for '%s' budget. $%.2f remaining",
                        event.getBudgetName(), event.getRemainingAmount()));
                break;
            default:
                notification.setType(NotificationType.CUSTOM_ALERT);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Budget Activity");
                notification.setMessage("A budget activity occurred");
        }

        notification.setMetadata(String.format("{\"budgetId\":%d,\"category\":\"%s\",\"percentageUsed\":%.2f}",
                event.getBudgetId(), event.getCategory(), event.getPercentageUsed()));

        return notification;
    }

    // =========================
    // CATEGORY EVENTS
    // =========================

    /**
     * Listen to category events from Category-Service
     */
    @KafkaListener(topics = "category-events", groupId = "notification-category-group", containerFactory = "categoryEventKafkaListenerContainerFactory")
    public void consumeCategoryEvent(Object eventData) {
        try {
            log.info("Received category event: {}", eventData);
            CategoryEventDTO event = convertEventData(eventData, CategoryEventDTO.class);

            Notification notification = createNotificationFromCategoryEvent(event);
            Notification savedNotification = notificationService.createNotification(notification);

            sendNotificationToUser(savedNotification);

            log.info("Category notification created and sent: {}", savedNotification.getId());
        } catch (Exception e) {
            log.error("Error processing category event: {}", e.getMessage(), e);
        }
    }

    /**
     * Create notification from category event
     */
    private Notification createNotificationFromCategoryEvent(CategoryEventDTO event) {
        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setChannel("IN_APP");
        notification.setIsRead(false);
        notification.setIsSent(false);

        switch (event.getAction()) {
            case "CREATE":
                notification.setType(NotificationType.CATEGORY_CREATED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Category Created");
                notification.setMessage(String.format("Category '%s' has been created", event.getCategoryName()));
                break;
            case "UPDATE":
                notification.setType(NotificationType.CATEGORY_UPDATED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Category Updated");
                notification.setMessage(String.format("Category '%s' has been updated", event.getCategoryName()));
                break;
            case "DELETE":
                notification.setType(NotificationType.CATEGORY_DELETED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Category Deleted");
                notification.setMessage(String.format("Category '%s' has been deleted", event.getCategoryName()));
                break;
            case "BUDGET_EXCEEDED":
                notification.setType(NotificationType.CATEGORY_BUDGET_EXCEEDED);
                notification.setPriority(NotificationPriority.HIGH);
                notification.setTitle("Category Budget Exceeded");
                notification.setMessage(String.format("Your '%s' category has exceeded its budget of $%.2f",
                        event.getCategoryName(), event.getBudgetLimit()));
                break;
            default:
                notification.setType(NotificationType.CUSTOM_ALERT);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Category Activity");
                notification.setMessage("A category activity occurred");
        }

        notification.setMetadata(String.format("{\"categoryId\":%d,\"totalExpenses\":%.2f}",
                event.getCategoryId(), event.getTotalExpenses()));

        return notification;
    }

    // =========================
    // PAYMENT METHOD EVENTS
    // =========================

    /**
     * Listen to payment method events from Payment-Method-Service
     */
    @KafkaListener(topics = "payment-method-events", groupId = "notification-payment-method-group", containerFactory = "paymentMethodEventKafkaListenerContainerFactory")
    public void consumePaymentMethodEvent(Object eventData) {
        try {
            log.info("Received payment method event: {}", eventData);
            PaymentMethodEventDTO event = convertEventData(eventData, PaymentMethodEventDTO.class);

            Notification notification = createNotificationFromPaymentMethodEvent(event);
            Notification savedNotification = notificationService.createNotification(notification);

            sendNotificationToUser(savedNotification);

            log.info("Payment method notification created and sent: {}", savedNotification.getId());
        } catch (Exception e) {
            log.error("Error processing payment method event: {}", e.getMessage(), e);
        }
    }

    /**
     * Create notification from payment method event
     */
    private Notification createNotificationFromPaymentMethodEvent(PaymentMethodEventDTO event) {
        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setChannel("IN_APP,EMAIL");
        notification.setIsRead(false);
        notification.setIsSent(false);

        String eventType = event.getEventType() != null ? event.getEventType() : "CREATE";

        switch (eventType) {
            case "CREATE":
                notification.setType(NotificationType.PAYMENT_METHOD_ADDED);
                notification.setPriority(NotificationPriority.MEDIUM);
                notification.setTitle("Payment Method Added");
                notification.setMessage(String.format("New payment method '%s' has been added for %s",
                        event.getPaymentMethodName(), event.getPaymentType()));
                break;
            case "UPDATE":
                notification.setType(NotificationType.PAYMENT_METHOD_UPDATED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Payment Method Updated");
                notification.setMessage(
                        String.format("Payment method '%s' has been updated", event.getPaymentMethodName()));
                break;
            case "DELETE":
                notification.setType(NotificationType.PAYMENT_METHOD_DELETED);
                notification.setPriority(NotificationPriority.MEDIUM);
                notification.setTitle("Payment Method Removed");
                notification.setMessage(
                        String.format("Payment method '%s' has been removed", event.getPaymentMethodName()));
                break;
            default:
                notification.setType(NotificationType.CUSTOM_ALERT);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Payment Method Activity");
                notification.setMessage(
                        String.format("Payment method '%s' activity occurred", event.getPaymentMethodName()));
        }

        // Build metadata with available fields
        String metadata = String.format(
                "{\"paymentMethodName\":\"%s\",\"paymentType\":\"%s\",\"expenseId\":%d,\"description\":\"%s\"}",
                event.getPaymentMethodName(),
                event.getPaymentType(),
                event.getExpenseId(),
                event.getDescription() != null ? event.getDescription().replace("\"", "\\\"") : "");
        notification.setMetadata(metadata);

        return notification;
    }

    // =========================
    // FRIEND EVENTS
    // =========================

    /**
     * Listen to friend events from Friendship-Service
     */
    @KafkaListener(topics = "friend-events", groupId = "notification-friend-group", containerFactory = "friendEventKafkaListenerContainerFactory")
    public void consumeFriendEvent(Object eventData) {
        try {
            log.info("Received friend event: {}", eventData);
            FriendEventDTO event = convertEventData(eventData, FriendEventDTO.class);

            Notification notification = createNotificationFromFriendEvent(event);
            Notification savedNotification = notificationService.createNotification(notification);

            sendNotificationToUser(savedNotification);

            log.info("Friend notification created and sent: {}", savedNotification.getId());
        } catch (Exception e) {
            log.error("Error processing friend event: {}", e.getMessage(), e);
        }
    }

    /**
     * Create notification from friend event
     */
    private Notification createNotificationFromFriendEvent(FriendEventDTO event) {
        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setChannel("IN_APP,PUSH");
        notification.setIsRead(false);
        notification.setIsSent(false);

        switch (event.getAction()) {
            case "REQUEST_SENT":
                notification.setType(NotificationType.FRIEND_INVITATION_SENT);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Friend Request Sent");
                notification
                        .setMessage(String.format("Your friend request to %s has been sent", event.getFriendName()));
                break;
            case "REQUEST_RECEIVED":
                notification.setType(NotificationType.FRIEND_REQUEST_RECEIVED);
                notification.setPriority(NotificationPriority.MEDIUM);
                notification.setTitle("New Friend Request");
                notification.setMessage(String.format("%s sent you a friend request", event.getFriendName()));
                break;
            case "REQUEST_ACCEPTED":
                notification.setType(NotificationType.FRIEND_REQUEST_ACCEPTED);
                notification.setPriority(NotificationPriority.HIGH);
                notification.setTitle("Friend Request Accepted");
                notification.setMessage(String.format("%s accepted your friend request!", event.getFriendName()));
                break;
            case "REQUEST_REJECTED":
                notification.setType(NotificationType.FRIEND_REQUEST_REJECTED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Friend Request Declined");
                notification.setMessage("A friend request was declined");
                break;
            case "FRIEND_REMOVED":
                notification.setType(NotificationType.FRIEND_REMOVED);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Friend Removed");
                notification.setMessage(String.format("You are no longer friends with %s", event.getFriendName()));
                break;
            default:
                notification.setType(NotificationType.CUSTOM_ALERT);
                notification.setPriority(NotificationPriority.LOW);
                notification.setTitle("Friend Activity");
                notification.setMessage("A friend activity occurred");
        }

        notification.setMetadata(String.format("{\"friendId\":%d,\"friendName\":\"%s\",\"friendEmail\":\"%s\"}",
                event.getFriendId(), event.getFriendName(), event.getFriendEmail()));

        return notification;
    }

    // =========================
    // FRIEND REQUEST EVENTS
    // =========================

    /**
     * Listen to friend request events from Friendship-Service
     */
    @KafkaListener(topics = "friend-request-events", groupId = "notification-friend-request-group", containerFactory = "friendRequestEventKafkaListenerContainerFactory")
    public void consumeFriendRequestEvent(Object eventData) {
        try {
            log.info("Received friend request event: {}", eventData);
            FriendRequestEventDTO event = convertEventData(eventData, FriendRequestEventDTO.class);

            // Create notifications for both requester and recipient based on event type
            createAndSendFriendRequestNotifications(event);

            log.info("Friend request notifications processed for event: {}", event.getEventType());
        } catch (Exception e) {
            log.error("Error processing friend request event: {}", e.getMessage(), e);
        }
    }

    /**
     * Create and send notifications for friend request events
     * Sends notifications to the appropriate users based on event type
     */
    private void createAndSendFriendRequestNotifications(FriendRequestEventDTO event) {
        switch (event.getEventType()) {
            case "FRIEND_REQUEST_SENT":
                // Send notification to recipient (new friend request received)
                Notification recipientNotification = createFriendRequestReceivedNotification(event);
                Notification savedRecipientNotification = notificationService.createNotification(recipientNotification);
                sendNotificationToUser(savedRecipientNotification);
                log.info("Friend request received notification sent to user: {}", event.getRecipientId());
                break;

            case "FRIEND_REQUEST_ACCEPTED":
                // Send notification to requester (friend request was accepted)
                Notification requesterNotification = createFriendRequestAcceptedNotification(event);
                Notification savedRequesterNotification = notificationService.createNotification(requesterNotification);
                sendNotificationToUser(savedRequesterNotification);
                log.info("Friend request accepted notification sent to user: {}", event.getRequesterId());
                break;

            case "FRIEND_REQUEST_REJECTED":
                // Send notification to requester (friend request was rejected)
                Notification rejectedNotification = createFriendRequestRejectedNotification(event);
                Notification savedRejectedNotification = notificationService.createNotification(rejectedNotification);
                sendNotificationToUser(savedRejectedNotification);
                log.info("Friend request rejected notification sent to user: {}", event.getRequesterId());
                break;

            default:
                log.warn("Unknown friend request event type: {}", event.getEventType());
        }
    }

    /**
     * Create notification when a friend request is received
     */
    private Notification createFriendRequestReceivedNotification(FriendRequestEventDTO event) {
        Notification notification = new Notification();
        notification.setUserId(event.getRecipientId());
        notification.setType(NotificationType.FRIEND_REQUEST_RECEIVED);
        notification.setPriority(mapPriorityFromEvent(event.getNotificationPriority()));
        notification.setTitle("New Friend Request");
        notification.setMessage(String.format("%s sent you a friend request", event.getRequesterName()));
        notification.setCreatedAt(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now());
        notification.setChannel("IN_APP,PUSH");
        notification.setIsRead(false);
        notification.setIsSent(false);
        notification.setMetadata(String.format(
                "{\"friendshipId\":%d,\"requesterId\":%d,\"requesterName\":\"%s\",\"requesterEmail\":\"%s\",\"requesterImage\":\"%s\"}",
                event.getFriendshipId(),
                event.getRequesterId(),
                event.getRequesterName(),
                event.getRequesterEmail(),
                event.getRequesterImage() != null ? event.getRequesterImage() : ""));
        return notification;
    }

    /**
     * Create notification when a friend request is accepted
     */
    private Notification createFriendRequestAcceptedNotification(FriendRequestEventDTO event) {
        Notification notification = new Notification();
        notification.setUserId(event.getRequesterId());
        notification.setType(NotificationType.FRIEND_REQUEST_ACCEPTED);
        notification.setPriority(mapPriorityFromEvent(event.getNotificationPriority()));
        notification.setTitle("Friend Request Accepted");
        notification.setMessage(
                String.format("%s accepted your friend request! You are now friends.", event.getRecipientName()));
        notification.setCreatedAt(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now());
        notification.setChannel("IN_APP,PUSH");
        notification.setIsRead(false);
        notification.setIsSent(false);
        notification.setMetadata(String.format(
                "{\"friendshipId\":%d,\"recipientId\":%d,\"recipientName\":\"%s\",\"recipientEmail\":\"%s\",\"recipientImage\":\"%s\"}",
                event.getFriendshipId(),
                event.getRecipientId(),
                event.getRecipientName(),
                event.getRecipientEmail(),
                event.getRecipientImage() != null ? event.getRecipientImage() : ""));
        return notification;
    }

    /**
     * Create notification when a friend request is rejected
     */
    private Notification createFriendRequestRejectedNotification(FriendRequestEventDTO event) {
        Notification notification = new Notification();
        notification.setUserId(event.getRequesterId());
        notification.setType(NotificationType.FRIEND_REQUEST_REJECTED);
        notification.setPriority(mapPriorityFromEvent(event.getNotificationPriority()));
        notification.setTitle("Friend Request Declined");
        notification.setMessage("Your friend request was declined");
        notification.setCreatedAt(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now());
        notification.setChannel("IN_APP");
        notification.setIsRead(false);
        notification.setIsSent(false);
        notification.setMetadata(String.format(
                "{\"friendshipId\":%d,\"recipientId\":%d,\"recipientName\":\"%s\"}",
                event.getFriendshipId(),
                event.getRecipientId(),
                event.getRecipientName()));
        return notification;
    }

    /**
     * Map priority from event to NotificationPriority enum
     */
    private NotificationPriority mapPriorityFromEvent(Integer priority) {
        if (priority == null) {
            return NotificationPriority.MEDIUM;
        }
        switch (priority) {
            case 1:
                return NotificationPriority.HIGH;
            case 2:
                return NotificationPriority.MEDIUM;
            case 3:
                return NotificationPriority.LOW;
            default:
                return NotificationPriority.MEDIUM;
        }
    }

    // =========================
    // WEBSOCKET NOTIFICATION SENDER
    // =========================

    /**
     * Send notification to specific user via WebSocket
     * Frontend subscribes to: /topic/user/{userId}/notifications
     * Using convertAndSend with broadcast topic pattern (like Chat service)
     * This pattern works without Principal and is proven to work in Chat service
     */
    private void sendNotificationToUser(Notification notification) {
        try {
            // Use broadcast topic pattern like Chat service does with
            // /topic/group/{groupId}
            // This works without Principal - proven working pattern
            String destination = "/topic/user/" + notification.getUserId() + "/notifications";
            messagingTemplate.convertAndSend(
                    destination,
                    notification);
            log.info("Notification sent via WebSocket to user {} using convertAndSend to {} - data {}",
                    notification.getUserId(), destination, notification);
        } catch (Exception e) {
            log.error("Error sending notification via WebSocket: {}", e.getMessage(), e);
        }
    }
}
