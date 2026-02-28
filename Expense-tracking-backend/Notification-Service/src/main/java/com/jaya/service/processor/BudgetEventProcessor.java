package com.jaya.service.processor;

import com.jaya.dto.events.BudgetEventDTO;
import com.jaya.modal.Notification;
import com.jaya.repository.NotificationRepository;
import com.jaya.service.NotificationPreferencesChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class BudgetEventProcessor extends AbstractNotificationEventProcessor<BudgetEventDTO> {

    public BudgetEventProcessor(NotificationPreferencesChecker preferencesChecker,
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        super(preferencesChecker, notificationRepository, messagingTemplate);
    }

    @Override
    public String getNotificationType(BudgetEventDTO event) {
        switch (event.getAction()) {
            case "CREATE":
                return "budgetCreated";
            case "UPDATE":
                return "budgetUpdated";
            case "DELETE":
                return "budgetDeleted";
            case "EXCEEDED":
                return "budgetExceeded";
            case "WARNING":
                return "budgetWarning";
            case "LIMIT_APPROACHING":
                return "budgetLimitApproaching";
            default:
                return "budgetCreated";
        }
    }

    @Override
    public Integer getUserId(BudgetEventDTO event) {
        return event.getUserId();
    }

    @Override
    protected Notification buildNotification(BudgetEventDTO event) {
        String title;
        String message;
        String priority;

        switch (event.getAction()) {
            case "CREATE":
                title = "✅ Budget Created";
                message = String.format("New budget '%s' created with limit ₹%.2f",
                        event.getBudgetName(), event.getAmount());
                priority = "LOW";
                break;

            case "UPDATE":
                title = "📝 Budget Updated";
                message = String.format("Budget '%s' has been updated", event.getBudgetName());
                priority = "LOW";
                break;

            case "DELETE":
                title = "🗑️ Budget Deleted";
                message = String.format("Budget '%s' has been deleted", event.getBudgetName());
                priority = "LOW";
                break;

            case "EXCEEDED":
                title = "🚨 Budget Exceeded!";
                message = String.format("You've exceeded your '%s' budget! Spent: ₹%.2f / ₹%.2f (%.1f%%)",
                        event.getBudgetName(),
                        event.getSpentAmount(),
                        event.getAmount(),
                        event.getPercentageUsed());
                priority = "CRITICAL";
                break;

            case "WARNING":
                title = "⚠️ Budget Warning (80%)";
                message = String.format("You've used 80%% of your '%s' budget. Spent: ₹%.2f / ₹%.2f",
                        event.getBudgetName(),
                        event.getSpentAmount(),
                        event.getAmount());
                priority = "HIGH";
                break;

            case "LIMIT_APPROACHING":
                title = "💡 Approaching Budget Limit (50%)";
                message = String.format("You've reached 50%% of your '%s' budget. Remaining: ₹%.2f",
                        event.getBudgetName(),
                        event.getRemainingAmount());
                priority = "MEDIUM";
                break;

            default:
                title = "Budget Notification";
                message = "A budget activity occurred";
                priority = "LOW";
        }

        Notification notification = createBaseNotification(
                event.getUserId(),
                getNotificationType(event),
                title,
                message,
                priority);

        notification.setRelatedEntityId(event.getBudgetId());
        notification.setRelatedEntityType("BUDGET");

        return notification;
    }
}
