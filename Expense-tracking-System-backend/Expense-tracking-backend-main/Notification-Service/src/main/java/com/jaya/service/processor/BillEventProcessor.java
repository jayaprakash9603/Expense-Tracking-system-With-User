package com.jaya.service.processor;

import com.jaya.dto.events.BillEventDTO;
import com.jaya.modal.Notification;
import com.jaya.repository.NotificationRepository;
import com.jaya.service.NotificationPreferencesChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Processor for Bill events
 * Follows Single Responsibility Principle - only handles bill notifications
 */
@Component
@Slf4j
public class BillEventProcessor extends AbstractNotificationEventProcessor<BillEventDTO> {

    public BillEventProcessor(NotificationPreferencesChecker preferencesChecker,
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        super(preferencesChecker, notificationRepository, messagingTemplate);
    }

    @Override
    public String getNotificationType(BillEventDTO event) {
        switch (event.getAction()) {
            case "CREATE":
                return "billAdded";
            case "UPDATE":
                return "billUpdated";
            case "PAID":
                return "billPaid";
            case "REMINDER":
                return "billReminder";
            case "OVERDUE":
                return "billOverdue";
            default:
                return "billAdded";
        }
    }

    @Override
    public Integer getUserId(BillEventDTO event) {
        return event.getUserId();
    }

    @Override
    protected Notification buildNotification(BillEventDTO event) {
        String title;
        String message;
        String priority;

        switch (event.getAction()) {
            case "CREATE":
                title = "📄 Bill Added";
                message = String.format("New bill '%s' added: ₹%.2f due on %s",
                        event.getName(),
                        event.getAmount(),
                        formatDueDate(event.getDueDate()));
                priority = "LOW";
                break;

            case "UPDATE":
                title = "📝 Bill Updated";
                message = String.format("Bill '%s' has been updated", event.getName());
                priority = "LOW";
                break;

            case "PAID":
                title = "✅ Bill Paid";
                message = String.format("Bill '%s' marked as paid: ₹%.2f",
                        event.getName(),
                        event.getAmount());
                priority = "LOW";
                break;

            case "REMINDER":
                long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), event.getDueDate());
                title = "🔔 Bill Reminder";
                message = String.format("Bill '%s' is due in %d days: ₹%.2f",
                        event.getName(),
                        daysUntilDue,
                        event.getAmount());
                priority = daysUntilDue <= 3 ? "HIGH" : "MEDIUM";
                break;

            case "OVERDUE":
                long daysOverdue = ChronoUnit.DAYS.between(event.getDueDate(), LocalDate.now());
                title = "🚨 Bill Overdue!";
                message = String.format("Bill '%s' is overdue by %d days: ₹%.2f",
                        event.getName(),
                        daysOverdue,
                        event.getAmount());
                priority = "CRITICAL";
                break;

            default:
                title = "Bill Notification";
                message = "A bill activity occurred";
                priority = "LOW";
        }

        Notification notification = createBaseNotification(
                event.getUserId(),
                getNotificationType(event),
                title,
                message,
                priority);

        notification.setRelatedEntityId(event.getBillId());
        notification.setRelatedEntityType("BILL");

        return notification;
    }

    /**
     * Format due date in a user-friendly way
     */
    private String formatDueDate(LocalDate dueDate) {
        if (dueDate == null)
            return "N/A";

        long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), dueDate);

        if (daysUntilDue == 0) {
            return "today";
        } else if (daysUntilDue == 1) {
            return "tomorrow";
        } else if (daysUntilDue < 0) {
            return String.format("%d days ago", Math.abs(daysUntilDue));
        } else {
            return dueDate.toString();
        }
    }
}
