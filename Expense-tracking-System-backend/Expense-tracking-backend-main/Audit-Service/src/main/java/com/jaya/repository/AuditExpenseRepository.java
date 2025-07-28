package com.jaya.repository;

import com.jaya.models.AuditExpense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuditExpenseRepository extends JpaRepository<AuditExpense, Long> {

    // Find by correlation ID
    Optional<AuditExpense> findByCorrelationId(String correlationId);

    List<AuditExpense>findByUserId(Integer userId);

    // Find by user ID
    List<AuditExpense> findByUserIdOrderByTimestampDesc(Integer userId);
    Page<AuditExpense> findByUserIdOrderByTimestampDesc(Integer userId, Pageable pageable);

    // Find by entity
    List<AuditExpense> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);

    // Find by action type
    List<AuditExpense> findByActionTypeOrderByTimestampDesc(String actionType);

    // Find by user and entity
    List<AuditExpense> findByUserIdAndEntityTypeAndEntityIdOrderByTimestampDesc(
            Integer userId, String entityType, String entityId);

    // Find by date range
    List<AuditExpense> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    // Find by user and date range
    List<AuditExpense> findByUserIdAndTimestampBetweenOrderByTimestampDesc(
            Integer userId, LocalDateTime startDate, LocalDateTime endDate);

    // Find by status
    List<AuditExpense> findByStatusOrderByTimestampDesc(String status);

    // Find failed operations
    List<AuditExpense> findByStatusAndTimestampAfterOrderByTimestampDesc(
            String status, LocalDateTime after);

    // Custom queries
    @Query("SELECT ae FROM AuditExpense ae WHERE ae.userId = :userId AND ae.entityType = :entityType ORDER BY ae.timestamp DESC")
    List<AuditExpense> findUserAuditsByEntityType(@Param("userId") Integer userId, @Param("entityType") String entityType);

    @Query("SELECT ae FROM AuditExpense ae WHERE ae.ipAddress = :ipAddress AND ae.timestamp >= :since ORDER BY ae.timestamp DESC")
    List<AuditExpense> findRecentAuditsByIpAddress(@Param("ipAddress") String ipAddress, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(ae) FROM AuditExpense ae WHERE ae.userId = :userId AND ae.actionType = :actionType AND ae.timestamp >= :since")
    Long countUserActionsSince(@Param("userId") Integer userId, @Param("actionType") String actionType, @Param("since") LocalDateTime since);

    @Query("SELECT ae FROM AuditExpense ae WHERE ae.serviceName = :serviceName AND ae.timestamp >= :since ORDER BY ae.timestamp DESC")
    List<AuditExpense> findRecentAuditsByService(@Param("serviceName") String serviceName, @Param("since") LocalDateTime since);

    // Statistics queries
    @Query("SELECT ae.actionType, COUNT(ae) FROM AuditExpense ae WHERE ae.userId = :userId GROUP BY ae.actionType")
    List<Object[]> getUserActionStatistics(@Param("userId") Integer userId);

    @Query("SELECT ae.entityType, COUNT(ae) FROM AuditExpense ae WHERE ae.timestamp >= :since GROUP BY ae.entityType")
    List<Object[]> getEntityTypeStatistics(@Param("since") LocalDateTime since);

    // Legacy support for expense ID
    @Deprecated
    List<AuditExpense> findByExpenseIdOrderByTimestampDesc(Integer expenseId);

    @Deprecated
    List<AuditExpense> findByUserIdAndExpenseIdOrderByTimestampDesc(Integer userId, Integer expenseId);
}