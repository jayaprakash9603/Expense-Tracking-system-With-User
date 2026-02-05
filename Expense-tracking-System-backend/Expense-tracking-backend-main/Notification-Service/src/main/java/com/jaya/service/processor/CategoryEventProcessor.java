package com.jaya.service.processor;

import com.jaya.dto.events.CategoryEventDTO;
import com.jaya.modal.Notification;
import com.jaya.repository.NotificationRepository;
import com.jaya.service.NotificationPreferencesChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
@Component
@Slf4j
public class CategoryEventProcessor extends AbstractNotificationEventProcessor<CategoryEventDTO> {

    public CategoryEventProcessor(NotificationPreferencesChecker preferencesChecker,
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        super(preferencesChecker, notificationRepository, messagingTemplate);
    }

    @Override
    public String getNotificationType(CategoryEventDTO event) {
        if (event.getAction() == null) {
            return "categoryCreated";
        }
        switch (event.getAction()) {
            case "CREATE":
                return "categoryCreated";
            case "UPDATE":
                return "categoryUpdated";
            case "DELETE":
                return "categoryDeleted";
            case "BUDGET_EXCEEDED":
                return "categoryBudgetExceeded";
            default:
                return "categoryCreated";
        }
    }

    @Override
    public Integer getUserId(CategoryEventDTO event) {
        return event.getUserId();
    }

    @Override
    protected Notification buildNotification(CategoryEventDTO event) {
        String title;
        String message;
        String priority;
        String action = event.getAction() != null ? event.getAction() : "CREATE";

        switch (action) {
            case "CREATE":
                title = "📁 New Category Created";
                message = String.format("Category '%s' has been created",
                        event.getCategoryName() != null ? event.getCategoryName() : "Unknown");
                priority = "MEDIUM";
                if (event.getBudgetLimit() != null && event.getBudgetLimit() > 0) {
                    message += String.format(" with budget limit of ₹%.2f", event.getBudgetLimit());
                }
                break;

            case "UPDATE":
                title = "📝 Category Updated";
                message = String.format("Category '%s' has been updated",
                        event.getCategoryName() != null ? event.getCategoryName() : "Unknown");
                priority = "LOW";
                break;

            case "DELETE":
                title = "🗑️ Category Deleted";
                message = String.format("Category '%s' has been deleted",
                        event.getCategoryName() != null ? event.getCategoryName() : "Unknown");
                priority = "LOW";
                break;

            case "BUDGET_EXCEEDED":
                title = "⚠️ Category Budget Exceeded!";
                message = String.format("Budget exceeded for category '%s'! Spent: ₹%.2f, Limit: ₹%.2f",
                        event.getCategoryName() != null ? event.getCategoryName() : "Unknown",
                        event.getTotalExpenses() != null ? event.getTotalExpenses() : 0,
                        event.getBudgetLimit() != null ? event.getBudgetLimit() : 0);
                priority = "HIGH";
                break;

            default:
                title = "Category Notification";
                message = "A category activity occurred";
                priority = "LOW";
        }

        Notification notification = createBaseNotification(
                event.getUserId(),
                getNotificationType(event),
                title,
                message,
                priority);

        notification.setRelatedEntityId(event.getCategoryId());
        notification.setRelatedEntityType("CATEGORY");

        return notification;
    }
}
