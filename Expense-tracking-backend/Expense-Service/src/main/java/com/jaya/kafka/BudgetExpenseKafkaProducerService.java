package com.jaya.kafka;

import com.jaya.events.BudgetExpenseEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BudgetExpenseKafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(BudgetExpenseKafkaProducerService.class);
    private static final String BUDGET_EXPENSE_TOPIC = "budget-expense-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendBudgetExpenseEvent(BudgetExpenseEvent event) {


        System.out.println("Expense ids"+event.getBudgetIds()+"action"+event.getAction());
        try {
            kafkaTemplate.send(BUDGET_EXPENSE_TOPIC, event);
            logger.info("Budget expense event sent for expense ID: {} and UserDTO: {}",
                    event.getExpenseId(), event.getUserId());
        } catch (Exception e) {
            logger.error("Failed to send budget expense event for expense ID: {}",
                    event.getExpenseId(), e);
        }
    }
}