package com.jaya.kafka;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;
import com.jaya.models.UserDto;
import com.jaya.repository.AuditExpenseRepository;
import com.jaya.service.UserService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;


@Service
public class KafkaConsumerService {


    Logger logger= LoggerFactory.getLogger(KafkaConsumerService.class);
    @Autowired
    private  AuditExpenseRepository auditExpenseRepository;


    @Autowired
    private UserService userService;

    

    private final ObjectMapper objectMapper;

    public KafkaConsumerService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @KafkaListener(topics = "audit-events", groupId = "audit-group")
    public void consumeAuditEvent(String auditEventJson) {
        try {
            AuditEvent auditEvent = objectMapper.readValue(auditEventJson, AuditEvent.class);
            processAuditEvent(auditEvent);
            logger.info("Processed audit event: {}" , auditEvent);
        } catch (JsonProcessingException e) {
            logger.error("Error deserializing audit event: {}" ,e.getMessage());
           logger.error("Raw message: {}" , auditEventJson);
        } catch (Exception e) {
           logger.error("Error processing audit event: {}" , e.getMessage());
        }
    }

    private void processAuditEvent(AuditEvent auditEvent) {
        try {
            // Find the user by ID
            UserDto user = userService.getUserProfileById(auditEvent.getUserId());
            if (user==null) {
                logger.error("User not found with ID: {}" , auditEvent.getUserId());
                return;
            }

           

            // Create and save audit expense record
            AuditExpense auditExpense = new AuditExpense();
            auditExpense.setUserId(user.getId());
            auditExpense.setExpenseId(auditEvent.getExpenseId());
            auditExpense.setActionType(auditEvent.getActionType());
            auditExpense.setDetails(auditEvent.getDetails());
            auditExpense.setTimestamp(auditEvent.getTimestamp());

            auditExpenseRepository.save(auditExpense);

            logger.info("Audit record saved successfully for user: {}" , user.getFirstName() + " " + user.getLastName());
        } catch (Exception e) {
            logger.error("Error saving audit record: {}" , e.getMessage());
            e.printStackTrace();
        }
    }

    @KafkaListener(topics = "test-topic", groupId = "test-group")
    public void consumeTestMessage(String message) {
        logger.info("Consumed test message: {}" , message);
    }
}