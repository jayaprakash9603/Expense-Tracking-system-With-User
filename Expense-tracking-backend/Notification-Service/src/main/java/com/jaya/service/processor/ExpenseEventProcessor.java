package com.jaya.service.processor;

import com.jaya.dto.events.ExpenseEventDTO;
import com.jaya.modal.Notification;
import com.jaya.repository.NotificationRepository;
import com.jaya.service.NotificationPreferencesChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ExpenseEventProcessor extends AbstractNotificationEventProcessor<ExpenseEventDTO> {

    public ExpenseEventProcessor(NotificationPreferencesChecker preferencesChecker,
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        super(preferencesChecker, notificationRepository, messagingTemplate);
    }

    @Override
    public String getNotificationType(ExpenseEventDTO event) {
        switch (event.getAction()) {
            case "CREATE":
                if (isLargeExpense(event.getAmount())) {
                    return "largeExpenseAlert";
                }
                return "expenseAdded";
            case "UPDATE":
                return "expenseUpdated";
            case "DELETE":
                return "expenseDeleted";
            default:
                return "expenseAdded";
        }
    }

    @Override
    public Integer getUserId(ExpenseEventDTO event) {
        return event.getUserId();
    }

    @Override
    protected Notification buildNotification(ExpenseEventDTO event) {
        String title;
        String message;
        String priority;

        switch (event.getAction()) {
            case "CREATE":
                if (isLargeExpense(event.getAmount())) {
                    title = "⚠️ Large Expense Alert";
                    message = String.format("Large expense of ₹%.2f added: %s",
                            event.getAmount(), event.getDescription());
                    priority = "HIGH";
                } else {
                    title = "💸 New Expense Added";
                    message = String.format("Expense of ₹%.2f added: %s",
                            event.getAmount(), event.getDescription());
                    priority = "MEDIUM";
                }
                break;

            case "UPDATE":
                title = "📝 Expense Updated";
                message = String.format("Expense updated: %s (₹%.2f)",
                        event.getDescription(), event.getAmount());
                priority = "LOW";
                break;

            case "DELETE":
                title = "🗑️ Expense Deleted";
                message = String.format("Expense deleted: %s (₹%.2f)",
                        event.getDescription(), event.getAmount());
                priority = "LOW";
                break;

            default:
                title = "Expense Notification";
                message = "An expense activity occurred";
                priority = "LOW";
        }

        Notification notification = createBaseNotification(
                event.getUserId(),
                getNotificationType(event),
                title,
                message,
                priority);

        notification.setRelatedEntityId(event.getExpenseId());
        notification.setRelatedEntityType("EXPENSE");

        return notification;
    }

    private boolean isLargeExpense(Double amount) {
        return amount != null && amount >= 5000.0;
    }
}
