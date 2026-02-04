package com.jaya.service.processor;

import com.jaya.dto.events.PaymentMethodEventDTO;
import com.jaya.modal.Notification;
import com.jaya.repository.NotificationRepository;
import com.jaya.service.NotificationPreferencesChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Processor for Payment Method events
 * Follows Single Responsibility Principle - only handles payment method
 * notifications
 */
@Component
@Slf4j
public class PaymentMethodEventProcessor extends AbstractNotificationEventProcessor<PaymentMethodEventDTO> {

    public PaymentMethodEventProcessor(NotificationPreferencesChecker preferencesChecker,
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        super(preferencesChecker, notificationRepository, messagingTemplate);
    }

    /**
     * Override process to check notifyUser flag before creating notifications.
     * This prevents notifications from being sent for internal data sync events
     * (e.g., when expenses are created/updated and payment method data is synced).
     * Only explicit payment method CRUD operations should trigger notifications.
     */
    @Override
    public void process(PaymentMethodEventDTO event) {
        // Check if notification should be sent - default to false for backward
        // compatibility
        Boolean shouldNotify = event.getNotifyUser();
        if (shouldNotify == null || !shouldNotify) {
            log.debug(
                    "Skipping payment method notification for user {} - notifyUser flag is false (internal data sync event)",
                    event.getUserId());
            return;
        }

        // Proceed with normal notification processing
        super.process(event);
    }

    @Override
    public String getNotificationType(PaymentMethodEventDTO event) {
        switch (event.getEventType()) {
            case "CREATE":
                return "paymentMethodAdded";
            case "UPDATE":
                return "paymentMethodUpdated";
            case "DELETE":
                return "paymentMethodRemoved";
            default:
                return "paymentMethodAdded";
        }
    }

    @Override
    public Integer getUserId(PaymentMethodEventDTO event) {
        return event.getUserId();
    }

    @Override
    protected Notification buildNotification(PaymentMethodEventDTO event) {
        String title;
        String message;
        String priority = "LOW";

        // Use the icon from the event if available, otherwise use defaults
        String icon = event.getIcon() != null ? event.getIcon() : getDefaultIcon(event.getEventType());

        switch (event.getEventType()) {
            case "CREATE":
                title = icon + " Payment Method Added";
                message = String.format("New payment method '%s' has been added",
                        event.getPaymentMethodName());
                break;

            case "UPDATE":
                title = "📝 Payment Method Updated";
                message = String.format("Payment method '%s' has been updated",
                        event.getPaymentMethodName());
                break;

            case "DELETE":
                title = "🗑️ Payment Method Removed";
                message = String.format("Payment method '%s' has been removed",
                        event.getPaymentMethodName());
                break;

            default:
                title = "Payment Method Notification";
                message = "A payment method activity occurred";
        }

        Notification notification = createBaseNotification(
                event.getUserId(),
                getNotificationType(event),
                title,
                message,
                priority);

        if (event.getExpenseId() != null) {
            notification.setRelatedEntityId(event.getExpenseId());
        }
        notification.setRelatedEntityType("PAYMENT_METHOD");

        return notification;
    }

    /**
     * Get default icon based on event type
     */
    private String getDefaultIcon(String eventType) {
        switch (eventType) {
            case "CREATE":
                return "💳";
            case "UPDATE":
                return "📝";
            case "DELETE":
                return "🗑️";
            default:
                return "💳";
        }
    }
}
