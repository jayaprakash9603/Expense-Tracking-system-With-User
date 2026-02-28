package com.jaya.service.processor;

import com.jaya.dto.events.FriendActivityEventDTO;
import com.jaya.modal.Notification;
import com.jaya.repository.NotificationRepository;
import com.jaya.service.NotificationPreferencesChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class FriendActivityEventProcessor extends AbstractNotificationEventProcessor<FriendActivityEventDTO> {

    public FriendActivityEventProcessor(NotificationPreferencesChecker preferencesChecker,
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        super(preferencesChecker, notificationRepository, messagingTemplate);
    }

    @Override
    public String getNotificationType(FriendActivityEventDTO event) {
        String entityType = event.getEntityType() != null ? event.getEntityType().toUpperCase() : "UNKNOWN";
        String action = event.getAction() != null ? event.getAction().toUpperCase() : "CREATE";

        String entityName = convertToTitleCase(entityType);

        String actionName = action.toLowerCase();
        actionName = actionName.substring(0, 1).toUpperCase() + actionName.substring(1);

        if ("Delete".equals(actionName)) {
            actionName = "Deleted";
        } else if ("Create".equals(actionName)) {
            actionName = "Created";
        } else if ("Update".equals(actionName)) {
            actionName = "Updated";
        }

        return "friend" + entityName + actionName;
    }

    private String convertToTitleCase(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        String[] parts = input.toLowerCase().split("_");
        StringBuilder result = new StringBuilder();

        for (String part : parts) {
            if (!part.isEmpty()) {
                result.append(part.substring(0, 1).toUpperCase());
                if (part.length() > 1) {
                    result.append(part.substring(1));
                }
            }
        }

        return result.toString();
    }

    @Override
    public Integer getUserId(FriendActivityEventDTO event) {
        return event.getTargetUserId();
    }

    @Override
    protected Notification buildNotification(FriendActivityEventDTO event) {
        String title;
        String message;
        String priority;

        String actorName = event.getActorUserName() != null ? event.getActorUserName() : "A friend";
        String entityType = event.getEntityType() != null ? event.getEntityType().toLowerCase() : "item";
        String action = event.getAction() != null ? event.getAction().toUpperCase() : "CREATE";

        if (event.getDescription() != null && !event.getDescription().isEmpty()) {
            message = event.getDescription();
        } else {
            message = buildDefaultMessage(actorName, entityType, action, event);
        }

        switch (entityType.toUpperCase()) {
            case "EXPENSE":
                title = buildExpenseTitle(action, actorName);
                priority = action.equals("DELETE") ? "HIGH" : "MEDIUM";
                break;

            case "CATEGORY":
                title = buildCategoryTitle(action, actorName);
                priority = action.equals("DELETE") ? "MEDIUM" : "LOW";
                break;

            case "BUDGET":
                title = buildBudgetTitle(action, actorName);
                priority = action.equals("DELETE") ? "HIGH" : "MEDIUM";
                break;

            case "BILL":
                title = buildBillTitle(action, actorName);
                priority = action.equals("DELETE") ? "HIGH" : "MEDIUM";
                break;

            case "PAYMENT_METHOD":
                title = buildPaymentMethodTitle(action, actorName);
                priority = "HIGH";
                break;

            default:
                title = "👤 Friend Activity";
                priority = "MEDIUM";
        }

        Notification notification = createBaseNotification(
                event.getTargetUserId(),
                getNotificationType(event),
                title,
                message,
                priority);

        notification.setRelatedEntityId(event.getEntityId());
        notification.setRelatedEntityType(event.getEntityType());

        if (event.getActorUserId() != null) {
            notification.setMetadata(String.format("{\"actorUserId\":%d,\"actorName\":\"%s\",\"sourceService\":\"%s\"}",
                    event.getActorUserId(),
                    actorName,
                    event.getSourceService() != null ? event.getSourceService() : "UNKNOWN"));
        }

        return notification;
    }

    private String buildExpenseTitle(String action, String actorName) {
        switch (action) {
            case "CREATE":
                return "💰 " + actorName + " Added an Expense";
            case "UPDATE":
                return "📝 " + actorName + " Updated an Expense";
            case "DELETE":
                return "🗑️ " + actorName + " Deleted an Expense";
            default:
                return "💰 Friend Expense Activity";
        }
    }

    private String buildCategoryTitle(String action, String actorName) {
        switch (action) {
            case "CREATE":
                return "📁 " + actorName + " Created a Category";
            case "UPDATE":
                return "📝 " + actorName + " Updated a Category";
            case "DELETE":
                return "🗑️ " + actorName + " Deleted a Category";
            default:
                return "📁 Friend Category Activity";
        }
    }

    private String buildBudgetTitle(String action, String actorName) {
        switch (action) {
            case "CREATE":
                return "💵 " + actorName + " Created a Budget";
            case "UPDATE":
                return "📝 " + actorName + " Updated a Budget";
            case "DELETE":
                return "🗑️ " + actorName + " Deleted a Budget";
            default:
                return "💵 Friend Budget Activity";
        }
    }

    private String buildBillTitle(String action, String actorName) {
        switch (action) {
            case "CREATE":
                return "📄 " + actorName + " Created a Bill";
            case "UPDATE":
                return "📝 " + actorName + " Updated a Bill";
            case "DELETE":
                return "🗑️ " + actorName + " Deleted a Bill";
            default:
                return "📄 Friend Bill Activity";
        }
    }

    private String buildPaymentMethodTitle(String action, String actorName) {
        switch (action) {
            case "CREATE":
                return "💳 " + actorName + " Added a Payment Method";
            case "UPDATE":
                return "📝 " + actorName + " Updated a Payment Method";
            case "DELETE":
                return "🗑️ " + actorName + " Removed a Payment Method";
            default:
                return "💳 Friend Payment Method Activity";
        }
    }

    private String buildDefaultMessage(String actorName, String entityType, String action,
            FriendActivityEventDTO event) {
        String actionVerb;
        switch (action) {
            case "CREATE":
                actionVerb = "created";
                break;
            case "UPDATE":
                actionVerb = "updated";
                break;
            case "DELETE":
                actionVerb = "deleted";
                break;
            default:
                actionVerb = "modified";
        }

        String message = String.format("%s %s a %s for you", actorName, actionVerb, entityType);

        if (event.getAmount() != null) {
            message += String.format(" (₹%.2f)", event.getAmount());
        }

        return message;
    }
}
