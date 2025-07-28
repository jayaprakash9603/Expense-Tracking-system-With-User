package com.jaya.service;

import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;
import com.jaya.repository.AuditExpenseRepository;
import com.jaya.mapper.AuditMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditExpenseService {

    private final AuditExpenseRepository auditExpenseRepository;
    private final AuditMapper auditMapper;

    @Transactional
    public AuditExpense processAuditEvent(AuditEvent auditEvent) {
        try {
            // Convert AuditEvent to AuditExpense entity
            AuditExpense auditExpense = auditMapper.toAuditExpense(auditEvent);

            // Set processing timestamp if not already set
            if (auditExpense.getUpdatedAt() == null) {
                auditExpense.setUpdatedAt(LocalDateTime.now());
            }

            // Save to database
            AuditExpense savedAudit = auditExpenseRepository.save(auditExpense);

            // Additional processing if needed
            processAdditionalAuditLogic(savedAudit);

            log.debug("Successfully processed and saved audit event: {}", auditEvent.getCorrelationId());
            return savedAudit;

        } catch (Exception e) {
            log.error("Failed to process audit event: {}", auditEvent.getCorrelationId(), e);
            throw e;
        }
    }


    public  List<AuditExpense> getAllAuditLogs(Integer userId)
    {
        return auditExpenseRepository.findByUserId(userId);
    }
    private void processAdditionalAuditLogic(AuditExpense auditExpense) {
        // Check for suspicious activities
        if ("FAILURE".equals(auditExpense.getStatus()) &&
                "LOGIN".equals(auditExpense.getActionType())) {
            handleFailedLogin(auditExpense);
        }

        // Check for high-value transactions
        if ("EXPENSE".equals(auditExpense.getEntityType()) &&
                "CREATE".equals(auditExpense.getActionType())) {
            validateExpenseCreation(auditExpense);
        }
    }

    private void handleFailedLogin(AuditExpense auditExpense) {
        log.warn("Failed login attempt detected for user: {} from IP: {}",
                auditExpense.getUsername(), auditExpense.getIpAddress());
    }

    private void validateExpenseCreation(AuditExpense auditExpense) {
        log.info("New expense created by user: {} with ID: {}",
                auditExpense.getUsername(), auditExpense.getEntityId());
    }

    // Query methods
    public List<AuditExpense> getAuditTrailForEntity(String entityType, String entityId) {
        return auditExpenseRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    public List<AuditExpense> getAuditTrailForUser(Integer userId) {
        return auditExpenseRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public Page<AuditExpense> getAuditTrailForUser(Integer userId, Pageable pageable) {
        return auditExpenseRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }

    public Optional<AuditExpense> findByCorrelationId(String correlationId) {
        return auditExpenseRepository.findByCorrelationId(correlationId);
    }

    public List<AuditExpense> getAuditsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditExpenseRepository.findByTimestampBetweenOrderByTimestampDesc(startDate, endDate);
    }

    public List<AuditExpense> getFailedOperations(LocalDateTime since) {
        return auditExpenseRepository.findByStatusAndTimestampAfterOrderByTimestampDesc("FAILURE", since);
    }
}