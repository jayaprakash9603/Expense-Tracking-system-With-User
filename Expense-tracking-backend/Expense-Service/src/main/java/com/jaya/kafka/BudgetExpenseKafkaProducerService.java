package com.jaya.kafka;

import com.jaya.common.messaging.MessagingPort;
import com.jaya.events.BudgetExpenseEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BudgetExpenseKafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(BudgetExpenseKafkaProducerService.class);
    private static final String BUDGET_EXPENSE_TOPIC = "BudgetModel-expense-events";

    private final MessagingPort messagingPort;

    public void sendBudgetExpenseEvent(BudgetExpenseEvent event) {
        try {
            messagingPort.send(BUDGET_EXPENSE_TOPIC, event);
            logger.info("BudgetModel expense event sent for expense ID: {} and UserDTO: {}",
                    event.getExpenseId(), event.getUserId());
        } catch (Exception e) {
            logger.error("Failed to send BudgetModel expense event for expense ID: {}",
                    event.getExpenseId(), e);
        }
    }
}
