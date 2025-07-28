
package com.jaya.mapper;

import com.jaya.dto.PaymentMethodEvent;
import com.jaya.events.BudgetExpenseEvent;
import com.jaya.events.CategoryExpenseEvent;
import com.jaya.models.AuditEvent;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class AuditEventMapper {

    /**
     * Maps AuditEvent to PaymentMethodEvent
     */
    public PaymentMethodEvent mapToPaymentMethodEvent(AuditEvent auditEvent) {
        PaymentMethodEvent paymentMethodEvent = new PaymentMethodEvent();

        // Map basic fields
        paymentMethodEvent.setUserId(auditEvent.getUserId());
        paymentMethodEvent.setEventType(auditEvent.getActionType());

        // Extract expense ID from entity ID if entity type is EXPENSE
        if ("EXPENSE".equals(auditEvent.getEntityType()) && auditEvent.getEntityId() != null) {
            try {
                paymentMethodEvent.setExpenseId(Integer.valueOf(auditEvent.getEntityId()));
            } catch (NumberFormatException e) {
                paymentMethodEvent.setExpenseId(null);
            }
        }

        // Extract payment method details from newValues or oldValues
        if (auditEvent.getNewValues() != null) {
            extractPaymentMethodDetails(auditEvent.getNewValues(), paymentMethodEvent);
        } else if (auditEvent.getOldValues() != null) {
            extractPaymentMethodDetails(auditEvent.getOldValues(), paymentMethodEvent);
        }

        // Set description from audit event details
        paymentMethodEvent.setDescription(auditEvent.getDetails() != null ?
                auditEvent.getDetails() : auditEvent.getDescription());

        return paymentMethodEvent;
    }

    /**
     * Maps AuditEvent to CategoryExpenseEvent
     */
    public CategoryExpenseEvent mapToCategoryExpenseEvent(AuditEvent auditEvent) {
        CategoryExpenseEvent categoryEvent = new CategoryExpenseEvent();

        // Map basic fields
        categoryEvent.setUserId(auditEvent.getUserId());
        categoryEvent.setAction(auditEvent.getActionType());

        // Extract expense ID from entity ID
        if (auditEvent.getEntityId() != null) {
            try {
                categoryEvent.setExpenseId(Integer.valueOf(auditEvent.getEntityId()));
            } catch (NumberFormatException e) {
                categoryEvent.setExpenseId(null);
            }
        }

        // Extract category details from newValues or oldValues
        if (auditEvent.getNewValues() != null) {
            extractCategoryDetails(auditEvent.getNewValues(), categoryEvent);
        } else if (auditEvent.getOldValues() != null) {
            extractCategoryDetails(auditEvent.getOldValues(), categoryEvent);
        }

        // Set timestamp from audit event
        if (auditEvent.getTimestamp() != null) {
            categoryEvent.setTimestamp(auditEvent.getTimestamp());
        }

        return categoryEvent;
    }

    /**
     * Maps AuditEvent to BudgetExpenseEvent
     */
    public BudgetExpenseEvent mapToBudgetExpenseEvent(AuditEvent auditEvent) {
        BudgetExpenseEvent budgetEvent = new BudgetExpenseEvent();

        // Map basic fields
        budgetEvent.setUserId(auditEvent.getUserId());
        budgetEvent.setAction(auditEvent.getActionType());

        // Extract expense ID from entity ID
        if (auditEvent.getEntityId() != null) {
            try {
                budgetEvent.setExpenseId(Integer.valueOf(auditEvent.getEntityId()));
            } catch (NumberFormatException e) {
                budgetEvent.setExpenseId(null);
            }
        }

        // Extract budget IDs from newValues or oldValues
        Set<Integer> budgetIds = new HashSet<>();
        if (auditEvent.getNewValues() != null) {
            budgetIds = extractBudgetIds(auditEvent.getNewValues());
        } else if (auditEvent.getOldValues() != null) {
            budgetIds = extractBudgetIds(auditEvent.getOldValues());
        }
        budgetEvent.setBudgetIds(budgetIds);

        return budgetEvent;
    }

    /**
     * Generic method to map AuditEvent to any event type based on entity type
     */
    public Object mapToSpecificEvent(AuditEvent auditEvent) {
        if (auditEvent == null || auditEvent.getEntityType() == null) {
            return null;
        }

        switch (auditEvent.getEntityType().toUpperCase()) {
            case "EXPENSE":
                // Determine specific event type based on details or action
                if (auditEvent.getDetails() != null &&
                        auditEvent.getDetails().toLowerCase().contains("payment")) {
                    return mapToPaymentMethodEvent(auditEvent);
                } else if (auditEvent.getDetails() != null &&
                        auditEvent.getDetails().toLowerCase().contains("category")) {
                    return mapToCategoryExpenseEvent(auditEvent);
                } else if (auditEvent.getDetails() != null &&
                        auditEvent.getDetails().toLowerCase().contains("budget")) {
                    return mapToBudgetExpenseEvent(auditEvent);
                }
                break;
            case "PAYMENT_METHOD":
                return mapToPaymentMethodEvent(auditEvent);
            case "CATEGORY":
                return mapToCategoryExpenseEvent(auditEvent);
            case "BUDGET":
                return mapToBudgetExpenseEvent(auditEvent);
            default:
                return null;
        }

        return null;
    }

    // Private helper methods
    private void extractPaymentMethodDetails(java.util.Map<String, Object> values, PaymentMethodEvent event) {
        if (values.containsKey("paymentMethod")) {
            event.setPaymentMethodName((String) values.get("paymentMethod"));
        }

        if (values.containsKey("paymentType")) {
            event.setPaymentType((String) values.get("paymentType"));
        }

        if (values.containsKey("icon")) {
            event.setIcon((String) values.get("icon"));
        }

        if (values.containsKey("color")) {
            event.setColor((String) values.get("color"));
        }

        // Set default values if not present
        if (event.getPaymentMethodName() == null && values.containsKey("expenseName")) {
            event.setPaymentMethodName((String) values.get("expenseName"));
        }

        if (event.getPaymentType() == null) {
            event.setPaymentType("default");
        }

        if (event.getIcon() == null) {
            event.setIcon("💳");
        }

        if (event.getColor() == null) {
            event.setColor("#007bff");
        }
    }

    private void extractCategoryDetails(java.util.Map<String, Object> values, CategoryExpenseEvent event) {
        if (values.containsKey("categoryId")) {
            Object categoryId = values.get("categoryId");
            if (categoryId instanceof Integer) {
                event.setCategoryId((Integer) categoryId);
            } else if (categoryId instanceof String) {
                try {
                    event.setCategoryId(Integer.valueOf((String) categoryId));
                } catch (NumberFormatException e) {
                    event.setCategoryId(null);
                }
            }
        }

        if (values.containsKey("categoryName")) {
            event.setCategoryName((String) values.get("categoryName"));
        }

        // Fallback to other possible field names
        if (event.getCategoryName() == null && values.containsKey("category")) {
            event.setCategoryName((String) values.get("category"));
        }
    }

    @SuppressWarnings("unchecked")
    private Set<Integer> extractBudgetIds(java.util.Map<String, Object> values) {
        Set<Integer> budgetIds = new HashSet<>();

        if (values.containsKey("budgetIds")) {
            Object budgetIdsObj = values.get("budgetIds");
            if (budgetIdsObj instanceof Set) {
                Set<?> rawSet = (Set<?>) budgetIdsObj;
                for (Object id : rawSet) {
                    if (id instanceof Integer) {
                        budgetIds.add((Integer) id);
                    } else if (id instanceof String) {
                        try {
                            budgetIds.add(Integer.valueOf((String) id));
                        } catch (NumberFormatException e) {
                            // Skip invalid budget ID
                        }
                    }
                }
            }
        }

        // Check for single budget ID
        if (budgetIds.isEmpty() && values.containsKey("budgetId")) {
            Object budgetId = values.get("budgetId");
            if (budgetId instanceof Integer) {
                budgetIds.add((Integer) budgetId);
            } else if (budgetId instanceof String) {
                try {
                    budgetIds.add(Integer.valueOf((String) budgetId));
                } catch (NumberFormatException e) {
                    // Skip invalid budget ID
                }
            }
        }

        return budgetIds;
    }

    /**
     * Utility method to determine event type from AuditEvent
     */
    public String determineEventType(AuditEvent auditEvent) {
        if (auditEvent.getDetails() != null) {
            String details = auditEvent.getDetails().toLowerCase();
            if (details.contains("payment")) {
                return "PAYMENT_METHOD";
            } else if (details.contains("category")) {
                return "CATEGORY";
            } else if (details.contains("budget")) {
                return "BUDGET";
            }
        }

        return auditEvent.getEntityType();
    }
}