package com.jaya.service.deletion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.deletion.AbstractPurgeHandler;
import com.jaya.common.deletion.AccountDeletionTopics;
import com.jaya.common.deletion.PurgeUserCommand;
import com.jaya.repository.UserSettingsRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Reference participant purge implementation for the Expense service. Every
 * other user-data-owning service should add an analogous {@code *PurgeHandler}
 * that extends {@link AbstractPurgeHandler} and deletes its owned rows via
 * repository methods or JPQL/native SQL. All statements MUST be idempotent
 * (missing rows are a successful outcome).
 */
@Component
@Slf4j
@ConditionalOnProperty(prefix = "spring.kafka", name = "bootstrap-servers")
public class ExpensePurgeHandler extends AbstractPurgeHandler {

    private static final List<String> DELETE_STATEMENTS = List.of(
            "DELETE FROM Expense e WHERE e.userId = :userId",
            "DELETE FROM ExpenseDetails d WHERE d.userId = :userId",
            "DELETE FROM ReportHistory r WHERE r.userId = :userId",
            "DELETE FROM MomentumInsight m WHERE m.userId = :userId",
            "DELETE FROM EmailLog l WHERE l.userId = :userId",
            "DELETE FROM Otp o WHERE o.userId = :userId"
    );

    private final UserSettingsRepository userSettingsRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public ExpensePurgeHandler(KafkaTemplate<String, Object> kafkaTemplate,
                                ObjectMapper objectMapper,
                                UserSettingsRepository userSettingsRepository) {
        super("expense-service", kafkaTemplate, objectMapper);
        this.userSettingsRepository = userSettingsRepository;
    }

    @KafkaListener(topics = AccountDeletionTopics.PURGE_COMMANDS,
            groupId = "${account-deletion.consumer-group:expense-service-deletion}")
    public void onCommand(String rawPayload) {
        handle(rawPayload);
    }

    @Override
    @Transactional
    protected void purge(PurgeUserCommand command) {
        Integer userId = command.getUserId();
        try {
            userSettingsRepository.deleteByUserId(userId);
        } catch (RuntimeException e) {
            log.warn("expense-service purge: user_settings best-effort delete: {}", e.getMessage());
        }
        for (String jpql : DELETE_STATEMENTS) {
            try {
                entityManager.createQuery(jpql).setParameter("userId", userId).executeUpdate();
            } catch (RuntimeException e) {
                // Idempotency: an entity/table missing in a given deployment
                // is not a purge failure.
                log.warn("expense-service purge: '{}' best-effort skipped: {}", jpql, e.getMessage());
            }
        }
    }
}
