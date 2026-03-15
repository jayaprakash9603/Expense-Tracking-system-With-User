package com.jaya.kafka;

import com.jaya.common.messaging.MessagingPort;
import com.jaya.events.CategoryExpenseEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoryExpenseKafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryExpenseKafkaProducerService.class);
    private static final String TOPIC = "category-expense-events";

    @Autowired
    private MessagingPort messagingPort;

    public void sendCategoryExpenseEvent(CategoryExpenseEvent event) {
        try {
            messagingPort.send(TOPIC, event);
            logger.info("ExpenseCategory expense event sent successfully: {}", event);
        } catch (Exception e) {
            logger.error("Failed to send category expense event: {}", event, e);
        }
    }
}

