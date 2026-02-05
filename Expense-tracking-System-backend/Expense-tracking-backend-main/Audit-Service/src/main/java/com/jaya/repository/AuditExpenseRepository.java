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

        Optional<AuditExpense> findByCorrelationId(String correlationId);

        List<AuditExpense> findByUserId(Integer userId);

        List<AuditExpense> findByUserIdOrderByTimestampDesc(Integer userId);

        Page<AuditExpense> findByUserIdOrderByTimestampDesc(Integer userId, Pageable pageable);

        List<AuditExpense> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);

        List<AuditExpense> findByActionTypeOrderByTimestampDesc(String actionType);

        List<AuditExpense> findByUserIdAndEntityTypeAndEntityIdOrderByTimestampDesc(
                        Integer userId, String entityType, String entityId);

        List<AuditExpense> findByTimestampBetweenOrderByTimestampDesc(
                        LocalDateTime startDate, LocalDateTime endDate);

        List<AuditExpense> findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                        Integer userId, LocalDateTime startDate, LocalDateTime endDate);

        List<AuditExpense> findByStatusOrderByTimestampDesc(String status);

        List<AuditExpense> findByStatusAndTimestampAfterOrderByTimestampDesc(
                        String status, LocalDateTime after);

        @Query("SELECT ae FROM AuditExpense ae WHERE ae.userId = :userId AND ae.entityType = :entityType ORDER BY ae.timestamp DESC")
        List<AuditExpense> findUserAuditsByEntityType(@Param("userId") Integer userId,
                        @Param("entityType") String entityType);

        @Query("SELECT ae FROM AuditExpense ae WHERE ae.ipAddress = :ipAddress AND ae.timestamp >= :since ORDER BY ae.timestamp DESC")
        List<AuditExpense> findRecentAuditsByIpAddress(@Param("ipAddress") String ipAddress,
                        @Param("since") LocalDateTime since);

        @Query("SELECT COUNT(ae) FROM AuditExpense ae WHERE ae.userId = :userId AND ae.actionType = :actionType AND ae.timestamp >= :since")
        Long countUserActionsSince(@Param("userId") Integer userId, @Param("actionType") String actionType,
                        @Param("since") LocalDateTime since);

        @Query("SELECT ae FROM AuditExpense ae WHERE ae.serviceName = :serviceName AND ae.timestamp >= :since ORDER BY ae.timestamp DESC")
        List<AuditExpense> findRecentAuditsByService(@Param("serviceName") String serviceName,
                        @Param("since") LocalDateTime since);

        @Query("SELECT ae.actionType, COUNT(ae) FROM AuditExpense ae WHERE ae.userId = :userId GROUP BY ae.actionType")
        List<Object[]> getUserActionStatistics(@Param("userId") Integer userId);

        @Query("SELECT ae.entityType, COUNT(ae) FROM AuditExpense ae WHERE ae.timestamp >= :since GROUP BY ae.entityType")
        List<Object[]> getEntityTypeStatistics(@Param("since") LocalDateTime since);

        @Deprecated
        List<AuditExpense> findByExpenseIdOrderByTimestampDesc(Integer expenseId);

        @Deprecated
        List<AuditExpense> findByUserIdAndExpenseIdOrderByTimestampDesc(Integer userId, Integer expenseId);

        @Query("SELECT ae FROM AuditExpense ae ORDER BY ae.timestamp DESC")
        Page<AuditExpense> findAllOrderByTimestampDesc(Pageable pageable);

        @Query("SELECT ae FROM AuditExpense ae WHERE ae.actionType = :actionType ORDER BY ae.timestamp DESC")
        Page<AuditExpense> findByActionTypeOrderByTimestampDesc(@Param("actionType") String actionType,
                        Pageable pageable);

        @Query("SELECT ae FROM AuditExpense ae WHERE ae.timestamp >= :since ORDER BY ae.timestamp DESC")
        Page<AuditExpense> findByTimestampAfterOrderByTimestampDesc(@Param("since") LocalDateTime since,
                        Pageable pageable);

        @Query("SELECT ae FROM AuditExpense ae WHERE ae.actionType = :actionType AND ae.timestamp >= :since ORDER BY ae.timestamp DESC")
        Page<AuditExpense> findByActionTypeAndTimestampAfterOrderByTimestampDesc(
                        @Param("actionType") String actionType, @Param("since") LocalDateTime since, Pageable pageable);

        @Query("SELECT ae FROM AuditExpense ae WHERE " +
                        "LOWER(ae.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(ae.actionType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(ae.details) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "ORDER BY ae.timestamp DESC")
        Page<AuditExpense> searchAuditLogs(@Param("search") String search, Pageable pageable);

        @Query("SELECT ae FROM AuditExpense ae WHERE " +
                        "(LOWER(ae.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(ae.actionType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(ae.details) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "AND ae.actionType = :actionType " +
                        "ORDER BY ae.timestamp DESC")
        Page<AuditExpense> searchAuditLogsByType(
                        @Param("search") String search, @Param("actionType") String actionType, Pageable pageable);

        @Query("SELECT ae.actionType, COUNT(ae) FROM AuditExpense ae WHERE ae.timestamp >= :since GROUP BY ae.actionType")
        List<Object[]> getActionTypeStatisticsSince(@Param("since") LocalDateTime since);

        @Query("SELECT COUNT(ae) FROM AuditExpense ae WHERE ae.timestamp >= :since")
        Long countAuditLogsSince(@Param("since") LocalDateTime since);

        @Query("SELECT COUNT(ae) FROM AuditExpense ae WHERE ae.actionType = :actionType AND ae.timestamp >= :since")
        Long countByActionTypeSince(@Param("actionType") String actionType, @Param("since") LocalDateTime since);
}