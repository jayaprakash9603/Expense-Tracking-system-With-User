package com.jaya.service;

import com.jaya.dto.BudgetNotificationEvent;
import com.jaya.kafka.producer.BudgetNotificationProducer;
import com.jaya.models.Budget;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class BudgetNotificationService {

    private final BudgetNotificationProducer producer;

    @Autowired
    public BudgetNotificationService(BudgetNotificationProducer producer) {
        this.producer = producer;
    }

    @Async
    public void sendBudgetCreatedNotification(Budget budget) {
        try {
            log.debug("Preparing budget created notification for budget ID: {}", budget.getId());

            BudgetNotificationEvent event = BudgetNotificationEvent.builder()
                    .budgetId(budget.getId())
                    .userId(budget.getUserId())
                    .action(BudgetNotificationEvent.CREATE)
                    .budgetName(budget.getName())
                    .amount(budget.getAmount())
                    .spentAmount(BigDecimal.ZERO)
                    .remainingAmount(BigDecimal.valueOf(budget.getAmount()))
                    .percentageUsed(0.0)
                    .startDate(budget.getStartDate())
                    .endDate(budget.getEndDate())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildMetadata("created", budget))
                    .build();

            producer.sendEvent(event);
            log.info("Budget created notification sent for budget: {} (User: {})",
                    budget.getName(), budget.getUserId());

        } catch (Exception e) {
            log.error("Failed to send budget created notification: {}", e.getMessage(), e);
        }
    }

    @Async
    public void sendBudgetCreatedNotification(Budget budget, Integer creatorUserId, boolean friendCreation) {
        try {
            log.debug("Preparing contextual budget created notification for budget ID: {}", budget.getId());

            Map<String, Object> metadata = buildMetadata("created", budget);
            metadata.put("created_by_user_id", creatorUserId);
            metadata.put("creation_type", friendCreation ? "FRIEND_CREATED" : "SELF_CREATED");
            metadata.put("owner_user_id", budget.getUserId());
            if (!friendCreation) {
                metadata.put("message", "Your budget '" + budget.getName() + "' has been created.");
            } else {
                metadata.put("message", "A friend created the budget '" + budget.getName() + "' for you.");
            }

            BudgetNotificationEvent event = BudgetNotificationEvent.builder()
                    .budgetId(budget.getId())
                    .userId(budget.getUserId())
                    .action(BudgetNotificationEvent.CREATE)
                    .budgetName(budget.getName())
                    .amount(budget.getAmount())
                    .spentAmount(BigDecimal.ZERO)
                    .remainingAmount(BigDecimal.valueOf(budget.getAmount()))
                    .percentageUsed(0.0)
                    .startDate(budget.getStartDate())
                    .endDate(budget.getEndDate())
                    .timestamp(LocalDateTime.now())
                    .metadata(metadata)
                    .build();

            producer.sendEvent(event);
            log.info("Contextual budget created notification sent for budget: {} (Owner: {}, Creator: {}, Type: {})",
                    budget.getName(), budget.getUserId(), creatorUserId,
                    friendCreation ? "FRIEND_CREATED" : "SELF_CREATED");
        } catch (Exception e) {
            log.error("Failed to send contextual budget created notification: {}", e.getMessage(), e);
        }
    }

    @Async
    public void sendBudgetUpdatedNotification(Budget budget) {
        try {
            log.debug("Preparing budget updated notification for budget ID: {}", budget.getId());

            BigDecimal spent = calculateSpent(budget);
            BigDecimal budgetAmountBD = BigDecimal.valueOf(budget.getAmount());
            BigDecimal remaining = budgetAmountBD.subtract(spent);
            Double percentageUsed = calculatePercentageUsed(spent, budgetAmountBD);

            BudgetNotificationEvent event = BudgetNotificationEvent.builder()
                    .budgetId(budget.getId())
                    .userId(budget.getUserId())
                    .action(BudgetNotificationEvent.UPDATE)
                    .budgetName(budget.getName())
                    .amount(budget.getAmount())
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .percentageUsed(percentageUsed)
                    .startDate(budget.getStartDate())
                    .endDate(budget.getEndDate())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildMetadata("updated", budget))
                    .build();

            producer.sendEvent(event);
            log.info("Budget updated notification sent for budget: {} (User: {})",
                    budget.getName(), budget.getUserId());

        } catch (Exception e) {
            log.error("Failed to send budget updated notification: {}", e.getMessage(), e);
        }
    }

    @Async
    public void sendBudgetDeletedNotification(Integer budgetId, String budgetName, Integer userId) {
        try {
            log.debug("Preparing budget deleted notification for budget ID: {}", budgetId);

            BudgetNotificationEvent event = BudgetNotificationEvent.builder()
                    .budgetId(budgetId)
                    .userId(userId)
                    .action(BudgetNotificationEvent.DELETE)
                    .budgetName(budgetName)
                    .timestamp(LocalDateTime.now())
                    .metadata(buildSimpleMetadata("deleted", budgetId, budgetName))
                    .build();

            producer.sendEvent(event);
            log.info("Budget deleted notification sent for budget: {} (User: {})",
                    budgetName, userId);

        } catch (Exception e) {
            log.error("Failed to send budget deleted notification: {}", e.getMessage(), e);
        }
    }

    @Async
    public void sendBudgetExceededNotification(Budget budget, BigDecimal spent) {
        try {
            log.debug("Preparing budget exceeded notification for budget ID: {}", budget.getId());

            BigDecimal budgetAmountBD = BigDecimal.valueOf(budget.getAmount());
            BigDecimal remaining = budgetAmountBD.subtract(spent);
            Double percentageUsed = calculatePercentageUsed(spent, budgetAmountBD);

            BudgetNotificationEvent event = BudgetNotificationEvent.builder()
                    .budgetId(budget.getId())
                    .userId(budget.getUserId())
                    .action(BudgetNotificationEvent.EXCEEDED)
                    .budgetName(budget.getName())
                    .amount(budget.getAmount())
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .percentageUsed(percentageUsed)
                    .startDate(budget.getStartDate())
                    .endDate(budget.getEndDate())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildAlertMetadata("exceeded", budget, spent, percentageUsed))
                    .build();

            producer.sendEvent(event);
            log.warn("Budget exceeded notification sent for budget: {} (User: {}, Exceeded by: {})",
                    budget.getName(), budget.getUserId(), remaining.abs());

        } catch (Exception e) {
            log.error("Failed to send budget exceeded notification: {}", e.getMessage(), e);
        }
    }

    @Async
    public void sendBudgetWarningNotification(Budget budget, BigDecimal spent) {
        try {
            log.debug("Preparing budget warning notification for budget ID: {}", budget.getId());

            BigDecimal budgetAmountBD = BigDecimal.valueOf(budget.getAmount());
            BigDecimal remaining = budgetAmountBD.subtract(spent);
            Double percentageUsed = calculatePercentageUsed(spent, budgetAmountBD);

            BudgetNotificationEvent event = BudgetNotificationEvent.builder()
                    .budgetId(budget.getId())
                    .userId(budget.getUserId())
                    .action(BudgetNotificationEvent.WARNING)
                    .budgetName(budget.getName())
                    .amount(budget.getAmount())
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .percentageUsed(percentageUsed)
                    .startDate(budget.getStartDate())
                    .endDate(budget.getEndDate())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildAlertMetadata("warning", budget, spent, percentageUsed))
                    .build();

            producer.sendEvent(event);
            log.info("Budget warning notification sent for budget: {} (User: {}, Usage: {}%)",
                    budget.getName(), budget.getUserId(), percentageUsed);

        } catch (Exception e) {
            log.error("Failed to send budget warning notification: {}", e.getMessage(), e);
        }
    }

    @Async
    public void sendBudgetLimitApproachingNotification(Budget budget, BigDecimal spent) {
        try {
            log.debug("Preparing budget limit approaching notification for budget ID: {}", budget.getId());

            BigDecimal budgetAmountBD = BigDecimal.valueOf(budget.getAmount());
            BigDecimal remaining = budgetAmountBD.subtract(spent);
            Double percentageUsed = calculatePercentageUsed(spent, budgetAmountBD);

            BudgetNotificationEvent event = BudgetNotificationEvent.builder()
                    .budgetId(budget.getId())
                    .userId(budget.getUserId())
                    .action(BudgetNotificationEvent.LIMIT_APPROACHING)
                    .budgetName(budget.getName())
                    .amount(budget.getAmount())
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .percentageUsed(percentageUsed)
                    .startDate(budget.getStartDate())
                    .endDate(budget.getEndDate())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildAlertMetadata("limit_approaching", budget, spent, percentageUsed))
                    .build();

            producer.sendEvent(event);
            log.info("Budget limit approaching notification sent for budget: {} (User: {}, Remaining: {})",
                    budget.getName(), budget.getUserId(), remaining);

        } catch (Exception e) {
            log.error("Failed to send budget limit approaching notification: {}", e.getMessage(), e);
        }
    }

    private BigDecimal calculateSpent(Budget budget) {
        return BigDecimal.ZERO;
    }

    private Double calculatePercentageUsed(BigDecimal spent, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return spent.divide(total, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private Map<String, Object> buildMetadata(String eventType, Budget budget) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("eventType", eventType);
        metadata.put("budgetId", budget.getId());
        metadata.put("budgetName", budget.getName());
        metadata.put("amount", budget.getAmount());
        metadata.put("startDate", budget.getStartDate());
        metadata.put("endDate", budget.getEndDate());
        return metadata;
    }

    private Map<String, Object> buildSimpleMetadata(String eventType, Integer budgetId, String budgetName) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("eventType", eventType);
        metadata.put("budgetId", budgetId);
        metadata.put("budgetName", budgetName);
        return metadata;
    }

    private Map<String, Object> buildAlertMetadata(String alertType, Budget budget,
            BigDecimal spent, Double percentageUsed) {
        Map<String, Object> metadata = buildMetadata(alertType, budget);
        BigDecimal budgetAmountBD = BigDecimal.valueOf(budget.getAmount());
        metadata.put("spent", spent);
        metadata.put("remaining", budgetAmountBD.subtract(spent));
        metadata.put("percentageUsed", percentageUsed);
        metadata.put("alertLevel", getAlertLevel(percentageUsed));
        return metadata;
    }

    private String getAlertLevel(Double percentageUsed) {
        if (percentageUsed >= 100.0) {
            return "CRITICAL";
        } else if (percentageUsed >= 90.0) {
            return "HIGH";
        } else if (percentageUsed >= 80.0) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
}
